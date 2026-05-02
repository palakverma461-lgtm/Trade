import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const getStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score, label: 'Weak',   color: 'var(--error)' };
    if (score <= 3) return { score, label: 'Fair',   color: 'var(--warning)' };
    return              { score, label: 'Strong', color: 'var(--accent)' };
};

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const strength = useMemo(() => getStrength(formData.password), [formData.password]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '85vh', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div className="glass-elevated animate-fade" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Create account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start tracking your portfolio today</p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div className="input-icon-wrap">
                            <User size={16} className="icon" />
                            <input name="username" type="text" className="input" placeholder="johndoe"
                                value={formData.username} onChange={handleChange} required minLength={3} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="input-icon-wrap">
                            <Mail size={16} className="icon" />
                            <input name="email" type="email" className="input" placeholder="you@example.com"
                                value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-icon-wrap">
                            <Lock size={16} className="icon" />
                            <input name="password" type={showPass ? 'text' : 'password'} className="input has-right"
                                placeholder="Min. 6 characters" value={formData.password}
                                onChange={handleChange} required minLength={6} />
                            <button type="button" className="icon-right" onClick={() => setShowPass(s => !s)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Password strength */}
                        {formData.password && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label} password</span>
                            </div>
                        )}
                    </div>

                    {/* Terms */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        <CheckCircle size={15} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Your data is encrypted and stored securely. We never share your information.
                        </p>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem' }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
