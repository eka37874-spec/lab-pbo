// Kelas sederhana : Mahasiswa 
class Mahasiswa {
    constructor (nama, nim, jurusan) {
        this.nama = nama;
        this.nim = nim;
        this.jurusan = jurusan;
        this.nilai = [];
}

tambahNilai(nilai) {
    this.nilai.push(nilai);
}

rataNilai () {
