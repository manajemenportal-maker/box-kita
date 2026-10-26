# BoxKita V23 — Layanan Nasi Box

Website PWA BoxKita untuk pelanggan dan mitra kuliner, dengan dashboard administrasi berbasis Firebase.

## Perubahan V23
- Navigasi utama diringkas. Menu **Jumat Barokah** dan **Aneka Kue** tidak lagi ditampilkan pada menu atas; keduanya tetap tersedia sebagai bagian khusus dan kategori katalog.
- Teks utama, menu navigasi, form, tombol, kartu produk, footer, serta kontrol dashboard diperbesar agar lebih nyaman dibaca.
- Navigasi mobile dibuat lebih mudah disentuh; pada layar sangat kecil katalog produk memakai satu kolom agar judul dan deskripsi lebih mudah dibaca.
- Versi aset dan cache PWA diperbarui ke V23.

## Upload ke GitHub Pages
1. Ekstrak ZIP ini.
2. Upload semua isi folder `BoxKita_GitHub_Pages_v23` ke root repository GitHub, timpa file versi sebelumnya.
3. Commit changes dan pastikan Pages menggunakan branch `main` dan folder `/(root)`.
4. Pada HP, tutup PWA sepenuhnya, buka website lewat Chrome dan refresh. Jika masih terlihat versi lama, hapus data/cache situs lalu buka ulang PWA.

## Firebase
Konfigurasi Firebase berada pada `app.js`. Aturan akses berada di `firestore.rules`. Jika Rules perlu diperbarui, publikasikan melalui Firebase Console → Firestore Database → Rules. Jangan memasukkan password atau service-account private key ke repository publik.

## Catatan
V23 mengubah tampilan dan navigasi; ia tidak mengubah koleksi atau data pesanan yang sudah tersimpan di Firebase. Login, katalog, iklan, dan transaksi tetap bergantung pada konfigurasi Firebase yang sudah valid.
