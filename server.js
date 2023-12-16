// from browser type :    http://localhost:3000/

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const koneksi = require('./config/database.js');
const multer = require('multer');
const mysql = require('mysql2/promise');
const xlsx = require('xlsx');

const app = express()
const port = 3000

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistem_ujian_db',
    multipleStatements: true
};

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

// Menangani rute untuk halaman utama
app.get('/', (req, res) => {
    const querySql = 'SELECT * FROM ujian';

    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        let dataFromDatabase = [];
        // const dataFromDatabase = [
        //     { id: 1, name: 'Item 1', price: 10 },
        //     { id: 2, name: 'Item 2', price: 20 },
        //     // ...
        // ];
        rows.forEach(row=>{
            dataFromDatabase.push(row)
        })
        res.render('index', { title: 'Node.js EJS Tutorial',data: dataFromDatabase });
    });
  });

app.get('/lihatUjian/:id', (req, res) => {
    const querySql = `SELECT * FROM ujian WHERE id = ${req.params.id}`;

    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        let dataFromDatabase = [];
        let soal = JSON.parse(rows[0].soal);
        // rows.forEach(row=>{
        //     row.pertanyaan = JSON.parse(row.pertanyaan)
        //     dataFromDatabase.push(row)
        //     pertanyaan.push(row.pertanyaan)
        // })
        // console.log(pertanyaan.length)
        
        res.render('lihatUjian', { title: 'Node.js EJS Tutorial',data: rows[0], soal });
    });
  });

app.get('/buatUjian', (req, res) => {
    res.render('buatUjian');
  });
app.post('/buatUjian', (req, res) => {
    const data = { ...req.body };
    const jumlahSoal = parseInt(data.jumlah_soal);

    const soalPerBab = {
        bab1: (parseInt(data.bab1) / 100) * jumlahSoal,
        bab2: (parseInt(data.bab2) / 100) * jumlahSoal,
        bab3: (parseInt(data.bab3) / 100) * jumlahSoal,
    };
    const tingkatKesulitan1 = {
        mudah: (parseInt(data.mudah1) / 100) * soalPerBab.bab1,
        sedang: (parseInt(data.sedang1) / 100) * soalPerBab.bab1,
        sulit: (parseInt(data.sulit1) / 100) * soalPerBab.bab1,
    };
    const tingkatKesulitan2 = {
        mudah: (parseInt(data.mudah2) / 100) * soalPerBab.bab2,
        sedang: (parseInt(data.sedang2) / 100) * soalPerBab.bab2,
        sulit: (parseInt(data.sulit2) / 100) * soalPerBab.bab2,
    };
    const tingkatKesulitan3 = {
        mudah: (parseInt(data.mudah3) / 100) * soalPerBab.bab3,
        sedang: (parseInt(data.sedang3) / 100) * soalPerBab.bab3,
        sulit: (parseInt(data.sulit3) / 100) * soalPerBab.bab3,
    };
    console.log("soalPerBab= ",soalPerBab)
    console.log("tingkatKesulitan1= ",tingkatKesulitan1)
    console.log("tingkatKesulitan2= ",tingkatKesulitan2)
    console.log("tingkatKesulitan3= ",tingkatKesulitan3)
    // const babDiujikan = {
    //     bab1: (parseInt(data.bab1) / 100) * jumlahSoal,
    //     bab2: (parseInt(data.bab2) / 100) * jumlahSoal,
    //     bab3: (parseInt(data.bab3) / 100) * jumlahSoal,
    // };
    // console.log("tingkatKesulitan",tingkatKesulitan)

    // Lakukan pemilihan soal berdasarkan kriteria
    // const selectedSoals = selectSoals(data.mata_kuliah, tingkatKesulitan, jumlahSoal);

    console.log("materii = ", data.materi)

    const query = `
    SELECT * FROM soal
    ORDER BY RAND()
    `;

    // Parameter untuk query
    // const params = [
    //     data.materi
    // ];

    let selectedSoals = [];

    koneksi.query(query, (err, results) => {
        if (err) {
            console.error('Error selecting soals:', err);
        } else {
            // Distribusi soal sesuai dengan tingkat kesulitan yang diinginkan
            // console.log("results ",results)
            selectedSoals = distributeSoals(results, tingkatKesulitan1,tingkatKesulitan2,tingkatKesulitan3, jumlahSoal);
            // selectedSoals = distributeSoals(results, tingkatKesulitan, jumlahSoal);

            console.log("selectedSoals udah dipotong = ",selectedSoals.length)

            const ujianData = {
                materi: data.materi,
                jenis: data.jenis,
                jumlah_soal: jumlahSoal,
                durasi: parseInt(data.durasi),
                tanggal: data.tanggal,
                jam: data.jam,
                soal: JSON.stringify(selectedSoals)
            };

            saveSelectedSoalsToUjian(ujianData);
            // console.log('Selected soals:', selectedSoals);
        }
    });

    // Redirect atau berikan respons sesuai kebutuhan
    res.redirect('/');  // Ganti dengan halaman yang sesuai
});

