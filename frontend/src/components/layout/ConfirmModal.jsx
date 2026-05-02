import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', loading = false }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="glass-elevated animate-fade" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--error-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={26} color="var(--error)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                        <button onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                        <button onClick={onConfirm} disabled={loading} className="btn btn-danger" style={{ flex: 1, background: 'var(--error)', color: '#fff', border: 'none' }}>
                            {loading ? 'Deleting...' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
