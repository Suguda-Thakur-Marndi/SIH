'use client';

import React, { useState } from 'react';
import { FormInput, PasswordInput, LoadingButton, AuthAlert } from './FormControls';
import { smartCropAuth, isValidIndianPhone, isValidEmail, UserSession } from '@/lib/smartcrop-auth';
import { useLanguage } from '@/lib/language-context';

interface LoginFormProps {
  onSuccess: (session: UserSession) => void;
  onForgotPassword: () => void;
  onNavigateToRegister: () => void;
}

export default function LoginForm({
  onSuccess,
  onForgotPassword,
  onNavigateToRegister,
}: LoginFormProps) {
  const { t } = useLanguage();
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (authMethod === 'mobile') {
      if (!mobileNumber.trim()) {
        errs.mobileNumber = 'Mobile number is required.';
      } else if (!isValidIndianPhone(mobileNumber)) {
        errs.mobileNumber = 'Please enter a valid 10-digit number.';
      }
    } else {
      if (!email.trim()) {
        errs.email = 'Email address is required.';
      } else if (!isValidEmail(email)) {
        errs.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      let session: UserSession;
      if (authMethod === 'mobile') {
        session = await smartCropAuth.loginWithMobile(mobileNumber, password);
      } else {
        session = await smartCropAuth.loginWithEmail(email, password);
      }
      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await smartCropAuth.signInWithGoogle('farmer');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to Google.');
      setIsGoogleLoading(false);
    }
  };

  const fillDemo = (role: 'farmer' | 'admin') => {
    setError(null);
    setValidationErrors({});
    if (role === 'farmer') {
      setAuthMethod('mobile');
      setMobileNumber('9876543210');
      setPassword('Password123!');
    } else if (role === 'admin') {
      setAuthMethod('email');
      setEmail('admin@agri.gov.in');
      setPassword('Password123!');
    }
  };

  return (
    <div className="w-full space-y-4 text-left">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {t('sign_in', 'Sign in')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t('welcome_back', 'Welcome back to Smart Crop')}
        </p>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/70 hover:bg-white/90 text-slate-700 font-medium text-xs border border-white/80 shadow-xs transition-all cursor-pointer disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{isGoogleLoading ? 'Connecting to Google...' : t('continue_with_google', 'Continue with Google')}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200/70 w-full" />
        <span className="bg-transparent px-3 text-[11px] text-slate-400 font-normal">
          or
        </span>
        <div className="border-t border-slate-200/70 w-full" />
      </div>

      {/* Method Switcher */}
      <div className="flex p-0.5 bg-slate-100/80 rounded-lg border border-slate-200/50 text-xs">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('mobile');
            setError(null);
            setValidationErrors({});
          }}
          className={`flex-1 py-1.5 text-center font-medium rounded-md transition-all cursor-pointer ${
            authMethod === 'mobile'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('mobile_number', 'Mobile')}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('email');
            setError(null);
            setValidationErrors({});
          }}
          className={`flex-1 py-1.5 text-center font-medium rounded-md transition-all cursor-pointer ${
            authMethod === 'email'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('email_address', 'Email')}
        </button>
      </div>

      {/* Error Alert */}
      <AuthAlert type="error" message={error} onClose={() => setError(null)} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {authMethod === 'mobile' ? (
          <FormInput
            label={t('mobile_number', 'Mobile number')}
            type="tel"
            required
            placeholder="Enter 10-digit number"
            value={mobileNumber}
            onChange={(e) => {
              setMobileNumber(e.target.value);
              if (validationErrors.mobileNumber) {
                setValidationErrors((prev) => ({ ...prev, mobileNumber: '' }));
              }
            }}
            error={validationErrors.mobileNumber}
            prefixElement={<span className="text-xs font-semibold text-slate-500">+91</span>}
            maxLength={13}
            autoComplete="tel"
          />
        ) : (
          <FormInput
            label={t('email_address', 'Email address')}
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            error={validationErrors.email}
            autoComplete="email"
          />
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-800">
              {t('password', 'Password')} <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline focus:outline-none cursor-pointer"
            >
              {t('forgot_password', 'Forgot?')}
            </button>
          </div>
          <PasswordInput
            label=""
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            error={validationErrors.password}
            autoComplete="current-password"
          />
        </div>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText={t('signing_in', 'Signing in...')}
          className="mt-2"
        >
          {t('sign_in', 'Sign in')}
        </LoadingButton>
      </form>

      {/* Clean, Subtle Demo Shortcuts */}
      <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
        <span>{t('test_accounts', 'Test accounts:')}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fillDemo('farmer')}
            className="text-emerald-700 hover:underline font-medium cursor-pointer"
          >
            {t('role_farmer', 'Farmer')}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="text-emerald-700 hover:underline font-medium cursor-pointer"
          >
            {t('role_officer', 'Officer')}
          </button>
        </div>
      </div>

      {/* Footer link */}
      <div className="text-center text-xs text-slate-500 pt-1">
        <span>{t('dont_have_account', "Don't have an account?")} </span>
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
        >
          {t('create_account', 'Create account')}
        </button>
      </div>
    </div>
  );
}


