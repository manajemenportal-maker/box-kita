# BoxKita Marketplace — Paket Firebase Spark (Gratis)

Paket ini disiapkan untuk Firebase Spark tanpa Cloud Functions dan tanpa Firebase Storage upload. Firebase web configuration ada di `public/app.js`; file aturan database berada di `firestore.rules`.

## Fitur dalam versi Spark
- Katalog publik membaca dokumen aktif dari `catalog`.
- Formulir mitra membuat dokumen `partnerApplications` yang hanya dapat ditinjau admin.
- Checkout menyimpan permintaan pesanan publik yang hanya berisi data pelanggan, ID menu, dan jumlah. Pengunjung tidak dapat menulis harga modal, margin, status pembayaran, atau stok.
- Admin memeriksa permintaan. Saat admin mengubah status menjadi **Dikonfirmasi**, browser admin menjalankan transaksi Firestore yang memvalidasi menu/mitra, mengunci harga jual dan harga modal ke snapshot pesanan, serta mengurangi stok secara atomik.
- Pembayaran pelanggan diverifikasi manual. Pembayaran mitra dicatat oleh akun admin melalui transaksi Firestore untuk mencegah pesanan yang sama dihitung dua kali.
- Firebase Storage tidak digunakan/dideploy; gunakan URL gambar HTTPS publik di kolom foto menu. Aturan deny-all disediakan sebagai file referensi bila project sudah memiliki Storage.
- Cloud Functions tidak digunakan dalam paket ini.

## Yang gratis dan batasannya
Firestore Rules sendiri tidak dikenai biaya terpisah. Pada paket Spark, Firestore masih memiliki kuota gratis; cek quota resmi terkini sebelum operasional. Paket Spark tidak menyediakan akses ke Cloud Functions, sehingga alur ini telah dipindahkan ke transaksi Firestore dari aplikasi admin.

Karena tidak ada server berbayar, pesanan baru adalah **permintaan yang belum disahkan** sampai admin menekan Konfirmasi. Pastikan admin memeriksa jumlah, harga aktual, ketersediaan, dan area antar. Pesanan palsu/spam masih mungkin dibuat oleh pengunjung sehingga pantau daftar pesanan dan kuota. Jangan menandai pembayaran sudah diterima sebelum mengecek mutasi bank.

## Instalasi
1. Unduh dan ekstrak ZIP.
2. Pasang Node.js dan Firebase CLI pada komputer: `npm install -g firebase-tools`.
3. Masuk: `firebase login`.
4. Dari folder `BoxKita_Operasional`, pastikan proyek `box-kita` memang proyek Anda, lalu jalankan `firebase use default`.
5. Di Firebase Console project `box-kita`, aktifkan **Authentication > Email/Password** dan buat database **Cloud Firestore (Native mode)**. Gunakan database default `(default)` agar free-tier Firestore dapat diterapkan.
6. Buat akun admin melalui Authentication > Users. Salin UID akun tersebut.
7. Di Firestore Console, buat dokumen `users/{UID}` dengan field:
   - `role` (string) = `admin`
   - `active` (boolean) = `true`
   Dokumen admin pertama perlu dibuat dari Console karena tidak ada admin yang dapat memberi dirinya sendiri hak admin.
8. Deploy hanya Firestore rules, indeks, dan Hosting:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,hosting
   ```

   Jika belum ingin mengubah hosting yang sedang live, deploy hanya rules:

   ```bash
   firebase deploy --only firestore:rules
   ```

9. Untuk katalog pertama, masuk memakai akun admin, lalu buat mitra aktif dan menu. Pastikan dokumen internal `products/{productId}` dan katalog publik `catalog/{productId}` dibuat bersama melalui dashboard.

## Catatan penting
- Jangan mengubah `allow read, write: if true` untuk memecahkan error; aturan seperti itu membuat data admin terbuka.
- Jangan memasukkan `costPrice`, detail rekening mitra, atau margin ke koleksi `catalog` / `partnerDirectory`.
- `orders` dapat dibaca/diubah hanya oleh admin. Pengunjung hanya boleh membuat permintaan order yang dibatasi rules.
- Admin harus selalu mengonfirmasi harga, kapasitas, jadwal, ongkir, dan pembayaran secara manual.
- PWA cache: setelah deploy, lakukan hard refresh (Ctrl+Shift+R) bila browser masih menampilkan versi sebelumnya.
- Jangan mengaktifkan Cloud Functions atau upload Storage bila memang ingin tetap menggunakan Spark tanpa billing.
