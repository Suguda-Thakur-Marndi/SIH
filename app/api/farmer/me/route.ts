import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-jwt';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, ['farmer', 'administrator', 'admin']);
  if (errorResponse) return errorResponse;

  try {
    const connection = await pool.getConnection();

    try {
      // 1. Fetch from farmers table
      const [farmers]: any = await connection.query(
        `SELECT id, name, phone, email, district, village, language, land_area, state, created_at 
         FROM farmers 
         WHERE id = ? OR phone = ? 
         LIMIT 1;`,
        [user.id, user.mobileNumber || user.id]
      );

      let farmerData = farmers && farmers.length > 0 ? farmers[0] : null;

      // 2. If not found in farmers, check users/farmer_profiles
      if (!farmerData) {
        const [users]: any = await connection.query(
          `SELECT u.id, u.name, u.email, u.role, fp.phone,
                  fp.district, fp.village, fp.state, fp.language, fp.land_area
           FROM users u
           LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
           WHERE u.id = ?
           LIMIT 1;`,
          [user.id]
        );
        if (users && users.length > 0) {
          farmerData = users[0];
        }
      }

      if (!farmerData) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          farmer: {
            id: user.id,
            name: user.name,
            fullName: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
          },
        });
      }

      // Fetch crops & farms
      const [farms]: any = await connection.query(
        `SELECT id, name, area, soil_type, village, district, latitude, longitude 
         FROM farms WHERE farmer_id = ?;`,
        [farmerData.id || user.id]
      );

      const [crops]: any = await connection.query(
        `SELECT id, name, stage, sowing_date 
         FROM crops WHERE farmer_id = ?;`,
        [farmerData.id || user.id]
      );

      return NextResponse.json({
        success: true,
        authenticated: true,
        farmer: {
          id: farmerData.id || user.id,
          name: farmerData.name,
          fullName: farmerData.name,
          phone: farmerData.phone,
          mobileNumber: farmerData.phone,
          email: farmerData.email,
          district: farmerData.district || 'Mayurbhanj',
          village: farmerData.village || 'Baripada',
          state: farmerData.state || 'Odisha',
          language: farmerData.language || 'en',
          landArea: farmerData.land_area || 3.5,
          role: user.role,
          farms: farms || [],
          crops: crops || [],
        },
      });

    } finally {
      connection.release();
    }

  } catch (err: any) {
    console.error('[Farmer Profile / Me API Error]:', err);
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'Failed to fetch farmer profile.' } },
      { status: 500 }
    );
  }
}
