import { insforge } from './insforge';

export type UserRole = 'farmer' | 'administrator' | 'bank';

export interface UserSession {
  id: string;
  role: UserRole;
  fullName: string;
  email?: string;
  mobileNumber?: string;
  accountStatus: 'active' | 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
}

export interface FarmerRegistrationData {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password: string;
  dateOfBirth?: string;
  gender?: string;
  state: string;
  district: string;
  village?: string;
  landArea?: string;
  currentCrop?: string;
  sowingDate?: string;
  preferredLanguage?: string;
}

export interface AdminRegistrationData {
  fullName: string;
  mobileNumber: string;
  officialEmail: string;
  password: string;
  organization: string;
  designation: string;
  state: string;
  district: string;
  administratorId: string;
}

export interface BankRegistrationData {
  fullName: string;
  mobileNumber: string;
  officialEmail: string;
  password: string;
  organizationName: string;
  organizationType: 'Bank' | 'Insurance';
  employeeId: string;
  branch: string;
  state: string;
  district: string;
}

export interface StoredUserAccount {
  id: string;
  role: UserRole;
  fullName: string;
  email?: string;
  mobileNumber?: string;
  passwordHash: string; // Plain/encoded password for local verification
  accountStatus: 'active' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  metadata: Record<string, any>;
}

const SESSION_KEY = 'smartcrop_auth_session';
const ACCOUNTS_DB_KEY = 'smartcrop_registered_accounts';

// Seed default demo accounts if not already present
const DEFAULT_DEMO_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'usr_farmer_demo_1',
    role: 'farmer',
    fullName: 'Ramesh Kumar Patel',
    mobileNumber: '9876543210',
    email: 'farmer@smartcrop.in',
    passwordHash: 'Password123!',
    accountStatus: 'active',
    createdAt: new Date().toISOString(),
    metadata: {
      state: 'Odisha',
      district: 'Mayurbhanj',
      village: 'Baripada',
      landArea: '3.5',
      currentCrop: 'Rice / Paddy',
      preferredLanguage: 'Odia',
    },
  },
  {
    id: 'usr_admin_demo_1',
    role: 'administrator',
    fullName: 'Dr. Anil Verma',
    mobileNumber: '9876543211',
    email: 'admin@agri.gov.in',
    passwordHash: 'Password123!',
    accountStatus: 'active',
    createdAt: new Date().toISOString(),
    metadata: {
      organization: 'Department of Agriculture',
      designation: 'District Agriculture Officer',
      administratorId: 'AGRI-OD-8821',
      state: 'Odisha',
      district: 'Cuttack',
    },
  },
  {
    id: 'usr_bank_demo_1',
    role: 'bank',
    fullName: 'Meera Patnaik',
    mobileNumber: '9876543212',
    email: 'bank@sbi.co.in',
    passwordHash: 'Password123!',
    accountStatus: 'active',
    createdAt: new Date().toISOString(),
    metadata: {
      organizationName: 'State Bank of India',
      organizationType: 'Bank',
      employeeId: 'SBI-AGRI-9182',
      branch: 'Bhubaneswar Main Branch',
      state: 'Odisha',
      district: 'Khordha',
    },
  },
];

export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function isValidIndianPhone(input: string): boolean {
  const normalized = normalizeIndianPhone(input);
  return /^[6-9]\d{9}$/.test(normalized);
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

export function phoneToEmail(phone: string): string {
  const clean = normalizeIndianPhone(phone);
  return `phone_${clean}@smartcrop.local`;
}

/**
 * Local Account Storage Helpers
 */
function getStoredAccounts(): StoredUserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_DEMO_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
      return DEFAULT_DEMO_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
      return DEFAULT_DEMO_ACCOUNTS;
    }
    return parsed;
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

function saveStoredAccount(account: StoredUserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredAccounts();
    // Update if exists or append
    const idx = existing.findIndex(
      (a) =>
        a.id === account.id ||
        (account.email && a.email?.toLowerCase() === account.email.toLowerCase()) ||
        (account.mobileNumber && a.mobileNumber === account.mobileNumber)
    );
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...account };
    } else {
      existing.push(account);
    }
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('[SmartCropAuth] Local storage save notice:', err);
  }
}

function findStoredAccount(identifier: string): StoredUserAccount | undefined {
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = normalizeIndianPhone(identifier);
  const accounts = getStoredAccounts();

  return accounts.find((acc) => {
    if (acc.email && acc.email.toLowerCase() === clean) return true;
    if (cleanPhone && acc.mobileNumber && normalizeIndianPhone(acc.mobileNumber) === cleanPhone) return true;
    return false;
  });
}

