import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getDashboardStatsAPI } from "../api/analytics";
import { useAuthStore } from "../context/authStore";
import { formatCurrency, formatDate, getBudgetPercentage } from "../utils/helpers";

const StatCard = ({ title, value, sub, color, icon }) => (
  <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </span>
      <div style={{
        width: 34, height: 34, borderRadius: "var(--radius-sm)",
        background: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color,
      }}>
        {icon}
      </div>
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStatsAPI();
      setStats(res.data.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const budgetPct = getBudgetPercentage(stats?.monthlyTotal, stats?.monthlyBudget);
  const budgetColor = budgetPct >= 100 ? "var(--danger)" : budgetPct >= 80 ? "var(--warning)" : "var(--success)";

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(" ")[0]}</p>
        </div>
        <Link to="/expenses" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Expense
        </Link>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats?.totalExpenses || 0, user?.currency)}
          sub="All time"
          color="var(--accent-primary)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.monthlyTotal || 0, user?.currency)}
          sub={new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}
          color="var(--purple)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
        />
        <StatCard
          title="Monthly Budget"
          value={formatCurrency(stats?.monthlyBudget || 0, user?.currency)}
          sub={stats?.budgetExceeded ? "Budget exceeded!" : `${formatCurrency(stats?.budgetLeft || 0, user?.currency)} remaining`}
          color={stats?.budgetExceeded ? "var(--danger)" : "var(--success)"}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
        />
        <StatCard
          title="Transactions"
          value={stats?.recentTransactions?.length || 0}
          sub="Recent entries"
          color="var(--teal)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
        />
      </div>

      {stats?.monthlyBudget > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Monthly Budget Usage</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {formatCurrency(stats?.monthlyTotal, user?.currency)} of {formatCurrency(stats?.monthlyBudget, user?.currency)}
              </div>
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: budgetColor,
            }}>
              {Math.round(budgetPct)}%
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${budgetPct}%`,
                background: budgetColor,
                boxShadow: `0 0 8px ${budgetColor}60`,
              }}
            />
          </div>
          {stats?.budgetExceeded && (
            <div style={{
              marginTop: 10, padding: "8px 12px",
              background: "var(--danger-soft)",
              border: "1px solid rgba(244,63,94,0.2)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13, color: "var(--danger)", fontWeight: 500,
            }}>
              Budget exceeded by {formatCurrency(Math.abs(stats?.budgetLeft), user?.currency)}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Transactions</h2>
          <Link to="/expenses" style={{ fontSize: 13, color: "var(--accent-primary)", fontWeight: 500 }}>
            View all
          </Link>
        </div>

        {stats?.recentTransactions?.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h3>No transactions yet</h3>
            <p>Add your first expense to get started</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {stats?.recentTransactions?.map((tx, i) => (
              <div key={tx._id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)",
                transition: "var(--transition)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "var(--accent-primary)",
                  }}>
                    {tx.category?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                      {tx.category}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {tx.note || formatDate(tx.date)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", fontFamily: "var(--font-display)" }}>
                    -{formatCurrency(tx.amount, user?.currency)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {formatDate(tx.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}