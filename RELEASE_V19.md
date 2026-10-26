# BoxKita V19 — Perbaikan dashboard mitra

- Menu Saya menampilkan produk katalog milik mitra dan riwayat pengajuan menu.
- Iklan & Promosi membaca promosi mitra langsung dari Firestore, termasuk status jeda, serta riwayat pengajuan iklan.
- Pembacaan katalog, pesanan, profil, pembayaran, pengajuan, dan promosi diisolasi agar satu kegagalan izin tidak mengosongkan seluruh dashboard.
- Notifikasi diagnosis ditampilkan jika Firestore menolak pembacaan; admin juga melihat peringatan jika daftar pengajuan tidak dapat dimuat.
- Perbaikan pemulihan relasi akun mitra lama yang bisa ditautkan berdasarkan UID pemilik profil.
- Upload foto mempunyai fallback pemrosesan untuk browser yang tidak mendukung `createImageBitmap`.
- Cache PWA memakai nama dan URL aset V19.
