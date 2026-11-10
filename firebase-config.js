// Konfigurasi Firebase untuk sinkronisasi realtime antar anggota tim.
//
// Selama nilainya masih `null`, web berjalan di "mode lokal": angka hanya
// tersimpan di browser perangkat itu sendiri dan TIDAK tersinkron ke tim.
//
// Cara mengisi (lihat README.md untuk langkah lengkap):
// 1. Buat project di https://console.firebase.google.com
// 2. Build > Realtime Database > Create database
// 3. Project settings > General > Your apps > tambah Web app (</>)
// 4. Salin objek firebaseConfig ke bawah ini. Pastikan ada `databaseURL`.
//
// Contoh:
// export const firebaseConfig = {
//   apiKey: "AIza...",
//   authDomain: "nama-project.firebaseapp.com",
//   databaseURL: "https://nama-project-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "nama-project",
//   storageBucket: "nama-project.appspot.com",
//   messagingSenderId: "1234567890",
//   appId: "1:1234567890:web:abcdef123456",
// };

export const firebaseConfig = null;
