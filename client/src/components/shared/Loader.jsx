export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
      <div className="spinner" />
    </div>
  );
}
