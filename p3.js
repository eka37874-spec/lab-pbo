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
    if (this.nilai.length === 0) return 0;
    const total = this.nilai.reduce ((a,b) => a + b, 0);
    return total / this.nilai.length;
}

info () {
    return ' ${this.nama} (${this.nim}) - $(this.jurusan}' ;
    }
}

cons mhs1 = new Mahasiswa ('Andi', '2023001', 'Informatika');
mhs1. tambahNilai (85);
mhs1.tambahNilai(90);
console.log(mhs1.info());
console.log('Rata-rata:', mhs1.rataNilai().toFixed(2)):


    
