'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DISCLAIMER } from '../data';
import { GlassCard, DisclaimerBox } from '../ui/FarmerComponents';

interface FacilityDetail {
  id: string;
  bankId: string;
  bankName: string;
  bankVerified: boolean;
  facilityName: string;
  facilityType: string;
  shortDescription: string | null;
  detailedDescription: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  interestRate: string | null;
  tenure: string | null;
  repayment: string | null;
  processingFee: string | null;
  otherCharges: string | null;
  farmerType: string[];
  minLand: string | null;
  maxLand: string | null;
  cropTypes: string[];
  states: string[];
  districts: string[];
  otherEligibility: string | null;
  documents: string[];
  benefits: string[];
  termsText: string | null;
  termsUrl: string | null;
  applicationUrl: string | null;
  status: string;
  lastUpdated: string;
  expiryDate?: string | null;
}

function formatInr(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(num)) return String(val);
  return '₹' + num.toLocaleString('en-IN');
}

export default function FacilityDetailPage() {
  const params = useSearchParams();
  const id = params?.get('id');
  const bankId = params?.get('bankId');

  const [facility, setFacility] = useState<FacilityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  // Refs guard against firing the same event twice per page visit.
  // useRef persists across re-renders without triggering them.
  const viewFired = useRef(false);
  const termsViewFired = useRef(false);

  // Fire-and-forget analytics: never await, never surface errors to the user.
  const trackEvent = (facilityId: string, eventType: 'VIEW' | 'TERMS_VIEW' | 'APPLY_CLICK') => {
    fetch(`/api/facilities/${encodeURIComponent(facilityId)}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, farmerLocation: null }),
    }).catch(e => console.warn(`[analytics] ${eventType} event silently failed:`, e));
  };

  useEffect(() => {
    if (!id) {
      setError('No facility ID provided.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const bankIdParam = (bankId && bankId.trim() !== '') ? `?bankId=${encodeURIComponent(bankId)}` : '';
    fetch(`/api/facilities/${encodeURIComponent(id)}${bankIdParam}`)
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Facility not found or currently unavailable.');
        }
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setFacility(data);
          setLoading(false);
          // Fire VIEW once per page visit — guarded by ref so Strict Mode
          // double-invocation and back-navigation don't produce duplicates.
          if (!viewFired.current) {
            viewFired.current = true;
            trackEvent(data.id, 'VIEW');
          }
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load facility.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, bankId]);

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '0.75rem',
        padding: '0.65rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.45)',
      }}
    >
      <span
        style={{
          fontSize: '0.78rem',
          fontWeight: 800,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          alignSelf: 'center',
        }}
      >
        {label}
      </span>
      <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.95rem' }}>{value}</span>
    </div>
  );

  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <style>{`
        .farmer-back-link {
          transition: transform 0.2s, background-color 0.2s;
        }
        .farmer-back-link:hover {
          transform: translateX(-3px);
          background: rgba(255, 255, 255, 0.85) !important;
          color: #166534 !important;
        }
        .apply-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(22, 101, 52, 0.4) !important;
        }
        .terms-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.85) !important;
          transform: translateY(-1px);
        }
        @keyframes pulseSkeleton {
          0% { opacity: 0.6; }
          50% { opacity: 0.9; }
          100% { opacity: 0.6; }
        }
      `}</style>

      {/* Natural Grass Photo Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/farmer-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(1.15) saturate(108%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(0, 0, 0, 0.05) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '2.25rem 1.25rem 3.5rem',
          maxWidth: '780px',
          margin: '0 auto',
        }}
      >
        {/* Back Link */}
        <Link
          href="/financial-support"
          className="farmer-back-link"
          style={{
            color: '#166534',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '1.25rem',
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(10px)',
            padding: '0.45rem 1rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          ← Back to All Facilities
        </Link>

        {/* Loading State */}
        {loading && (
          <GlassCard style={{ padding: '3rem 2rem', textAlign: 'center', animation: 'pulseSkeleton 1.5s infinite' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌱</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1a0e', margin: '0 0 0.5rem' }}>
              Loading Facility Details...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Fetching verified information from the bank partner portal.
            </p>
          </GlassCard>
        )}

        {/* Error State — Real 404 / Error without mock fallback */}
        {!loading && (error || !facility) && (
          <GlassCard style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1.5px solid #f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              }}
            >
              ⚠️
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Facility Not Found
            </h1>
            <p style={{ color: '#475569', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
              {error || 'This financial facility is either unavailable, unpublished, or the requested link does not exist.'}
            </p>
            <Link
              href="/financial-support"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.25)',
              }}
            >
              Browse Active Facilities →
            </Link>
          </GlassCard>
        )}

        {/* Loaded Facility Content */}
        {!loading && facility && (
          <>
            {/* Facility Header GlassCard */}
            <GlassCard style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      boxShadow: '0 2px 8px rgba(22,101,52,0.25)',
                    }}
                  >
                    🏦
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0b1a0e', fontSize: '1.1rem' }}>
                      {facility.bankName}
                    </div>
                    {facility.bankVerified && (
                      <div
                        style={{
                          color: '#16a34a',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          marginTop: '0.1rem',
                        }}
                      >
                        ✓ VERIFIED BANK PARTNER
                      </div>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    background: 'rgba(220, 252, 231, 0.95)',
                    color: '#166534',
                    border: '1px solid rgba(74, 222, 128, 0.5)',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                  }}
                >
                  {facility.facilityType}
                </span>
              </div>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#0b1a0e',
                  margin: '0 0 0.4rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {facility.facilityName}
              </h1>
              {facility.detailedDescription && (
                <p style={{ color: '#334155', margin: 0, lineHeight: 1.6, fontSize: '0.92rem' }}>
                  {facility.detailedDescription}
                </p>
              )}
              {facility.lastUpdated && (
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0, fontWeight: 500 }}>
                  Last Updated by Bank: <strong style={{ color: '#0f172a' }}>{facility.lastUpdated}</strong>
                </p>
              )}
            </GlassCard>

            {/* Financial Info GlassCard */}
            <GlassCard style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>💰</span>
                <h2
                  style={{
                    color: '#0b1a0e',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: 0,
                  }}
                >
                  Loan Amount &amp; Terms
                </h2>
              </div>
              {(facility.minAmount !== null || facility.maxAmount !== null) && (
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#166534',
                    marginBottom: '0.85rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {facility.minAmount !== null && facility.maxAmount !== null
                    ? `${formatInr(facility.minAmount)} – ${formatInr(facility.maxAmount)}`
                    : facility.minAmount !== null
                    ? `From ${formatInr(facility.minAmount)}`
                    : `Up to ${formatInr(facility.maxAmount)}`}
                </div>
              )}
              {facility.interestRate && <InfoRow label="Interest Rate" value={facility.interestRate} />}
              {facility.tenure && <InfoRow label="Tenure Period" value={facility.tenure} />}
              {facility.repayment && <InfoRow label="Repayment Mode" value={facility.repayment} />}
              {facility.processingFee && <InfoRow label="Processing Fee" value={facility.processingFee} />}
              {facility.otherCharges && <InfoRow label="Other Charges" value={facility.otherCharges} />}
            </GlassCard>

            {/* Eligibility GlassCard */}
            {(facility.farmerType.length > 0 ||
              facility.minLand ||
              facility.cropTypes.length > 0 ||
              facility.states.length > 0 ||
              facility.districts.length > 0 ||
              facility.otherEligibility) && (
              <GlassCard style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>👥</span>
                  <h2
                    style={{
                      color: '#0b1a0e',
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Eligibility Criteria
                  </h2>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {facility.farmerType.map(t => (
                    <li
                      key={t}
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Eligible: {t}
                    </li>
                  ))}
                  {facility.minLand && (
                    <li
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Minimum Land Holding:{' '}
                      <strong>{facility.minLand}</strong>
                    </li>
                  )}
                  {facility.cropTypes.length > 0 && (
                    <li
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Eligible Crops:{' '}
                      <strong>{facility.cropTypes.join(', ')}</strong>
                    </li>
                  )}
                  {facility.states.length > 0 && (
                    <li
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Applicable States:{' '}
                      {facility.states.join(', ')}
                    </li>
                  )}
                  {facility.districts.length > 0 && (
                    <li
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Applicable Districts:{' '}
                      {facility.districts.join(', ')}
                    </li>
                  )}
                  {facility.otherEligibility && (
                    <li
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> {facility.otherEligibility}
                    </li>
                  )}
                </ul>
                <div
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.75rem 0.9rem',
                    background: 'rgba(254, 243, 199, 0.85)',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', fontStyle: 'italic', fontWeight: 600 }}>
                    You may be eligible. Final eligibility and approval are determined by the bank.
                  </p>
                </div>
              </GlassCard>
            )}

            {/* Required Documents GlassCard */}
            {facility.documents.length > 0 && (
              <GlassCard style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📑</span>
                  <h2
                    style={{
                      color: '#0b1a0e',
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Required Documents
                  </h2>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  {facility.documents.map(d => (
                    <li
                      key={d}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        padding: '0.4rem 0.65rem',
                        color: '#0f172a',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.55)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.65)',
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> {d}
                    </li>
                  ))}
                </ul>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0, fontStyle: 'italic' }}>
                  ℹ️ Document submission happens securely on the bank&apos;s official website, not on Smart Crop.
                </p>
              </GlassCard>
            )}

            {/* Benefits GlassCard */}
            {facility.benefits.length > 0 && (
              <GlassCard style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🌟</span>
                  <h2
                    style={{
                      color: '#0b1a0e',
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Facility Benefits
                  </h2>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {facility.benefits.map(b => (
                    <li
                      key={b}
                      style={{
                        display: 'flex',
                        gap: '0.65rem',
                        padding: '0.35rem 0',
                        color: '#1e293b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {/* Terms GlassCard */}
            {(facility.termsText || facility.termsUrl) && (
              <GlassCard style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📜</span>
                  <h2
                    style={{
                      color: '#0b1a0e',
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Terms &amp; Conditions
                  </h2>
                </div>
                <button
                  onClick={() => {
                    const next = !showTerms;
                    setShowTerms(next);
                    // TERMS_VIEW fires only on first expand per page visit.
                    if (next && !termsViewFired.current && facility) {
                      termsViewFired.current = true;
                      trackEvent(facility.id, 'TERMS_VIEW');
                    }
                  }}
                  className="terms-toggle-btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.75)',
                    color: '#1e4078',
                    padding: '0.55rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s',
                  }}
                >
                  {showTerms ? '▲ Hide Terms Summary' : '▼ View Terms Summary'}
                </button>
                {showTerms && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.65)',
                      borderRadius: '10px',
                      padding: '1rem 1.25rem',
                      fontSize: '0.88rem',
                      color: '#334155',
                      lineHeight: 1.6,
                      border: '1px solid rgba(255, 255, 255, 0.75)',
                    }}
                  >
                    {facility.termsText && <p style={{ margin: 0 }}>{facility.termsText}</p>}
                    {facility.termsUrl && (
                      <a
                        href={facility.termsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#1d4ed8',
                          fontWeight: 700,
                          display: 'inline-block',
                          marginTop: '0.75rem',
                          textDecoration: 'underline',
                        }}
                      >
                        View Full Terms on Bank Official Website →
                      </a>
                    )}
                  </div>
                )}
              </GlassCard>
            )}

            {/* Disclaimer - Section 33 verbatim */}
            <DisclaimerBox text={DISCLAIMER} />

            {/* CTA Container */}
            <div style={{ marginTop: '1.75rem' }}>
              <GlassCard style={{ padding: '1.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.9rem 1.1rem',
                    background: 'rgba(254, 243, 199, 0.85)',
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                  }}
                >
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>⚠️</span>
                  <p style={{ margin: 0, color: '#78350f', fontSize: '0.85rem', lineHeight: 1.55 }}>
                    <strong>IMPORTANT NOTICE:</strong>
                    <br />
                    Final eligibility, interest rate, approval and terms are determined solely by {facility.bankName}. Smart
                    Crop does not process, approve, or disburse loans.
                  </p>
                </div>

                <Link
                  href={`/financial-support/acknowledgement?id=${encodeURIComponent(facility.id)}${bankId ? `&bankId=${encodeURIComponent(bankId)}` : ''}`}
                  className="apply-cta-btn"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    boxShadow: '0 4px 16px rgba(22, 101, 52, 0.3)',
                    letterSpacing: '0.01em',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Apply on Bank Website →
                </Link>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
