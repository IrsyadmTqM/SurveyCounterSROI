// Daftar tugas tim Bandung, diambil dari dokumen "Contekan Lapangan SROI KAI – Bandung".
//
// - Ubah `title` / `note` dengan bebas. `ref` = kunci bagian di SECTIONS (tombol Rujukan).
// - Jangan mengubah `id` tugas yang sudah dicentang; centangnya tersimpan berdasarkan id.
//   id hanya boleh huruf kecil, angka, dan tanda minus.
// - Repo dan website ini PUBLIK: jangan tulis angka atau temuan internal di sini.

// Sumber rujukan: tombol "Rujukan" di kanan tiap tugas membuka folder proyek di OneDrive.
export const SOURCE = {
  title: "Folder proyek PT KAI – SROI 3 Program (OneDrive)",
  url: "https://1drv.ms/f/c/f2e3f15542ab23db/IgC3VrTu-m5GS7vRnGPdHEoeAYSVTEX4ucERgNQ9e-ByHII?e=ZiyhtI",
};

// Topik tugas. `label` tampil di tombol Rujukan, `path` = judul bagian terkait di dokumen Contekan Lapangan.
export const SECTIONS = {
  hari1: { label: "Hari 1", path: "Tugas tim Bandung › Hari 1 – Kamis 12 November" },
  hari2: { label: "Hari 2", path: "Tugas tim Bandung › Hari 2" },
  harian: { label: "Harian", path: "Tugas tim Bandung › Setiap hari" },
  survei: { label: "Survei", path: "Survei penumpang" },
  cf: { label: "CF 8B", path: "Pertanyaan CF di kuesioner › Siapkan contoh tampilan untuk Bagian 8B" },
  a3: { label: "A3", path: "Wawancara A3 – Keberlanjutan (RS/RSM)" },
  a4: { label: "A4", path: "Wawancara A4 – IT Ticketing" },
  stasiun: { label: "Stasiun", path: "Petugas stasiun, cek fisik, dan data di stasiun" },
  report: { label: "Report", path: "Daily report dan unggah" },
  bawaan: { label: "Bawaan", path: "Daily report dan unggah › Bawaan" },
  internal: { label: "Internal", path: "Catatan internal (jangan diperlihatkan ke narasumber)" },
};

