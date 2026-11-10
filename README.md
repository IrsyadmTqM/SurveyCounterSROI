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

1. Buka link web-nya, lalu isi **Nama surveyor** sekali saja (nanti diingat otomatis).
2. Setiap selesai mewawancarai satu responden, buka bagian **Catat responden baru**:
   - pilih **Pengguna FR** atau **Non-pengguna FR**,
   - ketuk **Pengguna Water Station** kalau responden memakainya,
   - tekan **+ Simpan responden**.

   Total otomatis bertambah 1, begitu juga kategori yang dipilih.
3. Kalau salah input, betulkan dengan tombol **−** / **+** di kartu counter yang bersangkutan.
4. **Aktivitas terbaru** mencatat siapa mengubah apa dan jam berapa.

Fitur lain:

- Angka tidak bisa minus, dan tap bersamaan dari banyak HP tetap terhitung semua (memakai transaksi Firebase).
- Muncul peringatan kalau jumlahnya tidak masuk akal, misalnya FR + Non-FR lebih banyak dari total.
- Kalau sinyal hilang, perubahan disimpan dulu lalu otomatis terkirim saat online lagi.
- **Reset semua counter ke 0** ada di paling bawah, dan harus mengetik `RESET` dulu supaya tidak terpencet.

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

## Mengubah target atau kategori

Edit array `COUNTERS` di bagian atas [`app.js`](app.js). Kalau menambah kategori baru,
tambahkan juga nama kategorinya di [`database.rules.json`](database.rules.json), lalu
publish ulang Rules di Firebase.

## Catatan keamanan

Siapa pun yang punya link bisa menambah atau mengurangi angka, jadi bagikan link hanya
ke anggota tim. Rules yang disediakan mencegah angka negatif, menolak data selain
keempat counter, mencegah counter dihapus, dan mencegah log aktivitas diubah atau dihapus.

## Menjalankan di komputer sendiri

```bash
python3 -m http.server 8080
```

Lalu buka <http://localhost:8080>. File harus dibuka lewat server seperti ini, bukan
dengan double-click, karena `app.js` adalah ES module.
