# Jika menu atau iklan mitra tidak muncul

1. Pastikan akun sudah aktif: Firestore `users/{UID}` mempunyai `role` = string `partner`, `active` = boolean `true`, dan `partnerId`.
2. Buka `partners/{partnerId}` dan pastikan ada field `uid` = UID pemilik akun. Jangan menaruh NIK/rekening di `catalog` atau `partnerDirectory`.
3. Publish `firestore.rules` versi V19. Jangan hanya upload Rules ke GitHub; Rules harus ditempel ke Firebase Console dan di-Publish.
4. Dashboard Mitra → Menu & Foto akan menampilkan menu yang sudah terbit serta seluruh pengajuan menu milik mitra. Iklan & Promosi menampilkan iklan yang disetujui dan riwayat pengajuan.
5. Pengajuan baru berstatus menunggu. Menu baru tidak masuk katalog publik sebelum admin menyetujui dan menetapkan harga jual. Iklan tidak tampil ke publik sebelum admin menyetujui dan menerbitkan.
6. Bila suatu query tidak diizinkan, versi V19 tetap menampilkan formulir dan kotak peringatan yang menyebut bagian yang gagal dimuat, agar menu lain tidak ikut kosong. Tekan Muat ulang data setelah Rules diperbarui.
7. Upload foto dibatasi 3 file, masing-masing 12 MB sebelum kompresi. Data gambar hasil kompresi disimpan di Firestore; jangan upload puluhan foto beresolusi tinggi karena menghabiskan kuota Spark.
