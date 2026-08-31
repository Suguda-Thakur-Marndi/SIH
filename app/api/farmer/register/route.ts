import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      fullName,
      name,
      mobileNumber,
      phone,
      email,
      password,
      state = 'Odisha',
      district,
      block = 'Baripada',
      village = 'Baripada',
      latitude,
      longitude,
      landArea = 3.5,
      soilType = 'Red Loamy',
      currentCrop = 'Rice / Paddy',
      sowingDate = new Date().toISOString().split('T')[0],
      preferredLanguage = 'English',
      language = 'en',
    } = body;

    const farmerName = (fullName || name || '').trim();
    const farmerPhone = (mobileNumber || phone || '').trim().replace(/\D/g, '');
    const farmerEmail = email ? email.trim().toLowerCase() : null;
    const farmerDistrict = (district || 'Mayurbhanj').trim();
    const farmerBlock = (block || 'Baripada').trim();
    const farmerVillage = (village || 'Baripada').trim();
    const farmerState = (state || 'Odisha').trim();
    const farmerLang = preferredLanguage || language || 'en';
    const parsedArea = parseFloat(String(landArea)) || 3.50;
    const parsedLat = parseFloat(String(latitude)) || 21.9324;
    const parsedLon = parseFloat(String(longitude)) || 86.7351;

    // 1. Validation
    if (!farmerName || farmerName.length < 2) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Full name is required (at least 2 characters).' } },
        { status: 400 }
      );
    }

    if (!farmerPhone || farmerPhone.length < 10) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Valid 10-digit mobile number is required.' } },
        { status: 400 }
      );
    }

    // Clean Indian 10-digit phone
    const cleanPhone = farmerPhone.slice(-10);

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Password must be at least 6 characters.' } },
        { status: 400 }
      );
    }

    // 2. Connect and check duplicate phone in RDS
    const connection = await pool.getConnection();

    try {
      const [existingFarmers]: any = await connection.query(
        'SELECT id FROM farmers WHERE phone = ? LIMIT 1;',
        [cleanPhone]
      );

      if (existingFarmers && existingFarmers.length > 0) {
        return NextResponse.json(
          { error: { code: 'duplicate_phone', message: 'A farmer with this mobile number is already registered. Please log in.' } },
          { status: 409 }
        );
      }

      // 3. Hash Password securely with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 4. Generate Unique IDs (max varchar 30)
      const timestamp = Date.now();
      const farmerId = `FRM_${timestamp.toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;
      const farmId = `FRM_LAND_${timestamp.toString().slice(-8)}`;
      const cropId = `CRP_${timestamp.toString().slice(-8)}`;
      const notifId = `NTF_${timestamp.toString().slice(-8)}`;

      // 5. Begin Transaction
      await connection.beginTransaction();

      // Insert into `farmers`
      await connection.query(
        `INSERT INTO farmers (id, name, phone, email, password_hash, district, village, language, land_area, state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          farmerId,
          farmerName,
          cleanPhone,
          farmerEmail,
          hashedPassword,
          farmerDistrict,
          farmerVillage,
          farmerLang,
          parsedArea,
          farmerState,
        ]
      );

      // Insert into `farms`
      await connection.query(
        `INSERT INTO farms (id, farmer_id, name, latitude, longitude, area, soil_type, village, district)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          farmId,
          farmerId,
          `${farmerName}'s Farm`,
          parsedLat,
          parsedLon,
          parsedArea,
          soilType,
          farmerVillage,
          farmerDistrict,
        ]
      );

      // Insert into `crops`
      const formattedSowingDate = sowingDate && /^\d{4}-\d{2}-\d{2}$/.test(sowingDate)
        ? sowingDate
        : new Date().toISOString().split('T')[0];

      await connection.query(
        `INSERT INTO crops (id, farmer_id, name, stage, sowing_date)
         VALUES (?, ?, ?, ?, ?);`,
        [
          cropId,
          farmerId,
          currentCrop || 'Rice / Paddy',
          'Vegetative',
          formattedSowingDate,
        ]
      );

      // Insert initial welcome notification
      await connection.query(
        `INSERT INTO notifications (id, user_id, farmer_id, type, priority, title, message, action_label, action_url)
         VALUES (?, ?, ?, 'welcome', 'info', 'Welcome to Smart Crop', 'Your farm profile has been successfully registered on AWS RDS.', 'View Farm', '/dashboard');`,
        [
          notifId,
          farmerId,
          farmerId,
        ]
      ).catch(() => {}); // Non-critical if notifications schema differs

      // Commit transaction
      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: 'Farmer registered successfully in AWS RDS.',
          farmerId,
          farmId,
          cropId,
          farmer: {
            id: farmerId,
            name: farmerName,
            phone: cleanPhone,
            email: farmerEmail,
            district: farmerDistrict,
            village: farmerVillage,
            state: farmerState,
            landArea: parsedArea,
            currentCrop,
          },
        },
        { status: 201 }
      );

    } catch (dbErr: any) {
      await connection.rollback();
      console.error('[RDS Farmer Registration Error]:', dbErr);
      return NextResponse.json(
        { error: { code: 'database_error', message: dbErr.message || 'Failed to save farmer to database.' } },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (err: any) {
    console.error('[Farmer Registration Route Error]:', err);
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'Internal server error during registration.' } },
      { status: 500 }
    );
  }
}
