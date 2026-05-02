import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Toast from '../components/layout/Toast';
import ConfirmModal from '../components/layout/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { Plus, Trash2, TrendingUp, TrendingDown, Search, X, Filter } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Transactions = () => {
    const [txs, setTxs]               = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [search, setSearch]         = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const { toasts, addToast, removeToast } = useToast();

    const emptyForm = { coinName: '', symbol: '', type: 'BUY', amount: '', price: '', notes: '' };
    const [form, setForm]             = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);

    const fetchTxs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transactions?limit=100');
            setTxs(res.data.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTxs(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.post('/transactions', { ...form, amount: Number(form.amount), price: Number(form.price) });
            addToast(`${form.type} transaction added`);
            setShowModal(false);
            setForm(emptyForm);
            fetchTxs();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to add transaction', 'error');
        } finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/transactions/${deleteTarget._id}`);
            addToast('Transaction deleted', 'error');
            setDeleteTarget(null);
            fetchTxs();
        } catch { addToast('Failed to delete', 'error'); }
        finally { setDeleteLoading(false); }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return txs.filter(t =>
            (typeFilter === 'ALL' || t.type === typeFilter) &&
            (!q || t.coinName.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q))
        );
    }, [txs, search, typeFilter]);

    const totalBought = txs.filter(t => t.type === 'BUY').reduce((s, t) => s + t.total, 0);
    const totalSold   = txs.filter(t => t.type === 'SELL').reduce((s, t) => s + t.total, 0);

    return (
        <div className="container animate-fade" style={{ paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem' }}>Transactions</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Complete history of your buy & sell activity</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={16} /> Log Transaction
                </button>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Transactions', value: txs.length,          color: 'var(--primary)', bg: 'var(--primary-dim)', icon: <Filter size={20}/> },
                    { label: 'Total Bought',        value: `$${fmt(totalBought)}`, color: 'var(--accent)',  bg: 'var(--accent-dim)',  icon: <TrendingUp size={20}/> },
                    { label: 'Total Sold',          value: `$${fmt(totalSold)}`,   color: 'var(--error)',   bg: 'var(--error-dim)',   icon: <TrendingDown size={20}/> },
                    { label: 'Net Flow',            value: `${(totalSold-totalBought)>=0?'+':'-'}$${fmt(Math.abs(totalSold-totalBought))}`, color: (totalSold-totalBought)>=0?'var(--accent)':'var(--error)', bg: (totalSold-totalBought)>=0?'var(--accent-dim)':'var(--error-dim)', icon: <TrendingUp size={20}/> },
                ].map((c, i) => (
                    <div key={i} className="glass stat-card">
                        <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                        <div>
                            <p className="stat-label">{c.label}</p>
                            {loading ? <div className="skeleton" style={{ height: 22, width: 90, marginTop: 6, borderRadius: 4 }} />
                                : <p className="stat-value" style={{ fontSize: '1.2rem', color: c.color }}>{c.value}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="input-icon-wrap" style={{ width: 220 }}>
                    <Search size={15} className="icon" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="input" style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.875rem' }} />
                </div>
                {['ALL','BUY','SELL'].map(f => (
                    <button key={f} onClick={() => setTypeFilter(f)}
                        className={`btn ${typeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
                        {f === 'ALL' ? 'All' : f === 'BUY' ? '↑ Buy' : '↓ Sell'}
                    </button>
                ))}
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} records</span>
            </div>

            {/* Table */}
            <div className="glass table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Notes</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                                    <td key={j} style={{ padding: '1rem 1.25rem' }}>
                                        <div className="skeleton" style={{ height: 13, width: 80, borderRadius: 4 }} />
                                    </td>
                                ))}</tr>
                            ))
                            : filtered.length === 0
                                ? <tr><td colSpan="8" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    {search || typeFilter !== 'ALL' ? 'No matching transactions' : 'No transactions yet. Log your first trade!'}
                                  </td></tr>
                                : filtered.map(tx => (
                                    <tr key={tx._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 7, background: tx.type === 'BUY' ? 'var(--accent-dim)' : 'var(--error-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: tx.type === 'BUY' ? 'var(--accent)' : 'var(--error)', flexShrink: 0 }}>
                                                    {tx.symbol.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tx.coinName}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.symbol}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${tx.type === 'BUY' ? 'badge-success' : 'badge-error'}`}>
                                                {tx.type === 'BUY' ? '↑ BUY' : '↓ SELL'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-soft)' }}>{tx.amount}</td>
                                        <td style={{ color: 'var(--text-soft)' }}>${fmt(tx.price)}</td>
                                        <td style={{ fontWeight: 700, color: tx.type === 'BUY' ? 'var(--accent)' : 'var(--error)' }}>
                                            {tx.type === 'BUY' ? '-' : '+'}${fmt(tx.total)}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: 140 }}>
                                            {tx.notes || <span style={{ fontStyle: 'italic' }}>—</span>}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                            {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => setDeleteTarget(tx)} className="btn-icon" style={{ color: 'var(--error)' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-elevated modal animate-fade" style={{ borderRadius: 'var(--radius-xl)' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Log Transaction</h3>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            {/* Type Toggle */}
                            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius)' }}>
                                {['BUY','SELL'].map(t => (
                                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                                        style={{ flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', transition: 'var(--transition)', background: form.type === t ? (t === 'BUY' ? 'var(--accent)' : 'var(--error)') : 'none', color: form.type === t ? '#fff' : 'var(--text-muted)' }}>
                                        {t === 'BUY' ? '↑ BUY' : '↓ SELL'}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Coin Name *</label>
                                    <input className="input" value={form.coinName} onChange={e => setForm({ ...form, coinName: e.target.value })} placeholder="Bitcoin" required />
                                </div>
                                <div className="form-group" style={{ width: 100 }}>
                                    <label className="form-label">Symbol *</label>
                                    <input className="input" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="BTC" required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Amount *</label>
                                    <input type="number" step="any" min="0" className="input" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.5" required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Price ($) *</label>
                                    <input type="number" step="any" min="0" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45000" required />
                                </div>
                            </div>
                            {form.amount && form.price && (
                                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', background: form.type === 'BUY' ? 'var(--accent-dim)' : 'var(--error-dim)', border: `1px solid ${form.type === 'BUY' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                                    <p style={{ fontSize: '0.85rem', color: form.type === 'BUY' ? 'var(--accent)' : 'var(--error)', fontWeight: 700 }}>
                                        Total: ${fmt(form.amount * form.price)}
                                    </p>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Dip buy, profit taking..." maxLength={200} />
                            </div>
                            <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                                {formLoading ? 'Saving...' : `Log ${form.type} Transaction`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={!!deleteTarget} title="Delete Transaction" message={`Remove this ${deleteTarget?.type} transaction for ${deleteTarget?.coinName}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default Transactions;
