import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AiInsights from './pages/AiInsights';
import Transactions from './pages/Transactions';
import Watchlist from './pages/Watchlist';
import './index.css';
import './App.css';

const Spinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary-dim)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
);

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    return user ? children : <Navigate to="/login" replace />;
};

// Redirect logged-in users away from login/register
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
    const { user } = useAuth();
    const uid = user?._id;

    return (
        <>
            <Navbar />
            <main style={{ marginTop: '1.5rem' }}>
                <Routes>
                    <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/"             element={<PrivateRoute><Dashboard    key={uid} /></PrivateRoute>} />
                    <Route path="/analytics"    element={<PrivateRoute><Analytics    key={uid} /></PrivateRoute>} />
                    <Route path="/ai-insights"  element={<PrivateRoute><AiInsights   key={uid} /></PrivateRoute>} />
                    <Route path="/transactions" element={<PrivateRoute><Transactions key={uid} /></PrivateRoute>} />
                    <Route path="/watchlist"    element={<PrivateRoute><Watchlist    key={uid} /></PrivateRoute>} />
                    <Route path="*"             element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
