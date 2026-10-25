# BoxKita V12 — GitHub Pages + Firebase Spark

## Perubahan V12
- Navigasi publik tidak menampilkan tombol Pengelola. Login admin hanya melalui URL khusus `?portal=admin` atau `#pengelola`.
- Tombol Dashboard Pengelola baru ditampilkan setelah Firebase mengonfirmasi profil `users/{UID}` dengan `role: "admin"` dan `active: true`.
- Dashboard terpisah untuk pelanggan, mitra aktif, dan mitra menunggu persetujuan.
- Pelanggan bisa daftar/login dan melihat pesanan yang dibuat saat login. Pesanan tetap bisa dibuat sebagai tamu; pesanan tamu tidak masuk dashboard akun. Harga dan rincian pesanan pelanggan dibaca dari salinan terpisah milik akun tersebut.
- Mitra bisa daftar/login; akun berstatus menunggu hingga admin menyetujui pendaftaran. Saat disetujui, akun dikaitkan ke dokumen mitra dan mendapat akses menu/pesanan yang ditugaskan. Mitra tidak dapat membaca data biaya modal/margin pengelola atau pesanan milik mitra lain.
- Firestore Rules membatasi profil, pesanan pelanggan, data mitra, dan pembayaran sesuai role. Dokumen `/orders` lengkap (biaya modal dan margin) hanya dapat dibaca pengelola aktif; pelanggan membaca `/customerOrderViews/{UID}/orders`, mitra membaca `/partnerOrderViews/{partnerId}/orders` yang sudah disanitasi.
- Dashboard PWA responsif terpisah: pelanggan (riwayat pesanan/favorit/profil), mitra (pesanan yang ditugaskan/menu usaha/profil/pembayaran tercatat), serta pengelola aktif (operasional lengkap).
- Menu Dashboard Pengelola tidak tampil untuk pelanggan/pengunjung/mitra; akses admin melalui `?portal=admin` atau `#pengelola`, dan dashboard tetap menolak role non-admin atau akun tidak aktif.
- PWA cache naik ke V12.

## Deploy gratis
1. Unggah semua file di folder ini langsung ke root repository GitHub Pages branch `main`.
2. Pada GitHub: Settings → Pages → Deploy from a branch → `main` → `/(root)`.
3. Di Firebase Console project `box-kita`, buka Build → Firestore Database → Rules. Salin isi `firestore.rules` dari repository ini lalu Publish.
4. Aktifkan Authentication → Sign-in method → Email/Password.
5. Authentication → Settings → Authorized domains: tambahkan `USERNAME.github.io`.
6. Buat akun admin awal dari URL website dengan menambahkan `?portal=admin`, klik daftar akun pengelola pertama, lalu salin UID.
7. Di Firestore → Data, buat collection `users` dan dokumen dengan ID sama persis dengan UID. Fields: `role` string `admin`; `active` boolean `true`; email opsional. **Jangan pernah mengizinkan pendaftaran publik untuk role admin.**
8. Login kembali lewat `?portal=admin`. Hanya jika role admin dan active true, dashboard admin ditampilkan.

## Akses pelanggan dan mitra
- Klik **Akun / Login** untuk masuk atau mendaftar pelanggan/mitra.
- Pelanggan: daftar akun → role customer dan active true dibuat oleh aplikasi → order yang dibuat saat login disimpan dengan customerUid.
- Mitra: daftar akun mitra → dibuat role partner_pending dan pengajuan. Admin harus menyetujui pendaftaran di dashboard admin; proses persetujuan menghubungkan user profile dengan partnerId dan mengaktifkan role partner.
- Untuk aplikasi mitra yang dibuat lewat formulir publik lama tanpa akun, akun tidak terhubung otomatis; gunakan pendaftaran mitra dari menu Akun untuk alur dashboard.

## Penting
- GitHub Pages hanya hosting statis; rules harus dipublish ke Firebase Console secara terpisah.
- Tidak memakai Cloud Functions atau Firebase Storage. Foto menggunakan URL HTTPS.
- Checkout tamu masih diizinkan, tetapi pelanggan harus login saat memesan agar pesanan masuk Dashboard Pelanggan.
- Mitra hanya dapat membaca pesanan setelah pesanan dikonfirmasi admin dan `assignedPartnerIds` ditulis oleh dashboard. Mitra tidak dapat mengubah status pesanan, harga, stok, atau pembayaran lewat client.
- Firebase web config berada di frontend; keamanan datang dari Firestore Rules. Jangan commit service-account key, private key, password admin, atau token rahasia.
- Setelah deploy, hard refresh (`Ctrl + Shift + R`) dan tutup-buka PWA agar cache baru dimuat.
