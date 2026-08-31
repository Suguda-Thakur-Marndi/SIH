"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import bgDesktop from '@/Government equipment schemes/img/1(1).png';
import bgMobile from '@/Agriculture officer dashboard/img/3.png';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  User, 
  Bell, 
  Globe, 
  Shield, 
  LogOut, 
  Check, 
  Save, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  MapPin, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/language-context';
import { smartCropAuth } from '@/lib/smartcrop-auth';

interface OfficerProfile {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  district: string;
  subdivision: string;
  state: string;
  jurisdiction: string;
}

interface NotificationSettings {
  notify_high_distress: boolean;
  notify_weather_emergency: boolean;
  notify_new_assignment: boolean;
  notify_loan_insurance: boolean;
}

export default function OfficerSettings() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<OfficerProfile>({
    id: 'usr_admin_demo_1',
    name: 'Dr. Anil Verma',
    designation: 'Sub-Divisional Agricultural Officer (SDAO)',
    phone: '+91 98765 43211',
    email: 'admin@agri.gov.in',
    district: 'Mayurbhanj',
    subdivision: 'Baripada Subdivision',
    state: 'Odisha',
    jurisdiction: 'Mayurbhanj District (Baripada, Betnoti, Badasahi, Kuliana Blocks)'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    notify_high_distress: true,
    notify_weather_emergency: true,
    notify_new_assignment: true,
    notify_loan_insurance: false
  });

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: '', phone: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Notifications State
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  // Language State
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [langSuccess, setLangSuccess] = useState('');
  const [langError, setLangError] = useState('');

  // Password State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load initial settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/officer/settings');
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setProfile(json.data.profile);
            setProfileFormData({
              name: json.data.profile.name || '',
              phone: json.data.profile.phone || '',
              email: json.data.profile.email || ''
            });
            if (json.data.notifications) {
              setNotifications(json.data.notifications);
            }
            if (json.data.language) {
              setSelectedLanguage(json.data.language as LanguageCode);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load officer settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await fetch('/api/officer/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileFormData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to update profile');
      }

      setProfile(prev => ({
        ...prev,
        name: profileFormData.name || prev.name,
        phone: profileFormData.phone || prev.phone,
        email: profileFormData.email || prev.email
      }));
      setProfileSuccess('Profile contact details updated successfully.');
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    setNotifSuccess('');
    setNotifError('');

    try {
      const res = await fetch('/api/officer/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to update notifications');
      }

      setNotifSuccess('Notification alert preferences saved.');
      setTimeout(() => setNotifSuccess(''), 4000);
    } catch (err: any) {
      setNotifError(err.message || 'Failed to save notifications');
    } finally {
      setSavingNotifications(false);
    }
  };

  // Save Language
  const handleSaveLanguage = async () => {
    setSavingLanguage(true);
    setLangSuccess('');
    setLangError('');

    try {
      const res = await fetch('/api/officer/settings/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_language: selectedLanguage })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to update language');
      }

      setLanguage(selectedLanguage);
      setLangSuccess('Language preference saved and updated.');
      setTimeout(() => setLangSuccess(''), 4000);
    } catch (err: any) {
      setLangError(err.message || 'Failed to update language');
    } finally {
      setSavingLanguage(false);
    }
  };

  // Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/officer/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to change password');
      }

      setPasswordSuccess('Password has been changed securely.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await smartCropAuth.signOut();
    } catch {}
    router.push('/authentication');
  };

  // Initials for avatar
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'OV';

  return (
    <div className="relative min-h-screen font-sans text-[#1A1A1A]">
      {/* Background Frame Shell */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Desktop 16:9 Image */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src={bgDesktop}
            alt="Settings Background Desktop"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Mobile 9:16 Image */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src={bgMobile}
            alt="Settings Background Mobile"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Main Page Layout */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen p-4 gap-4">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} activeKey="settings" />

        {/* Content Area */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-auto space-y-6 pr-1 max-w-5xl">
            {/* Page Header Title */}
            <div className="glass rounded-2xl p-6 shadow-sm border border-white/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <User className="w-6 h-6 text-[#1A1A1A]" />
                    {t('settings', 'Officer Account & System Settings')}
                  </h1>
                  <p className="text-sm text-neutral-600 mt-1">
                    Manage administrative profile, broadcast alerts, regional language, and credential security.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#CFE362]/30 px-3 py-1.5 rounded-full border border-[#CFE362]/60 text-xs font-semibold text-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Verified Officer • {profile.district}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="glass rounded-2xl p-8 h-48 animate-pulse bg-white/40" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Profile Card */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-white/60 transition-all">
                  <div className="flex items-center justify-between pb-4 border-b border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#CFE362] text-[#1A1A1A] font-bold shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#1A1A1A]">Officer Profile</h2>
                        <p className="text-xs text-neutral-600">Personal contact details and official designation</p>
                      </div>
                    </div>
                    {!isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileFormData({
                            name: profile.name,
                            phone: profile.phone,
                            email: profile.email
                          });
                          setIsEditingProfile(true);
                        }}
                        className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1A1A1A] text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  {profileSuccess && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar / Initials */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1A1A1A] to-neutral-700 text-[#CFE362] flex items-center justify-center text-2xl font-bold shadow-md shrink-0 border-2 border-white/60">
                      {initials}
                    </div>

                    {/* Profile Fields */}
                    <div className="flex-1 w-full">
                      {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                              <input
                                type="text"
                                required
                                value={profileFormData.name}
                                onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })}
                                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Phone</label>
                              <input
                                type="text"
                                required
                                value={profileFormData.phone}
                                onChange={e => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A]"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                              <input
                                type="email"
                                required
                                value={profileFormData.email}
                                onChange={e => setProfileFormData({ ...profileFormData, email: e.target.value })}
                                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={savingProfile}
                              className="px-4 py-2 rounded-xl bg-[#CFE362] text-[#1A1A1A] font-bold text-xs hover:bg-[#b8cc50] transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="px-4 py-2 rounded-xl bg-white/60 text-neutral-700 font-semibold text-xs hover:bg-white/80 transition-all border border-neutral-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-neutral-500 font-medium">Officer Name</div>
                            <div className="text-base font-bold text-[#1A1A1A]">{profile.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 font-medium">Designation (Official)</div>
                            <div className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                              {profile.designation}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 font-medium">Official Contact</div>
                            <div className="text-sm font-medium text-neutral-800 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              {profile.phone}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 font-medium">Official Email</div>
                            <div className="text-sm font-medium text-neutral-800 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              {profile.email}
                            </div>
                          </div>
                          <div className="md:col-span-2 p-3 rounded-xl bg-white/50 border border-black/5">
                            <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              Assigned Jurisdiction (Read-Only)
                            </div>
                            <div className="text-xs font-semibold text-neutral-800 mt-0.5">
                              {profile.jurisdiction}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Notification Preferences Card */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-white/60">
                  <div className="flex items-center justify-between pb-4 border-b border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#CFE362] text-[#1A1A1A] font-bold shadow-sm">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#1A1A1A]">Notification Preferences</h2>
                        <p className="text-xs text-neutral-600">Configure alerts for distress spikes, weather broadcasts, and escalations</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={savingNotifications}
                      onClick={handleSaveNotifications}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#CFE362] text-[#1A1A1A] hover:bg-[#b8cc50] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {savingNotifications ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Preferences
                    </button>
                  </div>

                  {notifSuccess && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{notifSuccess}</span>
                    </div>
                  )}

                  {notifError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{notifError}</span>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    {/* Toggle 1: High Distress */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/50 border border-black/5 hover:bg-white/70 transition-all">
                      <div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">High-Distress Farmer Alerts</div>
                        <div className="text-xs text-neutral-600">Instant notification when a monitored farmer enters Critical Risk tier (&gt;75 Score).</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, notify_high_distress: !notifications.notify_high_distress })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          notifications.notify_high_distress ? 'bg-[#CFE362]' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`bg-[#1A1A1A] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifications.notify_high_distress ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 2: Weather Broadcasts */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/50 border border-black/5 hover:bg-white/70 transition-all">
                      <div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">Weather & Emergency Broadcasts</div>
                        <div className="text-xs text-neutral-600">Rainfall anomaly warnings, cyclone trackers, and IMD red alerts for Mayurbhanj district.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, notify_weather_emergency: !notifications.notify_weather_emergency })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          notifications.notify_weather_emergency ? 'bg-[#CFE362]' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`bg-[#1A1A1A] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifications.notify_weather_emergency ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 3: New Assignments */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/50 border border-black/5 hover:bg-white/70 transition-all">
                      <div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">New Intervention Assignments</div>
                        <div className="text-xs text-neutral-600">Alerts when field inspection or soil advisory tickets are assigned to your jurisdiction.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, notify_new_assignment: !notifications.notify_new_assignment })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          notifications.notify_new_assignment ? 'bg-[#CFE362]' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`bg-[#1A1A1A] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifications.notify_new_assignment ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 4: Loan/Insurance */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/50 border border-black/5 hover:bg-white/70 transition-all">
                      <div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">Loan & Insurance Escalations</div>
                        <div className="text-xs text-neutral-600">Notifications when bank partners flag loan stress or claim delays for local farmers.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, notify_loan_insurance: !notifications.notify_loan_insurance })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          notifications.notify_loan_insurance ? 'bg-[#CFE362]' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`bg-[#1A1A1A] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifications.notify_loan_insurance ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Language Preference Card */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-white/60">
                  <div className="flex items-center justify-between pb-4 border-b border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#CFE362] text-[#1A1A1A] font-bold shadow-sm">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#1A1A1A]">Language Preference</h2>
                        <p className="text-xs text-neutral-600">Select interface language for regional administrative workflows</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={savingLanguage}
                      onClick={handleSaveLanguage}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#CFE362] text-[#1A1A1A] hover:bg-[#b8cc50] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {savingLanguage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Language
                    </button>
                  </div>

                  {langSuccess && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{langSuccess}</span>
                    </div>
                  )}

                  {langError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{langError}</span>
                    </div>
                  )}

                  <div className="mt-6">
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">
                      Preferred Display Language (Persisted to Database)
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={e => setSelectedLanguage(e.target.value as LanguageCode)}
                      className="w-full md:w-96 px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A] font-medium shadow-sm cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name} — {l.nativeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Security Card */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-white/60">
                  <div className="flex items-center gap-3 pb-4 border-b border-black/10">
                    <div className="p-2.5 rounded-xl bg-[#CFE362] text-[#1A1A1A] font-bold shadow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1A1A1A]">Security & Password</h2>
                      <p className="text-xs text-neutral-600">Update officer portal password with secure authentication hashing</p>
                    </div>
                  </div>

                  {passwordSuccess && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSavePassword} className="mt-6 space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          required
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                          className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        >
                          {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">New Password (Min 8 chars)</label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="New password"
                            className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A] pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                            className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-800 cursor-pointer"
                          >
                            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm password"
                            className="w-full px-3.5 py-2 text-sm rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A] pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                            className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-800 cursor-pointer"
                          >
                            {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="px-5 py-2 rounded-xl bg-[#1A1A1A] text-white font-semibold text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-[#CFE362]" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* 5. Sign Out Card */}
                <div className="glass rounded-2xl p-6 shadow-sm border border-red-200/50 bg-red-50/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-600" />
                        Sign Out Session
                      </h2>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        Securely terminate active officer credentials on this workstation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
