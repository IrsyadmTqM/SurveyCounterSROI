# Survey Counter SROI

Web satu halaman untuk menghitung responden survei **secara realtime bersama tim**.
Semua anggota tim membuka link yang sama, dan setiap kali ada yang menambah atau
mengurangi angka, angkanya langsung berubah di HP semua orang.

| Counter | Target |
|---|---|
| Total responden (semua ditanya soal carbon footprint) | 45 |
| Pengguna FR KAI (Face Recognition) | 20 |
| Non-pengguna FR | 20 |
| Pengguna Water Station | 10 |

Satu responden bisa masuk beberapa kategori sekaligus, misalnya Non-FR **dan**
pengguna Water Station.

## Cara pakai (untuk tim)

1. Buka link web-nya, lalu pilih **Nama surveyor** (**Irsyad** atau **Aldo**). Cukup sekali,
   nanti diingat di HP itu. Tanpa memilih nama, data tidak bisa disimpan.
2. Setiap selesai mewawancarai satu responden, pakai bagian **Catat responden baru**:
   - pilih **Pengguna FR** atau **Non-pengguna FR**,
   - ketuk **Pengguna Water Station** kalau responden memakainya,
   - tekan **+ Simpan responden**.

   Setiap simpan = satu responden. Total otomatis bertambah 1, begitu juga kategori yang dipilih.
   Angka di kartu atas **tidak bisa diubah manual**, karena semuanya dihitung dari **Daftar responden**.

### Kalau salah input

| Masalah | Solusi |
|---|---|
| Salah pilih kategori (mis. harusnya Non-FR, tercatat FR) | Tekan **Ubah** di responden itu, pilih kategori yang benar, lalu tekan **Simpan perubahan** |
| Responden tercatat dua kali / tidak sengaja tersimpan | Tekan **Hapus** di responden itu |
| Terlanjur menghapus responden yang salah | Langsung tekan **Batalkan** di notifikasi bawah, atau buka **Responden terhapus** lalu tekan **Pulihkan** |

Setiap responden punya nomor tetap (#1, #2, …), nama surveyor yang mencatat, jam, dan
siapa yang terakhir mengubah, jadi tim bisa saling mengecek. Angka FR, Non-FR, dan WS
dijamin tidak pernah lebih besar dari total.

Fitur lain:

- Tap dari banyak HP sekaligus tetap tercatat semua.
- Kalau sinyal hilang, data disimpan dulu lalu otomatis terkirim saat online lagi.
- **Hapus semua data (mulai dari 0)** di paling bawah hanya untuk membersihkan data uji
  coba sebelum survei dimulai. Harus mengetik `RESET`, dan data yang terhapus tidak bisa dipulihkan.

## Ceklis tugas

Tab **Ceklis tugas** berisi tugas tim Bandung dari dokumen *Contekan Lapangan SROI KAI –
Bandung*: persiapan & bawaan, Hari 1, Hari 2, dokumen yang diminta, dan verifikasi internal.
Centang tugas yang sudah selesai; semua HP melihat ceklis yang sama, lengkap dengan siapa yang
mencentang dan jamnya. Salah centang? Ketuk lagi untuk membatalkan (ada tombol **Kembalikan**
kalau terlanjur). Link langsung ke ceklis: tambahkan `#ceklis` di akhir alamat web.

Tugas yang file rujukannya ada di folder proyek PT KAI – SROI 3 Program di OneDrive punya
tombol **Rujukan** di kanan; tugas lain sengaja tanpa tombol. Link folder ada di `SOURCE`, dan
lokasi file per tugas di `drive`, di [`tasks.js`](tasks.js).

Daftar tugasnya ada di [`tasks.js`](tasks.js). Karena repo dan web ini publik, angka dan
temuan dari bagian *Catatan internal* tidak ditulis di sana; detailnya tetap di dokumen Contekan.

## Setup sekali saja (oleh satu orang)

Web ini memakai **Firebase Realtime Database** (gratis) untuk sinkronisasi. Selama
`firebase-config.js` belum diisi, web berjalan di **mode lokal**: angka hanya
tersimpan di HP masing-masing dan tidak tersinkron.

### 1. Buat database Firebase

1. Buka <https://console.firebase.google.com>, lalu buat project baru (nama bebas,
   Google Analytics boleh dimatikan) **atau pakai project yang sudah ada**. Satu project
   bisa dipakai beberapa app, dan data web ini tersimpan terpisah di folder
   `surveyCounterSROI`.