function distributeSoals(soals, tingkatKesulitan1,tingkatKesulitan2,tingkatKesulitan3, jumlahSoal) {
    // Hitung jumlah soal yang harus dipilih untuk masing-masing tingkat kesulitan dan bab
    const jumlahMudah = Math.ceil(tingkatKesulitan1.mudah);
    const jumlahSedang = Math.ceil(tingkatKesulitan1.sedang);
    const jumlahSulit = Math.ceil(tingkatKesulitan1.sulit);

    const jumlahMudah2 = Math.ceil(tingkatKesulitan2.mudah);
    const jumlahSedang2 = Math.ceil(tingkatKesulitan2.sedang);
    const jumlahSulit2 = Math.ceil(tingkatKesulitan2.sulit);

    const jumlahMudah3 = Math.ceil(tingkatKesulitan3.mudah);
    const jumlahSedang3 = Math.ceil(tingkatKesulitan3.sedang);
    const jumlahSulit3 =  Math.ceil(tingkatKesulitan3.sulit);

    console.log("Ceil = ",jumlahMudah,jumlahSedang,jumlahSulit)
    console.log("Ceil 2 = ",jumlahMudah2,jumlahSedang2,jumlahSulit2)
    console.log("Ceil 3 = ",jumlahMudah3,jumlahSedang3,jumlahSulit3)

    // Pisahkan soal-soal berdasarkan tingkat kesulitan
    const mudahSoals = soals.filter(pertanyaan => pertanyaan.tingkat_kesulitan === 'Mudah');
    const sedangSoals = soals.filter(pertanyaan => pertanyaan.tingkat_kesulitan === 'Sedang');
    const sulitSoals = soals.filter(pertanyaan => pertanyaan.tingkat_kesulitan === 'Sulit');
    // console.log("Jumlah = ",mudahSoals.length,sedangSoals.length,sulitSoals.length)

    console.log("Pertanyaannnya = ",soals)

    // Pisahkan soal-soal berdasarkan bab dan tingkat kesulitan
    const bab1MudahSoals = soals.filter(pertanyaan => pertanyaan.bab == '1' && pertanyaan.tingkat_kesulitan == "Mudah");
    const bab1SedangSoals = soals.filter(pertanyaan => pertanyaan.bab == '1' && pertanyaan.tingkat_kesulitan == "Sedang");
    const bab1SulitSoals = soals.filter(pertanyaan => pertanyaan.bab == '1' && pertanyaan.tingkat_kesulitan == "Sulit");
    const bab2MudahSoals = soals.filter(pertanyaan => pertanyaan.bab == '2' && pertanyaan.tingkat_kesulitan == "Mudah");
    const bab2SedangSoals = soals.filter(pertanyaan => pertanyaan.bab == '2' && pertanyaan.tingkat_kesulitan == "Sedang");
    const bab2SulitSoals = soals.filter(pertanyaan => pertanyaan.bab == '2' && pertanyaan.tingkat_kesulitan == "Sulit");
    const bab3MudahSoals = soals.filter(pertanyaan => pertanyaan.bab == '3' && pertanyaan.tingkat_kesulitan == "Mudah");
    const bab3SedangSoals = soals.filter(pertanyaan => pertanyaan.bab == '3' && pertanyaan.tingkat_kesulitan == "Sedang");
    const bab3SulitSoals = soals.filter(pertanyaan => pertanyaan.bab == '3' && pertanyaan.tingkat_kesulitan == "Sulit");
    console.log("Jumlahnyaaa",bab1MudahSoals.length,bab1SedangSoals.length,bab1SulitSoals.length,bab2MudahSoals.length,bab2SedangSoals.length, bab2SulitSoals.length)

    if (mudahSoals.length < jumlahMudah || sedangSoals.length < jumlahSedang || sulitSoals.length < jumlahSulit) {
        console.error('Tidak cukup soal untuk memenuhi persyaratan kesulitan.');
        // return [];
    }

    // Ambil jumlah soal sesuai dengan kriteria
    const selectedMudahSoals = bab1MudahSoals.splice(0, jumlahMudah);
    const selectedSedangSoals = bab1SedangSoals.splice(0, jumlahSedang);
    const selectedSulitSoals = bab1SulitSoals.splice(0, jumlahSulit);

    const selectedMudahSoals2 = bab2MudahSoals.splice(0, jumlahMudah2);
    const selectedSedangSoals2 = bab2SedangSoals.splice(0, jumlahSedang2);
    const selectedSulitSoals2 = bab2SulitSoals.splice(0, jumlahSulit2);

    const selectedMudahSoals3 = bab3MudahSoals.splice(0, jumlahMudah3);
    const selectedSedangSoals3 = bab3SedangSoals.splice(0, jumlahSedang3);
    const selectedSulitSoals3 = bab3SulitSoals.splice(0, jumlahSulit3);
    // console.log("Tingkat = ",selectedMudahSoals.length,selectedSedangSoals.length,selectedSulitSoals.length)

    // Gabungkan soal-soal yang terpilih dari masing-masing tingkat kesulitan
    let selectedSoals = [
        ...selectedMudahSoals,
        ...selectedSedangSoals,
        ...selectedSulitSoals,
        ...selectedMudahSoals2,
        ...selectedSedangSoals2,
        ...selectedSulitSoals2,
        ...selectedMudahSoals3,
        ...selectedSedangSoals3,
        ...selectedSulitSoals3,
    ];
    console.log("selectedSoals panjang = ",selectedSoals.length)

    // kurangi jumlah soal jika melebihi dari yang dibutuhkan
    if (selectedSoals.length > jumlahSoal){
        let selisih = selectedSoals.length - jumlahSoal;
        selectedSoals.splice(selectedSoals.length - selisih, selisih);
    }

    return selectedSoals;
}

  
// Fungsi untuk menyimpan soal ke tabel "ujian"
function saveSelectedSoalsToUjian(ujianData) {
    // Query untuk menyimpan soal ke dalam tabel "ujian"
    const query = 'INSERT INTO ujian SET ?';

    koneksi.query(query, ujianData, (err, results) => {
        if (err) {
        console.error('Error saving ujian:', err);
        } else {
        console.log('Saved ujian to database:', results);
        }
    });
}
  
  
app.get('/soal', (req, res) => {

    const querySql = 'SELECT * FROM soal';

    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        let dataFromDatabase = [];
        // const dataFromDatabase = [
        //     { id: 1, name: 'Item 1', price: 10 },
        //     { id: 2, name: 'Item 2', price: 20 },
        //     // ...
        // ];
        rows.forEach(row=>{
            dataFromDatabase.push(row)
        })
        res.render('soal', { title: 'Node.js EJS Tutorial',data: dataFromDatabase });
    });

});

