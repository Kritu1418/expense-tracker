import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getExpensesAPI,
  addExpenseAPI,
  updateExpenseAPI,
  deleteExpenseAPI,
  deleteMultipleExpensesAPI,
} from "../api/expenses";
import { exportCSVAPI, exportPDFAPI } from "../api/export";
import { useAuthStore } from "../context/authStore";
import { CATEGORIES, PAYMENT_METHODS, RECURRING_INTERVALS } from "../utils/constants";
import { formatCurrency, formatDate, formatDateInput, downloadFile } from "../utils/helpers";

const emptyForm = {
  amount: "",
  category: "",
  date: formatDateInput(new Date()),
  note: "",
  paymentMethod: "cash",
  isRecurring: false,
  recurringInterval: "",
};

function ExpenseModal({ open, onClose, onSave, initial, user }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [customCat, setCustomCat] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        amount: initial.amount || "",
        category: initial.category || "",
        date: formatDateInput(initial.date),
        note: initial.note || "",
        paymentMethod: initial.paymentMethod || "cash",
        isRecurring: initial.isRecurring || false,
        recurringInterval: initial.recurringInterval || "",
      });
      setCustomCat(!CATEGORIES.includes(initial.category));
    } else {
      setForm(emptyForm);
      setCustomCat(false);
    }
  }, [initial, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      toast.error("Amount, category and date are required");
      return;
    }
    setLoading(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const allCategories = [...CATEGORIES, ...(user?.customCategories || [])];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">{initial ? "Edit Expense" : "Add Expense"}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Amount ({user?.currency || "INR"})</label>
              <input className="input" type="number" name="amount" placeholder="0.00" value={form.amount} onChange={handleChange} min="0" step="0.01" />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <div style={{ display: "flex", gap: 8 }}>
              {!customCat ? (
                <select className="input" name="category" value={form.category} onChange={handleChange} style={{ flex: 1 }}>
                  <option value="">Select category</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input className="input" type="text" name="category" placeholder="Enter custom category" value={form.category} onChange={handleChange} style={{ flex: 1 }} />
              )}
              <button type="button" className="btn btn-secondary" onClick={() => { setCustomCat(!customCat); setForm(f => ({ ...f, category: "" })); }} style={{ flexShrink: 0, fontSize: 12 }}>
                {customCat ? "Preset" : "Custom"}
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Payment Method</label>
              <select className="input" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Note</label>
              <input className="input" type="text" name="note" placeholder="Optional note" value={form.note} onChange={handleChange} />
            </div>
          </div>

          <div style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 16px",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
              <input type="checkbox" className="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
              Recurring Expense
            </label>
            {form.isRecurring && (
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Repeat Every</label>
                <select className="input" name="recurringInterval" value={form.recurringInterval} onChange={handleChange}>
                  <option value="">Select interval</option>
                  {RECURRING_INTERVALS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : initial ? "Update" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ open, onClose, onConfirm, count = 1, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--danger-soft)",
            border: "1px solid rgba(244,63,94,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete {count > 1 ? `${count} Expenses` : "Expense"}</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            This action cannot be undone. {count > 1 ? `These ${count} expenses` : "This expense"} will be permanently deleted.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} style={{ flex: 1, background: "var(--danger)", color: "white" }}>
            {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Deleting...</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Expenses() {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [exportLoading, setExportLoading] = useState("");

  const [filters, setFilters] = useState({
    category: "", startDate: "", endDate: "", search: "", sortBy: "date", order: "desc",
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getExpensesAPI(params);
      setExpenses(res.data.data.expenses);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setSelected([]);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleFilterChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: "", startDate: "", endDate: "", search: "", sortBy: "date", order: "desc" });
    setPage(1);
  };

  const handleAdd = async (data) => {
    await addExpenseAPI(data);
    toast.success("Expense added");
    fetchExpenses();
  };

  const handleEdit = async (data) => {
    await updateExpenseAPI(editItem._id, data);
    toast.success("Expense updated");
    fetchExpenses();
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteExpenseAPI(deleteModal.id);
      toast.success("Expense deleted");
      setDeleteModal({ open: false, id: null });
      fetchExpenses();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteMultipleExpensesAPI(selected);
      toast.success(`${selected.length} expenses deleted`);
      setBulkDeleteModal(false);
      setSelected([]);
      fetchExpenses();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === expenses.length ? [] : expenses.map((e) => e._id));
  };

  const handleExport = async (type) => {
    setExportLoading(type);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      if (type === "csv") {
        const res = await exportCSVAPI(params);
        downloadFile(res.data, `expenses_${Date.now()}.csv`);
        toast.success("CSV downloaded");
      } else {
        const res = await exportPDFAPI(params);
        downloadFile(res.data, `expenses_${Date.now()}.html`);
        toast.success("Report downloaded");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExportLoading("");
    }
  };

  const allCategories = [...CATEGORIES, ...(user?.customCategories || [])];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{total} total transactions</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport("csv")} disabled={!!exportLoading}>
            {exportLoading === "csv" ? <div className="spinner" style={{ width: 12, height: 12 }} /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport("pdf")} disabled={!!exportLoading}>
            {exportLoading === "pdf" ? <div className="spinner" style={{ width: 12, height: 12 }} /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
            )}
            Report
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setModalOpen(true); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Expense
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="input-group" style={{ flex: "1 1 160px" }}>
            <label className="input-label">Search</label>
            <input className="input" type="text" name="search" placeholder="Search notes..." value={filters.search} onChange={handleFilterChange} />
          </div>
          <div className="input-group" style={{ flex: "1 1 140px" }}>
            <label className="input-label">Category</label>
            <select className="input" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All</option>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ flex: "1 1 140px" }}>
            <label className="input-label">From</label>
            <input className="input" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="input-group" style={{ flex: "1 1 140px" }}>
            <label className="input-label">To</label>
            <input className="input" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="input-group" style={{ flex: "1 1 120px" }}>
            <label className="input-label">Sort By</label>
            <select className="input" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className="input-group" style={{ flex: "1 1 100px" }}>
            <label className="input-label">Order</label>
            <select className="input" name="order" value={filters.order} onChange={handleFilterChange}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ marginBottom: 1 }}>
            Clear
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", marginBottom: 12,
          background: "var(--accent-soft)",
          border: "1px solid rgba(79,124,255,0.2)",
          borderRadius: "var(--radius-sm)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--accent-primary)" }}>
            {selected.length} selected
          </span>
          <button className="btn btn-danger btn-sm" onClick={() => setBulkDeleteModal(true)}>
            Delete Selected
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h3>No expenses found</h3>
            <p>Try adjusting your filters or add a new expense</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: "var(--radius-lg)" }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" className="checkbox" checked={selected.length === expenses.length && expenses.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Note</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>
                      <input type="checkbox" className="checkbox" checked={selected.includes(exp._id)} onChange={() => toggleSelect(exp._id)} />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "var(--radius-xs)",
                          background: "var(--accent-soft)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: "var(--accent-primary)",
                        }}>
                          {exp.category?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{exp.category}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--danger)", fontFamily: "var(--font-display)" }}>
                        -{formatCurrency(exp.amount, user?.currency)}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatDate(exp.date)}</td>
                    <td>
                      <span className="badge badge-gray" style={{ fontSize: 11 }}>
                        {PAYMENT_METHODS.find((m) => m.value === exp.paymentMethod)?.label || exp.paymentMethod}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {exp.note || "-"}
                    </td>
                    <td>
                      {exp.isRecurring ? (
                        <span className="badge badge-purple" style={{ fontSize: 11 }}>Recurring</span>
                      ) : (
                        <span className="badge badge-gray" style={{ fontSize: 11 }}>One-time</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditItem(exp); setModalOpen(true); }} style={{ padding: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={() => setDeleteModal({ open: true, id: exp._id })} style={{ padding: 6, color: "var(--danger)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            borderTop: "1px solid var(--border-subtle)",
          }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Page {page} of {pages}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
            </div>
          </div>
        )}
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={editItem ? handleEdit : handleAdd}
        initial={editItem}
        user={user}
      />

      <DeleteModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <DeleteModal
        open={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        count={selected.length}
        loading={deleteLoading}
      />
    </div>
  );
}