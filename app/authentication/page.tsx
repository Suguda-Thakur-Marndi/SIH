'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sprout } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from './components/Logo';
import LoginForm from './components/LoginForm';
import RoleSelector from './components/RoleSelector';
import FarmerRegisterForm from './components/FarmerRegisterForm';
import AdminRegisterForm from './components/AdminRegisterForm';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import { smartCropAuth, UserRole, UserSession } from '@/lib/smartcrop-auth';

type AuthView =
  | 'login'
  | 'role-select'
  | 'register-farmer'
  | 'register-admin'
  | 'success';

export default function AuthenticationPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    message: string;
    targetRoute: string;
  } | null>(null);

  // Handle successful login
  const handleLoginSuccess = useCallback((session: UserSession) => {
    const targetRoute = smartCropAuth.getDashboardRoute(session.role);

    setSuccessInfo({
      title: 'Welcome Back!',
      message: `Logging you into Smart Crop (${session.role.toUpperCase()})...`,
      targetRoute,
    });
    setCurrentView('success');

    setTimeout(() => {
      router.push(targetRoute);
    }, 1200);
  }, [router]);

  // Check if already authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const existing = await smartCropAuth.getCurrentSession();
      if (existing) {
        handleLoginSuccess(existing);
      }
    };
    checkAuth();
  }, [handleLoginSuccess]);

  // Handle successful registration
  const handleRegisterSuccess = (session: UserSession) => {
    const targetRoute = smartCropAuth.getDashboardRoute(session.role);

    let message = 'Welcome to Smart Crop. Redirecting you to your dashboard...';
    if (session.accountStatus === 'pending') {
      message = 'Your registration was submitted successfully. Verification is pending.';
    }

    setSuccessInfo({
      title: 'Account Created Successfully!',
      message,
      targetRoute,
    });
    setCurrentView('success');

    setTimeout(() => {
      router.push(targetRoute);
    }, 1500);
  };

  // Role continue button handler
  const handleRoleSelectedContinue = () => {
    if (selectedRole === 'farmer') {
      setCurrentView('register-farmer');
    } else if (selectedRole === 'administrator') {
      setCurrentView('register-admin');
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center lg:justify-start p-4 lg:py-6 lg:pl-28 xl:pl-36 overflow-x-hidden font-sans">
      {/* Background with subtle botanical atmosphere */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center lg:bg-right bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/images/smart-crop-auth-background.jpg')`,
          backgroundColor: '#0c2017',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-emerald-950/45 to-transparent backdrop-blur-[2px]" />
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-[440px] my-auto">
        <div className="relative rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-950/30 p-6 sm:p-7 text-center transition-all duration-300">
          {/* Top Bar with Language Selector */}
          <div className="flex items-center justify-between mb-4 relative z-[999] overflow-visible">
            <Logo size={currentView === 'login' ? 'md' : 'sm'} />
            <LanguageSelector variant="compact" />
          </div>

          {/* Dynamic Animated Views */}
          <AnimatePresence mode="wait">
            {/* VIEW: LOGIN */}
            {currentView === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onForgotPassword={() => setIsForgotModalOpen(true)}
                  onNavigateToRegister={() => setCurrentView('role-select')}
                />
              </motion.div>
            )}

            {/* VIEW: ROLE SELECTOR */}
            {currentView === 'role-select' && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <RoleSelector
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                  onContinue={handleRoleSelectedContinue}
                  onBackToLogin={() => setCurrentView('login')}
                />
              </motion.div>
            )}

            {/* VIEW: REGISTER FARMER */}
            {currentView === 'register-farmer' && (
              <motion.div
                key="register-farmer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <FarmerRegisterForm
                  onSuccess={handleRegisterSuccess}
                  onBackToRoles={() => setCurrentView('role-select')}
                  onBackToLogin={() => setCurrentView('login')}
                />
              </motion.div>
            )}

            {/* VIEW: REGISTER ADMINISTRATOR */}
            {currentView === 'register-admin' && (
              <motion.div
                key="register-admin"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <AdminRegisterForm
                  onSuccess={handleRegisterSuccess}
                  onBackToRoles={() => setCurrentView('role-select')}
                  onBackToLogin={() => setCurrentView('login')}
                />
              </motion.div>
            )}

            {/* VIEW: SUCCESS / REDIRECTING */}
            {currentView === 'success' && successInfo && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 space-y-4 text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {successInfo.title}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {successInfo.message}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                  <Sprout className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading dashboard...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimal clean footer */}
        <div className="mt-3 text-center text-xs text-white/75 font-normal">
          <span>Smart Crop Platform © {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </main>
  );
}
