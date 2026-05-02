/**
 * AI Insights Engine — Rule-based portfolio analysis
 * No external API required. Generates smart, context-aware suggestions.
 */

const RISK_THRESHOLDS = { HIGH: 40, MEDIUM: 25 };
const PNL_THRESHOLDS  = { STRONG_GAIN: 20, GAIN: 5, LOSS: -5, HEAVY_LOSS: -20 };

function generateInsights(assets) {
    if (!assets || assets.length === 0) {
        return [{
            type: 'info',
            title: 'Start Building Your Portfolio',
            message: 'Add your first crypto asset to get personalized AI insights and portfolio analysis.',
            priority: 1
        }];
    }

    const insights = [];

    const enriched = assets.map(a => {
        const cp         = a.currentPrice || a.buyPrice;
        const currentVal = a.amount * cp;
        const invested   = a.amount * a.buyPrice;
        const pnlAmt     = currentVal - invested;
        const pnlPct     = invested > 0 ? (pnlAmt / invested) * 100 : 0;
        return { ...a, currentVal, invested, pnlAmt, pnlPct };
    });

    const totalInvested     = enriched.reduce((s, a) => s + a.invested, 0);
    const totalCurrentValue = enriched.reduce((s, a) => s + a.currentVal, 0);
    const totalPnl          = totalCurrentValue - totalInvested;
    const totalPnlPct       = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    const withAlloc = enriched.map(a => ({
        ...a,
        allocation: totalInvested > 0 ? (a.invested / totalInvested) * 100 : 0
    }));

    // 1. Concentration Risk
    withAlloc.filter(a => a.allocation > RISK_THRESHOLDS.HIGH).forEach(a => {
        insights.push({
            type: 'warning',
            title: `High Concentration Risk: ${a.coinName}`,
            message: `${a.coinName} makes up ${a.allocation.toFixed(1)}% of your portfolio. Consider diversifying — a single asset exceeding 40% significantly increases risk exposure.`,
            priority: 1, asset: a.coinName
        });
    });

    // 2. Diversification
    if (assets.length === 1) {
        insights.push({ type: 'warning', title: 'Zero Diversification', message: 'Your portfolio holds only 1 asset. Professional portfolios typically hold 5–15 assets across different sectors to reduce volatility.', priority: 2 });
    } else if (assets.length < 4) {
        insights.push({ type: 'info', title: 'Low Diversification', message: `You hold ${assets.length} assets. Consider adding more assets across DeFi, Layer-1, Layer-2, and Stablecoins to reduce risk.`, priority: 3 });
    } else if (assets.length >= 8) {
        insights.push({ type: 'success', title: 'Well Diversified Portfolio', message: `Holding ${assets.length} assets shows good diversification. Monitor correlation between assets to ensure they don't all move together.`, priority: 5 });
    }

    // 3. Portfolio P&L
    if (totalPnlPct >= PNL_THRESHOLDS.STRONG_GAIN) {
        insights.push({ type: 'success', title: `Strong Performance: +${totalPnlPct.toFixed(2)}%`, message: `Your portfolio is up ${totalPnlPct.toFixed(2)}%. Consider taking partial profits on top performers to lock in gains and rebalance.`, priority: 2 });
    } else if (totalPnlPct <= PNL_THRESHOLDS.HEAVY_LOSS) {
        insights.push({ type: 'danger', title: `Portfolio Down ${Math.abs(totalPnlPct).toFixed(2)}% — Review Needed`, message: `Your portfolio has declined significantly. Evaluate whether this is a market-wide correction or asset-specific issue. Avoid panic selling — review fundamentals first.`, priority: 1 });
    }

    // 4. Best / Worst asset signals
    const sorted = [...enriched].sort((a, b) => b.pnlPct - a.pnlPct);
    const best = sorted[0], worst = sorted[sorted.length - 1];

    if (best && best.pnlPct > PNL_THRESHOLDS.STRONG_GAIN) {
        insights.push({ type: 'success', title: `${best.coinName} is Your Star Performer`, message: `${best.coinName} is up ${best.pnlPct.toFixed(2)}% (+$${Math.abs(best.pnlAmt).toFixed(2)}). Consider whether to take profits or let winners run based on your investment thesis.`, priority: 3, asset: best.coinName });
    }
    if (worst && worst.pnlPct < PNL_THRESHOLDS.HEAVY_LOSS) {
        insights.push({ type: 'danger', title: `${worst.coinName} Needs Attention`, message: `${worst.coinName} is down ${Math.abs(worst.pnlPct).toFixed(2)}% (-$${Math.abs(worst.pnlAmt).toFixed(2)}). Evaluate if this is a temporary dip or a fundamental issue. Set a stop-loss if you haven't already.`, priority: 1, asset: worst.coinName });
    }

    // 5. Missing current price
    const stale = assets.filter(a => !a.currentPrice);
    if (stale.length > 0) {
        insights.push({ type: 'info', title: `${stale.length} Asset${stale.length > 1 ? 's' : ''} Missing Current Price`, message: `Update current price for: ${stale.map(a => a.coinName).join(', ')}. Without current prices, P&L calculations use buy price and may be inaccurate.`, priority: 4 });
    }

    // 6. Portfolio value security tip
    if (totalCurrentValue > 10000) {
        insights.push({ type: 'info', title: 'Consider Hardware Wallet Storage', message: `Your portfolio value ($${totalCurrentValue.toFixed(2)}) exceeds $10,000. Consider moving long-term holdings to a hardware wallet (Ledger/Trezor) for enhanced security.`, priority: 4 });
    }

    // 7. Rebalancing
    const mediumOver = withAlloc.filter(a => a.allocation > RISK_THRESHOLDS.MEDIUM && a.allocation <= RISK_THRESHOLDS.HIGH);
    if (mediumOver.length > 0 && assets.length > 2) {
        insights.push({ type: 'info', title: 'Rebalancing Opportunity', message: `${mediumOver.map(a => a.coinName).join(', ')} ${mediumOver.length > 1 ? 'are' : 'is'} above 25% allocation. Periodic rebalancing (monthly/quarterly) helps maintain your target risk profile.`, priority: 4 });
    }

    return insights.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

module.exports = { generateInsights };
