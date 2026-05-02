import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
    success: <CheckCircle size={17} />,
    error:   <AlertCircle size={17} />,
    info:    <Info size={17} />,
};
const COLORS = {
    success: 'var(--accent)',
    error:   'var(--error)',
    info:    'var(--primary)',
};

const ToastItem = ({ toast, onRemove }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 3500;
        const interval = 30;
        const step = (interval / duration) * 100;
        const timer = setInterval(() => setProgress(p => Math.max(0, p - step)), interval);
        const dismiss = setTimeout(() => onRemove(toast.id), duration);
        return () => { clearInterval(timer); clearTimeout(dismiss); };
    }, [toast.id, onRemove]);

    const color = COLORS[toast.type] || COLORS.info;

    return (
        <div className="glass-elevated animate-fade" style={{
            minWidth: 300, maxWidth: 380, overflow: 'hidden',
            borderLeft: `3px solid ${color}`, borderRadius: 'var(--radius)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
                <span style={{ color, flexShrink: 0 }}>{ICONS[toast.type]}</span>
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>
                <button onClick={() => onRemove(toast.id)} className="btn-icon" style={{ padding: '0.2rem', flexShrink: 0 }}>
                    <X size={15} />
                </button>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: color, transition: 'width 0.03s linear', borderRadius: '0 0 0 3px' }} />
            </div>
        </div>
    );
};

const Toast = ({ toasts, removeToast }) => (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
);

export default Toast;
