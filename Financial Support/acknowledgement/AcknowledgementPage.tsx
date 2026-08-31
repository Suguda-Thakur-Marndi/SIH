'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface FacilityAckInfo {
  id: string;
  bankName: string;
  facilityName: string;
  applicationUrl: string | null;
}

export default function AcknowledgementPage() {
  const params = useSearchParams();
  const id = params?.get('id');
  const bankId = params?.get('bankId');

  const [facility, setFacility] = useState<FacilityAckInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // Fire-and-forget analytics: never await, never surface errors to the user.
  const trackEvent = (facilityId: string, eventType: 'VIEW' | 'TERMS_VIEW' | 'APPLY_CLICK') => {
    fetch(`/api/facilities/${encodeURIComponent(facilityId)}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, farmerLocation: null }),
    }).catch(e => console.warn(`[analytics] ${eventType} event silently failed:`, e));
  };

  const handleApplyClick = () => {
    if (!facility || !facility.applicationUrl) return;
    // Fire APPLY_CLICK event fire-and-forget — URL opens regardless of outcome.
    trackEvent(facility.id, 'APPLY_CLICK');
    window.open(facility.applicationUrl, '_blank', 'noopener,noreferrer');
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
          if (!data.applicationUrl) {
            throw new Error('This facility does not have an official application URL configured.');
          }
          setFacility({
            id: data.id,
            bankName: data.bankName || 'Bank Partner',
            facilityName: data.facilityName || 'Credit Facility',
            applicationUrl: data.applicationUrl,
          });
          setLoading(false);
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

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
      }}
    >
      <style>{`
        .gated-continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(22, 101, 52, 0.45) !important;
        }
        .ack-checkbox-label {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ack-checkbox-label:hover {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: #16a34a !important;
        }
        .ack-back-link {
          transition: transform 0.2s, background-color 0.2s;
        }
        .ack-back-link:hover {
          transform: translateX(-3px);
          background: rgba(255, 255, 255, 0.85) !important;
          color: #166534 !important;
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
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.35) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '540px', width: '100%' }}>
        {/* Loading State */}
        {loading && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(18px) saturate(170%)',
              WebkitBackdropFilter: 'blur(18px) saturate(170%)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.25)',
              animation: 'pulseSkeleton 1.5s infinite',
            }}
          >
            <div style={{ fontSize: '2.25rem', marginBottom: '0.85rem' }}>🌱</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
              Preparing Bank Gateway...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Verifying official bank redirect link and security parameters.
            </p>
          </div>
        )}

        {/* Error State — Real 404 / Error without mock fallback */}
        {!loading && (error || !facility) && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(18px) saturate(170%)',
              WebkitBackdropFilter: 'blur(18px) saturate(170%)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.25)',
            }}
          >
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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Facility Not Found
            </h1>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
              {error || 'This financial facility is either unavailable, unpublished, or the redirect link is invalid.'}
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
              ← Back to All Facilities
            </Link>
          </div>
        )}

        {/* Loaded Acknowledgement Modal */}
        {!loading && facility && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(18px) saturate(170%)',
              WebkitBackdropFilter: 'blur(18px) saturate(170%)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '2.25rem 2rem',
              boxShadow:
                '0 20px 50px -10px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 1)',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            {/* Top Back Link */}
            <div style={{ marginBottom: '1rem' }}>
              <Link
                href={`/financial-support/detail?id=${encodeURIComponent(facility.id)}`}
                className="ack-back-link"
                style={{
                  color: '#166534',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.65)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                }}
              >
                ← Back to Facility Details
              </Link>
            </div>

            {/* Header Icon & Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1.5px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  margin: '0 auto 0.85rem',
                  boxShadow: '0 4px 14px rgba(245,158,11,0.2)',
                }}
              >
                ⚠️
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem', letterSpacing: '-0.01em' }}>
                Important External Redirect
              </h1>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
                Please review and acknowledge before leaving Smart Crop.
              </p>
            </div>

            {/* Bank Destination Card */}
            <div
              style={{
                background: 'rgba(240, 253, 244, 0.9)',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                marginBottom: '1.35rem',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'center',
                boxShadow: '0 1px 4px rgba(22,101,52,0.06)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(22,101,52,0.25)',
                }}
              >
                🏦
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  You are being redirected to
                </div>
                <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>{facility.bankName}</div>
                <div style={{ color: '#166534', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.1rem' }}>
                  Official Bank Application Portal
                </div>
              </div>
            </div>

            {/* Clarifications List */}
            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', borderRadius: '10px', padding: '0.5rem 1rem', border: '1px solid #e2e8f0' }}>
              {[
                'Smart Crop does not process, approve, or disburse this loan.',
                'Final eligibility, interest rate, documentation, and approval are determined solely by the bank.',
                'You will be redirected to the bank\'s official website to complete your application.',
                'Smart Crop never collects your loan application documents or banking credentials.',
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                    padding: '0.6rem 0',
                    borderBottom: i < 3 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ color: '#b45309', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>
                    •
                  </span>
                  <p style={{ margin: 0, color: '#334155', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 500 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {/* Checkbox Acknowledgment */}
            <label
              className="ack-checkbox-label"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.8rem',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: checked ? '#f0fdf4' : '#f8fafd',
                border: checked ? '1.5px solid #16a34a' : '1.5px solid #cbdcf2',
                borderRadius: '12px',
                boxShadow: checked ? '0 0 0 3px rgba(22, 163, 74, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div
                onClick={() => setChecked((c: boolean) => !c)}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  flexShrink: 0,
                  marginTop: '1px',
                  border: '2px solid',
                  borderColor: checked ? '#16a34a' : '#94a3b8',
                  background: checked ? '#16a34a' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {checked && <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 800, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.55, userSelect: 'none', fontWeight: 600 }}>
                I have read and understood the displayed terms and conditions. I understand that Smart Crop is only redirecting me to the bank&apos;s official website and is not processing my loan application.
              </span>
            </label>

            {/* Continue Button */}
            <button
              onClick={checked && facility.applicationUrl ? handleApplyClick : undefined}
              disabled={!checked || !facility.applicationUrl}
              aria-disabled={!checked || !facility.applicationUrl}
              className={checked && facility.applicationUrl ? 'gated-continue-btn' : ''}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                background: checked && facility.applicationUrl ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : '#cbd5e1',
                color: checked && facility.applicationUrl ? '#ffffff' : '#94a3b8',
                padding: '1rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                boxShadow: checked && facility.applicationUrl ? '0 4px 18px rgba(22, 101, 52, 0.35)' : 'none',
                cursor: checked && facility.applicationUrl ? 'pointer' : 'not-allowed',
                marginBottom: '0.75rem',
                transition: 'all 0.15s ease',
              }}
            >
              Continue to Bank Website →
            </button>

            {!checked && (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>
                Please check the acknowledgement box to proceed.
              </p>
            )}

            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.76rem', marginTop: '0.9rem', marginBottom: 0 }}>
              🔒 You are leaving Smart Crop to visit the verified portal of <strong>{facility.bankName}</strong>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
