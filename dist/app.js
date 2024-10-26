"use strict";
// Kelas abstrak Buku: Kerangka dasar untuk semua buku
// 'abstract' berarti kelas ini tidak bisa diinstansiasi langsung, hanya bisa diwariskan
class Buku {
    // Constructor: metode yang dipanggil saat objek dibuat
    constructor(
    // 'private' berarti _id hanya bisa diakses di dalam kelas ini
    // '= Buku._nextId++' adalah nilai default yang akan increment setiap kali digunakan
    _id = Buku._nextId++, 
    // 'public' berarti properti ini bisa diakses dari luar kelas
    judul, 
    // string[] menandakan array of strings
    penulis, tahunTerbit) {
        this._id = _id;
        this.judul = judul;
        this.penulis = penulis;
        this.tahunTerbit = tahunTerbit;
    }
    // 'get' adalah accessor method, memungkinkan akses read-only ke _id
    get id() { return this._id; }
    // Metode untuk mendapatkan deskripsi lengkap buku
    getDeskripsiLengkap() {
        // Template literal (``) memungkinkan interpolasi string
        // join(', ') menggabungkan array penulis menjadi string
        return `${this.judul} oleh ${this.penulis.join(', ')} (${this.tahunTerbit}) - ${this.getDeskripsiGenre()}`;
    }
}
// 'static' berarti variabel ini milik kelas, bukan instance
// '_nextId' adalah counter untuk menghasilkan ID unik
Buku._nextId = 1;
// Kelas BukuFiksi: Turunan dari Buku
// 'extends' menandakan pewarisan dari kelas Buku
class BukuFiksi extends Buku {
    // Constructor dengan parameter tambahan 'subGenre'
    constructor(judul, penulis, tahunTerbit, subGenre) {
        // 'super' memanggil constructor dari kelas induk (Buku)
        super(undefined, judul, penulis, tahunTerbit);
        this.subGenre = subGenre;
    }
    // Override metode abstrak dari kelas induk
    getDeskripsiGenre() { return `Fiksi - ${this.subGenre}`; }
}
// Kelas BukuNonFiksi: Turunan dari Buku
class BukuNonFiksi extends Buku {
    constructor(judul, penulis, tahunTerbit, topik) {
        super(undefined, judul, penulis, tahunTerbit);
        this.topik = topik;
    }
    getDeskripsiGenre() { return `Non-Fiksi - ${this.topik}`; }
}
// KoleksiBuku: Mengelola koleksi dan operasi buku
class KoleksiBuku {
    constructor() {
        // Array untuk menyimpan buku-buku
        this._daftarBuku = [];
    }
    // Menambah buku baru ke koleksi
    tambahBuku(buku) {
        this._daftarBuku.push(buku);
        this.tampilkanBuku();
    }
    // Memperbarui informasi buku berdasarkan ID
    perbaruiBuku(id, judul, penulis, tahunTerbit, jenis, detail) {
        // findIndex mencari index buku dengan id yang sesuai
        const index = this._daftarBuku.findIndex(b => b.id === id);
        if (index !== -1) {
            let bukuBaru;
            if (jenis === 'fiksi') {
                bukuBaru = new BukuFiksi(judul, penulis, tahunTerbit, detail);
            }
            else {
                bukuBaru = new BukuNonFiksi(judul, penulis, tahunTerbit, detail);
            }
            // 'as any' adalah type assertion untuk mengakses properti private
            bukuBaru._id = id;
            this._daftarBuku[index] = bukuBaru;
            this.tampilkanBuku();
        }
    }
    // Menampilkan daftar buku
    tampilkanBuku() {
        const output = document.getElementById('output');
        if (output) {
            // Ternary operator untuk menentukan output berdasarkan jumlah buku
            output.innerHTML = this._daftarBuku.length === 0
                ? "<p>Belum ada buku dalam koleksi.</p>"
                : this._daftarBuku.map(b => `
                    <div>
                        <span><strong>- </strong></span>${b.getDeskripsiLengkap()}
                        <button onclick="manager.tampilkanForm(${b.id})">Edit</button>
                        <button onclick="manager.hapusBuku(${b.id})">Hapus</button>
                    </div>
                `).join('');
        }
    }
    // Hapus buku berdasarkan ID
    hapusBuku(id) {
        // filter membuat array baru tanpa buku dengan id yang dihapus
        this._daftarBuku = this._daftarBuku.filter(b => b.id !== id);
        this.tampilkanBuku();
    }
    // Cari buku berdasarkan ID
    cariBuku(id) {
        // find mengembalikan buku pertama yang memenuhi kondisi
        return this._daftarBuku.find(b => b.id === id);
    }
}
// ManagerBuku: Menghubungkan UI dengan KoleksiBuku
class ManagerBuku {
    constructor(_koleksi) {
        this._koleksi = _koleksi;
        // Menyimpan ID buku yang sedang diedit
        this._idSedangDiedit = null;
    }
    // Memproses form tambah atau edit buku
    prosesForm() {
        // Mengambil nilai dari input form
        const judul = document.getElementById('judul').value.trim();
        const penulis = document.getElementById('penulis').value.trim();
        const tahunTerbit = parseInt(document.getElementById('tahunTerbit').value);
        const jenis = document.getElementById('jenisBuku').value;
        const detail = document.getElementById('detailSpesifik').value.trim();
        if (judul && penulis && !isNaN(tahunTerbit) && detail) {
            // Memisahkan penulis menjadi array
            const penulisList = penulis.split(',').map(p => p.trim());
            if (this._idSedangDiedit !== null) {
                // Update buku yang ada
                this._koleksi.perbaruiBuku(this._idSedangDiedit, judul, penulisList, tahunTerbit, jenis, detail);
                this.selesaiEdit();
            }
            else {
                // Tambah buku baru
                let buku;
                if (jenis === 'fiksi') {
                    buku = new BukuFiksi(judul, penulisList, tahunTerbit, detail);
                }
                else {
                    buku = new BukuNonFiksi(judul, penulisList, tahunTerbit, detail);
                }
                this._koleksi.tambahBuku(buku);
            }
            this.bersihkanForm();
        }
        else {
            alert("Mohon isi semua field dengan benar.");
        }
    }
    // Tampilkan form edit untuk buku tertentu
    tampilkanForm(id) {
        const buku = this._koleksi.cariBuku(id);
        if (buku) {
            // Mengisi form dengan data buku yang akan diedit
            document.getElementById('judul').value = buku.judul;
            document.getElementById('penulis').value = buku.penulis.join(', ');
            document.getElementById('tahunTerbit').value = buku.tahunTerbit.toString();
            document.getElementById('jenisBuku').value = buku instanceof BukuFiksi ? 'fiksi' : 'nonfiksi';
            document.getElementById('detailSpesifik').value = buku instanceof BukuFiksi ? buku.subGenre : buku.topik;
            this._idSedangDiedit = id;
            document.getElementById('tambahBukuBtn').textContent = 'Update Buku';
        }
    }
    // Hapus buku dari koleksi
    hapusBuku(id) {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
            this._koleksi.hapusBuku(id);
        }
    }
    // Bersihkan form setelah operasi
    bersihkanForm() {
        // Mengosongkan semua input form
        ['judul', 'penulis', 'tahunTerbit', 'detailSpesifik'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('jenisBuku').selectedIndex = 0;
        this._idSedangDiedit = null;
        document.getElementById('tambahBukuBtn').textContent = 'Tambah Buku';
    }
    // Selesai edit buku
    selesaiEdit() {
        this._idSedangDiedit = null;
        document.getElementById('tambahBukuBtn').textContent = 'Tambah Buku';
    }
    // Inisialisasi aplikasi
    inisialisasi() {
        const tambahBukuBtn = document.getElementById('tambahBukuBtn');
        if (tambahBukuBtn) {
            // Menambahkan event listener untuk tombol tambah buku
            tambahBukuBtn.addEventListener('click', () => this.prosesForm());
        }
        else {
            console.error("Tombol 'Tambah Buku' tidak ditemukan.");
        }
        this._koleksi.tampilkanBuku();
    }
}
// Inisialisasi aplikasi
const manager = new ManagerBuku(new KoleksiBuku());
// Event listener untuk memastikan DOM telah dimuat sebelum inisialisasi
document.addEventListener('DOMContentLoaded', () => manager.inisialisasi());
