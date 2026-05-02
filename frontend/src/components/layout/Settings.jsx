import { useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Save, X, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from 'lucide-react';

const Settings = ({ isOpen, onClose, currentUser }) => {
    const { updateUser } = useAuth();
    const [tab, setTab]           = useState('profile');
    const [username, setUsername] = useState(currentUser?.username || '');
    const [email, setEmail]       = useState(currentUser?.email || '');
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPw, setShowPw]     = useState({ current: false, new: false });
    const [status, setStatus]     = useState({ type: '', msg: '' });
    const [loading, setLoading]   = useState(false);

    if (!isOpen) return null;

    const setMsg = (type, msg) => setStatus({ type, msg });

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setLoading(true); setMsg('', '');
        try {
            const res = await api.put('/auth/updatedetails', { username, email });
            updateUser(res.data.data);
            setMsg('success', 'Profile updated successfully!');
        } catch (err) {
            setMsg('error', err.response?.data?.error || 'Update failed');
        } finally { setLoading(false); }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return setMsg('error', 'New passwords do not match');
        if (passwords.new.length < 6) return setMsg('error', 'Password must be at least 6 characters');
        setLoading(true); setMsg('', '');
        try {
            await api.put('/auth/updatepassword', { currentPassword: passwords.current, newPassword: passwords.new });
            setMsg('success', 'Password changed successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            setMsg('error', err.response?.data?.error || 'Password update failed');
        } finally { setLoading(false); }
    };

    const switchTab = (t) => { setTab(t); setMsg('', ''); };

    return (
        <div className="modal-overlay">
            <div className="glass-elevated modal animate-fade" style={{ borderRadius: 'var(--radius-xl)', maxWidth: 500 }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                        }}>
                            {currentUser?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className="modal-title">Account Settings</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.1rem' }}>{currentUser?.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon"><X size={22} /></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius)', marginBottom: '1.75rem' }}>
                    {[['profile', <User size={15} key="u" />, 'Profile'], ['password', <Lock size={15} key="l" />, 'Security']].map(([key, icon, label]) => (
                        <button key={key} onClick={() => switchTab(key)} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.4rem', padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem', fontWeight: 600, transition: 'var(--transition)',
                            background: tab === key ? 'var(--primary)' : 'none',
                            color: tab === key ? '#fff' : 'var(--text-muted)',
                        }}>
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {status.msg && (
                    <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {status.msg}
                    </div>
                )}

                {tab === 'profile' ? (
                    <form onSubmit={handleUpdateDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div className="input-icon-wrap">
                                <User size={16} className="icon" />
                                <input className="input" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-icon-wrap">
                                <Mail size={16} className="icon" />
                                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { key: 'current', label: 'Current Password',     show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
                            { key: 'new',     label: 'New Password',         show: showPw.new,     toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
                            { key: 'confirm', label: 'Confirm New Password', show: showPw.new,     toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
                        ].map(({ key, label, show, toggle }) => (
                            <div key={key} className="form-group">
                                <label className="form-label">{label}</label>
                                <div className="input-icon-wrap">
                                    <Lock size={16} className="icon" />
                                    <input type={show ? 'text' : 'password'} className="input has-right"
                                        value={passwords[key]} onChange={e => setPasswords({ ...passwords, [key]: e.target.value })} required />
                                    <button type="button" className="icon-right" onClick={toggle}>
                                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                            <Lock size={16} /> {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Settings;
