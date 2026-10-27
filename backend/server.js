
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Expense = require("./Expense");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err.message));

app.get("/api/expenses", async (req, res) => {
  try {
    res.json(await Expense.find().sort({ date: -1 }));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title?.trim() || !category || !date ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Enter valid expense details" });
    }
    const expense = await Expense.create({
      title: title.trim(), amount: Number(amount), category, date
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to add expense" });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title?.trim() || !category || !date ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Enter valid expense details" });
    }
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), amount: Number(amount), category, date },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: "Failed to update expense" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete expense" });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port 5000")
);
