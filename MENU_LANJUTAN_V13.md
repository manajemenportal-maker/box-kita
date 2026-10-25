# Menu Lanjutan BoxKita V13

1. **Analitik & Laporan** — omzet, margin kotor, box terjual, nilai pesanan rata-rata.
2. **Tren omzet 7 hari** — visualisasi sederhana tanpa library chart eksternal.
3. **Pusat perhatian operasional** — pesanan baru, pembayaran belum selesai, pendaftar mitra, dan menu stok tipis; tiap tombol membuka bagian yang terkait.
4. **Menu terlaris** — ranking dari rincian pesanan yang sudah dibayar.
5. **Performa mitra** — kuantitas, nilai penjualan dan margin kotor dari data pesanan yang telah dibayar.
6. **Area terbaik** — ranking area menurut penjualan terbayar.
7. **Ekspor CSV** — pesanan, katalog menu, data mitra, dan riwayat pembayaran.

Indikator “Area Pengelola Aktif” tidak membuka akses umum. Akses dashboard tetap mensyaratkan profil Firebase `users/{UID}` dengan `role: "admin"` dan `active: true`.
