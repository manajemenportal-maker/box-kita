# Panduan akun BoxKita V12

### Mengaktifkan admin pertama
1. Buka website dengan `?portal=admin` di akhir URL, misalnya `https://USERNAME.github.io/boxkita/?portal=admin`.
2. Pilih **Daftar akun pengelola pertama**, buat akun Firebase Auth, lalu salin UID.
3. Di Firebase Console → Firestore Database → Data, buat collection `users` jika belum ada, dokumen ID = UID tadi.
4. Buat `role` (string) = `admin` dan `active` (boolean) = `true`.
5. Kembali ke URL admin dan login. Tombol Dashboard Pengelola tidak muncul di halaman publik sebelum akun terverifikasi aktif.

### Menu pengelola tidak tampil di publik
- Navigasi pengunjung hanya berisi menu toko dan **Akun / Login**. Tombol Dashboard Pengelola tersembunyi pada pengunjung, pelanggan, dan mitra.
- Login admin dibuka melalui URL pemilik `?portal=admin` atau `#pengelola`. Setelah login, aplikasi membaca `users/{UID}`. Dashboard hanya dibuka jika `role: "admin"` dan `active: true`. URL rahasia saja tidak memberikan hak akses; Firestore Rules tetap membatasi data.

### Pelanggan
1. Klik **Akun / Login** → **Daftar pelanggan**.
2. Akun tersimpan dengan `role: customer`, `active: true`.
3. Saat login dan membuat pesanan, pesanan memiliki customerUid dan terlihat di Dashboard Pelanggan.

### Dashboard mitra dan batas datanya
- Mitra aktif mendapat dashboard PWA sendiri: ringkasan usaha, pesanan yang ditugaskan, menu yang terhubung, profil usaha, dan total pembayaran yang tercatat.
- Mitra hanya membaca dokumen `/partnerOrderViews/{partnerId}/orders` dan katalog publik; dokumen `/products` yang berisi harga modal dan margin hanya untuk admin.

### Mitra
1. Klik **Akun / Login** → **Daftar mitra**, isi data usaha serta email/password.
2. Akun menjadi `role: partner_pending`, `active: false`, dan pengajuan dikirim ke admin.
3. Admin membuka **Mitra & Pendaftar**, lalu menyetujui. Aplikasi menautkan `users/{UID}` ke `partners/{partnerId}` dengan role `partner`, active true.
4. Mitra kemudian login dan dapat melihat menu serta pesanan yang telah ditugaskan setelah admin mengonfirmasi pesanan.

Jangan mengubah role melalui kode frontend atau memberikan hak admin kepada pendaftar umum.

### Salinan pesanan terpisah
- `/orders/{orderId}` menyimpan data operasional lengkap dan hanya dapat dibaca pengelola aktif.
- `/customerOrderViews/{UID}/orders/{orderId}` hanya boleh dibaca pelanggan pemilik akun dan pengelola aktif.
- `/partnerOrderViews/{partnerId}/orders/{orderId}` hanya boleh dibaca mitra pemilik dan pengelola aktif.
- Pesanan yang dibuat tanpa login tetap bisa diterima pengelola tetapi tidak otomatis muncul pada Dashboard Pelanggan.
