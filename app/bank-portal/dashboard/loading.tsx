export default function BankDashboardLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem 1.25rem',
        fontFamily: 'inherit',
        position: 'relative',
      }}
    >
      {/* Background overlay */}
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

      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="sk sk-round" style={{ width: 160, height: 26 }} />
            <div className="sk sk-sm"   style={{ width: 220, height: 36 }} />
            <div className="sk sk-sm"   style={{ width: 280, height: 18 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem' }}>
            <div className="sk sk-round" style={{ width: 80, height: 34 }} />
            <div className="sk sk-round" style={{ width: 90, height: 34 }} />
          </div>
        </div>

        {/* Bank Status Card */}
        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.4rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="sk" style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="sk sk-sm" style={{ width: 200, height: 22 }} />
              <div className="sk sk-sm" style={{ width: 140, height: 16 }} />
              <div className="sk sk-round" style={{ width: 110, height: 22 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="sk sk-round" style={{ width: 100, height: 34 }} />
            <div className="sk sk-round" style={{ width: 110, height: 34 }} />
          </div>
        </div>

        {/* 4 Stat pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="sk sk-sm" style={{ width: '55%', height: 13 }} />
              <div className="sk sk-sm" style={{ width: '40%', height: 32 }} />
              <div className="sk sk-round" style={{ width: '65%', height: 18 }} />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
          <div className="sk sk-sm" style={{ width: 160, height: 20, marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[140, 130, 150, 125].map((w, i) => (
              <div key={i} className="sk sk-round" style={{ width: w, height: 42 }} />
            ))}
          </div>
        </div>

        {/* Recent Facilities table */}
        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="sk sk-sm" style={{ width: 180, height: 20 }} />
            <div className="sk sk-round" style={{ width: 90, height: 30 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div className="sk sk-sm" style={{ flex: 2, height: 16 }} />
                <div className="sk sk-sm" style={{ flex: 1, height: 16 }} />
                <div className="sk sk-round" style={{ width: 76, height: 24 }} />
                <div className="sk sk-sm" style={{ width: 70, height: 14 }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
