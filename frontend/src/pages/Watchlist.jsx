import { useState, useEffect } from 'react';
import api from '../api';
import Toast from '../components/layout/Toast';
import ConfirmModal from '../components/layout/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { Plus, Trash2, Eye, Target, X, Edit2 } from 'lucide-react';

const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Watchlist = () => {
    const [items, setItems]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { toasts, addToast, removeToast } = useToast();

    const emptyForm = { coinName: '', symbol: '', targetPrice: '', notes: '' };
    const [form, setForm]             = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/watchlist');
            setItems(res.data.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = { ...form, targetPrice: form.targetPrice ? Number(form.targetPrice) : null };
            if (editingItem) {
                await api.put(`/watchlist/${editingItem._id}`, payload);
                addToast(`${form.coinName} updated`);
            } else {
                await api.post('/watchlist', payload);
                addToast(`${form.coinName} added to watchlist`);
            }
            setShowModal(false);
            setEditingItem(null);
            setForm(emptyForm);
            fetchItems();
        } catch (err) {
            addToast(err.response?.data?.error || 'Operation failed', 'error');
        } finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/watchlist/${deleteTarget._id}`);
            addToast(`${deleteTarget.coinName} removed from watchlist`, 'error');
            setDeleteTarget(null);
            fetchItems();
        } catch { addToast('Failed to remove', 'error'); }
        finally { setDeleteLoading(false); }
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setForm({ coinName: item.coinName, symbol: item.symbol, targetPrice: item.targetPrice || '', notes: item.notes || '' });
        setShowModal(true);
    };

    return (
        <div className="container animate-fade" style={{ paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem' }}>Watchlist</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Track assets you're interested in before buying</p>
                </div>
                <button onClick={() => { setEditingItem(null); setForm(emptyForm); setShowModal(true); }} className="btn btn-primary">
                    <Plus size={16} /> Add to Watchlist
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass stat-card">
                    <div className="stat-icon" style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}><Eye size={20} /></div>
                    <div>
                        <p className="stat-label">Watching</p>
                        <p className="stat-value">{items.length}</p>
                    </div>
                </div>
                <div className="glass stat-card">
                    <div className="stat-icon" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}><Target size={20} /></div>
                    <div>
                        <p className="stat-label">With Target Price</p>
                        <p className="stat-value">{items.filter(i => i.targetPrice).length}</p>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 4 }} />
                                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
                                <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Eye size={28} color="var(--primary)" />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Your watchlist is empty</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Add assets you want to monitor before investing</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Add First Asset</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {items.map(item => (
                        <div key={item._id} className="glass" style={{ padding: '1.5rem', transition: 'var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        {item.symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{item.coinName}</p>
                                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.symbol}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => openEdit(item)} className="btn-icon"><Edit2 size={15} /></button>
                                    <button onClick={() => setDeleteTarget(item)} className="btn-icon" style={{ color: 'var(--error)' }}><Trash2 size={15} /></button>
                                </div>
                            </div>

                            {item.targetPrice && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', borderRadius: 'var(--radius)', background: 'var(--accent-dim)', marginBottom: '0.75rem' }}>
                                    <Target size={14} color="var(--accent)" />
                                    <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700 }}>Target: ${fmt(item.targetPrice)}</span>
                                </div>
                            )}

                            {item.notes && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.notes}</p>
                            )}

                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                Added {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-elevated modal animate-fade" style={{ borderRadius: 'var(--radius-xl)' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingItem ? 'Edit Watchlist Item' : 'Add to Watchlist'}</h3>
                            <button onClick={() => setShowModal(false)} className="btn-icon"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Coin Name *</label>
                                    <input className="input" value={form.coinName} onChange={e => setForm({ ...form, coinName: e.target.value })} placeholder="Cardano" required />
                                </div>
                                <div className="form-group" style={{ width: 100 }}>
                                    <label className="form-label">Symbol *</label>
                                    <input className="input" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="ADA" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Buy Price ($)</label>
                                <input type="number" step="any" min="0" className="input" value={form.targetPrice} onChange={e => setForm({ ...form, targetPrice: e.target.value })} placeholder="e.g. 0.50 — alert when price hits this" />
                                <span className="form-hint">Optional — your desired entry price</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Why are you watching this?" maxLength={200} />
                            </div>
                            <button type="submit" disabled={formLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                                {formLoading ? 'Saving...' : (editingItem ? 'Update' : 'Add to Watchlist')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={!!deleteTarget} title="Remove from Watchlist" message={`Remove "${deleteTarget?.coinName}" from your watchlist?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default Watchlist;
