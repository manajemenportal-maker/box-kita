# Area Pengelola V17

Pada versi sebelumnya, tulisan “Area Pengelola Aktif” hanyalah kartu status, bukan menu. Karena itu terasa seperti area yang terkunci. V17 mengubahnya menjadi tombol navigasi sungguhan di sidebar bernama **Area Pengelola**.

## Fungsi menu Area Pengelola
- Mengatur nama layanan BoxKita.
- Mengatur WhatsApp pengelola dan email layanan yang aman ditampilkan ke publik.
- Menyimpan rincian rekening dan instruksi pembayaran sebagai data privat admin.
- Memeriksa email, UID, dan status admin aktif.
- Melihat wilayah yang tersedia serta berpindah cepat ke Ringkasan, Pesanan, Menu & Harga, Mitra & Pendaftar, Pembayaran Mitra, dan Analitik & Laporan.

## Penting
1. Login menggunakan akun yang memiliki dokumen `users/{UID}` dengan `role: admin` (string) dan `active: true` (boolean).
2. Ganti/publikasikan `firestore.rules` dari paket V17 ke Firebase Console → Firestore Database → Rules. Rule baru mengizinkan baca/tulis `adminSettings/operations` hanya untuk admin aktif.
3. Kontak umum tersimpan di `publicSettings/contact` dan dapat dibaca publik. **Jangan simpan nomor rekening di collection `publicSettings`.**
4. Rekening dan instruksi pembayaran tersimpan di `adminSettings/operations`, yang hanya dapat dibaca/ditulis admin aktif. Detail ini tidak otomatis ditampilkan pada checkout publik.
5. Setelah publish rules, buka menu Area Pengelola dan klik Simpan Pengaturan. Jika rules belum diperbarui, halaman akan memberi arahan yang jelas dan tidak menyimpan sebagian data.
