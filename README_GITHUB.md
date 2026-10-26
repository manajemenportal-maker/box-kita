# BoxKita — Layanan Nasi Box (V19)

Paket ini memperbaiki dashboard mitra agar daftar menu/iklan, riwayat pengajuan, unggah foto, serta profil transaksi tidak hilang hanya karena salah satu query Firestore ditolak. Jika akses diblokir, dashboard menampilkan notifikasi yang dapat ditindaklanjuti. Ada juga perbaikan tautan akun mitra lama berdasarkan UID—hanya ke dokumen usaha yang memuat UID milik akun tersebut.

## Isi paket
- `index.html`, `styles.css`, `app.js`: situs dan dashboard responsif.
- `manifest.json`, `sw.js`, ikon: PWA.
- `firestore.rules`: aturan akses versi V19.
- `firestore.indexes.json`: indeks Firestore.
- `PRIVASI_DATA_MITRA_V19.md`: ringkasan privasi data mitra.
- `DIAGNOSA_DASHBOARD_MITRA_V19.md`: cek cepat bila daftar belum muncul.

## Pasang ke GitHub Pages
1. Ekstrak ZIP dan upload semua isi folder ini ke root repository (jangan unggah ZIP saja).
2. Commit perubahan; pastikan GitHub Pages menggunakan branch `main` dan folder `/(root)`.
3. Buka Firebase Console project `box-kita` → Firestore Database → Rules. Tempel seluruh `firestore.rules` V19 dan klik Publish.
4. Pastikan Email/Password Authentication aktif.
5. Untuk akun mitra aktif, dokumen `users/{UID}` harus memiliki `role: "partner"`, `active: true`, dan `partnerId` yang sama dengan ID dokumen `partners/{partnerId}`. Dokumen `partners/{partnerId}` harus memiliki field `uid` yang sama dengan UID akun. Jika `partnerId` terlewat tapi field `uid` pada dokumen mitra benar, dashboard dapat menautkannya secara terbatas sesuai Rules V19.
6. Setelah deploy, pada HP tutup PWA sepenuhnya, buka ulang, dan jika perlu hapus cache/data situs lalu install ulang.

## Menu dan iklan mitra
- Mitra aktif membuka Dashboard Mitra → Menu & Foto atau Iklan & Promosi.
- Pilih maksimal 3 foto JPG/PNG/WebP (tiap file sumber maksimal 12 MB). Aplikasi mengompres di browser dengan target sekitar 82 KB per foto sebelum disimpan di Firestore.
- Pengajuan tampil di riwayat status. Pengelola menyetujui menu sambil menentukan harga jual, atau menyetujui dan menerbitkan iklan.
- Foto disimpan sebagai data gambar dalam Firestore; ini menghindari Firebase Storage, tetapi menggunakan kuota penyimpanan/pembacaan gratis. Sesuai untuk uji awal dengan volume terbatas.

## Profil transaksi mitra
Form memerlukan nama legal, NIK 16 digit, alamat KTP, alamat domisili, alamat usaha, nomor WhatsApp, nama bank, nama pemilik rekening, dan nomor rekening. NPWP dan cabang bank opsional. Data identitas/rekening tetap di dokumen privat `partners/{partnerId}`, hanya untuk mitra pemilik dan admin aktif; tidak diletakkan dalam katalog publik. Jangan meminta mitra mengirim KTP/rekening melalui pesan publik.

## Diagnosa cepat
Jika dashboard masih kosong, lihat kotak peringatan di atas tab mitra. Pastikan Rules V19 dipublikasikan, akun berstatus mitra aktif, `partnerId` cocok, dan `partners/{partnerId}.uid` sama dengan UID pengguna. Buka browser console untuk kode `permission-denied` jika perlu.

Paket ini ditujukan untuk Firebase Spark: tanpa Firebase Storage dan Cloud Functions. Transaksi serta pembayaran tetap perlu diuji dan diverifikasi oleh pengelola sebelum digunakan untuk transaksi nyata.
