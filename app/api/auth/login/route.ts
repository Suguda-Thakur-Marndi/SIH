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
        { error: { code: "validation_error", message: "Mobile number/email and password are required." } },
        { status: 400 }
      );
    }

    const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
    const cleanEmail = identifier.includes('@') ? identifier.toLowerCase() : null;

    let authenticatedUser: any = null;

    // 1. Query database for user record across users and farmers tables
    try {
      const connection = await pool.getConnection();
      try {
        // First check 'users' table (supports farmers, admin, officers, banks)
        const [userRows]: any = await connection.query(
          `SELECT id, name, email, phone, username, password as password_hash, role, account_status, metadata
           FROM users 
           WHERE (phone = ?) OR (? IS NOT NULL AND email = ?) OR (username = ?)
           LIMIT 1;`,
          [cleanPhone || identifier, cleanEmail, cleanEmail, identifier]
        );

        if (userRows && userRows.length > 0) {
          const user = userRows[0];
          let passwordValid = false;

          if (user.password_hash) {
            if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
              passwordValid = await bcrypt.compare(password, user.password_hash);
            } else {
              passwordValid = (user.password_hash === password);
            }
          }

          if (passwordValid) {
            if (user.account_status === 'rejected' || user.account_status === 'suspended') {
              return NextResponse.json(
                { error: { code: "account_suspended", message: "Your account is not active or has been suspended. Please contact support." } },
                { status: 403 }
              );
            }

            authenticatedUser = {
              id: user.id,
              fullName: user.name || user.username || 'Smart Crop User',
              email: user.email || undefined,
              mobileNumber: user.phone || undefined,
              role: user.role === 'admin' ? 'administrator' : user.role,
              accountStatus: user.account_status || 'active',
              metadata: typeof user.metadata === 'string' ? JSON.parse(user.metadata) : (user.metadata || {})
            };
          } else {
            return NextResponse.json(
              { error: { code: "invalid_credentials", message: "Invalid mobile number/email or password." } },
              { status: 401 }
            );
          }
        }

        // If not found in users table, check legacy 'farmers' table
        if (!authenticatedUser) {
          const [farmers]: any = await connection.query(
            `SELECT id, name, phone, email, password_hash, district, village, language, land_area, state 
             FROM farmers 
             WHERE (phone = ?) OR (? IS NOT NULL AND email = ?)
             LIMIT 1;`,
            [cleanPhone || identifier, cleanEmail, cleanEmail]
          );

          if (farmers && farmers.length > 0) {
            const farmer = farmers[0];
            let passwordValid = false;

            if (farmer.password_hash) {
              if (farmer.password_hash.startsWith('$2a$') || farmer.password_hash.startsWith('$2b$')) {
                passwordValid = await bcrypt.compare(password, farmer.password_hash);
              } else {
                passwordValid = (farmer.password_hash === password);
              }
            }

            if (passwordValid) {
              authenticatedUser = {
                id: farmer.id,
                fullName: farmer.name,
                email: farmer.email || undefined,
                mobileNumber: farmer.phone,
                role: 'farmer',
                accountStatus: 'active',
                district: farmer.district,
                village: farmer.village,
                state: farmer.state,
                landArea: farmer.land_area,
                metadata: {
                  district: farmer.district,
                  village: farmer.village,
                  state: farmer.state,
                  landArea: farmer.land_area,
                  language: farmer.language
                }
              };
            } else {
              return NextResponse.json(
                { error: { code: "invalid_credentials", message: "Invalid mobile number/email or password." } },
                { status: 401 }
              );
            }
          }
        }
      } finally {
        connection.release();
      }
    } catch (dbErr: any) {
      console.error('[Database Auth Query Error]:', dbErr);
    }

    // If user not found in database, return 401 unauthorized (no bypasses)
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: { code: "invalid_credentials", message: "Invalid credentials or account does not exist." } },
        { status: 401 }
      );
    }

    // 2. Issue genuine cryptographically signed JWT token
    const accessToken = signJwt({
      id: authenticatedUser.id,
      name: authenticatedUser.fullName,
      role: authenticatedUser.role,
      email: authenticatedUser.email,
      mobileNumber: authenticatedUser.mobileNumber,
    }, 86400 * 7); // 7 days expiration

    const refreshToken = signJwt({
      id: authenticatedUser.id,
      name: authenticatedUser.fullName,
      role: authenticatedUser.role,
    }, 86400 * 30); // 30 days expiration

    const response = NextResponse.json({
      accessToken,
      refreshToken,
      user: authenticatedUser,
      source: "AWS RDS MySQL"
    }, { status: 200 });

    response.cookies.set('smartcrop_token', accessToken, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('smartcrop_session', JSON.stringify(authenticatedUser), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "auth_error", message: err.message || "Authentication failed." } },
      { status: 500 }
    );
  }
}
