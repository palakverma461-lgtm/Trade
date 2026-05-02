import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, TrendingUp, Shield, Zap, Briefcase } from 'lucide-react';

const FEATURES = [
    { icon: <TrendingUp size={17} />, title: 'Real-time P&L', desc: 'Track gains and losses across all assets instantly.' },
    { icon: <Shield size={17} />,     title: 'Bank-grade Security', desc: 'JWT auth + bcrypt encryption on every account.' },
    { icon: <Zap size={17} />,        title: 'AI Portfolio Advisor', desc: 'Smart insights powered by rule-based analysis.' },
];

const STATS = [
    { value: '10K+', label: 'Assets Tracked' },
    { value: '$2M+', label: 'Portfolio Value' },
    { value: '99.9%', label: 'Uptime' },
];

const Login = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally { setLoading(false); }
    };

    const fillDemo = () => { setEmail('admin@test.com'); setPassword('password123'); };

    return (
        <div style={{ display: 'flex', minHeight: '88vh', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', width: '100%', maxWidth: '960px', alignItems: 'center' }}>

                {/* Left — branding */}
                <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                            <Briefcase size={22} color="#fff" />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                            Prime<span style={{ color: 'var(--primary)' }}>Trade</span>
                        </span>
                    </div>

                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 99, background: 'var(--accent-dim)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.25rem' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>Live Portfolio Tracking</span>
                        </div>
                        <h1 style={{ fontSize: '2.75rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                            Trade smarter.<br />
                            <span style={{ background: 'linear-gradient(135deg, var(--primary), #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Grow faster.
                            </span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8 }}>
                            One dashboard for your entire crypto portfolio — real-time P&L, AI-driven insights, and institutional-grade security. Built for investors who take performance seriously.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', transition: 'var(--transition)' }}>
                                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{f.title}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {STATS.map((s, i) => (
                            <div key={i}>
                                <p style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)' }}>{s.value}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — form */}
                <div className="glass-elevated animate-fade" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Welcome back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your PrimeTrade account</p>
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-icon-wrap">
                                <Mail size={16} className="icon" />
                                <input type="email" className="input" placeholder="you@example.com"
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-icon-wrap">
                                <Lock size={16} className="icon" />
                                <input type={showPass ? 'text' : 'password'} className="input has-right"
                                    placeholder="••••••••" value={password}
                                    onChange={e => setPassword(e.target.value)} required />
                                <button type="button" className="icon-right" onClick={() => setShowPass(s => !s)}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary"
                            style={{ width: '100%', padding: '0.9rem', marginTop: '0.25rem', fontSize: '1rem' }}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>

                        <div style={{ position: 'relative', textAlign: 'center', margin: '0.25rem 0' }}>
                            <div className="divider" style={{ margin: 0 }} />
                            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--bg-elevated)', padding: '0 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                        </div>

                        <button type="button" onClick={fillDemo} className="btn btn-ghost" style={{ width: '100%' }}>
                            ⚡ Demo Login — admin@test.com
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
