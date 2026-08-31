"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import bgDesktop from '@/Government equipment schemes/img/1(1).png';
import bgMobile from '@/Agriculture officer dashboard/img/3.png';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Clock, 
  Search, 
  RotateCcw, 
  Eye, 
  X, 
  Calendar, 
  PhoneCall, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  Ban, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface InterventionRecord {
  id: string;
  officer_id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_village?: string;
  intervention_type: string;
  notes?: string;
  outcome?: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface SummaryMeta {
  totalInterventions: number;
  highRiskInterventions: number;
  completedCount: number;
  scheduledCount: number;
}

export default function OfficerInterventionHistory() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Data States
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
    hasMore: false
  });
  const [summary, setSummary] = useState<SummaryMeta>({
    totalInterventions: 0,
    highRiskInterventions: 0,
    completedCount: 0,
    scheduledCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected Detail Modal State
  const [selectedItem, setSelectedItem] = useState<InterventionRecord | null>(null);

  // Fetch Interventions
  const fetchInterventions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setFilterLoading(true);
      }
      setError('');

      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '8');

      const res = await fetch(`/api/officer/interventions?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load intervention records');
      }

      const json = await res.json();
      if (json?.data) {
        setInterventions(json.data);
      }
      if (json?.pagination) {
        setPagination(json.pagination);
      }
      if (json?.summary) {
        setSummary(json.summary);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching records');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, [search, startDate, endDate, typeFilter, statusFilter, page]);

  useEffect(() => {
    fetchInterventions(true);
  }, [fetchInterventions]);

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  const getTypeIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('call') || lower.includes('phone')) return <PhoneCall className="w-4 h-4 text-sky-600" />;
    if (lower.includes('advisory') || lower.includes('emergency')) return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    if (lower.includes('visit') || lower.includes('field') || lower.includes('inspection')) return <Compass className="w-4 h-4 text-emerald-700" />;
    return <FileText className="w-4 h-4 text-neutral-700" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100/90 text-amber-800 border border-amber-300">
            <Clock3 className="w-3 h-3" /> In Progress
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100/90 text-blue-800 border border-blue-300">
            <Calendar className="w-3 h-3" /> Scheduled
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-200 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-[#1A1A1A]">
      {/* Background Frame Shell */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Desktop 16:9 Image */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src={bgDesktop}
            alt="Interventions Background Desktop"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Mobile 9:16 Image */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src={bgMobile}
            alt="Interventions Background Mobile"
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
        <Sidebar isOpen={sidebarOpen} activeKey="intervention_history" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-auto space-y-5 pr-1 max-w-7xl">
            {/* Top Bar Header & Metrics */}
            <div className="glass rounded-2xl p-5 shadow-sm border border-white/60">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Clock className="w-6 h-6 text-[#1A1A1A]" />
                    {t('intervention_history', 'Officer Intervention History')}
                  </h1>
                  <p className="text-xs text-neutral-600 mt-1">
                    Complete administrative record of field visits, emergency advisories, and distress mitigations in Mayurbhanj District.
                  </p>
                </div>

                {/* Summary Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white/60 backdrop-blur-sm border border-black/5 rounded-xl px-3 py-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total Logged</div>
                    <div className="text-lg font-extrabold text-[#1A1A1A]">{summary.totalInterventions}</div>
                  </div>
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Critical Risk</div>
                    <div className="text-lg font-extrabold text-red-700">{summary.highRiskInterventions}</div>
                  </div>
                  <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Resolved</div>
                    <div className="text-lg font-extrabold text-emerald-800">{summary.completedCount}</div>
                  </div>
                  <div className="bg-[#CFE362]/30 backdrop-blur-sm border border-[#CFE362]/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-neutral-700 tracking-wider">Scheduled</div>
                    <div className="text-lg font-extrabold text-[#1A1A1A]">{summary.scheduledCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar Panel */}
            <div className="glass rounded-2xl p-4 shadow-sm border border-white/60 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search Input */}
                <div className="relative lg:col-span-2">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search farmer name, ID, or notes..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A]"
                  />
                </div>

                {/* Intervention Type Dropdown */}
                <div>
                  <select
                    value={typeFilter}
                    onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A] font-medium cursor-pointer"
                  >
                    <option value="ALL">All Intervention Types</option>
                    <option value="Field Visit">Field Inspection / Visit</option>
                    <option value="Emergency Advisory">Emergency Advisory</option>
                    <option value="Phone Call">Phone Consultation</option>
                    <option value="Insurance Registration">Insurance Registration</option>
                    <option value="Alternative Crop Assessment">Crop Assessment</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362] text-[#1A1A1A] font-medium cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Reset Filters Action */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full py-2 px-3 rounded-xl bg-white/60 hover:bg-white text-neutral-700 font-semibold text-xs transition-all border border-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Date Range Sub-Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/5 text-xs text-neutral-600">
                <span className="font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Filter Date Range:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); setPage(1); }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362]"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => { setEndDate(e.target.value); setPage(1); }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white/70 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#CFE362]"
                  />
                </div>
                {filterLoading && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1 ml-auto">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating results...
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass rounded-xl p-4 bg-red-50/80 border border-red-200 text-red-800 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => fetchInterventions()}
                  className="px-3 py-1 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* List / Timeline View */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="glass rounded-2xl p-5 h-24 animate-pulse bg-white/40" />
                ))}
              </div>
            ) : interventions.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-white/60 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A]">
                  {search || startDate || endDate || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'No Interventions match the selected filters'
                    : 'No interventions logged yet'}
                </h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  {search || startDate || endDate || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Try clearing the search query or adjusting the date range filters above.'
                    : 'Scheduled field visits, emergency advisories, and triage actions will appear here.'}
                </p>
                {(search || startDate || endDate || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 px-4 py-2 bg-[#CFE362] text-[#1A1A1A] font-bold text-xs rounded-xl shadow-sm hover:bg-[#b8cc50] cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {interventions.map(item => {
                  const isHighRisk = item.risk_level === 'HIGH';
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-[1.003] hover:shadow-md ${
                        isHighRisk
                          ? 'bg-neutral-900/90 text-white border-red-500/40 shadow-sm'
                          : 'glass text-[#1A1A1A] border-white/60 hover:bg-white/80'
                      }`}
                    >
                      {/* Left Block: Date + Type Icon + Farmer Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        {/* Type Icon Badge */}
                        <div
                          className={`p-3 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${
                            isHighRisk ? 'bg-red-950/80 border border-red-500/30 text-red-400' : 'bg-[#CFE362] text-[#1A1A1A]'
                          }`}
                        >
                          {getTypeIcon(item.intervention_type)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-bold ${isHighRisk ? 'text-white' : 'text-[#1A1A1A]'}`}>
                              {item.farmer_name}
                            </span>
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                              isHighRisk ? 'bg-neutral-800 text-neutral-300' : 'bg-black/5 text-neutral-600'
                            }`}>
                              {item.farmer_id}
                            </span>
                            {isHighRisk && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                                <ShieldAlert className="w-2.5 h-2.5" /> High Risk Case
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                            <span className={`font-semibold ${isHighRisk ? 'text-[#CFE362]' : 'text-neutral-700'}`}>
                              {item.intervention_type}
                            </span>
                            <span className={isHighRisk ? 'text-neutral-400' : 'text-neutral-500'}>•</span>
                            <span className={`flex items-center gap-1 ${isHighRisk ? 'text-neutral-300' : 'text-neutral-600'}`}>
                              <MapPin className="w-3 h-3 text-emerald-500" />
                              {item.farmer_village || 'Mayurbhanj District'}
                            </span>
                            <span className={isHighRisk ? 'text-neutral-400' : 'text-neutral-500'}>•</span>
                            <span className={isHighRisk ? 'text-neutral-400' : 'text-neutral-500'}>
                              {new Date(item.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          {/* Notes preview */}
                          {item.notes && (
                            <p className={`text-xs mt-1.5 line-clamp-1 max-w-xl ${isHighRisk ? 'text-neutral-300' : 'text-neutral-600'}`}>
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Status + View CTA */}
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {getStatusBadge(item.status)}
                        <button
                          type="button"
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                            isHighRisk
                              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              : 'bg-black/5 hover:bg-black/10 text-[#1A1A1A]'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="glass rounded-xl p-3 flex items-center justify-between text-xs text-neutral-700 border border-white/60">
                <div>
                  Showing page <span className="font-bold">{pagination.page}</span> of{' '}
                  <span className="font-bold">{pagination.totalPages}</span> ({pagination.total} total items)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-neutral-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    disabled={!pagination.hasMore}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-neutral-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Detail Drawer / Modal on Row Selection */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass bg-white/95 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-black/5 hover:bg-black/10 text-neutral-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-black/10">
              <div className="p-3 rounded-2xl bg-[#CFE362] text-[#1A1A1A] font-bold shadow-sm">
                {getTypeIcon(selectedItem.intervention_type)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">{selectedItem.intervention_type}</h3>
                <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                  <span>Record ID: {selectedItem.id}</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedItem.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="mt-5 space-y-4">
              {/* Farmer Info Card */}
              <div className="p-4 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs text-neutral-500 font-semibold uppercase">Farmer Details</div>
                  <div className="text-base font-bold text-[#1A1A1A] mt-0.5">{selectedItem.farmer_name}</div>
                  <div className="text-xs text-neutral-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {selectedItem.farmer_village || 'Mayurbhanj District'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {getStatusBadge(selectedItem.status)}
                  <Link
                    href={`/officer-dashboard/farmers/${selectedItem.farmer_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline mt-1"
                  >
                    View Farmer Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Officer Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Inspection Notes & Advisory
                </h4>
                <div className="p-4 rounded-2xl bg-white/70 border border-neutral-200 text-xs text-neutral-800 leading-relaxed">
                  {selectedItem.notes || 'No detailed inspection notes recorded for this action.'}
                </div>
              </div>

              {/* Logged Outcome */}
              {selectedItem.outcome && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Recorded Outcome & Resolution
                  </h4>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed">
                    {selectedItem.outcome}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white font-bold text-xs hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
