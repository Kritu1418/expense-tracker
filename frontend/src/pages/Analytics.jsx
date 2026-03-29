import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart,
} from "recharts";
import {
  getCategoryWiseAPI,
  getMonthlyTrendAPI,
  getPaymentMethodStatsAPI,
  getTopExpensesAPI,
} from "../api/analytics";
import { useAuthStore } from "../context/authStore";
import { formatCurrency, formatDate } from "../utils/helpers";
import { CHART_COLORS } from "../utils/constants";

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-overlay)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      padding: "10px 14px",
      fontSize: 13,
    }}>
      {label && <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--text-primary)", fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? formatCurrency(p.value, currency) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { user } = useAuthStore();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchAll();
  }, [year]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cat, monthly, payment, top] = await Promise.all([
        getCategoryWiseAPI(),
        getMonthlyTrendAPI({ year }),
        getPaymentMethodStatsAPI(),
        getTopExpensesAPI({ limit: 5 }),
      ]);
      setCategoryData(cat.data.data);
      setMonthlyData(monthly.data.data);
      setPaymentData(payment.data.data);
      setTopExpenses(top.data.data);
    } catch {
      toast.error("Failed to load analytics");
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

  const pieData = categoryData.map((d) => ({ name: d._id, value: d.total }));
  const paymentPieData = paymentData.map((d) => ({ name: d._id, value: d.total }));
  const totalSpent = categoryData.reduce((s, d) => s + d.total, 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights into your spending patterns</p>
        </div>
        <select
          className="input"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: 120 }}
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Spending by Category</h3>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <h3>No data available</h3>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d._id}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(d.total, user?.currency)}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
                        {totalSpent > 0 ? Math.round((d.total / totalSpent) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Payment Methods</h3>
          {paymentPieData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <h3>No data available</h3>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentPieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={user?.currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {paymentData.map((d, i) => (
                  <div key={d._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{d._id}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(d.total, user?.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Monthly Trend — {year}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip currency={user?.currency} />} />
            <Area type="monotone" dataKey="total" name="Spent" stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#colorTotal)" dot={{ fill: "var(--accent-primary)", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Top Expenses</h3>
        {topExpenses.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <h3>No data available</h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topExpenses.map((exp, i) => (
              <div key={exp._id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: CHART_COLORS[i % CHART_COLORS.length] + "25",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{exp.category}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {exp.note || formatDate(exp.date)}
                  </div>
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--danger)",
                }}>
                  -{formatCurrency(exp.amount, user?.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}