'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  Search, Bell, User, ArrowRight, Activity, ThermometerSun, Leaf, Droplets, 
  MapPin, ChevronRight, Wind, AlertTriangle, Navigation, 
  Home, ShieldAlert, Sparkles, TrendingUp, Landmark, LogOut 
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import bgImage from './assets/bg.png';
import { useLanguage } from '@/lib/language-context';
import LanguageSelector from '@/components/LanguageSelector';
import { smartCropAuth } from '@/lib/smartcrop-auth';

interface FarmerLocation {
  farmerId: string;
  lat: number;
  lng: number;
  timestamp?: number;
}

export default function SmartCropDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const socketRef = useRef<Socket | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [farmerLocations, setFarmerLocations] = useState<FarmerLocation[]>([]);

  // Navigation State
  const [activeNav, setActiveNav] = useState('home');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY;

      // Always show at top
      if (currentY <= 40) {
        setShowHeader(true);
      } else if (diff > 6) {
        // Scrolling DOWN -> smoothly hide up
        setShowHeader(false);
      } else if (diff < -6) {
        // Scrolling UP -> smoothly slide down / reveal into view
        setShowHeader(true);
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t('home', 'Home'), icon: Home, href: '/dashboard' },
    { id: 'risk', label: t('risk_analysis', 'Risk'), icon: ShieldAlert, href: '/risk-details' },
    { id: 'advisory', label: t('monitoring', 'Advisory'), icon: Sparkles, href: '/crop-monitoring' },
    { id: 'market', label: t('market_prices', 'Market'), icon: TrendingUp, href: '/market' },
    { id: 'schemes', label: t('schemes', 'Schemes'), icon: Landmark, href: '/schemes' },
  ];

  useEffect(() => {
    // Connect to the custom server socket with resilient connection options
    let newSocket: Socket | null = null;
    try {
      newSocket = io({
        reconnectionAttempts: 2,
        timeout: 3000,
        autoConnect: true,
      });
      socketRef.current = newSocket;

      newSocket.on('farmerLocationUpdate', (data: FarmerLocation) => {
        setFarmerLocations(prev => {
          const existing = prev.findIndex(loc => loc.farmerId === data.farmerId);
          if (existing !== -1) {
            const updated = [...prev];
            updated[existing] = data;
            return updated;
          }
          return [...prev, data];
        });
      });

      newSocket.on('connect_error', () => {
        // Silently handle fallback when socket server is optional
      });
    } catch {
      // Ignore if websocket is not supported in current environment
    }

    return () => {
      newSocket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    let watchId: number;

    if (isSharingLocation && socketRef.current) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            socketRef.current?.emit('updateLocation', {
              farmerId: 'farmer_123', // Demo ID
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: Date.now()
            });
          },
          (error) => console.error("Error getting location:", error),
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation is not supported by your browser");
        setTimeout(() => setIsSharingLocation(false), 0);
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharingLocation]);

  // Risk history data
  const riskHistory = [
    { name: 'W1', score: 60 },
    { name: 'W2', score: 67 },
    { name: 'W3', score: 72 },
    { name: 'W4', score: 81 },
  ];

  const ndviHistory = [
    { name: 'M1', value: 0.8 },
    { name: 'M2', value: 0.75 },
    { name: 'M3', value: 0.6 },
    { name: 'M4', value: 0.42 },
  ];

  return (
    <div className="min-h-screen font-sans text-[#1B1E19]">

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${bgImage.src}')`,
          }}
        />
      </div>

      {/* Persistent Nav - Curve CSS Header Completely Attached to Top */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: showHeader ? 0 : -140,
          opacity: showHeader ? 1 : 0
        }}
        transition={{ 
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="fixed top-0 left-0 right-0 z-[999] w-full flex justify-center pointer-events-auto"
      >
        <nav
          className="relative w-full pt-4 pb-6 px-6 md:px-12 shadow-xl transition-all duration-300 overflow-visible"
          style={{
            borderRadius: '0 0 50% 50% / 0 0 36px 36px',
            background: 'linear-gradient(105deg, rgba(206, 235, 150, 0.92) 0%, rgba(247, 248, 244, 0.96) 48%, rgba(248, 218, 192, 0.92) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 16px 36px -8px rgba(27, 30, 25, 0.12), inset 0 -1px 2px rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Main Nav Content Row */}
          <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-[#1B1E19] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                <Leaf size={16} color="#D6F24B" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-[#1B1E19]">Smart Crop</span>
            </a>

          {/* Links (Symbols by default, expanding writings on hover / active) */}
          <div className="flex items-center gap-6 md:gap-8 bg-white/70 p-2 px-5 md:px-7 rounded-full border border-black/6 shadow-sm backdrop-blur-md">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const isHovered = hoveredNav === item.id;
              const isExpanded = isActive || isHovered;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveNav(item.id)}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`relative flex items-center justify-center h-11 rounded-full cursor-pointer select-none transition-all duration-300 ${
                    isExpanded ? 'px-5' : 'w-11'
                  } ${
                    isActive
                      ? 'bg-[#1B1E19] text-[#F7F8F4] shadow-md shadow-black/20'
                      : 'text-[#6B6F63] hover:text-[#1B1E19] hover:bg-white/80'
                  }`}
                  style={{
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {/* Symbol / Icon */}
                  <motion.div
                    animate={{
                      y: isHovered ? -2 : 0,
                      scale: isHovered || isActive ? 1.08 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="flex items-center justify-center shrink-0"
                  >
                    <Icon
                      size={19}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-[#D6F24B] drop-shadow-[0_0_8px_rgba(214,242,75,0.6)]'
                          : isHovered
                          ? 'text-[#1B1E19] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]'
                          : 'text-[#6B6F63]'
                      }`}
                    />
                  </motion.div>

                  {/* Expandable Label on Hover / Active */}
                  <motion.span
                    initial={false}
                    animate={{
                      width: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                      marginLeft: isExpanded ? 8 : 0,
                    }}
                    transition={{
                      width: { type: 'spring', stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="overflow-hidden whitespace-nowrap text-sm font-medium tracking-tight"
                  >
                    {item.label}
                  </motion.span>

                  {/* Glowing Indicator bar for active item */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavGlow"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.75 rounded-full bg-[#D6F24B]"
                      style={{
                        boxShadow: '0 0 8px #D6F24B, 0 0 14px rgba(214,242,75,0.8)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons (Symbols with Expandable Hover Text) */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Selector Dropdown */}
            <LanguageSelector variant="glass" />

            {/* Search */}
            <button
              onMouseEnter={() => setHoveredAction('search')}
              onMouseLeave={() => setHoveredAction(null)}
              className={`h-11 rounded-full flex items-center justify-center bg-white/80 hover:bg-white border border-black/6 hover:border-black/15 transition-all duration-300 shadow-sm cursor-pointer group ${
                hoveredAction === 'search' ? 'px-4' : 'w-11'
              }`}
            >
              <motion.div
                animate={{ y: hoveredAction === 'search' ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center justify-center shrink-0"
              >
                <Search size={18} className="text-[#1B1E19] group-hover:scale-105 transition-transform" />
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  width: hoveredAction === 'search' ? 'auto' : 0,
                  opacity: hoveredAction === 'search' ? 1 : 0,
                  marginLeft: hoveredAction === 'search' ? 6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="overflow-hidden whitespace-nowrap text-xs font-semibold text-[#1B1E19]"
              >
                Search
              </motion.span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => router.push('/notifications')}
              onMouseEnter={() => setHoveredAction('bell')}
              onMouseLeave={() => setHoveredAction(null)}
              className={`h-11 rounded-full flex items-center justify-center bg-white/80 hover:bg-white border border-black/6 hover:border-black/15 transition-all duration-300 shadow-sm relative cursor-pointer group ${
                hoveredAction === 'bell' ? 'px-4' : 'w-11'
              }`}
            >
              <motion.div
                animate={{ y: hoveredAction === 'bell' ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative flex items-center justify-center shrink-0"
              >
                <Bell size={18} className="text-[#1B1E19] group-hover:scale-105 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E4572E] ring-2 ring-white animate-pulse"></div>
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  width: hoveredAction === 'bell' ? 'auto' : 0,
                  opacity: hoveredAction === 'bell' ? 1 : 0,
                  marginLeft: hoveredAction === 'bell' ? 6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="overflow-hidden whitespace-nowrap text-xs font-semibold text-[#1B1E19]"
              >
                {t('alerts', 'Alerts')}
              </motion.span>
            </button>

            {/* Profile User */}
            <button
              onClick={() => router.push('/farmer-profile')}
              onMouseEnter={() => setHoveredAction('user')}
              onMouseLeave={() => setHoveredAction(null)}
              className={`h-11 rounded-full flex items-center justify-center bg-white/80 hover:bg-white border border-black/6 hover:border-black/15 transition-all duration-300 shadow-sm relative cursor-pointer group ${
                hoveredAction === 'user' ? 'px-4' : 'w-11'
              }`}
            >
              <motion.div
                animate={{ y: hoveredAction === 'user' ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative flex items-center justify-center shrink-0"
              >
                <User size={18} className="text-[#1B1E19] group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#D6F24B] border-2 border-white"></div>
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  width: hoveredAction === 'user' ? 'auto' : 0,
                  opacity: hoveredAction === 'user' ? 1 : 0,
                  marginLeft: hoveredAction === 'user' ? 6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="overflow-hidden whitespace-nowrap text-xs font-semibold text-[#1B1E19]"
              >
                Profile
              </motion.span>
            </button>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await smartCropAuth.signOut();
                router.push('/authentication');
              }}
              onMouseEnter={() => setHoveredAction('logout')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Sign Out to Authentication"
              className={`h-11 rounded-full flex items-center justify-center bg-red-50/90 hover:bg-red-100 border border-red-200/80 transition-all duration-300 shadow-sm relative cursor-pointer group ${
                hoveredAction === 'logout' ? 'px-4' : 'w-11'
              }`}
            >
              <motion.div
                animate={{ y: hoveredAction === 'logout' ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative flex items-center justify-center shrink-0"
              >
                <LogOut size={17} className="text-red-700 group-hover:scale-105 transition-transform" />
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  width: hoveredAction === 'logout' ? 'auto' : 0,
                  opacity: hoveredAction === 'logout' ? 1 : 0,
                  marginLeft: hoveredAction === 'logout' ? 6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="overflow-hidden whitespace-nowrap text-xs font-semibold text-red-700"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </div>

          {/* Bottom Curved Wave Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-2.5 pointer-events-none opacity-30">
            <svg viewBox="0 0 1440 24" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 Q720,22 1440,0 L1440,24 L0,24 Z" fill="rgba(255,255,255,0.75)" />
            </svg>
          </div>
        </nav>
      </motion.div>

      {/* SECTION 1: Full-Screen Immersive Farmer Hero */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 md:px-12 max-w-7xl mx-auto pt-24 pb-16 text-center">
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ letterSpacing: '-0.02em' }}
            className="text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6"
          >
            <span className="font-medium text-[#1B1E19]">{t('hero_title_1', 'Protect your crop')}</span><br />
            <span className="font-light text-[#1B1E19]">{t('hero_title_2', 'before risk becomes loss')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ letterSpacing: '-0.01em' }}
            className="text-lg text-[#1B1E19] font-semibold mb-10 max-w-lg"
          >
            {t('hero_subtitle', 'AI-powered crop monitoring, distress prediction, and personalized farming guidance.')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Link href="/crop-monitoring">
              <button className="whitespace-nowrap px-8 py-4 rounded-full bg-[#1B1E19] text-[#F7F8F4] font-medium flex items-center gap-2 hover:bg-black transition-colors shadow-lg shadow-black/10">
                {t('view_farm_health', 'View Farm Health')}
              </button>
            </Link>
            <Link href="/crop-monitoring">
              <button className="whitespace-nowrap px-8 py-4 rounded-full bg-white/60 backdrop-blur-xl border border-black/10 font-medium text-[#1B1E19] flex items-center gap-2 hover:bg-white/80 transition-colors shadow-lg shadow-black/5">
                {t('explore_advisory', 'Explore Advisory')} <ArrowRight size={18} />
              </button>
            </Link>
            <button
              onClick={() => setIsSharingLocation(!isSharingLocation)}
              className={`whitespace-nowrap px-6 py-4 rounded-full font-medium flex items-center gap-2 transition-colors shadow-lg shadow-black/10 ${isSharingLocation ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-[#1B1E19] hover:bg-gray-50'}`}
            >
              <Navigation size={18} className={isSharingLocation ? 'animate-pulse' : ''} />
              {isSharingLocation ? t('stop_sharing_location', 'Stop Sharing Location') : t('share_live_location', 'Share Live Location')}
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1B1E19]/70"
        >
          <span>{t('scroll_to_explore', 'Scroll to explore')}</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-[#1B1E19]/30 flex justify-center p-1"
          >
            <div className="w-1.5 h-2 bg-[#1B1E19]/70 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 1.5: Quick Insights 2x2 Grid */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-14 lg:gap-20 w-fit pointer-events-auto">
          {/* Stat 1 */}
          <motion.div 
            whileHover={{ scale: 1.045, y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            whileTap={{ scale: 0.96 }}
            className="group relative w-full sm:w-80 md:w-90 lg:w-105 overflow-hidden rounded-4xl p-8 lg:p-10 font-sans cursor-pointer transition-colors duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(244, 252, 220, 0.75) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(230, 248, 180, 0.60) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.07), 0 0 25px rgba(214, 242, 75, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            <div className="absolute -top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#D6F24B]/25 blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-125"></div>
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-black/6 pb-5">
                <div className="relative flex h-13 w-13 lg:h-14 lg:w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#E4FC67] to-[#BEE627] p-px shadow-[0_8px_20px_-4px_rgba(214,242,75,0.7),inset_0_1px_2px_rgba(255,255,255,0.9)] group-hover:scale-110 group-hover:shadow-[0_12px_28px_-4px_rgba(214,242,75,0.9)] transition-all duration-300">
                  <div className="w-full h-full rounded-[14px] bg-linear-to-b from-white/70 via-[#F3FDE0]/80 to-[#E1F79A]/80 backdrop-blur-md flex items-center justify-center border border-white/80 shadow-inner">
                    <Activity className="h-6 w-6 lg:h-7 lg:w-7 text-[#1B1E19]" strokeWidth={2.2} />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1B1E19]">{t('farm_health_score', 'Farm Health')}</p>
                  <p className="text-sm text-[#6B6F63]">{t('index_score', 'Index score')}</p>
                </div>
              </div>
              <div>
                <p className="text-6xl md:text-7xl font-bold text-[#1B1E19] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>78</p>
                <p className="mt-3 text-base font-semibold text-emerald-700">+2 from last week</p>
              </div>
            </div>
          </motion.div>

          {/* Stat 2 */}
          <motion.div 
            whileHover={{ scale: 1.045, y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            whileTap={{ scale: 0.96 }}
            className="group relative w-full sm:w-80 md:w-90 lg:w-105 overflow-hidden rounded-4xl p-8 lg:p-10 font-sans cursor-pointer transition-colors duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 240, 232, 0.75) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(254, 226, 215, 0.60) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.07), 0 0 25px rgba(228, 87, 46, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            <div className="absolute -top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#E4572E]/20 blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-125"></div>
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-black/6 pb-5">
                <div className="relative flex h-13 w-13 lg:h-14 lg:w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF9671] to-[#E4572E] p-px shadow-[0_8px_20px_-4px_rgba(228,87,46,0.5),inset_0_1px_2px_rgba(255,255,255,0.9)] group-hover:scale-110 group-hover:shadow-[0_12px_28px_-4px_rgba(228,87,46,0.7)] transition-all duration-300">
                  <div className="w-full h-full rounded-[14px] bg-linear-to-b from-white/70 via-[#FFF0EB]/80 to-[#FFD8CC]/80 backdrop-blur-md flex items-center justify-center border border-white/80 shadow-inner">
                    <Leaf className="h-6 w-6 lg:h-7 lg:w-7 text-[#E4572E]" strokeWidth={2.2} />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1B1E19]">{t('ndvi_status', 'NDVI')}</p>
                  <p className="text-sm text-[#6B6F63]">{t('vs_30_day_avg', 'vs 30-day avg')}</p>
                </div>
              </div>
              <div>
                <p className="text-6xl md:text-7xl font-bold text-[#1B1E19] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>↓18<span className="text-4xl text-[#6B6F63]">%</span></p>
                <p className="mt-3 text-base font-semibold text-[#E4572E]">{t('requires_attention', 'Requires attention')}</p>
              </div>
            </div>
          </motion.div>

          {/* Stat 3 */}
          <motion.div 
            whileHover={{ scale: 1.045, y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            whileTap={{ scale: 0.96 }}
            className="group relative w-full sm:w-80 md:w-90 lg:w-105 overflow-hidden rounded-4xl p-8 lg:p-10 font-sans cursor-pointer transition-colors duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(232, 244, 255, 0.75) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(218, 238, 255, 0.60) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.07), 0 0 25px rgba(59, 130, 246, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            <div className="absolute -top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-125"></div>
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-black/6 pb-5">
                <div className="relative flex h-13 w-13 lg:h-14 lg:w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#93C5FD] to-[#2563EB] p-px shadow-[0_8px_20px_-4px_rgba(37,99,235,0.45),inset_0_1px_2px_rgba(255,255,255,0.9)] group-hover:scale-110 group-hover:shadow-[0_12px_28px_-4px_rgba(37,99,235,0.65)] transition-all duration-300">
                  <div className="w-full h-full rounded-[14px] bg-linear-to-b from-white/70 via-[#EFF6FF]/80 to-[#DBEAFE]/80 backdrop-blur-md flex items-center justify-center border border-white/80 shadow-inner">
                    <Droplets className="h-6 w-6 lg:h-7 lg:w-7 text-blue-600" strokeWidth={2.2} />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1B1E19]">{t('monitoring', 'Advisory')}</p>
                  <p className="text-sm text-[#6B6F63]">Action needed</p>
                </div>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-semibold text-[#1B1E19] tracking-tight leading-tight">{t('advisory_action', 'Delay irrigation')}</p>
                <p className="mt-3 text-base font-semibold text-blue-600">{t('rain_expected', 'Rain expected today')}</p>
              </div>
            </div>
          </motion.div>

          {/* Stat 4 (Risk Card) */}
          <motion.div 
            whileHover={{ scale: 1.045, y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            whileTap={{ scale: 0.96 }}
            className="group relative w-full sm:w-80 md:w-90 lg:w-105 overflow-hidden rounded-4xl p-8 lg:p-10 font-sans cursor-pointer transition-colors duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 236, 236, 0.75) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(254, 220, 220, 0.60) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.07), 0 0 25px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            <div className="absolute -top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-125"></div>
            <div className="relative flex flex-col gap-6 h-full justify-between">
              <div className="flex items-center gap-4 border-b border-black/6 pb-5">
                <div className="relative flex h-13 w-13 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-linear-to-br from-[#FF6B6B] to-[#DC2626] p-0.5 shadow-[0_8px_22px_-4px_rgba(220,38,38,0.55),inset_0_1px_2px_rgba(255,255,255,0.9)] group-hover:scale-110 group-hover:shadow-[0_12px_30px_-4px_rgba(220,38,38,0.75)] transition-all duration-300">
                  <div className="relative w-full h-full rounded-full bg-linear-to-b from-white/80 via-[#FFEBEB]/85 to-[#FFCDCD]/85 backdrop-blur-md flex items-center justify-center border border-white/90 shadow-inner overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/70 to-transparent pointer-events-none" />
                    <ShieldAlert className="h-6 w-6 lg:h-7 lg:w-7 text-red-600 drop-shadow-[0_2px_4px_rgba(220,38,38,0.25)] relative z-10" strokeWidth={2.2} />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1B1E19]">{t('risk_level', 'Risk Level')}</p>
                  <p className="text-sm font-semibold text-red-600">{t('high_risk', 'High Risk')}</p>
                </div>
              </div>
              <div>
                <div className="text-6xl md:text-7xl font-bold text-[#1B1E19] tracking-tight leading-none mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>81<span className="text-4xl text-[#6B6F63]">/100</span></div>
                <p className="text-base font-medium text-[#6B6F63]">{t('rainfall_deficit', 'Rainfall 35% below normal')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Smart Farm Dashboard */}
      <section className="relative z-20 bg-transparent py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">

            {/* Left Column: Overview + Monitoring */}
            <div className="md:col-span-4 flex flex-col gap-6">

              {/* Farm Overview Card */}
              <motion.div
                onClick={() => router.push('/farmer-profile')}
                whileHover={{ scale: 1.045, y: -8, transition: { type: 'spring', stiffness: 450, damping: 12 } }}
                whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 550, damping: 14 } }}
                className="relative overflow-hidden rounded-[28px] p-6 text-[#1B1E19] transition-colors duration-300 hover:shadow-[0_24px_50px_-10px_rgba(214,242,75,0.35)] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(244, 252, 230, 0.60) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.06), 0 0 25px rgba(214, 242, 75, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D6F24B]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-13 h-13 rounded-full p-0.5 bg-linear-to-tr from-[#D6F24B] to-emerald-400 shadow-[0_0_16px_rgba(214,242,75,0.6)] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://ui-avatars.com/api/?name=Ramesh+Singh&background=D6F24B&color=1B1E19" alt="Ramesh" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1B1E19]">Ramesh Singh</h2>
                    <div className="text-sm text-[#6B6F63] flex items-center gap-1"><MapPin size={13} className="text-[#E4572E]" /> Mayurbhanj, Odisha</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div className="bg-black/4 p-2.5 rounded-xl border border-black/6">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-[#1B1E19]/60 mb-1">{t('land_size_label', 'LAND SIZE')}</div>
                    <div className="font-semibold text-[#1B1E19]">2.5 Acres</div>
                  </div>
                  <div className="bg-black/4 p-2.5 rounded-xl border border-black/6">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-[#1B1E19]/60 mb-1">{t('crop_label', 'CROP')}</div>
                    <div className="font-semibold text-[#1B1E19]">Paddy (Rice)</div>
                  </div>
                  <div className="bg-black/4 p-2.5 rounded-xl border border-black/6">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-[#1B1E19]/60 mb-1">{t('season_label', 'SEASON')}</div>
                    <div className="font-semibold text-[#1B1E19]">Kharif 2026</div>
                  </div>
                  <div className="bg-black/4 p-2.5 rounded-xl border border-black/6">
                    <div className="text-[11px] font-semibold tracking-wide uppercase text-[#1B1E19]/60 mb-1">{t('sowing_date_label', 'SOWING DATE')}</div>
                    <div className="font-semibold text-[#1B1E19]">June 15</div>
                  </div>
                </div>
              </motion.div>

              {/* Active Farmer Locations Card */}
              {farmerLocations.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.045, y: -8, transition: { type: 'spring', stiffness: 450, damping: 12 } }}
                  whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 550, damping: 14 } }}
                  className="relative overflow-hidden rounded-[28px] p-6 text-[#1B1E19] transition-colors duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(254, 240, 232, 0.60) 100%)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.06), 0 0 25px rgba(228, 87, 46, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#1B1E19]">
                    <Navigation size={18} className="text-[#E4572E] animate-pulse" /> {t('active_field_locations', 'Active Field Locations')}
                  </h3>
                  <div className="space-y-4">
                    {farmerLocations.map((loc, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black/4 p-3 rounded-xl border border-black/6 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1B1E19] flex items-center justify-center text-[#D6F24B] text-xs font-bold shadow-[0_0_10px_rgba(214,242,75,0.4)]">
                            {loc.farmerId.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1B1E19]">{loc.farmerId}</div>
                            <div className="text-xs text-[#6B6F63]">
                              Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Crop Health Monitoring Card */}
              <motion.div
                whileHover={{ scale: 1.045, y: -8, transition: { type: 'spring', stiffness: 450, damping: 12 } }}
                whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 550, damping: 14 } }}
                className="relative overflow-hidden rounded-[28px] p-6 text-[#1B1E19] transition-colors duration-300 hover:shadow-[0_24px_50px_-10px_rgba(214,242,75,0.35)] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(242, 252, 232, 0.60) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.06), 0 0 28px rgba(214, 242, 75, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-[22px] font-semibold mb-5 tracking-tight text-[#1B1E19]">{t('crop_health', 'Crop Health')}</h2>

                {/* NDVI */}
                <div className="mb-6 bg-linear-to-br from-[#EAF7B8]/40 via-lime-500/10 to-transparent rounded-2xl p-4 border border-[#D6F24B]/40 shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <div className="text-sm font-semibold text-[#1B1E19]">{t('ndvi_trend', 'NDVI Trend')}</div>
                    <div className="text-sm font-bold text-[#E4572E]">↓18% {t('vs_30_day_avg', 'vs 30-day avg')}</div>
                  </div>
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ndviHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="ndviGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#84cc16" stopOpacity={0.7} />
                            <stop offset="100%" stopColor="#84cc16" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#65a30d" fill="url(#ndviGlow)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#6B6F63] flex items-center gap-1.5 font-medium"><Droplets size={16} className="text-blue-500" /> {t('soil_moisture', 'Soil Moisture')}</span>
                      <span className="font-bold text-[#E4572E]">{t('low_moisture', 'Low (22%)')}</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/8 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-linear-to-r from-amber-500 to-[#E4572E] rounded-full shadow-sm" style={{ width: '22%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 bg-linear-to-r from-amber-500/15 via-amber-500/8 to-transparent rounded-2xl border border-amber-400/30 shadow-sm backdrop-blur-sm">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#FDE68A] to-[#D97706] p-px shadow-[0_4px_12px_rgba(217,119,6,0.3)] shrink-0">
                      <div className="w-full h-full rounded-[10px] bg-linear-to-b from-white/80 to-[#FEF3C7]/90 flex items-center justify-center border border-white/80">
                        <ThermometerSun size={20} className="text-amber-600" strokeWidth={2.2} />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1B1E19]">{t('overcast_no_rain', 'Overcast, no rain')}</div>
                      <div className="text-xs text-[#6B6F63] mt-0.5">{t('expected_next_5_days', 'Expected for next 5 days')}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-medium text-[#6B6F63]">{t('crop_stage', 'Crop Stage')}</span>
                    <span className="px-3.5 py-1.5 bg-[#D6F24B] text-[#1B1E19] text-xs font-bold tracking-wide uppercase rounded-full shadow-[0_0_14px_rgba(214,242,75,0.4)] border border-lime-300">{t('flowering', 'Flowering')}</span>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Centerpiece: Distress Risk Intelligence */}
            <motion.div
              whileHover={{ scale: 1.012, y: -4, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
              whileTap={{ scale: 0.99 }}
              className="md:col-span-8 relative overflow-hidden rounded-4xl p-8 text-[#1B1E19] flex flex-col transition-all duration-500 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 244, 236, 0.65) 45%, rgba(246, 252, 235, 0.65) 100%)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.08), 0 0 35px rgba(228, 87, 46, 0.18), 0 0 35px rgba(214, 242, 75, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
              }}
            >
              {/* Internal ambient glow orbs */}
              <div className="absolute -top-10 left-10 w-72 h-72 bg-[#E4572E]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-10 w-72 h-72 bg-[#D6F24B]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex justify-between items-start mb-8">
                <h2 className="text-[28px] font-semibold tracking-tight text-[#1B1E19]">{t('distress_intelligence', 'Distress Risk Intelligence')}</h2>
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r from-red-500/15 to-[#E4572E]/15 text-[#E4572E] text-[11px] font-extrabold tracking-wider border border-[#E4572E]/40 uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{t('high_risk', 'HIGH RISK')}</span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 grow">
                {/* Meter Side */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <div className="w-70 h-70" style={{ filter: 'drop-shadow(0 0 16px rgba(228, 87, 46, 0.4))' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius="75%" outerRadius="100%"
                        barSize={20}
                        data={[{ name: 'Risk', value: 81, fill: '#E4572E' }]}
                        startAngle={180} endAngle={0}
                      >
                        <RadialBar background={{ fill: 'rgba(0,0,0,0.06)' }} dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute top-[40%] flex flex-col items-center">
                    <span className="text-[74px] font-bold leading-none tracking-tight text-[#1B1E19]" style={{ fontVariantNumeric: 'tabular-nums' }}>81</span>
                    <span className="text-[#6B6F63] text-sm mt-1 font-semibold">/ 100</span>
                  </div>

                  {/* Trend sparkline under gauge */}
                  <div className="w-36 h-10 -mt-13.75">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskHistory}>
                        <Area type="monotone" dataKey="score" stroke="#E4572E" fill="transparent" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-[#E4572E] mt-2">{t('risk_climbing', 'Risk climbing over 30 days')}</div>
                </div>

                {/* Factors Side */}
                <div className="flex-1 flex flex-col justify-center gap-6">
                  <div>
                    <h3 className="text-[11px] font-bold tracking-wider text-[#6B6F63] uppercase mb-4">{t('contributing_factors', 'Contributing Factors')}</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center bg-black/3 hover:bg-black/6 border border-black/6 hover:border-black/12 px-4 py-3.5 rounded-2xl shadow-sm transition-all duration-300 group/factor">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#FFA07A] to-[#E4572E] p-px shadow-[0_4px_12px_rgba(228,87,46,0.35)] shrink-0">
                            <div className="w-full h-full rounded-[10px] bg-linear-to-b from-white/70 to-[#FFE4DC]/80 flex items-center justify-center border border-white/80">
                              <Wind size={16} className="text-[#E4572E]" strokeWidth={2.2} />
                            </div>
                          </div>
                          <span className="text-[15px] font-semibold text-[#1B1E19]">{t('rainfall_deficit_factor', 'Rainfall −35%')}</span>
                        </div>
                        <span className="text-[#E4572E] text-[15px] font-bold">+28 pts</span>
                      </div>

                      <div className="flex justify-between items-center bg-black/3 hover:bg-black/6 border border-black/6 hover:border-black/12 px-4 py-3.5 rounded-2xl shadow-sm transition-all duration-300 group/factor">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#FDE68A] to-[#D97706] p-px shadow-[0_4px_12px_rgba(217,119,6,0.35)] shrink-0">
                            <div className="w-full h-full rounded-[10px] bg-linear-to-b from-white/70 to-[#FEF3C7]/80 flex items-center justify-center border border-white/80">
                              <Activity size={16} className="text-amber-700" strokeWidth={2.2} />
                            </div>
                          </div>
                          <span className="text-[15px] font-semibold text-[#1B1E19]">{t('market_deficit_factor', 'Market price −22%')}</span>
                        </div>
                        <span className="text-amber-700 text-[15px] font-bold">+19 pts</span>
                      </div>

                      <div className="flex justify-between items-center bg-black/3 hover:bg-black/6 border border-black/6 hover:border-black/12 px-4 py-3.5 rounded-2xl shadow-sm transition-all duration-300 group/factor">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#F87171] to-[#DC2626] p-px shadow-[0_4px_12px_rgba(220,38,38,0.35)] shrink-0">
                            <div className="w-full h-full rounded-[10px] bg-linear-to-b from-white/70 to-[#FEE2E2]/80 flex items-center justify-center border border-white/80">
                              <AlertTriangle size={16} className="text-red-600" strokeWidth={2.2} />
                            </div>
                          </div>
                          <span className="text-[15px] font-semibold text-[#1B1E19]">{t('loan_due_factor', 'Loan due in 8 days')}</span>
                        </div>
                        <span className="text-amber-700 text-[15px] font-bold">+15 pts</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/insurance" className="block w-full">
                    <button className="w-full py-4 mt-2 rounded-full bg-[#D6F24B] text-[#1B1E19] font-bold flex justify-center items-center gap-2 hover:bg-[#cbf026] hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 shadow-[0_0_28px_rgba(214,242,75,0.4),0_8px_20px_rgba(0,0,0,0.06)] border border-lime-300/60">
                      {t('view_insurance_options', 'View Insurance Options')} <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recommended Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <Link href="/crop-monitoring" className="block">
              <motion.div
                whileHover={{ scale: 1.06, y: -10, transition: { type: 'spring', stiffness: 500, damping: 12, mass: 0.6 } }}
                whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 600, damping: 14 } }}
                className="rounded-3xl p-6 flex items-center justify-between cursor-pointer transition-colors duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(238, 252, 218, 0.65) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 16px 36px -10px rgba(27, 30, 25, 0.06), 0 0 25px rgba(214, 242, 75, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex w-12 h-12 rounded-2xl bg-linear-to-br from-[#E4FC67] to-[#BEE627] p-px shadow-[0_8px_20px_-4px_rgba(214,242,75,0.7)] group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-linear-to-b from-white/70 via-[#F3FDE0]/80 to-[#E1F79A]/80 backdrop-blur-md flex items-center justify-center border border-white/80 shadow-inner">
                      <Droplets size={20} className="text-[#1B1E19]" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B1E19] text-[15px]">{t('switch_irrigation', 'Switch irrigation')}</h3>
                    <div className="text-[13px] text-[#6B6F63] mt-0.5">{t('update_schedule_soil', 'Update schedule based on soil')}</div>
                  </div>
                </div>
                <ChevronRight className="text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>

            <Link href="/insurance" className="block">
              <motion.div
                whileHover={{ scale: 1.06, y: -10, transition: { type: 'spring', stiffness: 500, damping: 12, mass: 0.6 } }}
                whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 600, damping: 14 } }}
                className="rounded-3xl p-6 flex items-center justify-between cursor-pointer transition-colors duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(254, 236, 228, 0.65) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 16px 36px -10px rgba(27, 30, 25, 0.06), 0 0 25px rgba(228, 87, 46, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex w-12 h-12 rounded-full bg-linear-to-br from-[#FF7B7B] to-[#DC2626] p-0.5 shadow-[0_8px_20px_-4px_rgba(220,38,38,0.55)] group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <div className="w-full h-full rounded-full bg-linear-to-b from-white/80 via-[#FFEBEB]/85 to-[#FFCDCD]/85 backdrop-blur-md flex items-center justify-center border border-white/90 shadow-inner">
                      <ShieldAlert size={20} className="text-red-600" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B1E19] text-[15px]">{t('apply_insurance', 'Apply insurance')}</h3>
                    <div className="text-[13px] text-[#6B6F63] mt-0.5">{t('high_risk_crossed', 'High risk threshold crossed')}</div>
                  </div>
                </div>
                <ChevronRight className="text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>

            <Link href="/alternative-crop" className="block">
              <motion.div
                whileHover={{ scale: 1.06, y: -10, transition: { type: 'spring', stiffness: 500, damping: 12, mass: 0.6 } }}
                whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 600, damping: 14 } }}
                className="rounded-3xl p-6 flex items-center justify-between cursor-pointer transition-colors duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(232, 252, 238, 0.65) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 16px 36px -10px rgba(27, 30, 25, 0.06), 0 0 25px rgba(34, 197, 94, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex w-12 h-12 rounded-2xl bg-linear-to-br from-[#86EFAC] to-[#22C55E] p-px shadow-[0_8px_20px_-4px_rgba(34,197,94,0.55)] group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-linear-to-b from-white/70 via-[#ECFDF5]/80 to-[#DCFCE7]/80 backdrop-blur-md flex items-center justify-center border border-white/80 shadow-inner">
                      <Sparkles size={20} className="text-[#1B1E19]" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B1E19] text-[15px]">{t('alternative_crops', 'Alternative crops')}</h3>
                    <div className="text-[13px] text-[#6B6F63] mt-0.5">{t('explore_resilient_options', 'Explore climate-resilient options')}</div>
                  </div>
                </div>
                <ChevronRight className="text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}
