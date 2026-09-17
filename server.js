const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const COOKIE_NAME = 'market_renzz_auth';

if (!JWT_SECRET) {
  console.warn('JWT_SECRET belum di-set. Set environment variable JWT_SECRET sebelum production.');
}
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL belum di-set. Hubungkan project ke Neon/Postgres sebelum digunakan.');
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
let dbReady;

async function initDb() {
  if (!sql) throw new Error('DATABASE_URL belum di-set.');
  await sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance NUMERIC(14,2) NOT NULL DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(14,2) NOT NULL,
    icon TEXT NOT NULL DEFAULT '📦',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(14,2) NOT NULL,
    total NUMERIC(14,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Diproses' CHECK (status IN ('Diproses','Selesai','Dibatalkan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('topup','purchase','refund')),
    amount NUMERIC(14,2) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    order_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`;
  await sql`INSERT INTO products (id, category, name, description, price, icon)
             VALUES ('quota','QUOTA','Quota Add Owner','Tambahkan quota sesuai kebutuhan.',2000,'📦')
             ON CONFLICT (id) DO UPDATE SET
               category=EXCLUDED.category,
               name=EXCLUDED.name,
               description=EXCLUDED.description,
               price=EXCLUDED.price,
               icon=EXCLUDED.icon`;
}

async function ensureDb(req, res, next) {
  try {
    if (!dbReady) dbReady = initDb();
    await dbReady;
    next();
  } catch (err) {
    dbReady = null;
    console.error(err);
    res.status(500).json({ message: 'Database belum siap. Pastikan DATABASE_URL sudah terpasang di Vercel.' });
  }
}

const publicUser = u => ({
  id: u.id,
  name: u.name,
  email: u.email,
  balance: Number(u.balance || 0),
  role: u.role || 'user',
  createdAt: u.created_at || u.createdAt
});

function signToken(user) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET belum di-set.');
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
}

function setAuthCookie(res, user) {
  const token = signToken(user);
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure ? '; Secure' : ''}`);
}

