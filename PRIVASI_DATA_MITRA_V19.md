# BoxKita V18 — Data Pribadi Mitra

## Data yang diminta

- Nama legal/penanggung jawab sesuai identitas.
- NIK/KTP 16 digit (nomor saja; tidak meminta foto KTP).
- Alamat identitas, alamat domisili, dan alamat usaha.
- Nomor WhatsApp.
- Nama bank/metode pembayaran, nama pemilik rekening, nomor rekening.
- Cabang bank dan NPWP bersifat opsional.

## Tujuan penggunaan

Data diperlukan untuk verifikasi identitas dan usaha, komunikasi terkait pesanan, administrasi kemitraan, pencatatan kewajiban, serta pembayaran kepada mitra. Kumpulkan hanya data yang benar-benar diperlukan dan pastikan mitra memberi persetujuan.

## Akses

Data identitas dan rekening ditempatkan di `partners/{partnerId}`. Firestore Rules membatasi pembacaan pada admin aktif dan mitra yang memiliki `partnerId` tersebut. Data tersebut tidak boleh disalin ke dokumen katalog/promosi publik.

## Foto menu dan iklan pada Firebase Spark

Foto diubah menjadi gambar terkompresi di browser dan disimpan pada Firestore sebagai data gambar, maksimal tiga gambar per pengajuan. Foto bukan dokumen identitas. Metode ini menghemat kebutuhan layanan tambahan tetapi tetap menggunakan kuota Firestore; gunakan foto yang memang pantas ditampilkan di publik.

## Tanggung jawab pengelola

- Batasi akun admin hanya untuk orang yang membutuhkan.
- Jangan membagikan akses email/password admin.
- Jangan gunakan NIK/rekening nyata saat menguji fitur.
- Sediakan cara bagi mitra untuk memperbaiki data dan minta penghapusan jika tidak lagi diperlukan, sesuai kebijakan dan kewajiban hukum yang berlaku.
- Periksa Rules sebelum membuka pendaftaran umum.
