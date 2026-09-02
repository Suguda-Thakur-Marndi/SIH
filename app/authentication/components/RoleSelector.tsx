'use client';

import React from 'react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/smartcrop-auth';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onContinue: () => void;
  onBackToLogin: () => void;
}

interface RoleOption {
  id: UserRole;
  title: string;
  emoji: string;
  subtitle: string;
  badge?: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    emoji: '👨‍🌾',
    subtitle: 'Crop monitoring & farm advisory',
    badge: 'Growers',
  },
  {
    id: 'administrator',
    title: 'Agriculture Extension Officer',
    emoji: '🧑‍💼',
    subtitle: 'Manage farmers, telemetry & distress triage',
    badge: 'Agri Officers',
  },
];

export default function RoleSelector({
  selectedRole,
  onSelectRole,
  onContinue,
  onBackToLogin,
}: RoleSelectorProps) {
  return (
    <div className="w-full space-y-2.5">
      {/* Header */}
      <div className="text-center pb-0.5">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
          Choose Account Type
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
          Select your role to access customized agricultural tools
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="space-y-2">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`group relative p-2.5 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left backdrop-blur-md ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-600 shadow-md ring-1 ring-emerald-400/40'
                  : 'bg-white/60 border-white/70 hover:border-emerald-300 hover:bg-white/80 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Emoji Icon Container */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600/20 border border-emerald-300'
                      : 'bg-white/80 border border-white/90 shadow-2xs'
                  }`}
                >
                  <span role="img" aria-label={role.title}>
                    {role.emoji}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`text-xs font-bold tracking-tight ${
                        isSelected ? 'text-emerald-950 font-extrabold' : 'text-slate-800'
                      }`}
                    >
                      {role.title}
                    </h3>

                    {/* Radio Check Circle */}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'border-2 border-slate-300/80 text-transparent'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-none mt-0.5">{role.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue CTA */}
      <div className="pt-1 space-y-1.5">
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>Continue as {ROLES.find((r) => r.id === selectedRole)?.title}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Back to Login */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-1.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Already have an account? Login</span>
        </button>
      </div>
    </div>
  );
}