export const smartCropAuth = {
  /**
   * Determine dashboard route for a given role
   */
  getDashboardRoute(role: UserRole): string {
    switch (role) {
      case 'administrator':
        return '/admin/dashboard';
      case 'bank':
        return '/bank-portal/dashboard';
      case 'farmer':
      default:
        return '/dashboard';
    }
  },

  /**
   * Get cached local session or inspect current InsForge auth
   */
  async getCurrentSession(): Promise<UserSession | null> {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(SESSION_KEY);
      if (cached) {
        return JSON.parse(cached) as UserSession;
      }
    } catch {
      // ignore parse error
    }

    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (!error && data?.user) {
        const user = data.user;
        const profile = (user.profile as any) || {};
        const metadata = (user.metadata as any) || {};

        const session: UserSession = {
          id: user.id,
          role: profile.role || metadata.role || 'farmer',
          fullName: profile.name || profile.full_name || user.email?.split('@')[0] || 'Smart Crop User',
          email: user.email?.includes('@smartcrop.local') ? undefined : user.email,
          mobileNumber: profile.mobile_number || metadata.mobile_number,
          accountStatus: profile.account_status || 'active',
          metadata: { ...metadata, ...profile },
        };
        this.saveSession(session);
        return session;
      }
    } catch (e) {
      // ignore
    }

    return null;
  },

  /**
   * Save session to localStorage and cookie for server-side auth guards
   */
  saveSession(session: UserSession) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      try {
        document.cookie = `smartcrop_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=604800; SameSite=Lax`;
      } catch {
        // ignore cookie errors
      }
    }
  },

  /**
   * Log in with Email & Password (validates directly with AWS RDS MySQL)
   */
  async loginWithEmail(email: string, password: string): Promise<UserSession> {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    // 1. Primary: Authenticate with AWS RDS MySQL via backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (res.ok && data?.user) {
        const u = data.user;
        const session: UserSession = {
          id: u.id,
          role: u.role || 'farmer',
          fullName: u.fullName || cleanEmail.split('@')[0],
          email: u.email || cleanEmail,
          mobileNumber: u.mobileNumber,
          accountStatus: u.accountStatus || 'active',
          metadata: u.metadata || {},
        };

        saveStoredAccount({
          id: session.id,
          role: session.role,
          fullName: session.fullName,
          email: cleanEmail,
          mobileNumber: session.mobileNumber,
          passwordHash: password,
          accountStatus: session.accountStatus,
          createdAt: new Date().toISOString(),
          metadata: session.metadata || {},
        });

        this.saveSession(session);
        return session;
      } else if (data?.error?.code === 'invalid_credentials') {
        throw new Error(data.error.message);
      }
    } catch (apiErr: any) {
      if (apiErr.message && apiErr.message.includes('Incorrect password')) {
        throw apiErr;
      }
    }

    // 2. Fallback: Check local persistent accounts cache
    const stored = findStoredAccount(cleanEmail);
    if (stored) {
      if (stored.passwordHash === password) {
        const session: UserSession = {
          id: stored.id,
          role: stored.role,
          fullName: stored.fullName,
          email: stored.email,
          mobileNumber: stored.mobileNumber,
          accountStatus: stored.accountStatus,
          metadata: stored.metadata,
        };
        this.saveSession(session);
        return session;
      } else {
        throw new Error('Incorrect password. Please check and try again.');
      }
    }

    throw new Error('No account found with this email address. Please register or check details.');
  },

  /**
   * Log in with Mobile Number & Password (validates directly with AWS RDS MySQL)
   */
  async loginWithMobile(mobileNumber: string, password: string): Promise<UserSession> {
    const cleanPhone = normalizeIndianPhone(mobileNumber);
    if (!isValidIndianPhone(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    // 1. Primary: Authenticate with AWS RDS MySQL via backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: cleanPhone, password }),
      });

      const data = await res.json();
      if (res.ok && data?.user) {
        const u = data.user;
        const session: UserSession = {
          id: u.id,
          role: u.role || 'farmer',
          fullName: u.fullName || `Farmer ${cleanPhone.slice(-4)}`,
          email: u.email,
          mobileNumber: u.mobileNumber || cleanPhone,
          accountStatus: u.accountStatus || 'active',
          metadata: u.metadata || {},
        };

        saveStoredAccount({
          id: session.id,
          role: session.role,
          fullName: session.fullName,
          email: u.email,
          mobileNumber: cleanPhone,
          passwordHash: password,
          accountStatus: session.accountStatus,
          createdAt: new Date().toISOString(),
          metadata: session.metadata || {},
        });

        this.saveSession(session);
        return session;
      } else if (data?.error?.code === 'invalid_credentials') {
        throw new Error(data.error.message);
      }
    } catch (apiErr: any) {
      if (apiErr.message && apiErr.message.includes('Incorrect password')) {
        throw apiErr;
      }
    }

    // 2. Fallback: Check local persistent accounts database
    const stored = findStoredAccount(cleanPhone);
    if (stored) {
      if (stored.passwordHash === password) {
        const session: UserSession = {
          id: stored.id,
          role: stored.role,
          fullName: stored.fullName,
          email: stored.email,
          mobileNumber: stored.mobileNumber || cleanPhone,
          accountStatus: stored.accountStatus,
          metadata: stored.metadata,
        };
        this.saveSession(session);
        return session;
      } else {
        throw new Error('Incorrect password. Please check and try again.');
      }
    }

    throw new Error('No account found for this mobile number. Please register first.');
  },

  /**
   * Register Farmer Account (persists to AWS RDS MySQL)
   */
  async registerFarmer(data: FarmerRegistrationData): Promise<UserSession> {
    const cleanPhone = normalizeIndianPhone(data.mobileNumber);
    if (!isValidIndianPhone(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    const metadata = {
      state: data.state,
      district: data.district,
      village: data.village || '',
      landArea: data.landArea || '',
      currentCrop: data.currentCrop || 'Rice / Paddy',
      sowingDate: data.sowingDate || new Date().toISOString().split('T')[0],
      preferredLanguage: data.preferredLanguage || 'English',
      gender: data.gender || 'Male',
      dateOfBirth: data.dateOfBirth || '',
    };

    let userId = `FRM_${Date.now()}`;

    // 1. Save directly to AWS RDS MySQL via dedicated backend API
    try {
      const res = await fetch('/api/farmer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName.trim(),
          mobileNumber: cleanPhone,
          email: data.email?.trim().toLowerCase(),
          password: data.password,
          state: data.state,
          district: data.district,
          village: data.village,
          landArea: data.landArea,
          currentCrop: data.currentCrop,
          sowingDate: data.sowingDate,
          preferredLanguage: data.preferredLanguage,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to register farmer in AWS RDS.');
      }
      if (resData?.farmerId) {
        userId = resData.farmerId;
      }
    } catch (apiErr: any) {
      throw apiErr;
    }

    const newAccount: StoredUserAccount = {
      id: userId,
      role: 'farmer',
      fullName: data.fullName.trim(),
      email: data.email?.trim().toLowerCase(),
      mobileNumber: cleanPhone,
      passwordHash: data.password,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      metadata,
    };

    // Cache locally
    saveStoredAccount(newAccount);

    const session: UserSession = {
      id: userId,
      role: 'farmer',
      fullName: data.fullName.trim(),
      email: data.email?.trim().toLowerCase(),
      mobileNumber: cleanPhone,
      accountStatus: 'active',
      metadata,
    };

    this.saveSession(session);
    return session;
  },

  /**
   * Register Administrator Account
   */
  async registerAdmin(data: AdminRegistrationData): Promise<UserSession> {
    const cleanEmail = data.officialEmail.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid official email address.');
    }

    const cleanPhone = normalizeIndianPhone(data.mobileNumber);
    if (!isValidIndianPhone(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    // Check duplicate
    if (findStoredAccount(cleanEmail)) {
      throw new Error('An account with this official email already exists. Please log in.');
    }
    if (findStoredAccount(cleanPhone)) {
      throw new Error('An account with this mobile number already exists. Please log in.');
    }

    const userId = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const metadata = {
      organization: data.organization,
      designation: data.designation,
      administratorId: data.administratorId,
      state: data.state,
      district: data.district,
      officialEmail: cleanEmail,
    };

    const newAccount: StoredUserAccount = {
      id: userId,
      role: 'administrator',
      fullName: data.fullName.trim(),
      email: cleanEmail,
      mobileNumber: cleanPhone,
      passwordHash: data.password,
      accountStatus: 'pending',
      createdAt: new Date().toISOString(),
      metadata,
    };

    saveStoredAccount(newAccount);

    // Save cloud user if InsForge connected
    try {
      await insforge.auth.signUp({
        email: cleanEmail,
        password: data.password,
        name: data.fullName.trim(),
      });
      const { data: signInData } = await insforge.auth.signInWithPassword({
        email: cleanEmail,
        password: data.password,
      });
      if (signInData?.user) {
        await insforge.auth.setProfile({
          role: 'administrator',
          name: data.fullName.trim(),
          mobile_number: cleanPhone,
          organization: data.organization,
          designation: data.designation,
          administrator_id: data.administratorId,
          state: data.state,
          district: data.district,
          account_status: 'pending',
        });
      }
    } catch {
      // Cloud signup is optional best-effort
    }

    const session: UserSession = {
      id: userId,
      role: 'administrator',
      fullName: data.fullName.trim(),
      email: cleanEmail,
      mobileNumber: cleanPhone,
      accountStatus: 'pending',
      metadata,
    };

    this.saveSession(session);
    return session;
  },

  /**
   * Register Bank / Insurance Account
   */
  async registerBank(data: BankRegistrationData): Promise<UserSession> {
    const cleanEmail = data.officialEmail.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid official email address.');
    }

    const cleanPhone = normalizeIndianPhone(data.mobileNumber);
    if (!isValidIndianPhone(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    // Check duplicate
    if (findStoredAccount(cleanEmail)) {
      throw new Error('An account with this official email already exists. Please log in.');
    }
    if (findStoredAccount(cleanPhone)) {
      throw new Error('An account with this mobile number already exists. Please log in.');
    }

    const userId = `bnk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const metadata = {
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      employeeId: data.employeeId,
      branch: data.branch,
      state: data.state,
      district: data.district,
      officialEmail: cleanEmail,
    };

    const newAccount: StoredUserAccount = {
      id: userId,
      role: 'bank',
      fullName: data.fullName.trim(),
      email: cleanEmail,
      mobileNumber: cleanPhone,
      passwordHash: data.password,
      accountStatus: 'pending',
      createdAt: new Date().toISOString(),
      metadata,
    };

    saveStoredAccount(newAccount);

    // Save cloud user if InsForge connected
    try {
      await insforge.auth.signUp({
        email: cleanEmail,
        password: data.password,
        name: data.fullName.trim(),
      });
      const { data: signInData } = await insforge.auth.signInWithPassword({
        email: cleanEmail,
        password: data.password,
      });
      if (signInData?.user) {
        await insforge.auth.setProfile({
          role: 'bank',
          name: data.fullName.trim(),
          mobile_number: cleanPhone,
          organization_name: data.organizationName,
          organization_type: data.organizationType,
          employee_id: data.employeeId,
          branch: data.branch,
          state: data.state,
          district: data.district,
          account_status: 'pending',
        });
      }
    } catch {
      // Cloud signup is optional best-effort
    }

    const session: UserSession = {
      id: userId,
      role: 'bank',
      fullName: data.fullName.trim(),
      email: cleanEmail,
      mobileNumber: cleanPhone,
      accountStatus: 'pending',
      metadata,
    };

    this.saveSession(session);
    return session;
  },

  /**
   * Log in with Google OAuth (InsForge BaaS / Provider redirect)
   */
  async signInWithGoogle(role: UserRole = 'farmer'): Promise<{ url?: string }> {
    if (typeof window === 'undefined') return {};

    localStorage.setItem('smartcrop_oauth_intended_role', role);
    const redirectUrl = `${window.location.origin}/authentication`;

    try {
      const { data, error } = await insforge.auth.signInWithOAuth('google', {
        redirectTo: redirectUrl,
      });

      if (!error && data?.url) {
        window.location.href = data.url;
        return { url: data.url };
      }
      if (error) {
        throw new Error(error.message || 'Failed to start Google sign-in.');
      }
    } catch (err: any) {
      console.warn('[SmartCropAuth] InsForge Google OAuth notice:', err);
      throw err;
    }

    return {};
  },

  /**
   * Request password reset
   */
  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    const clean = identifier.trim();
    if (!clean) {
      throw new Error('Please enter your email or mobile number.');
    }

    const account = findStoredAccount(clean);
    if (!account && !isValidEmail(clean) && !isValidIndianPhone(clean)) {
      throw new Error('Please enter a valid email address or 10-digit mobile number.');
    }

    try {
      const targetEmail = account?.email || (isValidIndianPhone(clean) ? phoneToEmail(clean) : clean);
      await insforge.auth.sendResetPasswordEmail({ email: targetEmail });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Password reset link and OTP instructions have been dispatched to your registered contact.',
    };
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await insforge.auth.signOut().catch(() => {});
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      try {
        document.cookie = 'smartcrop_token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'smartcrop_session=; path=/; max-age=0; SameSite=Lax';
      } catch {
        // ignore cookie errors
      }
    }
  },

  /**
   * Get all registered accounts (for diagnostic or admin checks)
   */
  getRegisteredAccounts(): StoredUserAccount[] {
    return getStoredAccounts();
  },

  /**
   * Clean formatting of error messages
   */
  formatErrorMessage(msg: string): string {
    const low = msg.toLowerCase();
    if (
      low.includes('invalid login credentials') ||
      low.includes('invalid credentials') ||
      low.includes('user not found') ||
      low.includes('wrong password')
    ) {
      return 'Invalid login details. Please check your email/mobile number and password.';
    }
    if (low.includes('user already registered') || low.includes('already exists') || low.includes('duplicate key')) {
      return 'An account with these details already exists. Try logging in instead.';
    }
    if (low.includes('password') && (low.includes('weak') || low.includes('short') || low.includes('length'))) {
      return 'Password must be at least 8 characters long.';
    }
    if (low.includes('network') || low.includes('failed to fetch')) {
      return 'Unable to connect to the cloud right now. Using offline authentication.';
    }
    return msg;
  },
};

export default smartCropAuth;

