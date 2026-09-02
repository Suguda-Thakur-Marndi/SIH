import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { signJwt } from '@/lib/auth-jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password, email, mobileNumber, phone } = body;

    const identifier = (mobileNumber || phone || email || username || '').trim();
    if (!identifier || !password) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Mobile number/email and password are required.' } },
        { status: 400 }
      );
    }

    const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
    const cleanEmail = identifier.includes('@') ? identifier.toLowerCase() : null;

    let authenticatedFarmer: any = null;
    const connection = await pool.getConnection();

    try {
      // 1. Check farmers table
      const [farmers]: any = await connection.query(
        `SELECT id, name, phone, email, password_hash, district, village, language, land_area, state 
         FROM farmers 
         WHERE (phone = ?) OR (? IS NOT NULL AND email = ?)
         LIMIT 1;`,
        [cleanPhone || identifier, cleanEmail, cleanEmail]
      );

      if (farmers && farmers.length > 0) {
        const f = farmers[0];
        let passwordValid = false;

        if (f.password_hash) {
          if (f.password_hash.startsWith('$2a$') || f.password_hash.startsWith('$2b$')) {
            passwordValid = await bcrypt.compare(password, f.password_hash);
          } else {
            passwordValid = (f.password_hash === password);
          }
        }

        if (passwordValid) {
          authenticatedFarmer = {
            id: f.id,
            fullName: f.name,
            name: f.name,
            email: f.email || undefined,
            mobileNumber: f.phone,
            role: 'farmer',
            accountStatus: 'active',
            district: f.district,
            village: f.village,
            state: f.state,
            landArea: f.land_area,
            metadata: {
              district: f.district,
              village: f.village,
              state: f.state,
              landArea: f.land_area,
              language: f.language,
            },
          };
        }
      }

      // 2. If not found in farmers table, check users table for role 'farmer'
      if (!authenticatedFarmer) {
        const [users]: any = await connection.query(
          `SELECT id, name, email, phone, username, password as password_hash, role, account_status, metadata
           FROM users 
           WHERE (phone = ? OR (? IS NOT NULL AND email = ?) OR username = ?) AND role IN ('farmer')
           LIMIT 1;`,
          [cleanPhone || identifier, cleanEmail, cleanEmail, identifier]
        );

        if (users && users.length > 0) {
          const u = users[0];
          let passwordValid = false;

          if (u.password_hash) {
            if (u.password_hash.startsWith('$2a$') || u.password_hash.startsWith('$2b$')) {
              passwordValid = await bcrypt.compare(password, u.password_hash);
            } else {
              passwordValid = (u.password_hash === password);
            }
          }

          if (passwordValid) {
            const meta = typeof u.metadata === 'string' ? JSON.parse(u.metadata) : (u.metadata || {});
            authenticatedFarmer = {
              id: u.id,
              fullName: u.name || u.username || 'Farmer',
              name: u.name || u.username || 'Farmer',
              email: u.email || undefined,
              mobileNumber: u.phone || undefined,
              role: 'farmer',
              accountStatus: u.account_status || 'active',
              district: meta.district || 'Mayurbhanj',
              village: meta.village || 'Baripada',
              state: meta.state || 'Odisha',
              landArea: meta.landArea || 3.5,
              metadata: meta,
            };
          }
        }
      }
    } finally {
      connection.release();
    }

    if (!authenticatedFarmer) {
      return NextResponse.json(
        { error: { code: 'invalid_credentials', message: 'Invalid mobile number/email or password.' } },
        { status: 401 }
      );
    }

    // Generate JWT
    const accessToken = signJwt({
      id: authenticatedFarmer.id,
      name: authenticatedFarmer.fullName,
      role: 'farmer',
      email: authenticatedFarmer.email,
      mobileNumber: authenticatedFarmer.mobileNumber,
    }, 86400 * 7);

    const refreshToken = signJwt({
      id: authenticatedFarmer.id,
      name: authenticatedFarmer.fullName,
      role: 'farmer',
    }, 86400 * 30);

    const response = NextResponse.json({
      success: true,
      message: 'Farmer authenticated successfully.',
      accessToken,
      refreshToken,
      userId: authenticatedFarmer.id,
      farmerId: authenticatedFarmer.id,
      role: 'farmer',
      farmer: authenticatedFarmer,
      user: authenticatedFarmer,
    }, { status: 200 });

    response.cookies.set('smartcrop_token', accessToken, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('smartcrop_session', JSON.stringify(authenticatedFarmer), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (err: any) {
    console.error('[Farmer Login API Error]:', err);
    return NextResponse.json(
      { error: { code: 'auth_error', message: err.message || 'Farmer authentication failed.' } },
      { status: 500 }
    );
  }
}
