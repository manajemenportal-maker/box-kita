# BoxKita V14 — Perbaikan Navigasi PWA

## Yang diubah
- Header responsif memiliki tinggi konsisten pada desktop/tablet/HP.
- Pada tablet dan HP, menu berubah menjadi dropdown yang tidak menambah tinggi header atau menindih alur dokumen secara tidak terduga.
- Tautan desktop dan mobile sekarang menunjuk ke bagian halaman yang sama dan diurutkan sesuai urutan bagian: Jumat Barokah, Aneka Kue, Menu, Cara Pesan, Mitra Kuliner, Jadi Mitra.
- Tautan bagian aktif diberi penanda saat pengguna menggulir.
- Klik navigasi menutup dropdown terlebih dahulu, kemudian menggulir dengan offset header sehingga judul bagian tidak tertutup header lengket.
- Tombol akun dan instalasi dipindahkan ke panel mobile agar header HP tidak berdesakan. Keranjang tetap terlihat; pada layar sangat sempit label disingkat.
- Menambahkan dukungan Escape, klik di luar menu, atribut ARIA, dan hormat pada `prefers-reduced-motion`.
- Menghapus penutup `</main>` berlebih yang berada sesudah footer.
- Versi cache PWA dinaikkan ke V14.

## Cara deploy
1. Ekstrak ZIP V14.
2. Upload semua file ke root repository GitHub Pages, timpa versi lama, lalu commit.
3. Pastikan GitHub Pages masih memakai branch `main` dan folder root.
4. Di HP, tutup aplikasi PWA sepenuhnya lalu buka ulang. Bila masih tampak versi lama, buka website di Chrome dan lakukan refresh; bila perlu hapus data situs/cache untuk domain tersebut lalu install ulang PWA.
5. Uji semua item menu: Jumat Barokah, Aneka Kue, Menu, Cara Pesan, Mitra Kuliner, dan Jadi Mitra. Pastikan judul bagian muncul di bawah header tanpa tertutup.

## Catatan
Paket ini memperbaiki frontend. Ia tidak mengubah konfigurasi Firebase, aturan akses, atau deployment di akun GitHub secara otomatis.