function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`);
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const found = header.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getCookie(req, COOKIE_NAME);
    if (!token || !JWT_SECRET) return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
    const payload = jwt.verify(token, JWT_SECRET);
    const [user] = await sql`SELECT * FROM users WHERE id=${payload.sub} LIMIT 1`;
    if (!user) return res.status(401).json({ message: 'Session tidak valid.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Session tidak valid atau sudah kedaluwarsa.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Akses admin ditolak.' });
  next();
}

app.use(express.json({ limit: '30kb' }));
app.use(ensureDb);
app.use(express.static(__dirname));

app.get('/api/health', async (req, res) => {
  res.json({ ok: true, database: true, platform: process.env.VERCEL ? 'vercel' : 'node' });
});

app.get('/api/products', async (req, res) => {
  const products = await sql`SELECT id, category, name, description AS desc, price, icon FROM products WHERE active=true ORDER BY created_at DESC`;
  res.json({ products: products.map(p => ({ ...p, price: Number(p.price) })) });
});

app.post('/api/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2) return res.status(400).json({ message: 'Nama minimal 2 karakter.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Format email tidak valid.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    if (!JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET belum dikonfigurasi.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const id = 'USR-' + cryptoRandom();
    const role = ADMIN_EMAIL && email === ADMIN_EMAIL ? 'admin' : 'user';
    const rows = await sql`INSERT INTO users (id,name,email,password_hash,role) VALUES (${id},${name},${email},${passwordHash},${role}) RETURNING *`;
    const user = rows[0];
    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err && err.code === '23505') return res.status(409).json({ message: 'Email sudah terdaftar.' });
    console.error(err);
    res.status(500).json({ message: 'Pendaftaran gagal.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const rows = await sql`SELECT * FROM users WHERE email=${email} LIMIT 1`;
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }
    // Keep the configured admin email authoritative for existing accounts too.
    if (ADMIN_EMAIL && email === ADMIN_EMAIL && user.role !== 'admin') {
      const updated = await sql`UPDATE users SET role='admin', updated_at=NOW() WHERE id=${user.id} RETURNING *`;
      Object.assign(user, updated[0]);
    }
    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login gagal.' });
  }
});

app.get('/api/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.post('/api/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/orders', requireAuth, async (req, res) => {
  const orders = await sql`SELECT id, product_id AS "productId", product_name AS product, quantity, price, total, status, created_at AS date, updated_at AS "updatedAt"
                            FROM orders WHERE user_id=${req.user.id} ORDER BY created_at DESC`;
  res.json({ orders: orders.map(o => ({ ...o, price: Number(o.price), total: Number(o.total) })) });
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const productId = String(req.body.productId || '').trim();
    const quantity = Math.max(1, Math.min(1000, parseInt(req.body.quantity, 10) || 1));
    if (!productId) return res.status(400).json({ message: 'Produk tidak valid.' });

    const products = await sql`SELECT * FROM products WHERE id=${productId} AND active=true LIMIT 1`;
    const product = products[0];
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });

    const total = Number(product.price) * quantity;
    const orderId = 'ORD-' + cryptoRandom();
    const txId = 'TX-' + cryptoRandom();

    // Atomic balance check + deduction + order + transaction in one SQL statement.
    const rows = await sql`
      WITH updated_user AS (
        UPDATE users
        SET balance = balance - ${total}, updated_at = NOW()
        WHERE id = ${req.user.id} AND balance >= ${total}
        RETURNING *
      ), new_order AS (
        INSERT INTO orders (id,user_id,product_id,product_name,quantity,price,total)
        SELECT ${orderId}, ${req.user.id}, ${product.id}, ${product.name}, ${quantity}, ${product.price}, ${total}
        FROM updated_user
        RETURNING id, product_id AS "productId", product_name AS product, quantity, price, total, status, created_at AS date
      ), new_tx AS (
        INSERT INTO transactions (id,user_id,type,amount,description,order_id)
        SELECT ${txId}, ${req.user.id}, 'purchase', ${-total}, ${'Pembelian ' + product.name}, ${orderId}
        FROM updated_user
        RETURNING id
      )
      SELECT u.*, o.id AS order_id, o."productId", o.product, o.quantity, o.price AS order_price, o.total AS order_total, o.status AS order_status, o.date AS order_date
      FROM updated_user u
      JOIN new_order o ON TRUE
    `;

    const row = rows[0];
    if (!row) return res.status(400).json({ message: 'Saldo tidak cukup.' });
    const updatedUser = row;
    const order = {
      id: row.order_id, productId: row.productId, product: row.product, quantity: row.quantity,
      price: Number(row.order_price), total: Number(row.order_total), status: row.order_status, date: row.order_date
    };

    setAuthCookie(res, updatedUser);
    res.json({ order: { ...order, price: Number(order.price), total: Number(order.total) }, user: publicUser(updatedUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Pembelian gagal.' });
  }
});

app.post('/api/profile', requireAuth, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const newPassword = String(req.body.newPassword || '');
  if (name.length < 2) return res.status(400).json({ message: 'Nama minimal 2 karakter.' });
  let user;
  if (newPassword) {
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
    const hash = await bcrypt.hash(newPassword, 12);
    [user] = await sql`UPDATE users SET name=${name}, password_hash=${hash}, updated_at=NOW() WHERE id=${req.user.id} RETURNING *`;
  } else {
    [user] = await sql`UPDATE users SET name=${name}, updated_at=NOW() WHERE id=${req.user.id} RETURNING *`;
  }
  setAuthCookie(res, user);
  res.json({ user: publicUser(user) });
});

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  const [users, orders, revenue, pending] = await sql.transaction([
    sql`SELECT COUNT(*)::int AS count FROM users`,
    sql`SELECT COUNT(*)::int AS count FROM orders`,
    sql`SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status <> 'Dibatalkan'`,
    sql`SELECT COUNT(*)::int AS count FROM orders WHERE status='Diproses'`
  ]);
  res.json({ users: users[0].count, orders: orders[0].count, revenue: Number(revenue[0].total), pending: pending[0].count });
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const users = await sql`SELECT id,name,email,balance,role,created_at FROM users ORDER BY created_at DESC`;
  res.json({ users: users.map(publicUser) });
});

app.get('/api/admin/orders', requireAuth, requireAdmin, async (req, res) => {
  const orders = await sql`SELECT o.id, o.user_id AS "userId", u.email, o.product_name AS product, o.quantity, o.price, o.total, o.status, o.created_at AS date, o.updated_at AS "updatedAt"
                            FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 200`;
  res.json({ orders: orders.map(o => ({ ...o, price: Number(o.price), total: Number(o.total) })) });
});

app.post('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const status = String(req.body.status || '').trim();
  if (!['Diproses','Selesai','Dibatalkan'].includes(status)) return res.status(400).json({ message: 'Status tidak valid.' });
  const [order] = await sql`UPDATE orders SET status=${status}, updated_at=NOW() WHERE id=${req.params.id} RETURNING id, product_id AS "productId", product_name AS product, quantity, price, total, status, created_at AS date, updated_at AS "updatedAt"`;
  if (!order) return res.status(404).json({ message: 'Order tidak ditemukan.' });
  res.json({ order: { ...order, price: Number(order.price), total: Number(order.total) } });
});

app.post('/api/admin/topup', requireAuth, requireAdmin, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const amount = Number(req.body.amount || 0);
    if (!email || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Data top up tidak valid.' });
    const txId = 'TX-' + cryptoRandom();
    const rows = await sql`
      WITH updated_user AS (
        UPDATE users SET balance=balance+${amount}, updated_at=NOW()
        WHERE email=${email}
        RETURNING *
      ), new_tx AS (
        INSERT INTO transactions (id,user_id,type,amount,description)
        SELECT ${txId}, id, 'topup', ${amount}, ${'Top up oleh admin ' + req.user.email}
        FROM updated_user
        RETURNING id
      )
      SELECT * FROM updated_user
    `;
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Top up gagal.' });
  }
});

function cryptoRandom() {
  return require('crypto').randomBytes(10).toString('hex').toUpperCase();
}

app.get('/{*splat}', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Market Renzz aktif di port ${PORT}`));
}

module.exports = app;
