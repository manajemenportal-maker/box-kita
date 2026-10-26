# BoxKita V21 — GitHub Pages + Firebase Spark

## Yang berubah pada V21
- Form iklan mitra menampilkan 23 pilihan wilayah secara langsung dalam kelompok: Jakarta, Tangerang & Tangerang Selatan, Depok, Bekasi, dan Bogor.
- Mitra dapat memilih banyak area, menekan **Pilih semua wilayah**, atau **Hapus semua pilihan**.
- Pilihan tampil sebagai chip dan jumlah area terpilih selalu diperbarui.
- Form iklan mulai tanpa area terpilih; setidaknya satu area harus dicentang sebelum dikirim.
- Pilihan jamak disimpan pada field `areas` (array). Field `area` juga menyimpan area pertama agar tetap kompatibel dengan data lama.
- URL aset HTML dan cache service worker dinaikkan ke V21 untuk menghindari versi lama tersaji dari cache.
- Tidak memerlukan Firebase Storage atau Cloud Functions; gambar tetap dikompres pada browser dan disimpan di Firestore.

## Upload website ke GitHub Pages
1. Ekstrak ZIP ini.
2. Upload **semua isi folder `BoxKita_GitHub_Pages_v21`** ke root repository GitHub Pages dan timpa file lama.
3. Commit changes. Pastikan GitHub Pages menggunakan branch `main` dan folder `/(root)`.
4. Publish Rules: buka Firebase Console → project `box-kita` → Firestore Database → Rules, salin seluruh isi `firestore.rules` dari paket ini, lalu klik **Publish**.
5. Buka website lagi. Di browser desktop lakukan hard refresh. Di HP, tutup PWA sepenuhnya, buka URL situs melalui Chrome, refresh, lalu buka kembali PWA.

## Menguji pilihan area iklan
1. Login dengan akun mitra aktif yang memiliki profil usaha terhubung.
2. Buka Dashboard Mitra → **Iklan & Promosi**.
3. Pilihan area akan terlihat langsung di bawah bagian “Jangkauan iklan” — tidak perlu membuka dropdown.
4. Centang 2 area. Penghitung dan chip area terpilih harus berubah menjadi 2.
5. Coba **Pilih semua wilayah**, lalu kirim iklan menggunakan foto contoh. Iklan masuk ke status menunggu tinjauan.
6. Pengelola menyetujui dan menerbitkan iklan. Kartu iklan publik seharusnya menampilkan seluruh wilayah yang dipilih.

## Catatan
- Aturan Firestore V21 tetap membatasi pengajuan agar hanya mitra yang login dan terhubung dengan profil miliknya yang dapat mengirim iklan.
- Data publik hanya menampilkan materi promosi. Nomor KTP dan rekening tidak dimasukkan ke iklan.
- Pemeriksaan sintaks dan struktur lokal dilakukan; pengujian langsung terhadap Firebase project dan perangkat HP pengguna belum dilakukan.