app.get('/tambahSoal', (req, res) => {
    res.render('tambahSoal', { title: 'Tambah Soal Page' });
});

app.post('/tambahSoal', (req, res) => {
    // Tangani data yang diterima dari formulir di sini
    // const { mata_kuliah, tingkat_kesulitan, pertanyaan } = req.body;

    // Simpan data ke database atau lakukan operasi lainnya
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO soal SET ?';

    // jalankan query
    koneksi.query(querySql, data, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal insert data mahasiswa!', error: err });
        }

        // jika request berhasil
        // res.status(201).json({ success: true, message: 'Berhasil insert data mahasiswa!' });
        res.redirect('/soal');
    });
});

app.get('/students', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM mahasiswa';
    console.log('Ini GET' );

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// app.get('/soal', (req, res) => {
//     // Buat query SQL
//     const querySql = 'SELECT * FROM soal';
  
//     // Jalankan query
//     koneksi.query(querySql, (err, rows, fields) => {
//       if (err) {
//         return res.status(500).json({ message: 'Ada kesalahan', error: err });
//       }
  
//       // Baca file soal.html
//       fs.readFile('soal.html', (err, data) => {
//         if (err) {
//           res.writeHead(500, { 'Content-Type': 'text/html' });
//           res.end('Internal Server Error');
//         } else {
//           // Gabungkan form HTML dengan data mahasiswa
//           const html = data.toString().replace('{{soal}}', renderSoalList(rows));
  
//           res.writeHead(200, { 'Content-Type': 'text/html' });
//           res.end(html);
//         }
//       });
//     });
//   });

app.get('/bankSoal', (req, res) => {
    res.render('uploadBankSoal');
  });
app.post('/upload-bank-soal', upload.single('bankSoalFile'), async (req, res) => {
    try {
      const connection = await mysql.createConnection(dbConfig);
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  
      const bankSoalSheet = workbook.Sheets[workbook.SheetNames[0]];
      // const pilihanJawabanSheet = workbook.Sheets[workbook.SheetNames[1]];
  
      const bankSoalData = xlsx.utils.sheet_to_json(bankSoalSheet);
      // const pilihanJawabanData = xlsx.utils.sheet_to_json(pilihanJawabanSheet);
  
      for (const row of bankSoalData) {
        const { bab, materi, pertanyaan, opsi_jawaban, jawaban_benar, tingkat_kesulitan} = row;

  
        // Check for undefined values and set them to null
        const babValue = bab || null;
        const materiValue = materi || null;
        const pertanyaanValue = pertanyaan || null;
        const opsiJawabanValue = opsi_jawaban || null;
        const jawabanBenarValue = jawaban_benar || null;
        const tingkatKesulitanValue = tingkat_kesulitan || null;
  
        await connection.execute(
          'INSERT INTO soal (materi, pertanyaan, opsi_jawaban, jawaban_benar, tingkat_kesulitan, bab) VALUES (?, ?, ?, ?, ?, ?)',
          [materiValue, pertanyaanValue, opsiJawabanValue, jawabanBenarValue, tingkatKesulitanValue, babValue]
        );
      }
  
      // // for (const row of pilihanJawabanData) {
      // //   // const { bank_soal_id, teks_pilihan, benar } = row;
  
      //   // Check for undefined values and set them to null
      //   const bankSoalIdValue = bank_soal_id || null;
      //   const teksPilihanValue = teks_pilihan || null;
      //   const benarValue = benar || null;
  
      //   await connection.execute(
      //     'INSERT INTO jawaban (bank_soal_id, teks_pilihan, benar) VALUES (?, ?, ?)',
      //     [bankSoalIdValue, teksPilihanValue, benarValue]
      //   );
      // }
  
      res.send('Bank soal data successfully uploaded and imported into the database.');
  
      connection.end();
    } catch (error) {
      console.error('Error uploading and importing data:', error);
      res.status(500).send('An error occurred while uploading and importing data.');
    }
  });

  function formatOptions(options) {
    // Pisahkan opsi menjadi array
    const optionArray = options.split('\n');

    // Gabungkan kembali dengan tag <br>
    const formattedOptions = optionArray.join('<br>');

    return formattedOptions;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
