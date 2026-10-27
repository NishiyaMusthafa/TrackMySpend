
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/expenses";
const emptyForm = { title: "", amount: "", category: "Food", date: new Date().toISOString().slice(0, 10) };

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  async function loadExpenses() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      setExpenses(await res.json());
    } catch {
      setMessage("Cannot connect to server");
    }
  }

  useEffect(() => { loadExpenses(); }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.date ||
        !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setMessage("Please enter valid details");
      return;
    }

    try {
      const res = await fetch(editing ? `${API}/${editing}` : API, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Operation failed");
      setMessage(editing ? "Expense updated!" : "Expense added!");
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
      setEditing(null);
      loadExpenses();
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    }
  }

  function editExpense(item) {
    setEditing(item._id);
    setForm({
      title: item.title,
      amount: String(item.amount),
      category: item.category,
      date: new Date(item.date).toISOString().slice(0, 10)
    });
    setMessage("");
  }

  async function deleteExpense(id) {
    if (!window.confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessage("Expense deleted!");
      if (editing === id) {
        setEditing(null);
        setForm(emptyForm);
      }
      loadExpenses();
    } catch {
      setMessage("Failed to delete expense");
    }
  }

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <main className="container">
      <header>
        <p className="eyebrow">PERSONAL FINANCE</p>
        <h1>TrackMySpend</h1>
        <p className="subtitle">Keep your daily spending in balance.</p>
      </header>

      <section className="summary">
        <span>Total Amount Spent</span>
        <h2>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
      </section>

      <section className="panel">
        <h2>{editing ? "Edit Expense" : "Add Expense"}</h2>
        <form onSubmit={submit}>
          <label>Title
            <input name="title" value={form.title} onChange={change} placeholder="e.g. Lunch" required />
          </label>
          <label>Amount (₹)
            <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={change} placeholder="0.00" required />
          </label>
          <label>Category
            <select name="category" value={form.category} onChange={change}>
              {["Food", "Travel", "Bills", "Shopping", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Date
            <input name="date" type="date" value={form.date} onChange={change} required />
          </label>
          <div className="actions">
            <button type="submit">{editing ? "Save Changes" : "Add Expense"}</button>
            {editing && <button type="button" className="cancel" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
          </div>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="panel">
        <h2>Expenses</h2>
        {expenses.length === 0 ? <p className="empty">No expenses yet. Add your first expense above.</p> :
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Amount</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>{expenses.map(item => <tr key={item._id}>
                <td>{item.title}</td>
                <td>₹{Number(item.amount).toFixed(2)}</td>
                <td><span className="category">{item.category}</span></td>
                <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>
                <td className="row-actions">
                  <button className="edit" onClick={() => editExpense(item)}>Edit</button>
                  <button className="delete" onClick={() => deleteExpense(item._id)}>Delete</button>
                </td>
              </tr>)}</tbody>
            </table>
          </div>}
      </section>
    </main>
  );
}

export default App;
