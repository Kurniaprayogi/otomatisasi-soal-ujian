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

let soalSemua = [
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 1"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 2"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 3"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 1"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 1"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 1"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 1"
    },
    {
        id:1,
        tingkat_kesulitan:"Mudah",
        bab:"Bab 1"
    },
]

let jumlahMudah = 2;
let jumlahSedang = 3;
let jumlahSulit = 5;

let jumlahBab1 = 6;
let jumlahBab2 = 2;
let jumlahBab3 = 2;

let soalTerpilih = [];

for (let i = 0; i < soalSemua.length; i++) {
    if(jumlahMudah > 0){
        if(soalSemua[i].tingkat_kesulitan == "Mudah"){
            soalTerpilih.push(soalSemua[i])

            if(soalSemua[i].bab == "Bab 1"){
                jumlahBab1--;
            }else if(soalSemua[i].bab == "Bab 2"){
                jumlahBab2--;
            }else{
                jumlahBab3--;
            }

            jumlahMudah--;

        }        
    }
    else if(jumlahSedang > 0){
        if(soalSemua[i].tingkat_kesulitan == "Sedang"){
            soalTerpilih.push(soalSemua[i])
            
            if(soalSemua[i].bab == "Bab 1"){
                jumlahBab1--;
            }else if(soalSemua[i].bab == "Bab 2"){
                jumlahBab2--;
            }else{
                jumlahBab3--;
            }

            jumlahSedang--;

        }  
    }
    else if(jumlahSulit > 0){
        if(soalSemua[i].tingkat_kesulitan == "Sulit"){
            soalTerpilih.push(soalSemua[i])
            
            if(soalSemua[i].bab == "Bab 1"){
                jumlahBab1--;
            }else if(soalSemua[i].bab == "Bab 2"){
                jumlahBab2--;
            }else{
                jumlahBab3--;
            }

            jumlahSulit--;

        }  
    }
    else{
        
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})