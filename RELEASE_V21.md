# BoxKita V21 — Pilihan Area Iklan Multi-Area

- Daftar wilayah iklan sekarang tampil langsung di halaman, tidak tersembunyi di dropdown/details.
- Wilayah dikelompokkan menjadi Jakarta, Tangerang & Tangerang Selatan, Depok, Bekasi, dan Bogor.
- Mitra dapat mencentang beberapa area atau menggunakan tombol Pilih semua wilayah; area yang dipilih tampil sebagai chips dan penghitung jumlah.
- Form iklan dimulai tanpa pilihan bawaan agar mitra memilih target secara sadar. Minimal satu wilayah wajib dipilih.
- Data tetap dikirim dalam field `areas` berbentuk array dan `area` berisi area pertama untuk kompatibilitas. Firestore Rules V20 sudah mendukung bentuk data tersebut; file rules disertakan sebagai `firestore.rules`.
- Cache-busting HTML diganti ke V21 dan service worker menggunakan cache baru agar versi yang lama tidak menghalangi tampilan.

## Pemasangan
1. Upload seluruh isi folder ini ke root repository GitHub Pages, menimpa semua file lama.
2. Publish `firestore.rules` pada Firebase Console > Firestore Database > Rules.
3. Buka website pada browser, hard refresh, lalu tutup dan buka ulang PWA.
4. Login sebagai mitra, buka Iklan & Promosi, centang minimal dua wilayah, dan pastikan penghitung serta chips berubah.

Pengujian dengan project Firebase live belum dilakukan.
