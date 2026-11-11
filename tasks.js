// Daftar tugas tim Bandung (Tim 2), dari dokumen "Contekan Lapangan SROI KAI – Bandung" dan Lembar Kerja
// Internal Lapangan. Tugas dari Lembar Kerja hanya memakai kode informan; detailnya tetap di Lembar Kerja.
//
// - Ubah `title` / `note` dengan bebas.
// - `drive` = lokasi rujukannya di folder OneDrive (lihat SOURCE). Hanya tugas yang punya `drive`
//   yang diberi tombol "Rujukan"; tugas yang rujukannya tidak ada di OneDrive dibiarkan tanpa tombol.
// - Jangan mengubah `id` tugas yang sudah dicentang; centangnya tersimpan berdasarkan id.
//   id hanya boleh huruf kecil, angka, dan tanda minus.
// - Repo dan website ini PUBLIK: jangan tulis angka atau temuan internal di sini.

// Folder proyek di OneDrive, dibuka oleh tombol "Rujukan".
export const SOURCE = {
  title: "Folder proyek PT KAI – SROI 3 Program (OneDrive)",
  url: "https://1drv.ms/f/c/f2e3f15542ab23db/IgC3VrTu-m5GS7vRnGPdHEoeAYSVTEX4ucERgNQ9e-ByHII?e=ZiyhtI",
};

export const TASK_GROUPS = [
  {
    id: "prep",
    title: "Persiapan & bawaan",
    tasks: [
      { id: "prep-janji-kp", title: "Buat janji wawancara Kantor Pusat A1–A4", note: "Tenggat H-7 · lihat Checklist H-7" },
      { id: "prep-pertanyaan-kp", title: "Kirim daftar pertanyaan ke informan A1–A4", note: "H-5 · lihat Checklist H-7" },
      { id: "prep-qr-a1", title: "Minta A1 mengirim tautan form QR ke mantan pengguna FR", note: "Tenggat H-3 · lihat Checklist H-7" },
      { id: "prep-surat", title: "Surat tugas & surat izin (beberapa fotokopi)" },
      { id: "prep-lanyard", title: "Lanyard & ID card" },
      { id: "prep-laptop", title: "Laptop" },
      { id: "prep-form", title: "Link Google Form khusus enumerator siap di HP" },
      {
        id: "prep-cf",
        title: "Contoh tampilan jejak karbon (Bagian 8B) tersimpan di HP",
        drive: "2. Data Sekunder › 3. Informasi Carbon Footprint › dokumentasi",
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
        note: "Pagi, 30–45 menit · minta izin merekam, konfirmasi ulang angka penting di akhir",
      },
      { id: "h1-a4", title: "Wawancara A4 – IT Ticketing", note: "Pagi, ±30 menit" },
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
    id: "ext",
    title: "Wawancara daring",
    subtitle: "Tugas Tim 2; detail informan dan jadwal di Tracker Wawancara (Lembar Kerja)",
    tasks: [
      { id: "ext-janji", title: "Buat janji wawancara daring: A5, B3, dan 3 informan B6", note: "Tenggat H-7 · lihat Checklist H-7" },
      { id: "ext-pertanyaan", title: "Kirim daftar pertanyaan ke informan daring", note: "H-5 · 3–5 hari sebelum wawancara" },
      { id: "ext-metode-b6", title: "Kirim ringkasan metode ke 3 informan B6 bersama daftar pertanyaan", note: "H-5 · lihat Checklist H-7" },
      { id: "ext-a5", title: "Wawancara daring A5 (Daop 8)", note: "Lihat Tracker Wawancara" },
      { id: "ext-b3", title: "Wawancara daring B3", note: "Lihat Tracker Wawancara" },
      { id: "ext-b6-1", title: "Wawancara daring B6 (informan 1)", note: "Lihat Tracker Wawancara · narasumber perlu ditetapkan" },
      { id: "ext-b6-2", title: "Wawancara daring B6 (informan 2)", note: "Lihat Tracker Wawancara · narasumber perlu ditetapkan" },
      { id: "ext-b6-3", title: "Wawancara daring B6 (informan 3)", note: "Lihat Tracker Wawancara · narasumber perlu ditetapkan" },
      {
        id: "ext-upload",
        title: "Unggah rekaman & catatan tiap wawancara daring",
        note: "Malam yang sama, ke folder bersama; nama file sesuai sheet Petunjuk",
      },
    ],
  },
  {
    id: "docs",
    title: "Dokumen yang diminta",
    subtitle: "Minta saat wawancara, centang kalau sudah diterima",
    tasks: [
      { id: "doc-a1", title: "3 dokumen dari A1", note: "Daftar di Pedoman Wawancara bagian A1 · Tracker Dokumen no. 14–16" },
      { id: "doc-a2", title: "5 dokumen dari A2", note: "Daftar di Pedoman Wawancara bagian A2 · Tracker Dokumen no. 17–21" },
      { id: "doc-a3-biaya", title: "Rincian biaya program, termasuk kontrak konsultan", note: "Dari A3" },
      { id: "doc-a3-emisi", title: "Laporan akhir & kertas kerja perhitungan emisi (per relasi dan kelas)", note: "Dari A3" },
      { id: "doc-a3-fgd", title: "Notulen & daftar hadir FGD 15 November 2024", note: "Dari A3" },
      { id: "doc-a3-pemakai", title: "Surat atau notulen pemakaian data oleh BI dan Kemenhub", note: "Dari A3" },
      { id: "doc-a3-media", title: "Liputan media peluncuran 23 Desember 2024", note: "Dari A3" },
      { id: "doc-a4-tiket", title: "Data tiket yang menampilkan info jejak karbon per bulan", note: "Dari A4" },
      { id: "doc-a4-klik", title: "Data klik atau tampilan di aplikasi", note: "Dari A4" },
      { id: "doc-a4-biaya", title: "Rincian biaya pengembangan fitur", note: "Dari A4" },
      { id: "doc-a5", title: "5 dokumen dari A5 (Daop 8)", note: "Daftar di Pedoman Wawancara bagian A5 · Tracker Dokumen no. 30–33" },
      { id: "doc-b3", title: "1 dokumen dari B3", note: "Daftar di Pedoman Wawancara bagian B3 · Tracker Dokumen no. 35" },
    ],
  },
  {
    id: "verif",
    title: "Verifikasi internal",
    subtitle: "Detail di sheet Verifikasi Internal (Lembar Kerja). Tanyakan dengan kalimat netral.",
    tasks: [
      { id: "verif-a3-biaya", title: "Konfirmasi rincian biaya program Carbon Footprint", note: "Ke A3" },
      { id: "verif-a3-okupansi", title: "Tanyakan asumsi okupansi dalam perhitungan emisi", note: "Ke A3 dan B3" },
      { id: "verif-a1-lane", title: "Cek jumlah lane FR terpasang", note: "Ke A1 dan A5 Daop 8" },
      { id: "verif-a1-jember", title: "Tanyakan data pengguna FR Jember", note: "Ke A1" },
      { id: "verif-a2-ws", title: "Cek status pemasangan Water Station Daop 8", note: "Ke A2 dan A5 Daop 8" },
    ],
  },
];
