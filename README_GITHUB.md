# BoxKita — pemasangan melalui GitHub Pages (gratis)

## Isi yang diunggah ke GitHub
Unggah semua file di folder ini langsung ke **root** repository GitHub: `index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js`, ikon PNG, serta `firestore.rules` dan file referensi rules. Jangan mengunggah ZIP-nya sebagai satu file dan berharap website otomatis berjalan.

## A. Publikasikan website
1. Buat repository baru di GitHub. Untuk GitHub Free, paling mudah gunakan repository **Public**. Contoh nama: `boxkita`.
2. Pilih **Add file → Upload files**, lalu unggah isi folder ini. Klik **Commit changes**.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/(root)`, lalu klik **Save**.
6. Setelah deployment selesai, buka alamat yang ditampilkan di halaman Pages, biasanya `https://USERNAME.github.io/boxkita/`.

## B. Pasang Firestore Rules (langkah terpisah dari GitHub Pages)
1. Buka Firebase Console dan pilih project `box-kita`.
2. Masuk ke **Build → Firestore Database → Rules**.
3. Buka `firestore.rules` di repository ini, salin seluruh isinya ke editor Rules Firebase, lalu klik **Publish**.
4. File rules di GitHub hanya salinan/version control. Mengunggahnya ke GitHub tidak otomatis menerapkan rules ke Firebase.

## C. Daftarkan akun pengelola pertama
1. Di Firebase Console, aktifkan **Authentication → Sign-in method → Email/Password**.
2. Tambahkan domain GitHub Pages ke **Authentication → Settings → Authorized domains**. Untuk `https://USERNAME.github.io/boxkita/`, masukkan `USERNAME.github.io` tanpa `https://` dan tanpa path.
3. Setelah website online, tekan **Pengelola → Daftar akun pengelola pertama**. Masukkan email yang kamu kuasai dan password minimal 8 karakter. Form ini membuat akun Firebase Authentication dan menampilkan UID.
4. Salin UID yang ditampilkan. Pada Firebase Console → Firestore Database → Data, buat collection `users` (jika belum ada) dan dokumen dengan Document ID persis sama dengan UID tersebut.
5. Di dokumen itu buat field `role` bertipe **string** bernilai `admin`, serta field `active` bertipe **boolean** bernilai `true`.
6. Kembali ke website dan login dengan email/password yang baru didaftarkan. Dashboard hanya terbuka setelah dokumen role tersebut ada.
7. Karena repository GitHub Pages adalah publik, jangan membuat aturan yang membolehkan siapa pun memberi `role: admin` ke akun sendiri.

> Penting: halaman web dapat membuat akun Firebase Authentication, tetapi tidak bisa secara aman memberi role admin sendiri. Langkah dokumen `users/{UID}` harus dikerjakan pemilik project dari Firebase Console. Jangan menaruh service-account key atau password admin di GitHub.

## D. Tentang paket gratis
- GitHub Pages menyajikan file website statis. Firebase Authentication dan Firestore tetap berjalan di project Firebase terpisah.
- Paket ini tidak memerlukan Cloud Functions atau upload Firebase Storage.
- `storage.rules` hanya file referensi; website ini tidak mengunggah gambar ke Firebase Storage. Gunakan URL gambar HTTPS.
- Jangan memasukkan password, private key, service-account JSON, token akses, atau data rahasia ke repository.
- Firebase Web API key berada di kode frontend dan bukan password. Keamanan data harus ditegakkan dengan Firestore Security Rules, Firebase Authentication, dan pembatasan API key yang sesuai.
- Checkout yang dipublikasikan akan membuat permintaan pesanan di Firebase, bukan sekadar simulasi browser. Pastikan rules dan akun admin sudah benar sebelum dipakai pelanggan nyata. Pesanan harus diperiksa sebelum dikonfirmasi; pembayaran pelanggan diverifikasi manual.

## E. Pilihan area layanan
Semua wilayah memiliki opsi masing-masing, bukan satu opsi gabungan: Jakarta dan bagian-bagiannya, Tangerang/Kota Tangerang/Kabupaten Tangerang, Tangerang Selatan, Serpong, BSD City, Ciputat, Pamulang, Pondok Aren, Depok, Bekasi/Kota Bekasi/Kabupaten Bekasi, serta Bogor/Kota Bogor/Kabupaten Bogor. Untuk satu pesanan, satu menu, atau satu mitra, pilih area utama pada dropdown.

## F. Jika website masih menampilkan versi lama
Lakukan hard refresh (`Ctrl + Shift + R`). PWA/service worker dapat menahan cache; tutup aplikasi terpasang lalu buka URL website lagi. Jika perlu, hapus data situs/service worker untuk domain GitHub Pages melalui pengaturan browser.
