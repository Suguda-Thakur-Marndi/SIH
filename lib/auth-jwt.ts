import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface TokenPayload {
  id: string;
  name: string;
  role: 'farmer' | 'administrator' | 'admin' | 'bank';
  email?: string;
  mobileNumber?: string;
  exp: number; // Unix timestamp in seconds
  iat: number;
}

// Fallback runtime secret if not configured in environment
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'smartcrop_super_secure_jwt_secret_key_2026';

/**
 * Base64URL encode a buffer or string
 */
function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode to string
 */
function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Create a cryptographically signed HMAC-SHA256 JWT Token
 */
export function signJwt(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInSeconds: number = 86400 * 7): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify and decode an HMAC-SHA256 JWT Token
 */
export function verifyJwt(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token missing or invalid format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT structure' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Verify signature with timing-safe comparison
    const expectedSignature = base64UrlEncode(
      crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()
    );

    if (encodedSignature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification failed' };
  }
}

/**
 * Helper to extract Bearer token from Request headers
 */
export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
  }

  // Fallback: Check smartcrop_token cookie (matching proxy.ts pattern)
  const cookieToken = req.cookies.get('smartcrop_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * RBAC Middleware helper for Next.js Route Handlers.
 * Validates token & role; returns either the TokenPayload or a NextResponse error.
 */
export function requireAuth(
  req: NextRequest,
  allowedRoles?: Array<'farmer' | 'administrator' | 'admin' | 'bank'>
): { user: TokenPayload; errorResponse: null } | { user: null; errorResponse: NextResponse } {
  const token = extractBearerToken(req);
  let sessionUser: TokenPayload | null = null;

  // 1. Check signed JWT token if available
  if (token) {
    const verified = verifyJwt(token);
    if (verified.valid && verified.payload) {
      sessionUser = verified.payload;
    }
  }

  // 2. Fallback: Check smartcrop_session cookie if present (matching proxy.ts lines 89-101)
  if (!sessionUser) {
    const sessionCookie = req.cookies.get('smartcrop_session')?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed && parsed.id && parsed.role) {
          const now = Math.floor(Date.now() / 1000);
          sessionUser = {
            id: parsed.id,
            name: parsed.fullName || parsed.name || 'Smart Crop User',
            role: parsed.role,
            email: parsed.email,
            mobileNumber: parsed.mobileNumber || parsed.phone,
            iat: now,
            exp: now + 86400 * 7,
          };
        }
      } catch {
        // invalid session format
      }
    }
  }

  if (!sessionUser) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required. Please sign in.' } },
        { status: 401 }
      ),
    };
  }

  // 3. Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = sessionUser.role === 'admin' ? 'administrator' : sessionUser.role;
    const isAllowed = allowedRoles.some((r) => (r === 'admin' ? 'administrator' : r) === userRole);

    if (!isAllowed) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: { code: 'forbidden', message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}].` } },
          { status: 403 }
        ),
      };
    }
  }

  return { user: sessionUser, errorResponse: null };
}
