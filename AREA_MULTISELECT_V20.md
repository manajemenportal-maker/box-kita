# BoxKita V20 — Multi-area untuk Iklan Mitra

Perubahan utama:
- Iklan mitra memiliki checklist multi-area, tombol Pilih semua wilayah dan Hapus pilihan.
- Minimal satu area harus dipilih; maksimal seluruh 23 area Jabodetabek.
- Array `areas` disimpan bersama field `area` (area pertama) untuk kompatibilitas dengan dokumen lama.
- Halaman publik, dashboard mitra, serta panel persetujuan admin menampilkan seluruh area iklan.
- Firestore Rules membatasi array ke 1–23 area yang valid. Pengajuan menu biasa tetap menggunakan satu area.

Pasang semua file website ke root GitHub Pages, lalu terbitkan `firestore.rules` ke Firestore Rules. Service worker cache menggunakan versi V20.
