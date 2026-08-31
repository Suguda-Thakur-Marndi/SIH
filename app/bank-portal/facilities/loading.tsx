export default function BankFacilitiesLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem 1.25rem',
        fontFamily: 'inherit',
        position: 'relative',
      }}
    >
      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'rgba(240, 248, 235, 0.82)', backdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes skshimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .sk {
          border-radius: 10px;
          background: linear-gradient(90deg, #e2f0e6 25%, #c8e6d0 50%, #e2f0e6 75%);
          background-size: 600px 100%;
          animation: skshimmer 1.4s infinite linear;
        }
        .sk-round { border-radius: 9999px; }
        .sk-sm    { border-radius: 6px; }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div className="sk sk-round" style={{ width: 150, height: 26 }} />
            <div className="sk sk-sm"   style={{ width: 260, height: 34 }} />
            <div className="sk sk-sm"   style={{ width: 200, height: 16 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div className="sk sk-round" style={{ width: 80, height: 34 }} />
            <div className="sk sk-round" style={{ width: 130, height: 38 }} />
          </div>
        </div>

        {/* Filter / search bar */}
        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="sk sk-sm" style={{ flex: 1, minWidth: 180, height: 36 }} />
          {[90, 105, 90].map((w, i) => (
            <div key={i} className="sk sk-round" style={{ width: w, height: 34 }} />
          ))}
        </div>

        {/* Facility cards list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              {/* Left: title + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div className="sk" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div className="sk sk-sm" style={{ width: 220, height: 18 }} />
                  <div className="sk sk-sm" style={{ width: 150, height: 14 }} />
                  <div className="sk sk-round" style={{ width: 80, height: 20 }} />
                </div>
              </div>
              {/* Right: interest + date + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                  <div className="sk sk-sm" style={{ width: 60, height: 20 }} />
                  <div className="sk sk-sm" style={{ width: 80, height: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="sk sk-round" style={{ width: 72, height: 32 }} />
                  <div className="sk sk-round" style={{ width: 72, height: 32 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
