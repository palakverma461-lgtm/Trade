import { useState, useEffect } from 'react';
import api from '../api';
import { Brain, AlertTriangle, CheckCircle, Info, TrendingDown, RefreshCw, Lightbulb, Shield, Zap } from 'lucide-react';

const TYPE_CONFIG = {
    success: { icon: <CheckCircle size={20} />, color: 'var(--accent)',   bg: 'var(--accent-dim)',   border: 'rgba(16,185,129,0.25)' },
    warning: { icon: <AlertTriangle size={20}/>, color: 'var(--warning)',  bg: 'var(--warning-dim)',  border: 'rgba(245,158,11,0.25)' },
    danger:  { icon: <TrendingDown size={20} />, color: 'var(--error)',    bg: 'var(--error-dim)',    border: 'rgba(239,68,68,0.25)' },
    info:    { icon: <Info size={20} />,         color: 'var(--primary)',  bg: 'var(--primary-dim)',  border: 'rgba(99,102,241,0.25)' },
};

const TIPS = [
    { icon: <Shield size={18} />,    title: 'Dollar Cost Averaging',  body: 'Invest a fixed amount regularly regardless of price. This reduces the impact of volatility over time.' },
    { icon: <Lightbulb size={18} />, title: 'The 1% Rule',            body: 'Never risk more than 1-2% of your total portfolio on a single trade. Protects against catastrophic loss.' },
    { icon: <Zap size={18} />,       title: 'Rebalance Quarterly',    body: 'Review and rebalance your portfolio every 3 months to maintain your target allocation and lock in gains.' },
    { icon: <Brain size={18} />,     title: 'Avoid Emotional Trading', body: 'Set entry/exit targets before buying. Stick to your plan — fear and greed are the biggest portfolio killers.' },
];

const InsightCard = ({ insight }) => {
    const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
    return (
        <div className="glass animate-fade" style={{ padding: '1.25rem 1.5rem', borderLeft: `3px solid ${cfg.color}`, display: 'flex', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{insight.title}</h3>
                    {insight.asset && <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem' }}>{insight.asset}</span>}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-soft)', lineHeight: 1.65 }}>{insight.message}</p>
            </div>
        </div>
    );
};

const AiInsights = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await api.get('/portfolio/ai-insights');
            setInsights(res.data.data);
            setLastUpdated(new Date());
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchInsights(); }, []);

    const counts = {
        danger:  insights.filter(i => i.type === 'danger').length,
        warning: insights.filter(i => i.type === 'warning').length,
        success: insights.filter(i => i.type === 'success').length,
        info:    insights.filter(i => i.type === 'info').length,
    };

    return (
        <div className="container animate-fade" style={{ paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Brain size={22} color="var(--primary)" />
                        </div>
                        <h1 style={{ fontSize: '1.6rem' }}>AI Portfolio Advisor</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Smart insights based on your portfolio composition and performance
                        {lastUpdated && <span style={{ marginLeft: '0.5rem' }}>· Updated {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <button onClick={fetchInsights} disabled={loading} className="btn btn-ghost">
                    <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Analysis
                </button>
            </div>

            {/* Score Summary */}
            {!loading && insights.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Critical',  count: counts.danger,  color: 'var(--error)',   bg: 'var(--error-dim)' },
                        { label: 'Warnings',  count: counts.warning, color: 'var(--warning)', bg: 'var(--warning-dim)' },
                        { label: 'Positive',  count: counts.success, color: 'var(--accent)',  bg: 'var(--accent-dim)' },
                        { label: 'Info',      count: counts.info,    color: 'var(--primary)', bg: 'var(--primary-dim)' },
                    ].map((s, i) => (
                        <div key={i} className="glass" style={{ padding: '1.1rem 1.25rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.count}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem' }}>
                            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 4 }} />
                                <div className="skeleton" style={{ height: 12, width: '90%', borderRadius: 4 }} />
                                <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 4 }} />
                            </div>
                        </div>
                    ))
                    : insights.map((ins, i) => <InsightCard key={i} insight={ins} />)
                }
            </div>

            {/* General Tips */}
            <div style={{ marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lightbulb size={18} color="var(--warning)" /> General Investment Tips
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {TIPS.map((tip, i) => (
                        <div key={i} className="glass" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', color: 'var(--primary)' }}>
                                {tip.icon}
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{tip.title}</h4>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{tip.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AiInsights;
