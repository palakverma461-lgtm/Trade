import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Settings from '../components/layout/Settings';
import Toast from '../components/layout/Toast';
import ConfirmModal from '../components/layout/ConfirmModal';
import { useToast } from '../hooks/useToast';
import {
    Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign,
    PieChart, X, Settings as SettingsIcon, Search,
    ChevronUp, ChevronDown, Star, StickyNote, BarChart2,
    ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

const fmt    = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n) => (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';

const SkeletonRow = () => (
    <tr>
        {[180, 80, 70, 100, 110, 90, 80, 60].map((w, i) => (
            <td key={i} style={{ padding: '1.1rem 1.25rem' }}>
                <div className="skeleton" style={{ height: 14, width: w, borderRadius: 6 }} />
            </td>
        ))}
    </tr>
);

const StatCard = ({ icon, iconBg, iconColor, label, value, sub, subColor, loading }) => (
    <div className="glass stat-card">
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <div>
            <p className="stat-label">{label}</p>
            {loading
                ? <div className="skeleton" style={{ height: 28, width: 120, marginTop: 6, borderRadius: 6 }} />
                : <p className="stat-value">{value}</p>
            }
            {sub && !loading && <p className="stat-sub" style={{ color: subColor }}>{sub}</p>}
        </div>
    </div>
);

const EmptyState = ({ onAdd, filtered }) => (
    <tr>
        <td colSpan="8">
            <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart2 size={28} color="var(--primary)" />
                </div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
                        {filtered ? 'No matching assets' : 'Your portfolio is empty'}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {filtered ? 'Try a different search term' : 'Add your first asset to start tracking'}
                    </p>
                </div>
                {!filtered && (
                    <button onClick={onAdd} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                        <Plus size={16} /> Add First Asset
                    </button>
                )}
            </div>
        </td>
    </tr>
);

const Dashboard = () => {
    const [assets, setAssets]             = useState([]);
    const [stats, setStats]               = useState(null);
    const [loading, setLoading]           = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [showModal, setShowModal]       = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch]             = useState('');
    const [sort, setSort]                 = useState({ key: 'createdAt', dir: 'desc' });
    const [page, setPage]                 = useState(1);
    const [pagination, setPagination]     = useState({ total: 0, pages: 1 });
    const LIMIT = 10;

    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const emptyForm = { coinName: '', symbol: '', amount: '', buyPrice: '', currentPrice: '', notes: '' };
    const [form, setForm]           = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);

    // Fix: addToast in deps, totalInvested computed outside map
    const fetchAssets = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await api.get(`/portfolio?page=${p}&limit=${LIMIT}`);
            setAssets(res.data.data);
            setPagination({ total: res.data.total, pages: res.data.pages });
        } catch {
            addToast('Failed to load assets', 'error');
        } finally { setLoading(false); }
    }, [addToast]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/portfolio/stats');
            setStats(res.data.data);
        } catch { /* silent */ }
        finally { setStatsLoading(false); }
    }, []);

    useEffect(() => { fetchAssets(page); }, [page, fetchAssets]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = { ...form, amount: Number(form.amount), buyPrice: Number(form.buyPrice), currentPrice: form.currentPrice ? Number(form.currentPrice) : null };
            if (editingAsset) {
                await api.put(`/portfolio/${editingAsset._id}`, payload);
                addToast(`${form.coinName} updated successfully`);
            } else {
                await api.post('/portfolio', payload);
                addToast(`${form.coinName} added to portfolio`);
            }
            setShowModal(false);
            setEditingAsset(null);
            setForm(emptyForm);
            fetchAssets(page);
            fetchStats();
        } catch (err) {
            addToast(err.response?.data?.error || 'Operation failed', 'error');
        } finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/portfolio/${deleteTarget._id}`);
            addToast(`${deleteTarget.coinName} removed`, 'error');
            setDeleteTarget(null);
            const newPage = assets.length === 1 && page > 1 ? page - 1 : page;
            setPage(newPage);
            fetchAssets(newPage);
            fetchStats();
        } catch {
            addToast('Failed to delete asset', 'error');
        } finally { setDeleteLoading(false); }
    };

    const openEdit = (asset) => {
        setEditingAsset(asset);
        setForm({ coinName: asset.coinName, symbol: asset.symbol, amount: asset.amount, buyPrice: asset.buyPrice, currentPrice: asset.currentPrice || '', notes: asset.notes || '' });
        setShowModal(true);
    };
    const openAdd = () => { setEditingAsset(null); setForm(emptyForm); setShowModal(true); };
    const handleSort = (key) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

    // Fix: compute totalInvested once, not inside each map iteration
    const enriched = useMemo(() => {
        const totalInvested = assets.reduce((s, x) => s + x.amount * x.buyPrice, 0);
        return assets.map(a => {
            const cp         = a.currentPrice || a.buyPrice;
            const currentVal = a.amount * cp;
            const investedVal = a.amount * a.buyPrice;
            const pnlAmt     = currentVal - investedVal;
            const pnlPct     = investedVal > 0 ? (pnlAmt / investedVal) * 100 : 0;
            const allocation = totalInvested > 0 ? (investedVal / totalInvested) * 100 : 0;
            return { ...a, currentVal, investedVal, pnlAmt, pnlPct, allocation };
        });
    }, [assets]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return enriched
            .filter(a => !q || a.coinName.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q))
            .sort((a, b) => {
                const av = typeof a[sort.key] === 'string' ? a[sort.key].toLowerCase() : (a[sort.key] ?? 0);
                const bv = typeof b[sort.key] === 'string' ? b[sort.key].toLowerCase() : (b[sort.key] ?? 0);
                return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
            });
    }, [enriched, search, sort]);

    const SortTh = ({ col, label }) => (
        <th onClick={() => handleSort(col)} style={{ cursor: 'pointer', color: sort.key === col ? 'var(--primary)' : undefined, userSelect: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {label}
                {sort.key === col
                    ? (sort.dir === 'asc' ? <ChevronUp size={13} color="var(--primary)" /> : <ChevronDown size={13} color="var(--primary)" />)
                    : <ChevronUp size={13} style={{ opacity: 0.25 }} />}
            </span>
        </th>
    );

    return (
        <div className="container animate-fade" style={{ paddingBottom: '5rem' }}>

            {/* ── Welcome Banner ── */}
            <div className="glass" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                        {user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Welcome back</p>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            {user?.username}{' '}
                            <span className="badge badge-primary" style={{ fontSize: '0.62rem', verticalAlign: 'middle' }}>{user?.role}</span>
                        </h2>
                    </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <StatCard loading={statsLoading} icon={<DollarSign size={22} />} iconBg="var(--primary-dim)" iconColor="var(--primary)"
                    label="Total Invested" value={`$${fmt(stats?.totalInvested || 0)}`} />
                <StatCard loading={statsLoading} icon={<BarChart2 size={22} />} iconBg="rgba(129,140,248,0.12)" iconColor="#818cf8"
                    label="Current Value" value={`$${fmt(stats?.totalCurrentValue || 0)}`} />
                <StatCard loading={statsLoading}
                    icon={(stats?.totalPnl ?? 0) >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                    iconBg={(stats?.totalPnl ?? 0) >= 0 ? 'var(--accent-dim)' : 'var(--error-dim)'}
                    iconColor={(stats?.totalPnl ?? 0) >= 0 ? 'var(--accent)' : 'var(--error)'}
                    label="Total P&L"
                    value={`${(stats?.totalPnl ?? 0) >= 0 ? '+' : '-'}$${fmt(Math.abs(stats?.totalPnl || 0))}`}
                    sub={stats ? fmtPct(stats.totalPnlPct) : ''}
                    subColor={(stats?.totalPnlPct ?? 0) >= 0 ? 'var(--accent)' : 'var(--error)'}
                />
                <StatCard loading={statsLoading} icon={<PieChart size={22} />} iconBg="var(--accent-dim)" iconColor="var(--accent)"
                    label="Total Assets" value={stats?.totalAssets ?? 0} />
            </div>

            {/* ── Best / Worst ── */}
            {stats?.bestAsset && stats?.worstAsset && stats.bestAsset._id !== stats.worstAsset._id && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { asset: stats.bestAsset,  label: 'Best Performer',  icon: <Star size={15} />,         color: 'var(--accent)', border: 'var(--accent)' },
                        { asset: stats.worstAsset, label: 'Worst Performer', icon: <TrendingDown size={15} />, color: 'var(--error)',  border: 'var(--error)' },
                    ].map(({ asset, label, icon, color, border }) => (
                        <div key={label} className="glass" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderLeft: `3px solid ${border}` }}>
                            <span style={{ color }}>{icon}</span>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{label}</p>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.1rem' }}>
                                    {asset.coinName}
                                    <span style={{ color, fontSize: '0.82rem', marginLeft: '0.5rem' }}>{fmtPct(asset.pnlPct)}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Portfolio</h2>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="input-icon-wrap" style={{ width: 210 }}>
                        <Search size={15} className="icon" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search assets..." className="input"
                            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.875rem' }} />
                    </div>
                    <button onClick={() => { fetchAssets(page); fetchStats(); }} className="btn-icon" title="Refresh">
                        <RefreshCw size={17} />
                    </button>
                    <button onClick={() => setShowSettings(true)} className="btn-icon" title="Settings">
                        <SettingsIcon size={17} />
                    </button>
                    <button onClick={openAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.875rem' }}>
                        <Plus size={16} /> Add Asset
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="glass table-wrap">
                <table>
                    <thead>
                        <tr>
                            <SortTh col="coinName"   label="Asset" />
                            <SortTh col="symbol"     label="Symbol" />
                            <SortTh col="amount"     label="Amount" />
                            <SortTh col="buyPrice"   label="Buy Price" />
                            <SortTh col="currentVal" label="Value" />
                            <SortTh col="pnlPct"     label="P&L" />
                            <th>Allocation</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            : filtered.length === 0
                                ? <EmptyState onAdd={openAdd} filtered={!!search} />
                                : filtered.map(asset => (
                                    <tr key={asset._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>
                                                    {asset.symbol.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{asset.coinName}</p>
                                                    {asset.notes && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><StickyNote size={11} />{asset.notes.slice(0, 28)}{asset.notes.length > 28 ? '…' : ''}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-primary">{asset.symbol}</span></td>
                                        <td style={{ color: 'var(--text-soft)' }}>{asset.amount}</td>
                                        <td style={{ color: 'var(--text-soft)' }}>${fmt(asset.buyPrice)}</td>
                                        <td style={{ fontWeight: 700 }}>${fmt(asset.currentVal)}</td>
                                        <td>
                                            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: asset.pnlAmt >= 0 ? 'var(--accent)' : 'var(--error)' }}>
                                                {asset.pnlAmt >= 0 ? '+' : '-'}${fmt(Math.abs(asset.pnlAmt))}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: asset.pnlPct >= 0 ? 'var(--accent)' : 'var(--error)' }}>
                                                {fmtPct(asset.pnlPct)}
                                            </p>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="progress-bar-track">
                                                    <div className="progress-bar-fill" style={{ width: `${Math.min(asset.allocation, 100)}%` }} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 36 }}>{asset.allocation.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => openEdit(asset)} className="btn-icon" title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => setDeleteTarget(asset)} className="btn-icon" style={{ color: 'var(--error)' }} title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {!search && pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total} assets
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem' }}>
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.5rem 0.875rem', minWidth: 38 }}>
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Add/Edit Modal ── */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-elevated modal animate-fade" style={{ borderRadius: 'var(--radius-xl)' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
                            <button onClick={() => { setShowModal(false); setEditingAsset(null); setForm(emptyForm); }} className="btn-icon"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Coin Name *</label>
                                    <input className="input" value={form.coinName} onChange={e => setForm({ ...form, coinName: e.target.value })} placeholder="Bitcoin" required />
                                </div>
                                <div className="form-group" style={{ width: 110 }}>
                                    <label className="form-label">Symbol *</label>
                                    <input className="input" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })} placeholder="BTC" required maxLength={10} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Amount *</label>
                                    <input type="number" step="any" min="0" className="input" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.5" required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Buy Price ($) *</label>
                                    <input type="number" step="any" min="0" className="input" value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: e.target.value })} placeholder="45000" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Price ($)</label>
                                <input type="number" step="any" min="0" className="input" value={form.currentPrice} onChange={e => setForm({ ...form, currentPrice: e.target.value })} placeholder="Leave blank to use buy price" />
                                <span className="form-hint">Used to calculate live P&L</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Long-term hold" maxLength={200} />
                            </div>
                            <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem' }}>
                                {formLoading ? (editingAsset ? 'Updating...' : 'Adding...') : (editingAsset ? 'Update Asset' : 'Add to Portfolio')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} currentUser={user} />

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Asset"
                message={`Remove "${deleteTarget?.coinName}" from your portfolio? This cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading}
            />

            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default Dashboard;
