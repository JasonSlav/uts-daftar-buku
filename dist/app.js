"use strict";
// Kelas abstrak Buku: Mendefinisikan struktur dasar untuk semua jenis buku
class Buku {
    // Konstruktor untuk inisialisasi objek Buku
    constructor(judul, penulis, tahunTerbit) {
        // Mengatur ID buku dan menaikkan nextId untuk buku berikutnya
        this._id = Buku.nextId++;
        this._judul = judul;
        this._penulis = penulis;
        this._tahunTerbit = tahunTerbit;
    }
    // Getter dan setter untuk properti buku
    // Getter: Metode untuk mengakses nilai properti private
    // Setter: Metode untuk mengubah nilai properti private
    get id() { return this._id; }
    get judul() { return this._judul; }
    set judul(value) { this._judul = value; }
    get penulis() { return this._penulis; }
    set penulis(value) { this._penulis = value; }
    get tahunTerbit() { return this._tahunTerbit; }
    set tahunTerbit(value) { this._tahunTerbit = value; }
    // Metode untuk mendapatkan deskripsi lengkap buku
    getDeskripsiLengkap() {
        return `${this._judul} oleh ${this._penulis} (${this._tahunTerbit}) - ${this.getDeskripsiGenre()}`;
    }
}
// Variabel statis untuk menghasilkan ID unik, dimulai dari 1
Buku.nextId = 1;
// Kelas BukuFiksi: Turunan dari Buku untuk buku-buku fiksi
class BukuFiksi extends Buku {
    // Konstruktor BukuFiksi memanggil konstruktor Buku (super) dan menambahkan subGenre
    constructor(judul, penulis, tahunTerbit, subGenre) {
        super(judul, penulis, tahunTerbit);
        this._subGenre = subGenre;
    }
    // Getter dan setter untuk subGenre
    get subGenre() { return this._subGenre; }
    set subGenre(value) { this._subGenre = value; }
    // Implementasi getDeskripsiGenre untuk buku fiksi
    getDeskripsiGenre() {
        return `Fiksi - ${this._subGenre}`;
    }
}
// Kelas BukuNonFiksi: Turunan dari Buku untuk buku-buku non-fiksi
class BukuNonFiksi extends Buku {
    // Konstruktor BukuNonFiksi memanggil konstruktor Buku (super) dan menambahkan topik
    constructor(judul, penulis, tahunTerbit, topik) {
        super(judul, penulis, tahunTerbit);
        this._topik = topik;
    }
    // Getter dan setter untuk topik
    get topik() { return this._topik; }
    set topik(value) { this._topik = value; }
    // Implementasi getDeskripsiGenre untuk buku non-fiksi
    getDeskripsiGenre() {
        return `Non-Fiksi - ${this._topik}`;
    }
}
// Kelas KoleksiBuku: Mengelola koleksi buku dan operasi terkait
class KoleksiBuku {
    constructor() {
        // Array untuk menyimpan semua buku dalam koleksi
        this.daftarBuku = [];
    }
    // Tambahkan metode baru untuk mengatur nextId
    aturNextId() {
        if (this.daftarBuku.length > 0) {
            const maxId = Math.max(...this.daftarBuku.map(buku => buku.id));
            Buku.nextId = maxId + 1;
        }
        else {
            Buku.nextId = 1;
        }
    }
    // Menambahkan buku baru ke koleksi
    tambahBukuKeKoleksi(buku) {
        this.daftarBuku.push(buku);
        this.aturNextId(); // Atur nextId setelah menambah buku
        this.perbaruiTampilanDaftarBuku();
    }
    // Memperbarui informasi buku yang sudah ada
    perbaruiInfoBuku(id, judul, penulis, tahunTerbit, jenisBuku, detailSpesifik) {
        const bukuLama = this.cariBukuBerdasarkanId(id);
        if (bukuLama) {
            let bukuBaru;
            if (jenisBuku === 'fiksi') {
                bukuBaru = new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik);
            }
            else {
                bukuBaru = new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
            }
            // Mempertahankan ID buku yang lama
            bukuBaru._id = id;
            // Mengganti buku lama dengan buku baru dalam array
            const index = this.daftarBuku.findIndex(b => b.id === id);
            if (index !== -1) {
                this.daftarBuku[index] = bukuBaru;
            }
            this.perbaruiTampilanDaftarBuku();
        }
    }
    // Memperbarui tampilan daftar buku di UI
    perbaruiTampilanDaftarBuku() {
        const outputElement = document.getElementById('output');
        if (outputElement) {
            // Jika tidak ada buku, tampilkan pesan. Jika ada, tampilkan daftar buku
            outputElement.innerHTML = this.daftarBuku.length === 0 ? "<p>Belum ada buku dalam koleksi.</p>" :
                "<h2>Koleksi Buku:</h2>" + this.daftarBuku.map(buku => `
                    <div>
                        <span>00</span>${buku.id}. ${buku.getDeskripsiLengkap()}
                        <button onclick="managerBuku.tampilkanFormEditBuku(${buku.id})">Edit</button>
                        <button onclick="managerBuku.konfirmasiHapusBuku(${buku.id})">Hapus</button>
                    </div>
                `).join('');
        }
    }
    // Menghapus buku dari koleksi
    hapusBukuDariKoleksi(id) {
        this.daftarBuku = this.daftarBuku.filter(b => b.id !== id);
        this.aturNextId(); // Atur nextId setelah menghapus buku
        this.perbaruiTampilanDaftarBuku();
    }
    // Mencari buku berdasarkan ID
    cariBukuBerdasarkanId(id) {
        return this.daftarBuku.find(b => b.id === id);
    }
}
// Kelas ManagerBuku: Mengelola interaksi antara UI dan KoleksiBuku
class ManagerBuku {
    constructor(koleksiBuku) {
        this.idBukuYangSedangDiedit = null;
        this.koleksiBuku = koleksiBuku;
    }
    // Memproses input form untuk menambah atau memperbarui buku
    prosesFormBuku() {
        // Mengambil nilai dari form input
        const judul = document.getElementById('judul').value;
        const penulis = document.getElementById('penulis').value;
        const tahunTerbit = parseInt(document.getElementById('tahunTerbit').value);
        const jenisBuku = document.getElementById('jenisBuku').value;
        const detailSpesifik = document.getElementById('detailSpesifik').value;
        // Validasi input
        if (this.validasiInputBuku(judul, penulis, tahunTerbit, jenisBuku, detailSpesifik)) {
            if (this.idBukuYangSedangDiedit !== null) {
                // Update buku yang ada
                this.koleksiBuku.perbaruiInfoBuku(this.idBukuYangSedangDiedit, judul, penulis, tahunTerbit, jenisBuku, detailSpesifik);
                this.selesaiEditBuku();
            }
            else {
                // Tambah buku baru
                const bukuBaru = this.buatObjekBuku(judul, penulis, tahunTerbit, jenisBuku, detailSpesifik);
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
            this.isiFormDenganDataBuku(buku);
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
    // Validasi input form buku
    validasiInputBuku(judul, penulis, tahunTerbit, jenisBuku, detailSpesifik) {
        return !!(judul && penulis && !isNaN(tahunTerbit) && jenisBuku && detailSpesifik);
    }
    // Membuat objek buku baru berdasarkan input
    buatObjekBuku(judul, penulis, tahunTerbit, jenisBuku, detailSpesifik) {
        return jenisBuku === 'fiksi' ?
            new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik) :
            new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
    }
    // Mengisi form dengan data buku yang akan diedit
    isiFormDenganDataBuku(buku) {
        document.getElementById('judul').value = buku.judul;
        document.getElementById('penulis').value = buku.penulis;
        document.getElementById('tahunTerbit').value = buku.tahunTerbit.toString();
        document.getElementById('jenisBuku').value = buku instanceof BukuFiksi ? 'fiksi' : 'nonfiksi';
        document.getElementById('detailSpesifik').value = buku instanceof BukuFiksi ? buku.subGenre : buku.topik;
        document.getElementById('tambahBukuBtn').textContent = 'Update Buku';
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
const koleksiBukuSaya = new KoleksiBuku();
const managerBuku = new ManagerBuku(koleksiBukuSaya);
// Event listener untuk memastikan DOM telah dimuat sebelum menjalankan inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    managerBuku.inisialisasiAplikasi();
});
