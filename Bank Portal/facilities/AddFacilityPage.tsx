'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Toast, BANK_INPUT_STYLE, BANK_LABEL_STYLE, BANK_PAGE_CONTAINER_STYLE, BANK_PRIMARY_BTN_STYLE } from '../ui/BankComponents';

const FACILITY_TYPES = [
  'Crop Loan',
  'Kisan Credit Facility',
  'Farm Equipment Loan',
  'Irrigation Loan',
  'Agricultural Infrastructure Loan',
  'Warehouse / Storage Finance',
  'Dairy Finance',
  'Fisheries Finance',
  'Horticulture Finance',
  'Agri Business Loan',
  'Other Agricultural Finance',
];
const CROPS = ['Paddy', 'Wheat', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Other'];
const DOCS_OPTIONS = [
  'Aadhaar',
  'PAN',
  'Land ownership document',
  'Land record',
  'Bank account details',
  'Passport-size photograph',
  'Address proof',
  'Crop details',
  'Equipment quotation',
  'Project report',
];
const FARMER_TYPES = [
  'Individual Farmer',
  'Tenant Farmer',
  'Sharecropper',
  'Farmer Producer Organization',
  'Agricultural Business',
  'Other',
];

const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderBottom: '2px solid #eff6ff', paddingBottom: '0.75rem', marginBottom: '1.35rem' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          fontSize: '1.05rem',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(37,99,235,0.08)',
        }}
      >
        {icon}
      </span>
      <h3 style={{ color: '#1e4078', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

export default function AddFacilityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams?.get('id');
  const bankId = searchParams?.get('bankId') || 'bank_test_facility_check';
  const [toast, setToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [form, setForm] = useState({
    facilityName: '',
    facilityType: '',
    shortDesc: '',
    detailedDesc: '',
    status: 'Draft',
    minAmount: '',
    maxAmount: '',
    interestRate: '',
    tenure: '',
    repayment: '',
    processingFee: '',
    otherCharges: '',
    farmerType: [] as string[],
    minLand: '',
    cropTypes: [] as string[],
    states: '',
    districts: '',
    otherEligibility: '',
    documents: [] as string[],
    benefits: '',
    termsText: '',
    termsUrl: '',
    applicationUrl: '',
  });

  useEffect(() => {
    if (editId && bankId) {
      fetch(`/api/facilities/${encodeURIComponent(editId)}?bankId=${encodeURIComponent(bankId)}`)
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to load facility data for editing.');
          }
          return res.json();
        })
        .then(data => {
          setForm({
            facilityName: data.facilityName || '',
            facilityType: data.facilityType || '',
            shortDesc: data.shortDescription || '',
            detailedDesc: data.detailedDescription || '',
            status: data.status || 'Draft',
            minAmount: data.minAmount !== null && data.minAmount !== undefined ? String(data.minAmount) : '',
            maxAmount: data.maxAmount !== null && data.maxAmount !== undefined ? String(data.maxAmount) : '',
            interestRate: data.interestRate || '',
            tenure: data.tenure || '',
            repayment: data.repayment || 'Monthly',
            processingFee: data.processingFee || '',
            otherCharges: data.otherCharges || '',
            farmerType: Array.isArray(data.farmerType) ? data.farmerType : [],
            minLand: data.minLand || '',
            cropTypes: Array.isArray(data.cropTypes) ? data.cropTypes : [],
            states: Array.isArray(data.states) ? data.states.join(', ') : '',
            districts: Array.isArray(data.districts) ? data.districts.join(', ') : '',
            otherEligibility: data.otherEligibility || '',
            documents: Array.isArray(data.documents) ? data.documents : [],
            benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : '',
            termsText: data.termsText || '',
            termsUrl: data.termsUrl || '',
            applicationUrl: data.applicationUrl || '',
          });
        })
        .catch(err => {
          setApiError(err.message || 'Could not load facility details.');
        });
    }
  }, [editId, bankId]);

  const ch = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleArr = (key: 'farmerType' | 'cropTypes' | 'documents', val: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(message);
    setToastType(type);
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  };

  const submitToApi = async (forcedStatus?: string) => {
    if (submitting) return;
    if (!bankId) {
      setApiError('No bank selected. Open this page with your bank id, e.g. /bank-portal/facilities/add?bankId=test_bank_001');
      return;
    }
    setApiError('');
    setSubmitting(true);
    try {
      const url = editId ? `/api/facilities/${encodeURIComponent(editId)}` : '/api/facilities/create';
      const method = editId ? 'PUT' : 'POST';

      let status = form.status;
      if (forcedStatus) {
        status = forcedStatus;
      } else if (!editId) {
        status = form.status.toLowerCase() === 'published' ? 'submitted' : 'draft';
      }

      const tokenMatch = typeof document !== 'undefined' ? document.cookie.match(/(?:^|;\s*)smartcrop_token=([^;]+)/) : null;
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ ...form, bankId, status }),
      });
      const data = await res.json().catch(() => ({}) as { message?: string; error?: string });

      if (res.ok) {
        showToast(data.message || (editId ? 'Facility updated successfully!' : 'Facility saved successfully!'), 'success');
        setTimeout(() => router.push(`/bank-portal/facilities?bankId=${encodeURIComponent(bankId)}`), 1500);
      } else {
        const rawErr = data.error;
        const msg =
          (typeof rawErr === 'object' && rawErr !== null ? (rawErr as any).message : rawErr) ||
          (editId ? 'Facility update failed.' : 'Facility creation failed.');
        setApiError(msg);
        showToast(msg, 'error');
      }
    } catch {
      const msg = 'Network error — could not reach the server. Please check your connection and try again.';
      setApiError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const sub = (e: React.FormEvent) => {
    e.preventDefault();
    submitToApi();
  };

  const saveDraft = () => submitToApi('draft');

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
        .bank-input:focus {
          border-color: #2563eb !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.2) !important;
          outline: none !important;
        }
        .chip-btn {
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .chip-btn:hover {
          transform: translateY(-1px);
        }
        .bank-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35) !important;
        }
        .bank-draft-btn:hover {
          background: #f1f5f9 !important;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220, 252, 231, 0.95)', border: '1px solid rgba(74, 222, 128, 0.5)', color: '#166534', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
            <span>🏦</span>
            <span>BANK PARTNER PORTAL</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.3rem', letterSpacing: '-0.02em' }}>
            {editId ? 'Edit Financial Facility' : 'Add Financial Facility'}
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', margin: 0 }}>
            {editId ? 'Update existing agricultural financial facility details.' : 'Create a new agricultural financial facility listing for farmers to discover.'}
          </p>
        </div>

        <Card>
          <form onSubmit={sub}>
            <Section title="Section 10 — Basic Details" icon="📋">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={BANK_LABEL_STYLE}>Facility Name *</label>
                  <input required className="bank-input" name="facilityName" value={form.facilityName} onChange={ch} placeholder="e.g. Crop Loan" style={BANK_INPUT_STYLE} />
                </div>
                <div>
                  <label style={BANK_LABEL_STYLE}>Facility Type *</label>
                  <select required className="bank-input" name="facilityType" value={form.facilityType} onChange={ch} style={BANK_INPUT_STYLE}>
                    <option value="">Select facility type...</option>
                    {FACILITY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={BANK_LABEL_STYLE}>Short Description *</label>
                <input required className="bank-input" name="shortDesc" value={form.shortDesc} onChange={ch} placeholder="One-line summary visible in the listing cards" style={BANK_INPUT_STYLE} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={BANK_LABEL_STYLE}>Detailed Description</label>
                <textarea className="bank-input" name="detailedDesc" value={form.detailedDesc} onChange={ch} rows={3} style={{ ...BANK_INPUT_STYLE, resize: 'vertical' }} placeholder="Describe the facility's coverage and features in detail..." />
              </div>
              <div>
                <label style={BANK_LABEL_STYLE}>Status</label>
                <select className="bank-input" name="status" value={form.status} onChange={ch} style={{ ...BANK_INPUT_STYLE, maxWidth: '240px' }}>
                  <option value="Draft">Draft (Save privately)</option>
                  <option value="Published">Publish immediately</option>
                </select>
              </div>
            </Section>

            <Section title="Section 11 — Financial Information" icon="💰">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={BANK_LABEL_STYLE}>Minimum Amount</label>
                  <input className="bank-input" name="minAmount" value={form.minAmount} onChange={ch} placeholder="e.g. Rs.50,000" style={BANK_INPUT_STYLE} />
                </div>
                <div>
                  <label style={BANK_LABEL_STYLE}>Maximum Amount</label>
                  <input className="bank-input" name="maxAmount" value={form.maxAmount} onChange={ch} placeholder="e.g. Rs.10,00,000" style={BANK_INPUT_STYLE} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={BANK_LABEL_STYLE}>Interest Rate</label>
                  <input className="bank-input" name="interestRate" value={form.interestRate} onChange={ch} placeholder="e.g. Starting from 7%" style={BANK_INPUT_STYLE} />
                </div>
                <div>
                  <label style={BANK_LABEL_STYLE}>Tenure</label>
                  <input className="bank-input" name="tenure" value={form.tenure} onChange={ch} placeholder="e.g. 6 months - 5 years" style={BANK_INPUT_STYLE} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={BANK_LABEL_STYLE}>Repayment Schedule</label>
                  <select className="bank-input" name="repayment" value={form.repayment} onChange={ch} style={BANK_INPUT_STYLE}>
                    {['Monthly', 'Quarterly', 'Half-yearly', 'Seasonal', 'As specified by bank'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={BANK_LABEL_STYLE}>Processing Fee</label>
                  <input className="bank-input" name="processingFee" value={form.processingFee} onChange={ch} placeholder="e.g. As per bank policy" style={BANK_INPUT_STYLE} />
                </div>
              </div>
              <div>
                <label style={BANK_LABEL_STYLE}>Other Charges</label>
                <input className="bank-input" name="otherCharges" value={form.otherCharges} onChange={ch} placeholder="Documentation, insurance charges, etc." style={BANK_INPUT_STYLE} />
              </div>
            </Section>

            <Section title="Section 12 — Farmer Eligibility" icon="👥">
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={BANK_LABEL_STYLE}>Eligible Farmer Types</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {FARMER_TYPES.map(t => {
                    const active = form.farmerType.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        className="chip-btn"
                        onClick={() => toggleArr('farmerType', t)}
                        style={{
                          padding: '0.4rem 0.95rem',
                          borderRadius: '20px',
                          border: active ? '1.5px solid #1e4078' : '1.5px solid #cbdcf2',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          background: active ? 'linear-gradient(135deg, #1e4078, #2563eb)' : '#ffffff',
                          color: active ? '#ffffff' : '#1e4078',
                          boxShadow: active ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                        }}
                      >
                        {active ? `✓ ${t}` : t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={BANK_LABEL_STYLE}>Minimum Land Holding</label>
                  <input className="bank-input" name="minLand" value={form.minLand} onChange={ch} placeholder="e.g. 1 acre" style={BANK_INPUT_STYLE} />
                </div>
                <div>
                  <label style={BANK_LABEL_STYLE}>Applicable States</label>
                  <input className="bank-input" name="states" value={form.states} onChange={ch} placeholder="e.g. Odisha, Jharkhand" style={BANK_INPUT_STYLE} />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={BANK_LABEL_STYLE}>Applicable Districts</label>
                <input className="bank-input" name="districts" value={form.districts} onChange={ch} placeholder="e.g. Mayurbhanj, Balasore, Cuttack" style={BANK_INPUT_STYLE} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={BANK_LABEL_STYLE}>Eligible Crop Types</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {CROPS.map(c => {
                    const active = form.cropTypes.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        className="chip-btn"
                        onClick={() => toggleArr('cropTypes', c)}
                        style={{
                          padding: '0.4rem 0.95rem',
                          borderRadius: '20px',
                          border: active ? '1.5px solid #1e4078' : '1.5px solid #cbdcf2',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          background: active ? 'linear-gradient(135deg, #1e4078, #2563eb)' : '#ffffff',
                          color: active ? '#ffffff' : '#1e4078',
                          boxShadow: active ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                        }}
                      >
                        {active ? `✓ ${c}` : c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={BANK_LABEL_STYLE}>Other Eligibility Conditions</label>
                <textarea className="bank-input" name="otherEligibility" value={form.otherEligibility} onChange={ch} rows={2} style={{ ...BANK_INPUT_STYLE, resize: 'vertical' }} placeholder="e.g. Valid land record required. Bank credit score check applies..." />
              </div>
            </Section>

            <Section title="Section 13 — Required Documents" icon="📑">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {DOCS_OPTIONS.map(d => {
                  const active = form.documents.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      className="chip-btn"
                      onClick={() => toggleArr('documents', d)}
                      style={{
                        padding: '0.4rem 0.95rem',
                        borderRadius: '20px',
                        border: active ? '1.5px solid #1e4078' : '1.5px solid #cbdcf2',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        background: active ? 'linear-gradient(135deg, #1e4078, #2563eb)' : '#ffffff',
                        color: active ? '#ffffff' : '#1e4078',
                        boxShadow: active ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                      }}
                    >
                      {active ? `✓ ${d}` : d}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Section 14 — Facility Benefits" icon="🌟">
              <div>
                <label style={BANK_LABEL_STYLE}>Key Benefits (one per line)</label>
                <textarea className="bank-input" name="benefits" value={form.benefits} onChange={ch} rows={3} style={{ ...BANK_INPUT_STYLE, resize: 'vertical' }} placeholder="Agricultural-purpose financing&#10;Flexible repayment options&#10;Seasonal repayment facility" />
              </div>
            </Section>

            <Section title="Section 15 — Terms and Conditions" icon="📜">
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={BANK_LABEL_STYLE}>Terms Text Summary</label>
                <textarea className="bank-input" name="termsText" value={form.termsText} onChange={ch} rows={3} style={{ ...BANK_INPUT_STYLE, resize: 'vertical' }} placeholder="Enter facility terms & conditions summary..." />
              </div>
              <div>
                <label style={BANK_LABEL_STYLE}>Official Terms & Conditions URL</label>
                <input type="url" className="bank-input" name="termsUrl" value={form.termsUrl} onChange={ch} placeholder="https://yourbank.com/terms" style={BANK_INPUT_STYLE} />
              </div>
            </Section>

            <Section title="Section 17 — Official Application URL" icon="🔗">
              <div>
                <label style={BANK_LABEL_STYLE}>Official Application URL *</label>
                <input required type="url" className="bank-input" name="applicationUrl" value={form.applicationUrl} onChange={ch} placeholder="https://yourbank.com/apply/crop-loan" style={BANK_INPUT_STYLE} />
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                ⚠️ This URL must belong to your bank's official domain. Farmers will be redirected here after the acknowledgement step.
              </p>
            </Section>

            {apiError && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '0.9rem 1.1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#991b1b', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                <span style={{ fontWeight: 600 }}>{apiError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={submitting}
                className="bank-submit-btn"
                style={{
                  ...BANK_PRIMARY_BTN_STYLE,
                  flex: 1,
                  minWidth: '200px',
                  padding: '1rem',
                  fontSize: '1rem',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                💾 {submitting ? 'Saving…' : editId ? 'Update Facility' : 'Save & Publish Facility'}
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={submitting}
                className="bank-draft-btn"
                style={{
                  padding: '1rem 1.75rem',
                  background: '#ffffff',
                  color: '#1e4078',
                  border: '1.5px solid #cbdcf2',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s',
                }}
              >
                Save as Draft
              </button>
            </div>
          </form>
        </Card>
      </div>

      {toast && <Toast message={toastMsg} type={toastType} />}
    </div>
  );
}
