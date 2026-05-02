import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { AllocationDonut, PnlBarChart, ValueVsInvestedChart } from '../components/charts/PortfolioCharts';
import { TrendingUp, TrendingDown, BarChart2, DollarSign, RefreshCw } from 'lucide-react';

const fmt    = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n) => (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
const COLORS  = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

const ChartCard = ({ title, subtitle, children, loading }) => (
    <div className="glass" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{subtitle}</p>}
        </div>
        {loading
            ? <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 12 }} />
              </div>
            : children
        }
    </div>
);

const Analytics = () => {
    const [assets, setAssets]   = useState([]);
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [aRes, sRes] = await Promise.all([
                api.get('/portfolio?limit=100'),
                api.get('/portfolio/stats')
            ]);
            setAssets(aRes.data.data);
            setStats(sRes.data.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const enriched = useMemo(() => {
        const totalInvested = assets.reduce((s, a) => s + a.amount * a.buyPrice, 0);
        return assets.map((a, i) => {
            const cp         = a.currentPrice || a.buyPrice;
            const currentVal = a.amount * cp;
            const invested   = a.amount * a.buyPrice;
            const pnlAmt     = currentVal - invested;
            const pnlPct     = invested > 0 ? (pnlAmt / invested) * 100 : 0;
            const allocation = totalInvested > 0 ? (invested / totalInvested) * 100 : 0;
            return { ...a, currentVal, invested, pnlAmt, pnlPct, allocation, color: COLORS[i % COLORS.length] };
        }).sort((a, b) => b.allocation - a.allocation);
    }, [assets]);

    const summaryCards = [
        { label: 'Total Invested',    value: `$${fmt(stats?.totalInvested || 0)}`,      icon: <DollarSign size={20} />,  color: 'var(--primary)', bg: 'var(--primary-dim)' },
        { label: 'Current Value',     value: `$${fmt(stats?.totalCurrentValue || 0)}`,  icon: <BarChart2 size={20} />,   color: '#818cf8',        bg: 'rgba(129,140,248,0.12)' },
        { label: 'Total P&L',         value: `${(stats?.totalPnl||0)>=0?'+':'-'}$${fmt(Math.abs(stats?.totalPnl||0))}`, icon: (stats?.totalPnl||0)>=0?<TrendingUp size={20}/>:<TrendingDown size={20}/>, color: (stats?.totalPnl||0)>=0?'var(--accent)':'var(--error)', bg: (stats?.totalPnl||0)>=0?'var(--accent-dim)':'var(--error-dim)', sub: stats ? fmtPct(stats.totalPnlPct) : '' },
        { label: 'Assets Tracked',    value: stats?.totalAssets ?? 0,                   icon: <BarChart2 size={20} />,   color: 'var(--accent)',  bg: 'var(--accent-dim)' },
    ];

    return (
        <div className="container animate-fade" style={{ paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem' }}>Analytics</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Visual breakdown of your portfolio performance</p>
                </div>
                <button onClick={fetchAll} className="btn btn-ghost" style={{ gap: '0.5rem' }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {summaryCards.map((c, i) => (
                    <div key={i} className="glass stat-card">
                        <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                        <div>
                            <p className="stat-label">{c.label}</p>
                            {loading ? <div className="skeleton" style={{ height: 24, width: 100, marginTop: 6, borderRadius: 6 }} />
                                : <p className="stat-value" style={{ fontSize: '1.3rem' }}>{c.value}</p>}
                            {c.sub && !loading && <p className="stat-sub" style={{ color: c.color }}>{c.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <ChartCard title="Portfolio Allocation" subtitle="By invested value" loading={loading}>
                    <AllocationDonut assets={assets} />
                </ChartCard>
                <ChartCard title="P&L by Asset" subtitle="Profit & Loss per coin" loading={loading}>
                    <PnlBarChart assets={assets} />
                </ChartCard>
            </div>

            <ChartCard title="Cumulative Value vs Invested" subtitle="Portfolio growth over time (by entry order)" loading={loading}>
                <ValueVsInvestedChart assets={assets} />
            </ChartCard>

            {/* Breakdown Table */}
            <div className="glass table-wrap" style={{ marginTop: '1.25rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Asset Breakdown</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Amount</th>
                            <th>Buy Price</th>
                            <th>Current Price</th>
                            <th>Invested</th>
                            <th>Current Value</th>
                            <th>P&L</th>
                            <th>Allocation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                                    <td key={j} style={{ padding: '1rem 1.25rem' }}>
                                        <div className="skeleton" style={{ height: 13, width: 80, borderRadius: 4 }} />
                                    </td>
                                ))}</tr>
                            ))
                            : enriched.map(a => (
                                <tr key={a._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.coinName}</p>
                                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.symbol}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-soft)' }}>{a.amount}</td>
                                    <td style={{ color: 'var(--text-soft)' }}>${fmt(a.buyPrice)}</td>
                                    <td style={{ color: a.currentPrice ? 'var(--text)' : 'var(--text-muted)', fontStyle: a.currentPrice ? 'normal' : 'italic' }}>
                                        {a.currentPrice ? `$${fmt(a.currentPrice)}` : 'Not set'}
                                    </td>
                                    <td>${fmt(a.invested)}</td>
                                    <td style={{ fontWeight: 600 }}>${fmt(a.currentVal)}</td>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: a.pnlAmt >= 0 ? 'var(--accent)' : 'var(--error)' }}>
                                                {a.pnlAmt >= 0 ? '+' : '-'}${fmt(Math.abs(a.pnlAmt))}
                                            </p>
                                            <p style={{ fontSize: '0.72rem', color: a.pnlPct >= 0 ? 'var(--accent)' : 'var(--error)' }}>
                                                {fmtPct(a.pnlPct)}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="progress-bar-track" style={{ width: 70 }}>
                                                <div className="progress-bar-fill" style={{ width: `${Math.min(a.allocation, 100)}%`, background: a.color }} />
                                            </div>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.allocation.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
