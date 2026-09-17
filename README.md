# Market Renzz — Vercel + Neon

Versi ini tidak lagi menyimpan users/orders di JSON lokal. Data akun, saldo, produk, pesanan, dan transaksi disimpan di PostgreSQL (Neon), sehingga cocok untuk deployment serverless seperti Vercel.

## Deploy

1. Push folder ini ke GitHub.
2. Import repository ke Vercel.
3. Hubungkan project Vercel ke Neon/Postgres atau masukkan `DATABASE_URL` dari Neon.
4. Tambahkan Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
5. Deploy.

Database akan membuat tabel otomatis saat request pertama.

## Database

Tables:
- `users`
- `products`
- `orders`
- `transactions`

## Lokal

```bash
npm install
npm start
```

## Catatan

- Jangan commit `.env` atau token/secret.
- Harga produk divalidasi dari database server, bukan dari browser.
- Login memakai HttpOnly cookie JWT sehingga tidak bergantung pada MemoryStore Express.
- Untuk production, gunakan secret JWT yang panjang dan acak.
