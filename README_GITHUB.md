# BoxKita — Layanan Nasi Box

Website PWA BoxKita untuk layanan nasi box dan aneka kue di Jabodetabek. Website publik, dashboard pelanggan, dashboard mitra, dan dashboard pengelola menggunakan Firebase Authentication dan Cloud Firestore.

## Isi paket
- `index.html`, `styles.css`, `app.js`: website dan dashboard responsif.
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`: instalasi PWA dan cache aset.
- `firestore.rules`: aturan akses database.
- `firestore.indexes.json`: indeks Firestore.

## Publikasikan melalui GitHub Pages
1. Unggah semua file paket ini ke root repository GitHub Pages pada branch `main`.
2. Buka **Settings → Pages**, pilih **Deploy from a branch → main → /(root)**.
3. Setelah publikasi selesai, buka website dan refresh. Jika aplikasi sudah terpasang, tutup dan buka kembali agar pembaruan termuat.

## Persiapan Firebase
1. Pada project `box-kita`, aktifkan Authentication **Email/Password** dan buat database Cloud Firestore.
2. Tambahkan domain GitHub Pages, misalnya `USERNAME.github.io`, pada Authentication → Settings → Authorized domains.
3. Publikasikan isi `firestore.rules` melalui Firestore Database → Rules.
4. Untuk admin pertama, buka situs dengan parameter `?portal=admin`, pilih pendaftaran akun pengelola, lalu salin UID yang ditampilkan.
5. Di Firestore, buat dokumen `users/{UID}` dengan `role` (string) bernilai `admin` dan `active` (boolean) bernilai `true`. Login melalui `?portal=admin`.
6. Setelah masuk, tambahkan data mitra, katalog menu, harga modal, harga jual, dan stok sebenarnya melalui dashboard pengelola.

## Akses akun
- **Pelanggan:** daftar atau login melalui menu Akun untuk melihat pesanan sendiri.
- **Mitra:** daftar melalui formulir mitra; dashboard baru aktif setelah pengajuan disetujui dan akun ditautkan.
- **Pengelola:** login melalui `?portal=admin`; dashboard hanya dibuka bila role admin dan status aktif berhasil diverifikasi.

## Operasional
- Menu katalog, pendaftaran, dan pesanan dibaca/ditulis melalui Firestore. Jika koneksi atau akses database gagal, aplikasi menampilkan pesan layanan dan tidak membuat pesanan sampai layanan kembali tersedia.
- Isi `WA_ADMIN` dan `PAYMENT_INFO` di `app.js` dengan nomor WhatsApp serta rekening resmi BoxKita sebelum mengaktifkan konfirmasi WhatsApp dan menampilkan detail pembayaran.
- Tidak menggunakan Cloud Functions. Pengelolaan pesanan dan pembayaran mitra dilakukan langsung melalui aplikasi dan Firestore Rules; verifikasi pembayaran tetap manual.
- Pantau kuota gratis Firebase. Jangan menyimpan password, private key, atau service-account key dalam repository publik.
