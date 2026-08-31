export default function BankRegisterLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem 1.25rem',
        fontFamily: 'inherit',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
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

      <div style={{ width: '100%', maxWidth: '560px', paddingTop: '2rem' }}>

        {/* Logo / branding area */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="sk" style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 0.85rem' }} />
          <div className="sk sk-sm" style={{ width: 200, height: 28, margin: '0 auto 0.5rem' }} />
          <div className="sk sk-sm" style={{ width: 260, height: 16, margin: '0 auto' }} />
        </div>

        {/* Registration form card */}
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 18, border: '1px solid #e2e8f0', padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Section label */}
          <div className="sk sk-round" style={{ width: 140, height: 22 }} />

          {/* Input fields */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div className="sk sk-sm" style={{ width: `${40 + (i % 3) * 15}%`, height: 13 }} />
              <div className="sk sk-sm" style={{ width: '100%', height: 42 }} />
            </div>
          ))}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '0.25rem' }} />

          {/* Submit button */}
          <div className="sk sk-round" style={{ width: '100%', height: 46 }} />

          {/* Footer link */}
          <div style={{ textAlign: 'center' }}>
            <div className="sk sk-sm" style={{ width: 200, height: 14, margin: '0 auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