export const TASK_GROUPS = [
  {
    id: "prep",
    title: "Persiapan & bawaan",
    tasks: [
      { id: "prep-surat", ref: "bawaan", title: "Surat tugas & surat izin (beberapa fotokopi)" },
      { id: "prep-lanyard", ref: "bawaan", title: "Lanyard & ID card" },
      { id: "prep-laptop", ref: "bawaan", title: "Laptop" },
      { id: "prep-form", ref: "survei", title: "Link Google Form khusus enumerator siap di HP" },
      {
        id: "prep-cf", ref: "cf",
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
      { id: "h1-a1", ref: "hari1", title: "Wawancara A1 di Kantor Pusat", note: "Pagi · usul: Rinaldo" },
      { id: "h1-a2", ref: "hari1", title: "Wawancara A2 di Kantor Pusat", note: "Pagi · usul: Rinaldo" },
      {
        id: "h1-a3", ref: "a3",
        title: "Wawancara A3 – Keberlanjutan (RS/RSM)",
        note: "Pagi, 30–45 menit · usul: Irsyad · minta izin merekam, konfirmasi ulang angka penting di akhir",
      },
      { id: "h1-a4", ref: "a4", title: "Wawancara A4 – IT Ticketing", note: "Pagi, ±30 menit · usul: Irsyad" },
      { id: "h1-lapor", ref: "hari1", title: "Lapor ke petugas stasiun & tunjukkan surat tugas", note: "Siang" },
      {
        id: "h1-qr", ref: "hari1",
        title: "Pasang form QR di 3 titik & foto tiap titik",
        note: "Antrean boarding manual, ruang tunggu dekat gate FR, loket registrasi FR",
      },
      { id: "h1-survei", ref: "survei", title: "Survei 25 responden di Stasiun Bandung", note: "Catat tiap responden di tab Counter" },
      { id: "h1-kuota", ref: "harian", title: "Isi realisasi kuota di sheet Kuota Responden" },
      { id: "h1-report", ref: "report", title: "Kirim daily report (paling lambat 17.00)", note: "Ke grup WA internal studi; sertakan 2–3 foto" },
      {
        id: "h1-upload", ref: "report",
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
      { id: "h2-survei", ref: "survei", title: "Survei 20 responden (total 45, min. 10 pengguna Water Station)", note: "Catat tiap responden di tab Counter" },
      { id: "h2-a6-fr", ref: "stasiun", title: "Wawancara A6 – petugas boarding/registrasi FR", note: "20–30 menit" },
      { id: "h2-a6-ws", ref: "stasiun", title: "Wawancara A6 – petugas kebersihan/fasilitas Water Station", note: "20–30 menit" },
      {
        id: "h2-cek-ws", ref: "stasiun",
        title: "Cek fisik Water Station (menurut dokumen: 2 unit)",
        note: "Catat jumlah terlihat & berfungsi; foto dengan stempel tanggal dan lokasi",
      },
      {
        id: "h2-cek-fr", ref: "stasiun",
        title: "Cek fisik gate FR di pintu masuk utara (menurut dokumen: 3 lane)",
        note: "Catat jumlah terlihat & berfungsi; foto dengan stempel tanggal dan lokasi",
      },
      { id: "h2-obs-ramai", ref: "stasiun", title: "Observasi Water Station 30 menit saat ramai", note: "Hitung orang yang mengisi air; catat tanggal & jam mulai" },
      { id: "h2-obs-sepi", ref: "stasiun", title: "Observasi Water Station 30 menit saat sepi", note: "Hitung orang yang mengisi air; catat tanggal & jam mulai" },
      { id: "h2-harga", ref: "stasiun", title: "Catat harga air kemasan 600 ml & 1.500 ml di tenant", note: "Merek, harga, dan nama tenant" },
      { id: "h2-kuota", ref: "harian", title: "Isi realisasi kuota di sheet Kuota Responden" },
      { id: "h2-report", ref: "report", title: "Kirim daily report (paling lambat 17.00)", note: "Ke grup WA internal studi; sertakan 2–3 foto" },
      {
        id: "h2-upload", ref: "report",
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
      { id: "doc-a3-biaya", ref: "a3", title: "Rincian biaya program, termasuk kontrak konsultan", note: "Dari A3" },
      { id: "doc-a3-emisi", ref: "a3", title: "Laporan akhir & kertas kerja perhitungan emisi (per relasi dan kelas)", note: "Dari A3" },
      { id: "doc-a3-fgd", ref: "a3", title: "Notulen & daftar hadir FGD 15 November 2024", note: "Dari A3" },
      { id: "doc-a3-pemakai", ref: "a3", title: "Surat atau notulen pemakaian data oleh BI dan Kemenhub", note: "Dari A3" },
      { id: "doc-a3-media", ref: "a3", title: "Liputan media peluncuran 23 Desember 2024", note: "Dari A3" },
      { id: "doc-a4-tiket", ref: "a4", title: "Data tiket yang menampilkan info jejak karbon per bulan", note: "Dari A4" },
      { id: "doc-a4-klik", ref: "a4", title: "Data klik atau tampilan di aplikasi", note: "Dari A4" },
      { id: "doc-a4-biaya", ref: "a4", title: "Rincian biaya pengembangan fitur", note: "Dari A4" },
    ],
  },
  {
    id: "verif",
    title: "Verifikasi internal",
    subtitle: "Detail di dokumen Contekan Lapangan, bagian Catatan internal. Tanyakan dengan kalimat netral.",
    tasks: [
      { id: "verif-a3-biaya", ref: "internal", title: "Konfirmasi rincian biaya program Carbon Footprint", note: "Ke A3" },
      { id: "verif-a3-okupansi", ref: "internal", title: "Tanyakan asumsi okupansi dalam perhitungan emisi", note: "Ke A3" },
      { id: "verif-a1-lane", ref: "internal", title: "Cek jumlah lane FR terpasang", note: "Ke A1" },
      { id: "verif-a1-jember", ref: "internal", title: "Tanyakan data pengguna FR Jember", note: "Ke A1" },
      { id: "verif-a2-ws", ref: "internal", title: "Cek status pemasangan Water Station Daop 8", note: "Ke A2" },
    ],
  },
];
