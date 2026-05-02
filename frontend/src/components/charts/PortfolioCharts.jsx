import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];
const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(8,13,26,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
            {label && <p style={{ color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || '#f1f5f9', fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' && p.name?.includes('%') ? `${p.value.toFixed(2)}%` : `$${fmt(p.value)}`}
                </p>
            ))}
        </div>
    );
};

const EmptyChart = () => (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem' }}>
        Add assets to see chart
    </div>
);

export const AllocationDonut = ({ assets }) => {
    if (!assets?.length) return <EmptyChart />;
    const totalInvested = assets.reduce((s, a) => s + a.amount * a.buyPrice, 0);
    const data = assets.map((a, i) => ({
        name: a.coinName,
        value: parseFloat(((a.amount * a.buyPrice / totalInvested) * 100).toFixed(2)),
        color: COLORS[i % COLORS.length]
    }));
    return (
        <div>
            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} formatter={(v) => [`${v}%`, 'Allocation']} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.875rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ color: '#94a3b8' }}>{d.name}</span>
                        <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PnlBarChart = ({ assets }) => {
    if (!assets?.length) return <EmptyChart />;
    const data = assets.map(a => {
        const cp = a.currentPrice || a.buyPrice;
        const pnl = parseFloat(((a.amount * cp) - (a.amount * a.buyPrice)).toFixed(2));
        return { name: a.symbol, 'P&L': pnl, fill: pnl >= 0 ? '#10b981' : '#ef4444' };
    });
    return (
        <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${fmt(v)}`} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="P&L" radius={[6, 6, 0, 0]}>
                        {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ValueVsInvestedChart = ({ assets }) => {
    if (!assets?.length) return <EmptyChart />;
    const sorted = [...assets].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let cumInv = 0, cumVal = 0;
    const data = sorted.map(a => {
        const cp = a.currentPrice || a.buyPrice;
        cumInv += a.amount * a.buyPrice;
        cumVal += a.amount * cp;
        return { name: a.symbol, 'Invested': parseFloat(cumInv.toFixed(2)), 'Current Value': parseFloat(cumVal.toFixed(2)) };
    });
    return (
        <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                    <defs>
                        <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${fmt(v)}`} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8', paddingTop: '0.5rem' }} />
                    <Area type="monotone" dataKey="Current Value" stroke="#6366f1" strokeWidth={2.5} fill="url(#gVal)" />
                    <Area type="monotone" dataKey="Invested" stroke="#10b981" strokeWidth={2} fill="url(#gInv)" strokeDasharray="5 5" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
