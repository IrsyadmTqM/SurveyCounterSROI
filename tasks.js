// Daftar tugas tim Bandung, diambil dari dokumen "Contekan Lapangan SROI KAI – Bandung".
//
// - Ubah `title` / `note` dengan bebas.
// - Jangan mengubah `id` tugas yang sudah dicentang; centangnya tersimpan berdasarkan id.
//   id hanya boleh huruf kecil, angka, dan tanda minus.
// - Repo dan website ini PUBLIK: jangan tulis angka atau temuan internal di sini.

export const TASK_GROUPS = [
  {
    id: "prep",
    title: "Persiapan & bawaan",
    tasks: [
      { id: "prep-surat", title: "Surat tugas & surat izin (beberapa fotokopi)" },
      { id: "prep-lanyard", title: "Lanyard & ID card" },
      { id: "prep-laptop", title: "Laptop" },
      { id: "prep-form", title: "Link Google Form khusus enumerator siap di HP" },
      {
        id: "prep-cf",
        title: "Contoh tampilan jejak karbon (Bagian 8B) tersimpan di HP",
        note: "Dari OneDrive: 2. Data Sekunder → 3. Informasi Carbon Footprint → dokumentasi. Cetak kalau sempat.",
      },
    ],
  },
  {
    id: "h1",
    title: "Hari 1 – Kamis, 12 November",
    subtitle: "Kantor Pusat & Stasiun Bandung",
    tasks: [
      { id: "h1-a1", title: "Wawancara A1 di Kantor Pusat", note: "Pagi · usul: Rinaldo" },
      { id: "h1-a2", title: "Wawancara A2 di Kantor Pusat", note: "Pagi · usul: Rinaldo" },
      {
        id: "h1-a3",
        title: "Wawancara A3 – Keberlanjutan (RS/RSM)",
        note: "Pagi, 30–45 menit · usul: Irsyad · minta izin merekam, konfirmasi ulang angka penting di akhir",
      },
      { id: "h1-a4", title: "Wawancara A4 – IT Ticketing", note: "Pagi, ±30 menit · usul: Irsyad" },
      { id: "h1-lapor", title: "Lapor ke petugas stasiun & tunjukkan surat tugas", note: "Siang" },
      {
        id: "h1-qr",
        title: "Pasang form QR di 3 titik & foto tiap titik",
        note: "Antrean boarding manual, ruang tunggu dekat gate FR, loket registrasi FR",
      },
      { id: "h1-survei", title: "Survei 25 responden di Stasiun Bandung", note: "Catat tiap responden di tab Counter" },
      { id: "h1-kuota", title: "Isi realisasi kuota di sheet Kuota Responden" },
      { id: "h1-report", title: "Kirim daily report (paling lambat 17.00)", note: "Ke grup WA internal studi; sertakan 2–3 foto" },
      {
        id: "h1-upload",
        title: "Unggah rekaman, catatan, foto bertanggal & ekspor survei",
        note: "Malam itu juga, ke folder bersama; nama file sesuai sheet Petunjuk",
      },
    ],
  },
  {
    id: "h2",
    title: "Hari 2",
    subtitle: "Stasiun Bandung",
    tasks: [
      { id: "h2-survei", title: "Survei 20 responden (total 45, min. 10 pengguna Water Station)", note: "Catat tiap responden di tab Counter" },
      { id: "h2-a6-fr", title: "Wawancara A6 – petugas boarding/registrasi FR", note: "20–30 menit" },
      { id: "h2-a6-ws", title: "Wawancara A6 – petugas kebersihan/fasilitas Water Station", note: "20–30 menit" },
      {
        id: "h2-cek-ws",
        title: "Cek fisik Water Station (menurut dokumen: 2 unit)",
        note: "Catat jumlah terlihat & berfungsi; foto dengan stempel tanggal dan lokasi",
      },
      {
        id: "h2-cek-fr",
        title: "Cek fisik gate FR di pintu masuk utara (menurut dokumen: 3 lane)",
        note: "Catat jumlah terlihat & berfungsi; foto dengan stempel tanggal dan lokasi",
      },
      { id: "h2-obs-ramai", title: "Observasi Water Station 30 menit saat ramai", note: "Hitung orang yang mengisi air; catat tanggal & jam mulai" },
      { id: "h2-obs-sepi", title: "Observasi Water Station 30 menit saat sepi", note: "Hitung orang yang mengisi air; catat tanggal & jam mulai" },
      { id: "h2-harga", title: "Catat harga air kemasan 600 ml & 1.500 ml di tenant", note: "Merek, harga, dan nama tenant" },
      { id: "h2-kuota", title: "Isi realisasi kuota di sheet Kuota Responden" },
      { id: "h2-report", title: "Kirim daily report (paling lambat 17.00)", note: "Ke grup WA internal studi; sertakan 2–3 foto" },
      {
        id: "h2-upload",
        title: "Unggah rekaman, catatan, foto bertanggal & ekspor survei",
        note: "Malam itu juga, ke folder bersama; nama file sesuai sheet Petunjuk",
      },
    ],
  },
  {
    id: "docs",
    title: "Dokumen yang diminta",
    subtitle: "Minta saat wawancara, centang kalau sudah diterima",
    tasks: [
      { id: "doc-a3-biaya", title: "Rincian biaya program, termasuk kontrak konsultan", note: "Dari A3" },
      { id: "doc-a3-emisi", title: "Laporan akhir & kertas kerja perhitungan emisi (per relasi dan kelas)", note: "Dari A3" },
      { id: "doc-a3-fgd", title: "Notulen & daftar hadir FGD 15 November 2024", note: "Dari A3" },
      { id: "doc-a3-pemakai", title: "Surat atau notulen pemakaian data oleh BI dan Kemenhub", note: "Dari A3" },
      { id: "doc-a3-media", title: "Liputan media peluncuran 23 Desember 2024", note: "Dari A3" },
      { id: "doc-a4-tiket", title: "Data tiket yang menampilkan info jejak karbon per bulan", note: "Dari A4" },
      { id: "doc-a4-klik", title: "Data klik atau tampilan di aplikasi", note: "Dari A4" },
      { id: "doc-a4-biaya", title: "Rincian biaya pengembangan fitur", note: "Dari A4" },
    ],
  },
  {
    id: "verif",
    title: "Verifikasi internal",
    subtitle: "Detail di dokumen Contekan Lapangan, bagian Catatan internal. Tanyakan dengan kalimat netral.",
    tasks: [
      { id: "verif-a3-biaya", title: "Konfirmasi rincian biaya program Carbon Footprint", note: "Ke A3" },
      { id: "verif-a3-okupansi", title: "Tanyakan asumsi okupansi dalam perhitungan emisi", note: "Ke A3" },
      { id: "verif-a1-lane", title: "Cek jumlah lane FR terpasang", note: "Ke A1" },
      { id: "verif-a1-jember", title: "Tanyakan data pengguna FR Jember", note: "Ke A1" },
      { id: "verif-a2-ws", title: "Cek status pemasangan Water Station Daop 8", note: "Ke A2" },
    ],
  },
];