2. Buka **Realtime Database** di project itu. Lokasi menunya berbeda-beda tergantung
   versi console: cari di menu kiri (misalnya di kelompok **Databases & Storage** atau
   **Build**), atau ketik "Realtime Database" di kotak pencarian console.
   - Kalau muncul tombol **Create Database**: lokasi **Singapore (asia-southeast1)**,
     lalu pilih **Start in locked mode**.
   - Jangan pilih **Cloud Firestore**. Itu database yang berbeda.
3. Buka tab **Rules**:
   - **Database baru/kosong:** hapus isinya, tempel isi file
     [`database.rules.json`](database.rules.json), lalu klik **Publish**.
   - **Database sudah dipakai app lain:** jangan hapus rules lama. Tambahkan blok
     `"surveyCounterSROI": { ... }` dari file tersebut ke dalam `"rules": { ... }` yang sudah
     ada (pisahkan dengan koma), lalu klik **Publish**.

### 2. Ambil config web

1. Buka **Project settings** (ikon gerigi) → **General** → bagian **Your apps**. Kalau
   sudah ada Web app, config-nya boleh langsung dipakai. Kalau belum, klik **Add app** →
   ikon **Web** (`</>`), beri nama app (bebas), lalu klik **Register app**. Firebase
   Hosting tidak perlu dicentang.
2. Salin objek `firebaseConfig` yang muncul. Pastikan ada baris `databaseURL`.
   Kalau tidak ada, buka ulang config-nya di **Project settings → General → Your apps**
   setelah Realtime Database dibuat.
3. Buka file [`firebase-config.js`](firebase-config.js) di GitHub, klik ikon pensil
   (Edit), lalu ganti `export const firebaseConfig = null;` dengan:

   ```js
   export const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     databaseURL: "https://...firebasedatabase.app",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
   };
   ```

   Lalu klik **Commit changes**.

> Config web Firebase memang aman untuk ditaruh di repo publik. Yang membatasi akses
> adalah **Rules** di langkah 1.

### 3. Online-kan web dengan GitHub Pages

1. Di repo ini buka **Settings → Pages**.
2. Di bagian **Build and deployment**, pilih **Source: Deploy from a branch**,
   branch **main**, folder **/ (root)**, lalu klik **Save**.
3. Setelah 1–2 menit, web bisa dibuka di
   <https://irsyadmtqm.github.io/SurveyCounterSROI/>. Bagikan link ini ke tim.

Kalau status di pojok kanan atas sudah **● Live** (hijau), berarti sinkronisasi sudah jalan.

## Mengubah target, nama surveyor, atau daftar tugas

Edit angka `target` di array `COUNTERS`, atau daftar nama di `SURVEYORS`, di bagian atas
[`app.js`](app.js). Daftar tugas ceklis ada di [`tasks.js`](tasks.js); jangan mengubah `id`
tugas yang sudah dicentang. Setelah
mengubah file CSS/JS, naikkan angka `?v=` di `index.html` dan di baris `import` pertama
`app.js` supaya HP tim tidak memakai versi lama dari cache.

## Catatan keamanan

Siapa pun yang punya link bisa menambah, mengubah, dan menghapus responden, jadi bagikan
link hanya ke anggota tim. Rules yang disediakan hanya menerima data responden dengan
format yang benar (kategori FR/Non-FR/WS dan nama surveyor), dan menolak data di luar
folder `surveyCounterSROI/respondents`.

## Menjalankan di komputer sendiri

```bash
python3 -m http.server 8080
```

Lalu buka <http://localhost:8080>. File harus dibuka lewat server seperti ini, bukan
dengan double-click, karena `app.js` adalah ES module.
