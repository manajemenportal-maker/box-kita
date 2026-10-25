# Aktivasi Admin BoxKita (Firebase Spark / tanpa Cloud Functions)

1. Upload semua file paket GitHub Pages ke repository dan deploy website.
2. Di Firebase Console project `box-kita`, aktifkan Authentication → Sign-in method → Email/Password.
3. Tambahkan domain GitHub Pages ke Authentication → Settings → Authorized domains.
4. Buka website, tekan Pengelola → Daftar akun pengelola pertama. Masukkan email dan password pilihanmu. Form akan membuat akun Authentication dan menampilkan UID.
5. Di Firebase Console → Firestore Database → Data, buat collection `users` jika belum ada. Buat dokumen dengan Document ID persis sama dengan UID di halaman website.
6. Tambahkan field `role` bertipe string bernilai `admin` dan field `active` bertipe boolean bernilai `true`.
7. Kembali ke website, lalu login dengan email/password yang baru dibuat. Dashboard tetap tertutup sebelum dokumen role admin tersimpan.

## Kenapa butuh langkah manual?
GitHub Pages adalah frontend publik, sehingga tidak aman mengizinkan pendaftaran publik memberikan `role: admin` pada akun sendiri. Paket gratis ini tidak menggunakan backend admin berbayar. Pemilik project harus menetapkan role pertama melalui Firebase Console. Jangan unggah password atau service-account JSON ke GitHub.

## Area
Setiap area dipilih sendiri-sendiri pada checkout, pendaftaran mitra, dan formulir menu/mitra: Jakarta, Jakarta Pusat/Utara/Barat/Selatan/Timur, Kepulauan Seribu, Tangerang, Kota Tangerang, Kabupaten Tangerang, Tangerang Selatan, Serpong, BSD City, Ciputat, Pamulang, Pondok Aren, Depok, Bekasi, Kota Bekasi, Kabupaten Bekasi, Bogor, Kota Bogor, dan Kabupaten Bogor.
