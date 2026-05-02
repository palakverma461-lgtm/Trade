import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Menu, X, BarChart2, Brain, ArrowLeftRight, Eye, Briefcase, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
    { to: '/',              icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { to: '/analytics',    icon: <BarChart2 size={15} />,       label: 'Analytics' },
    { to: '/transactions', icon: <ArrowLeftRight size={15} />,  label: 'Transactions' },
    { to: '/watchlist',    icon: <Eye size={15} />,             label: 'Watchlist' },
    { to: '/ai-insights',  icon: <Brain size={15} />,           label: 'AI Insights' },
];

const UserAvatar = ({ username, size = 28, fontSize = '0.72rem' }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), #818cf8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 800, color: '#fff', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
    }}>
        {username?.[0]?.toUpperCase() || '?'}
    </div>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); setMobileOpen(false); };
    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <nav className="navbar">
            <div className="glass navbar-inner" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                    }}>
                        <Briefcase size={17} color="#fff" />
                    </div>
                    Prime<span style={{ color: 'var(--primary)' }}>Trade</span>
                </Link>

                {/* Desktop Nav */}
                {user && (
                    <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        {NAV_LINKS.map(l => (
                            <Link key={l.to} to={l.to}
                                className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
                                {l.icon} {l.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {user ? (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.4rem 0.875rem 0.4rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--primary-dim)',
                                border: '1px solid rgba(99,102,241,0.2)',
                            }}>
                                <UserAvatar username={user.username} />
                                <div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{user.username}</p>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</p>
                                </div>
                                <ChevronDown size={13} color="var(--text-muted)" />
                            </div>
                            <button onClick={handleLogout} className="btn-icon" title="Sign Out"
                                style={{ color: 'var(--error)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Sign In</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button className="btn-icon" onClick={() => setMobileOpen(o => !o)} id="ham2">
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="glass animate-fade" style={{ margin: '0.5rem 0 0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius)', background: 'var(--primary-dim)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.5rem' }}>
                                <UserAvatar username={user.username} size={36} fontSize="0.85rem" />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.username}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                </div>
                                <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{user.role}</span>
                            </div>
                            {NAV_LINKS.map(l => (
                                <Link key={l.to} to={l.to}
                                    className={`nav-link ${isActive(l.to) ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}>
                                    {l.icon} {l.label}
                                </Link>
                            ))}
                            <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: '0.75rem', width: '100%' }}>
                                <LogOut size={15} /> Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @media (min-width: 769px) { #ham2 { display: none !important; } }
                @media (max-width: 768px)  { .hide-mobile { display: none !important; } #ham2 { display: flex !important; } }
            `}</style>
        </nav>
    );
};

export default Navbar;
