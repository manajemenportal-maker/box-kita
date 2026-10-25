# Aktivasi Pengelola BoxKita V12

1. Publikasikan semua file V12 ke GitHub Pages dan aktifkan Firebase Authentication Email/Password.
2. Buka URL situs dengan `?portal=admin` di akhir alamat (misalnya `https://USERNAME.github.io/boxkita/?portal=admin`). Tombol pengelola tidak ditampilkan kepada pengunjung umum.
3. Pilih **Daftar akun pengelola pertama**, buat email/password dan salin UID.
4. Di Firebase Console → Firestore Database → Data, buat collection `users` dan dokumen dengan Document ID persis UID tadi.
5. Tambahkan field `role` bertipe string bernilai `admin` dan field `active` bertipe boolean bernilai `true`.
6. Kembali ke `?portal=admin` dan login. Dashboard Pengelola baru muncul sesudah aplikasi membaca role admin aktif.

Penting: hanya pemilik Firebase Console yang boleh memberi role admin. Jangan membuat form publik yang bisa mengubah role sendiri. Gunakan file `firestore.rules` dari versi yang sama.
