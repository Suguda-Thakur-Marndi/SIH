'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Toggle, Toast, BANK_PAGE_CONTAINER_STYLE, BANK_PRIMARY_BTN_STYLE } from '../ui/BankComponents';

interface FacilityRow {
  id: string;
  facilityName: string;
  facilityType: string;
  status: string;
  minimumAmount: number | null;
  maximumAmount: number | null;
  interestRate: string | null;
  tenure: string | null;
  createdAt: string;
  updatedAt: string;
}

// DB status -> display label + badge colors (8 statuses in financial_facilities)
const STATUS_DISPLAY: Record<string, { label: string; bg: string; color: string; border: string }> = {
  published:    { label: 'Published',    bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  draft:        { label: 'Draft',        bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  submitted:    { label: 'Submitted',    bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  under_review: { label: 'Under Review', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  approved:     { label: 'Approved',     bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  unpublished:  { label: 'Unpublished',  bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  expired:      { label: 'Expired',      bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  suspended:    { label: 'Suspended',    bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
};

const NEUTRAL_STATUS = { label: '', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtINR = (v: number | null) =>
  v === null
    ? '—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function ManageFacilitiesPage() {
  const searchParams = useSearchParams();
  const bankId = searchParams?.get('bankId') || 'bank_test_facility_check';
  const [bankName, setBankName] = useState('');
  const [facilities, setFacilities] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const loadFacilities = useCallback(async (showLoading = true) => {
    if (!bankId) {
      setError('No bank selected. Open this page with your bank id, e.g. /bank-portal/facilities/manage?bankId=bank_xxx');
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/banks/${encodeURIComponent(bankId)}/facilities`);
      const json = await res.json().catch(() => ({}) as { error?: string });
      if (res.ok) {
        setBankName(json.bank.bankName);
        setFacilities(json.facilities);
        setError('');
      } else {
        setError(json.error || `Failed to load facilities (HTTP ${res.status}).`);
      }
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const togglePublish = async (f: FacilityRow) => {
    if (togglingId) return;
    const target = f.status === 'published' ? 'draft' : 'published';
    setTogglingId(f.id);
    try {
      const res = await fetch(`/api/facilities/${encodeURIComponent(f.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (res.ok) {
        showToast(
          target === 'published'
            ? 'Facility published successfully!'
            : 'Facility unpublished and saved as draft.',
          'success'
        );
        await loadFacilities(false);
      } else {
        showToast(data.error || 'Status update failed. Please try again.', 'error');
      }
    } catch {
      showToast('Network error — could not reach the server.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteFacility = async (f: FacilityRow) => {
    if (deletingId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${f.facilityName}"?\n\nThis facility will be removed from your active portal.`
    );
    if (!confirmed) return;

    setDeletingId(f.id);
    try {
      const res = await fetch(`/api/facilities/${encodeURIComponent(f.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deleted' }),
      });
      const data = await res.json().catch(() => ({}) as { error?: string });
      if (res.ok) {
        showToast('Facility deleted successfully.', 'success');
        await loadFacilities(false);
      } else {
        showToast(data.error || 'Failed to delete facility.', 'error');
      }
    } catch {
      showToast('Network error — could not reach the server.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div style={{ ...BANK_PAGE_CONTAINER_STYLE, position: 'relative' }}>
        <div
          className="fixed inset-0 -z-20 block md:hidden bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: "url('/bg-phone.png')" }}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 -z-20 hidden md:block bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg-laptop.png')" }}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 -z-10"
          style={{ background: "rgba(240, 248, 235, 0.82)", backdropFilter: "blur(4px)" }}
          aria-hidden="true"
        />
        <div style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'center', padding: '5rem 1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: '#166534', fontWeight: 700 }}>Loading facilities…</p>
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div style={{ ...BANK_PAGE_CONTAINER_STYLE, position: 'relative' }}>
        <div
          className="fixed inset-0 -z-20 block md:hidden bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: "url('/bg-phone.png')" }}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 -z-20 hidden md:block bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg-laptop.png')" }}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 -z-10"
          style={{ background: "rgba(240, 248, 235, 0.82)", backdropFilter: "blur(4px)" }}
          aria-hidden="true"
        />
        <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '3rem', position: 'relative', zIndex: 1 }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>⚠️</div>
              <h2 style={{ color: '#991b1b', margin: '0 0 0.5rem' }}>Could not load facilities</h2>
              <p style={{ color: '#475569', margin: 0 }}>{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...BANK_PAGE_CONTAINER_STYLE, position: 'relative' }} className="selection:bg-emerald-500 selection:text-white">
      {/* ── Fixed background layer from Crop Monitoring ── */}
      <div
        className="fixed inset-0 -z-20 block md:hidden bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: "url('/bg-phone.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-20 hidden md:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-laptop.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "rgba(240, 248, 235, 0.82)", backdropFilter: "blur(4px)" }}
        aria-hidden="true"
      />

      <style>{`
        .facility-action-link {
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .facility-action-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .add-facility-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35) !important;
        }
      `}</style>

      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220, 252, 231, 0.95)', border: '1px solid rgba(74, 222, 128, 0.5)', color: '#166534', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
              <span>🏦</span>
              <span>BANK PARTNER PORTAL</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.3rem', letterSpacing: '-0.02em' }}>
              Manage Facilities
            </h1>
            <p style={{ color: '#475569', fontSize: '1rem', margin: 0 }}>
              {bankName} · <strong>{facilities.length}</strong> listed facilities
            </p>
          </div>
          <Link
            href={`/bank-portal/facilities/add?bankId=${bankId}`}
            className="add-facility-btn"
            style={BANK_PRIMARY_BTN_STYLE}
          >
            <span>+</span> Add New Facility
          </Link>
        </div>

        {/* Facility Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {facilities.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>📋</div>
                <p style={{ color: '#475569', fontSize: '0.98rem', margin: 0 }}>
                  No facilities yet — click "+ Add New Facility" to create your first listing.
                </p>
              </div>
            </Card>
          ) : (
            facilities.map(f => {
              const sd = STATUS_DISPLAY[f.status] ?? { ...NEUTRAL_STATUS, label: f.status };
              return (
                <Card key={f.id} hoverEffect={true}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>{f.facilityName}</span>
                        <span
                          style={{
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            background: sd.bg,
                            color: sd.color,
                            border: `1px solid ${sd.border}`,
                          }}
                        >
                          {sd.label}
                        </span>
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 500 }}>
                        {f.facilityType} · <strong style={{ color: '#166534' }}>{f.interestRate || '—'}</strong> · Updated {fmtDate(f.updatedAt)}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                        Amount: <strong style={{ color: '#0f172a' }}>{fmtINR(f.minimumAmount)} – {fmtINR(f.maximumAmount)}</strong> · Tenure: {f.tenure || '—'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ background: '#f8fafd', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', opacity: togglingId === f.id ? 0.5 : 1, transition: 'opacity 0.15s ease' }}>
                        <Toggle
                          checked={f.status === 'published'}
                          onChange={() => togglePublish(f)}
                          label={sd.label}
                        />
                      </div>
                      <Link
                        href={`/bank-portal/facilities/add?bankId=${encodeURIComponent(bankId)}&id=${encodeURIComponent(f.id)}`}
                        className="facility-action-link"
                        style={{
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          textDecoration: 'none',
                          padding: '0.55rem 1rem',
                          border: '1.5px solid #bbf7d0',
                          borderRadius: '8px',
                          background: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        href={`/financial-support/detail?id=${encodeURIComponent(f.id)}&bankId=${encodeURIComponent(bankId)}`}
                        className="facility-action-link"
                        style={{
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          textDecoration: 'none',
                          padding: '0.55rem 1rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          background: '#ffffff',
                        }}
                      >
                        👁️ View
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteFacility(f)}
                        disabled={deletingId === f.id}
                        className="facility-action-link"
                        style={{
                          color: '#991b1b',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          padding: '0.55rem 0.9rem',
                          border: '1.5px solid #fecaca',
                          borderRadius: '8px',
                          background: '#ffffff',
                          cursor: deletingId === f.id ? 'not-allowed' : 'pointer',
                          opacity: deletingId === f.id ? 0.6 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {toast && <Toast message={toast} type={toastType} />}
    </div>
  );
}
