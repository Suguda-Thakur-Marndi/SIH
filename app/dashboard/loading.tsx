export default function FarmerDashboardLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background tint matching glassmorphism theme */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: 'linear-gradient(135deg, rgba(206,235,150,0.25) 0%, rgba(247,248,244,0.6) 50%, rgba(248,218,192,0.25) 100%)',
        }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes skshimmer {
          0%   { background-position: -700px 0; }
          100% { background-position: 700px 0; }
        }
        .sk {
          border-radius: 10px;
          background: linear-gradient(90deg, rgba(255,255,255,0.55) 25%, rgba(230,240,210,0.7) 50%, rgba(255,255,255,0.55) 75%);
          background-size: 700px 100%;
          animation: skshimmer 1.5s infinite linear;
        }
        .sk-round { border-radius: 9999px; }
        .sk-sm    { border-radius: 6px; }
      `}</style>

      {/* ── Navbar skeleton ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          padding: '1rem 2rem 1.5rem',
          borderRadius: '0 0 50% 50% / 0 0 36px 36px',
          background: 'linear-gradient(105deg, rgba(206,235,150,0.88) 0%, rgba(247,248,244,0.94) 48%, rgba(248,218,192,0.88) 100%)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 16px 36px -8px rgba(27,30,25,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="sk" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <div className="sk sk-sm" style={{ width: 100, height: 18 }} />
        </div>
        {/* Nav pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.6)', padding: '0.4rem 1.25rem', borderRadius: 9999 }}>
          {[44, 44, 44, 44, 44].map((w, i) => (
            <div key={i} className="sk" style={{ width: w, height: 36, borderRadius: 9999 }} />
          ))}
        </div>
        {/* Right action icons */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {[44, 44, 44, 44].map((w, i) => (
            <div key={i} className="sk" style={{ width: w, height: 36, borderRadius: 9999 }} />
          ))}
        </div>
      </div>

      {/* ── Hero section skeleton ── */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7rem 1.5rem 4rem',
          textAlign: 'center',
          gap: '1.25rem',
        }}
      >
        {/* Badge label */}
        <div className="sk sk-round" style={{ width: 120, height: 22 }} />
        {/* H1 large */}
        <div className="sk sk-sm" style={{ width: 480, maxWidth: '90%', height: 52 }} />
        <div className="sk sk-sm" style={{ width: 380, maxWidth: '80%', height: 44 }} />
        {/* Subtitle */}
        <div className="sk sk-sm" style={{ width: 340, maxWidth: '75%', height: 18, marginTop: '0.25rem' }} />
        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <div className="sk sk-round" style={{ width: 160, height: 52 }} />
          <div className="sk sk-round" style={{ width: 170, height: 52 }} />
          <div className="sk sk-round" style={{ width: 180, height: 52 }} />
        </div>
      </div>

      {/* ── Insights 2×2 grid skeleton ── */}
      <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(16px)',
                borderRadius: 28,
                border: '1px solid rgba(255,255,255,0.85)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Icon + label row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="sk" style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="sk sk-sm" style={{ width: 110, height: 18 }} />
                  <div className="sk sk-sm" style={{ width: 80, height: 13 }} />
                </div>
              </div>
              {/* Metric big number */}
              <div className="sk sk-sm" style={{ width: '55%', height: 56 }} />
              <div className="sk sk-sm" style={{ width: '70%', height: 16 }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
