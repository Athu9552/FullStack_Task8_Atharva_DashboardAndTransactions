// ------------------ Imports ------------------
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// ------------------ Setup ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ------------------ MySQL Connection ------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "task6",
});
db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected!");
});

// ------------------ PRODUCTS APIs ------------------
app.get("/api/products", (req, res) => {
  const search = req.query.search || "";
  const sql = `
    SELECT * FROM products
    WHERE name LIKE ? OR category LIKE ? OR description LIKE ? OR location LIKE ?
    ORDER BY updated_at DESC
  `;
  const param = `%${search}%`;
  db.query(sql, [param, param, param, param], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
});

app.put("/api/products/:id", (req, res) => {
  const { name, category, price, description, location, stock } = req.body;
  const sql = `
    UPDATE products SET name=?, category=?, price=?, description=?, location=?, stock=?, updated_at=NOW()
    WHERE id=?`;
  db.query(sql, [name, category, price, description, location, stock, req.params.id], (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, message: "Product updated successfully" });
  });
});

// ------------------ BUYERS APIs ------------------
app.get("/api/buyers", (req, res) => {
  const search = req.query.search || "";
  const sql = `
    SELECT * FROM buyers
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR location LIKE ?
    ORDER BY updated_at DESC
  `;
  const param = `%${search}%`;
  db.query(sql, [param, param, param, param], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
});

app.put("/api/buyers/:id", (req, res) => {
  const { name, email, phone, location, notes } = req.body;
  const sql = `
    UPDATE buyers
    SET name=?, email=?, phone=?, location=?, notes=?, updated_at=NOW()
    WHERE id=?`;
  db.query(sql, [name, email, phone, location, notes, req.params.id], (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, message: "Buyer updated successfully" });
  });
});

// ------------------ BILL API (Task 7) ------------------
app.get("/api/bill/:buyerId", (req, res) => {
  const buyerId = req.params.buyerId;
  db.query("SELECT * FROM buyers WHERE id=?", [buyerId], (err, buyerRows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    if (!buyerRows.length) return res.status(404).json({ ok: false, error: "Buyer not found" });

    db.query("SELECT * FROM products", (err2, prodRows) => {
      if (err2) return res.status(500).json({ ok: false, error: err2.message });
      res.json({
        ok: true,
        buyer: buyerRows[0],
        products: prodRows,
        transaction: {
          id: uuidv4().slice(0, 8).toUpperCase(),
          date: new Date().toLocaleDateString(),
          payment: "UPI",
        },
      });
    });
  });
});

// ------------------ VIEW DASHBOARD (Task 8) ------------------

// Buyers View
app.get("/api/view/buyers", (req, res) => {
  const search = req.query.search || "";
  const sql = `
    SELECT id, name, email, phone, location, created_at
    FROM buyers
    WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR location LIKE ?
    ORDER BY created_at DESC`;
  const param = `%${search}%`;
  db.query(sql, [param, param, param, param], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
});

// Products View
app.get("/api/view/products", (req, res) => {
  const search = req.query.search || "";
  const sql = `
    SELECT id, name, category, price, description, stock, updated_at
    FROM products
    WHERE name LIKE ? OR category LIKE ? OR description LIKE ?
    ORDER BY updated_at DESC`;
  const param = `%${search}%`;
  db.query(sql, [param, param, param], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
});

// Transactions View
app.get("/api/view/transactions", (req, res) => {
  const search = req.query.search || "";
  const sql = `
    SELECT t.id, b.name AS buyer_name, p.name AS product_name,
           t.date, t.quantity, t.total, t.payment_method, t.status
    FROM transactions t
    JOIN buyers b ON t.buyer_id = b.id
    JOIN products p ON t.product_id = p.id
    WHERE b.name LIKE ? OR p.name LIKE ? OR t.id LIKE ?
    ORDER BY t.date DESC`;
  const param = `%${search}%`;
  db.query(sql, [param, param, param], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
});

// ------------------ Start Server ------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));