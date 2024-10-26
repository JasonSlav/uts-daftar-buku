"use strict";
// Kelas abstrak Buku: Mendefinisikan struktur dasar untuk semua jenis buku
// Abstraksi: Kelas ini menyediakan kerangka umum untuk semua jenis buku
class Buku {
    // Konstruktor: Inisialisasi properti buku
    // Enkapsulasi: _id adalah private, sementara properti lain adalah public
    constructor(_id = Buku.nextId++, judul, penulis, tahunTerbit) {
        this._id = _id;
        this.judul = judul;
        this.penulis = penulis;
        this.tahunTerbit = tahunTerbit;
    }
    // Getter untuk id: Memungkinkan akses read-only ke _id
    get id() { return this._id; }
    // Metode untuk mendapatkan deskripsi lengkap buku
    getDeskripsiLengkap() {
        return `${this.judul} oleh ${this.penulis} (${this.tahunTerbit}) - ${this.getDeskripsiGenre()}`;
    }
}
// Variabel statis untuk menghasilkan ID unik, dimulai dari 1
// Enkapsulasi: nextId adalah private dan hanya diakses melalui konstruktor
Buku.nextId = 1;
// Kelas BukuFiksi: Turunan dari Buku untuk buku-buku fiksi
// Pewarisan: BukuFiksi mewarisi properti dan metode dari Buku
class BukuFiksi extends Buku {
    // Konstruktor BukuFiksi
    constructor(judul, penulis, tahunTerbit, subGenre) {
        // super: Memanggil konstruktor kelas induk (Buku)
        super(undefined, judul, penulis, tahunTerbit);
        this.subGenre = subGenre;
    }
    // Implementasi metode abstrak dari kelas Buku
    // Polimorfisme: Implementasi spesifik untuk BukuFiksi
    getDeskripsiGenre() { return `Fiksi - ${this.subGenre}`; }
}
// Kelas BukuNonFiksi: Turunan dari Buku untuk buku-buku non-fiksi
// Pewarisan: BukuNonFiksi mewarisi properti dan metode dari Buku
class BukuNonFiksi extends Buku {
    // Konstruktor BukuNonFiksi
    constructor(judul, penulis, tahunTerbit, topik) {
        // super: Memanggil konstruktor kelas induk (Buku)
        super(undefined, judul, penulis, tahunTerbit);
        this.topik = topik;
    }
    // Implementasi metode abstrak dari kelas Buku
    // Polimorfisme: Implementasi spesifik untuk BukuNonFiksi
    getDeskripsiGenre() { return `Non-Fiksi - ${this.topik}`; }
}
// Kelas KoleksiBuku: Mengelola koleksi buku dan operasi terkait
// Enkapsulasi: Menyembunyikan detail implementasi dan menyediakan antarmuka publik
class KoleksiBuku {
    constructor() {
        // Array private untuk menyimpan semua buku dalam koleksi
        this.daftarBuku = [];
    }
    // Menambahkan buku baru ke koleksi
    tambahBukuKeKoleksi(buku) {
        this.daftarBuku.push(buku);
        this.perbaruiTampilanDaftarBuku();
    }
    // Memperbarui informasi buku yang sudah ada
    perbaruiInfoBuku(id, judul, penulis, tahunTerbit, jenisBuku, detailSpesifik) {
        const index = this.daftarBuku.findIndex(b => b.id === id);
        if (index !== -1) {
            // Polimorfisme: Membuat objek BukuFiksi atau BukuNonFiksi berdasarkan jenis
            this.daftarBuku[index] = jenisBuku === 'fiksi'
                ? new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik)
                : new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
            this.daftarBuku[index]._id = id;
            this.perbaruiTampilanDaftarBuku();
        }
    }
    // Memperbarui tampilan daftar buku di UI
    perbaruiTampilanDaftarBuku() {
        const outputElement = document.getElementById('output');
        if (outputElement) {
            outputElement.innerHTML = this.daftarBuku.length === 0
                ? "<p>Belum ada buku dalam koleksi.</p>"
                : "<h2>Koleksi Buku:</h2>" + this.daftarBuku.map(buku => `
                    <div>
                        <span><strong>- </strong></span>${buku.getDeskripsiLengkap()}
                        <button onclick="managerBuku.tampilkanFormEditBuku(${buku.id})">Edit</button>
                        <button onclick="managerBuku.konfirmasiHapusBuku(${buku.id})">Hapus</button>
                    </div>
                `).join('');
        }
    }
    // Menghapus buku dari koleksi
    hapusBukuDariKoleksi(id) {
        this.daftarBuku = this.daftarBuku.filter(b => b.id !== id);
        this.perbaruiTampilanDaftarBuku();
    }
    // Mencari buku berdasarkan ID
    cariBukuBerdasarkanId(id) {
        return this.daftarBuku.find(b => b.id === id);
    }
}
// Kelas ManagerBuku: Mengelola interaksi antara UI dan KoleksiBuku
// Enkapsulasi: Menyembunyikan logika manajemen buku dari kode lain
class ManagerBuku {
    constructor(koleksiBuku) {
        this.koleksiBuku = koleksiBuku;
        this.idBukuYangSedangDiedit = null;
    }
    // Memproses input form untuk menambah atau memperbarui buku
    prosesFormBuku() {
        const judul = document.getElementById('judul').value;
        const penulis = document.getElementById('penulis').value;
        const tahunTerbit = parseInt(document.getElementById('tahunTerbit').value);
        const jenisBuku = document.getElementById('jenisBuku').value;
        const detailSpesifik = document.getElementById('detailSpesifik').value;
        if (judul && penulis && !isNaN(tahunTerbit) && jenisBuku && detailSpesifik) {
            if (this.idBukuYangSedangDiedit !== null) {
                // Update buku yang ada
                this.koleksiBuku.perbaruiInfoBuku(this.idBukuYangSedangDiedit, judul, penulis, tahunTerbit, jenisBuku, detailSpesifik);
                this.selesaiEditBuku();
            }
            else {
                // Tambah buku baru
                // Polimorfisme: Membuat objek BukuFiksi atau BukuNonFiksi berdasarkan input
                const bukuBaru = jenisBuku === 'fiksi'
                    ? new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik)
                    : new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
                this.koleksiBuku.tambahBukuKeKoleksi(bukuBaru);
            }
            this.bersihkanFormBuku();
        }
        else {
            alert("Mohon isi semua field dengan benar.");
        }
    }
    // Menampilkan form edit untuk buku tertentu
    tampilkanFormEditBuku(id) {
        const buku = this.koleksiBuku.cariBukuBerdasarkanId(id);
        if (buku) {
            ['judul', 'penulis', 'tahunTerbit'].forEach(prop => document.getElementById(prop).value = buku[prop].toString());
            document.getElementById('jenisBuku').value = buku instanceof BukuFiksi ? 'fiksi' : 'nonfiksi';
            document.getElementById('detailSpesifik').value = buku instanceof BukuFiksi ? buku.subGenre : buku.topik;
            document.getElementById('tambahBukuBtn').textContent = 'Update Buku';
            this.idBukuYangSedangDiedit = id;
        }
    }
    // Konfirmasi dan proses penghapusan buku
    konfirmasiHapusBuku(id) {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini dari koleksi?")) {
            this.koleksiBuku.hapusBukuDariKoleksi(id);
        }
    }
    // Inisialisasi aplikasi: set up event listener dan tampilkan daftar buku awal
    inisialisasiAplikasi() {
        const tambahBukuBtn = document.getElementById('tambahBukuBtn');
        if (tambahBukuBtn) {
            tambahBukuBtn.addEventListener('click', () => this.prosesFormBuku());
        }
        else {
            console.error("Tombol 'Tambah Buku' tidak ditemukan.");
        }
        this.koleksiBuku.perbaruiTampilanDaftarBuku();
    }
    // Menyelesaikan proses edit buku
    selesaiEditBuku() {
        this.idBukuYangSedangDiedit = null;
        document.getElementById('tambahBukuBtn').textContent = 'Tambah Buku';
    }
    // Membersihkan form setelah menambah atau mengedit buku
    bersihkanFormBuku() {
        ['judul', 'penulis', 'tahunTerbit', 'detailSpesifik'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('jenisBuku').selectedIndex = 0;
    }
}
// Inisialisasi aplikasi
const managerBuku = new ManagerBuku(new KoleksiBuku());
document.addEventListener('DOMContentLoaded', () => managerBuku.inisialisasiAplikasi());
