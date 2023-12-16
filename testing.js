const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const koneksi = require('./config/database.js');

const app = express()
const port = 3000

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

// Fungsi untuk memilih soal secara acak dari suatu BAB
function getRandomQuestions(bab, jumlahSoal) {
    // Ambil semua soal dari suatu BAB
    let semuaSoal = getQuestionsFromBab(bab);

    // Acak urutan soal
    // semuaSoal = shuffleArray(semuaSoal);

    // Ambil jumlah soal yang sesuai
    return semuaSoal.slice(0, jumlahSoal);
}

// Fungsi untuk mengambil soal-soal dari BAB tertentu
function getQuestionsFromBab(bab) {
    // Data dummy soal-soal dari setiap BAB
  const daftarSoalBab1 = [
    { id: 1, pertanyaan: "Pertanyaan Bab 1 - 1" },
    { id: 2, pertanyaan: "Pertanyaan Bab 1 - 2" },
    { id: 3, pertanyaan: "Pertanyaan Bab 1 - 3" },
    { id: 4, pertanyaan: "Pertanyaan Bab 1 - 4" },
    { id: 5, pertanyaan: "Pertanyaan Bab 1 - 5" },
    { id: 6, pertanyaan: "Pertanyaan Bab 1 - 6" },
    { id: 7, pertanyaan: "Pertanyaan Bab 1 - 7" },
    { id: 8, pertanyaan: "Pertanyaan Bab 1 - 8" },
    { id: 9, pertanyaan: "Pertanyaan Bab 1 - 9" },
    { id: 10, pertanyaan: "Pertanyaan Bab 1 - 10" },
    { id: 11, pertanyaan: "Pertanyaan Bab 1 - 11" },
    { id: 12, pertanyaan: "Pertanyaan Bab 1 - 12" },
    { id: 13, pertanyaan: "Pertanyaan Bab 1 - 13" },
    { id: 14, pertanyaan: "Pertanyaan Bab 1 - 14" },
    // ... tambahkan soal-soal Bab 1 sesuai kebutuhan
  ];

  const daftarSoalBab2 = [
    { id: 11, pertanyaan: "Pertanyaan Bab 2 - 1" },
    { id: 12, pertanyaan: "Pertanyaan Bab 2 - 2" },
    { id: 13, pertanyaan: "Pertanyaan Bab 2 - 3" },
    { id: 11, pertanyaan: "Pertanyaan Bab 2 - 4" },
    { id: 12, pertanyaan: "Pertanyaan Bab 2 - 5" },
    { id: 13, pertanyaan: "Pertanyaan Bab 2 - 6" },
    { id: 11, pertanyaan: "Pertanyaan Bab 2 - 7" },
    { id: 12, pertanyaan: "Pertanyaan Bab 2 - 8" },
    { id: 13, pertanyaan: "Pertanyaan Bab 2 - 9" },
    { id: 12, pertanyaan: "Pertanyaan Bab 2 - 10" },
    { id: 13, pertanyaan: "Pertanyaan Bab 2 - 11" },
    { id: 11, pertanyaan: "Pertanyaan Bab 2 - 12" },
    { id: 12, pertanyaan: "Pertanyaan Bab 2 - 13" },
    { id: 13, pertanyaan: "Pertanyaan Bab 2 - 14" },
    // ... tambahkan soal-soal Bab 2 sesuai kebutuhan
  ];

  const daftarSoalBab3 = [
    { id: 21, pertanyaan: "Pertanyaan Bab 3 - 1" },
    { id: 22, pertanyaan: "Pertanyaan Bab 3 - 2" },
    { id: 23, pertanyaan: "Pertanyaan Bab 3 - 3" },
    { id: 21, pertanyaan: "Pertanyaan Bab 3 - 4" },
    { id: 22, pertanyaan: "Pertanyaan Bab 3 - 5" },
    { id: 23, pertanyaan: "Pertanyaan Bab 3 - 6" },
    { id: 21, pertanyaan: "Pertanyaan Bab 3 - 7" },
    { id: 22, pertanyaan: "Pertanyaan Bab 3 - 8" },
    { id: 23, pertanyaan: "Pertanyaan Bab 3 - 9" },
    { id: 22, pertanyaan: "Pertanyaan Bab 3 - 10" },
    { id: 23, pertanyaan: "Pertanyaan Bab 3 - 11" },
    { id: 21, pertanyaan: "Pertanyaan Bab 3 - 12" },
    { id: 22, pertanyaan: "Pertanyaan Bab 3 - 13" },
    { id: 23, pertanyaan: "Pertanyaan Bab 3 - 14" },
    // ... tambahkan soal-soal Bab 3 sesuai kebutuhan
  ];

  // Kembalikan data soal sesuai dengan BAB yang diminta
  switch (bab) {
    case "Bab1":
      return daftarSoalBab1;
    case "Bab2":
      return daftarSoalBab2;
    case "Bab3":
      return daftarSoalBab3;
    default:
      return [];
  }
}
  
  // Fungsi untuk mengacak array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
  
// Fungsi untuk mendapatkan soal-soal ujian dengan persentase dan jumlah soal tertentu
function getExamQuestions() {
    // Tentukan jumlah soal dan persentase dari setiap BAB
    const totalSoal = 20;
    const persentaseBab1 = 0.1;
    const persentaseBab2 = 0.6;
    const persentaseBab3 = 0.3;

    // Tentukan jumlah soal di tiap ujian
    const jumlahSoalUjian1 = 8;
    const jumlahSoalUjian2 = 6;
    const jumlahSoalUjian3 = 6;

    // Hitung jumlah soal yang harus diambil dari setiap BAB
    const jumlahSoalBab1 = Math.round(totalSoal * persentaseBab1);
    const jumlahSoalBab2 = Math.round(totalSoal * persentaseBab2);
    const jumlahSoalBab3 = Math.round(totalSoal * persentaseBab3);

    // Ambil soal secara acak dari setiap BAB
    const soalBab1 = getRandomQuestions("Bab1", jumlahSoalBab1);
    const soalBab2 = getRandomQuestions("Bab2", jumlahSoalBab2);
    const soalBab3 = getRandomQuestions("Bab3", jumlahSoalBab3);

    // Gabungkan soal-soal dari setiap BAB
    const semuaSoal = soalBab1.concat(soalBab2, soalBab3);

    // Acak urutan soal secara keseluruhan
    const soalUjian = shuffleArray(semuaSoal);

    // Bagi soal ke dalam 3 ujian sesuai dengan jumlah soal yang ditentukan
    const ujian1 = soalUjian.slice(0, jumlahSoalUjian1);
    const ujian2 = soalUjian.slice(jumlahSoalUjian1, jumlahSoalUjian1 + jumlahSoalUjian2);
    const ujian3 = soalUjian.slice(jumlahSoalUjian1 + jumlahSoalUjian2);

    return { ujian1, ujian2, ujian3 };
}

// Contoh penggunaan
const examQuestions = getExamQuestions();
console.log("Ujian 1:", examQuestions.ujian1);
console.log("Ujian 2:", examQuestions.ujian2);
console.log("Ujian 3:", examQuestions.ujian3);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
  