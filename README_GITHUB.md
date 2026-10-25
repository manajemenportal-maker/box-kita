# BoxKita — Layanan Nasi Box (V17)

Website PWA BoxKita untuk layanan nasi box dan aneka kue di Jabodetabek. Paket ini mencakup toko publik serta dashboard pelanggan, mitra, dan pengelola dengan Firebase Authentication dan Cloud Firestore.

## File utama
- `index.html`, `styles.css`, `app.js`: website dan dashboard responsif.
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`: instalasi PWA dan cache aset.
- `firestore.rules`: aturan akses, termasuk collection privat `adminSettings`.
- `firestore.indexes.json`: indeks Firestore.
- `AREA_PENGELOLA_V17.md`: panduan fungsi Area Pengelola.

## Pasang ke GitHub Pages
1. Unggah seluruh isi folder paket ini ke root repo GitHub Pages pada branch `main`.
2. Settings → Pages → Deploy from a branch → `main` → `/(root)`.
3. Setelah publish, lakukan hard refresh. Tutup dan buka ulang PWA agar cache versi baru termuat.

## Agar menu Area Pengelola dapat dipakai
1. Pada project Firebase `box-kita`, buka Firestore Database → Rules.
2. Ganti rules dengan isi file `firestore.rules` dari paket ini dan klik **Publish**. Rules V17 menambahkan akses admin-only ke `adminSettings/{document}`.
3. Login dengan akun yang memiliki dokumen `users/{UID}` dengan `role` string `admin` dan `active` boolean `true`.
4. Di sidebar dashboard, klik **Area Pengelola**.
5. Isi nama layanan, WhatsApp dengan format kode negara `62`, email layanan bila ada, serta rincian rekening jika siap digunakan. Klik **Simpan Pengaturan**.

## Data settings dan privasi
- Kontak aman untuk publik: `publicSettings/contact` (nama layanan, WhatsApp, email layanan).
- Rincian pembayaran privat: `adminSettings/operations` (nama bank, nama pemilik rekening, nomor rekening, instruksi pembayaran). Hanya admin aktif dapat membaca/menulis.
- Jangan menyimpan detail rekening, password, private key, atau service-account key di repository publik.

## Menu dashboard pengelola
- **Ringkasan:** jumlah dan nilai pesanan, omzet terbayar, margin kotor, pekerjaan prioritas.
- **Pesanan:** konfirmasi ketersediaan, tanggal, status pesanan dan pembayaran pelanggan.
- **Menu & Harga:** stok, pemasok, harga modal, harga jual, dan foto melalui URL HTTPS.
- **Mitra & Pendaftar:** meninjau pendaftaran, mengaktifkan/menonaktifkan mitra, dan mengelola data usaha.
- **Pembayaran Mitra:** mencatat pembayaran pemasok untuk pesanan yang memenuhi syarat.
- **Analitik & Laporan:** tren omzet, menu terlaris, performa mitra, dan ekspor CSV.
- **Area Pengelola:** pengaturan kontak, referensi pembayaran privat, status akun, daftar wilayah, dan pintasan ke menu operasional.

## Keamanan dan paket gratis
- Area Pengelola hanya tersedia setelah role `admin` dan status aktif diverifikasi oleh Firebase.
- Tidak menggunakan Cloud Functions. Pembayaran tetap manual dan harus diverifikasi sebelum status dinyatakan lunas.
- Pantau kuota gratis Firebase. Firebase Web config bersifat publik pada aplikasi client; keamanan utama berada di Firestore Rules.
