// Kelas abstrak Buku: Kerangka dasar untuk semua buku
// 'abstract' berarti kelas ini tidak bisa diinstansiasi langsung, hanya bisa diwariskan
abstract class Buku {
    // 'static' berarti variabel ini milik kelas, bukan instance
    // '_nextId' adalah counter untuk menghasilkan ID unik
    private static _nextId = 1;

    // Constructor: metode yang dipanggil saat objek dibuat
    constructor(
        // 'private' berarti _id hanya bisa diakses di dalam kelas ini
        // '= Buku._nextId++' adalah nilai default yang akan increment setiap kali digunakan
        private _id: number = Buku._nextId++,
        // 'public' berarti properti ini bisa diakses dari luar kelas
        public judul: string, 
        // string[] menandakan array of strings
        public penulis: string[], 
        public tahunTerbit: number
    ) {}

    // 'get' adalah accessor method, memungkinkan akses read-only ke _id
    get id() { return this._id; }

    // Metode abstrak: harus diimplementasikan oleh kelas turunan
    abstract getDeskripsiGenre(): string;

    // Metode untuk mendapatkan deskripsi lengkap buku
    getDeskripsiLengkap() {
        // Template literal (``) memungkinkan interpolasi string
        // join(', ') menggabungkan array penulis menjadi string
        return `${this.judul} oleh ${this.penulis.join(', ')} (${this.tahunTerbit}) - ${this.getDeskripsiGenre()}`;
    }
}

// Kelas BukuFiksi: Turunan dari Buku
// 'extends' menandakan pewarisan dari kelas Buku
class BukuFiksi extends Buku {
    // Constructor dengan parameter tambahan 'subGenre'
    constructor(judul: string, penulis: string[], tahunTerbit: number, public subGenre: string) {
        // 'super' memanggil constructor dari kelas induk (Buku)
        super(undefined, judul, penulis, tahunTerbit);
    }
    // Override metode abstrak dari kelas induk
    getDeskripsiGenre() { return `Fiksi - ${this.subGenre}`; }
}

// Kelas BukuNonFiksi: Turunan dari Buku
class BukuNonFiksi extends Buku {
    constructor(judul: string, penulis: string[], tahunTerbit: number, public topik: string) {
        super(undefined, judul, penulis, tahunTerbit);
    }
    getDeskripsiGenre() { return `Non-Fiksi - ${this.topik}`; }
}

// KoleksiBuku: Mengelola koleksi dan operasi buku
class KoleksiBuku {
    // Array untuk menyimpan buku-buku
    private _daftarBuku: Buku[] = [];

    // Menambah buku baru ke koleksi
    tambahBuku(buku: Buku) {
        this._daftarBuku.push(buku);
        this.tampilkanBuku();
    }

    // Memperbarui informasi buku berdasarkan ID
    perbaruiBuku(id: number, judul: string, penulis: string[], tahunTerbit: number, jenis: string, detail: string) {
        // findIndex mencari index buku dengan id yang sesuai
        const index = this._daftarBuku.findIndex(b => b.id === id);
        if (index !== -1) {
            let bukuBaru: Buku;
            if (jenis === 'fiksi') {
                bukuBaru = new BukuFiksi(judul, penulis, tahunTerbit, detail);
            } else {
                bukuBaru = new BukuNonFiksi(judul, penulis, tahunTerbit, detail);
            }
            // 'as any' adalah type assertion untuk mengakses properti private
            (bukuBaru as any)._id = id;
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
    hapusBuku(id: number) {
        // filter membuat array baru tanpa buku dengan id yang dihapus
        this._daftarBuku = this._daftarBuku.filter(b => b.id !== id);
        this.tampilkanBuku();
    }

    // Cari buku berdasarkan ID
    cariBuku(id: number) {
        // find mengembalikan buku pertama yang memenuhi kondisi
        return this._daftarBuku.find(b => b.id === id);
    }
}

// ManagerBuku: Menghubungkan UI dengan KoleksiBuku
class ManagerBuku {
    // Menyimpan ID buku yang sedang diedit
    private _idSedangDiedit: number | null = null;

    constructor(private _koleksi: KoleksiBuku) {}

    // Memproses form tambah atau edit buku
    prosesForm() {
        // Mengambil nilai dari input form
        const judul = (document.getElementById('judul') as HTMLInputElement).value.trim();
        const penulis = (document.getElementById('penulis') as HTMLInputElement).value.trim();
        const tahunTerbit = parseInt((document.getElementById('tahunTerbit') as HTMLInputElement).value);
        const jenis = (document.getElementById('jenisBuku') as HTMLSelectElement).value;
        const detail = (document.getElementById('detailSpesifik') as HTMLInputElement).value.trim();

        if (judul && penulis && !isNaN(tahunTerbit) && detail) {
            // Memisahkan penulis menjadi array
            const penulisList = penulis.split(',').map(p => p.trim());
            if (this._idSedangDiedit !== null) {
                // Update buku yang ada
                this._koleksi.perbaruiBuku(this._idSedangDiedit, judul, penulisList, tahunTerbit, jenis, detail);
                this.selesaiEdit();
            } else {
                // Tambah buku baru
                let buku: Buku;
                if (jenis === 'fiksi') {
                    buku = new BukuFiksi(judul, penulisList, tahunTerbit, detail);
                } else {
                    buku = new BukuNonFiksi(judul, penulisList, tahunTerbit, detail);
                }
                this._koleksi.tambahBuku(buku);
            }
            this.bersihkanForm();
        } else {
            alert("Mohon isi semua field dengan benar.");
        }
    }

    // Tampilkan form edit untuk buku tertentu
    tampilkanForm(id: number) {
        const buku = this._koleksi.cariBuku(id);
        if (buku) {
            // Mengisi form dengan data buku yang akan diedit
            (document.getElementById('judul') as HTMLInputElement).value = buku.judul;
            (document.getElementById('penulis') as HTMLInputElement).value = buku.penulis.join(', ');
            (document.getElementById('tahunTerbit') as HTMLInputElement).value = buku.tahunTerbit.toString();
            (document.getElementById('jenisBuku') as HTMLSelectElement).value = buku instanceof BukuFiksi ? 'fiksi' : 'nonfiksi';
            (document.getElementById('detailSpesifik') as HTMLInputElement).value = buku instanceof BukuFiksi ? buku.subGenre : (buku as BukuNonFiksi).topik;
            this._idSedangDiedit = id;
            (document.getElementById('tambahBukuBtn') as HTMLButtonElement).textContent = 'Update Buku';
        }
    }

    // Hapus buku dari koleksi
    hapusBuku(id: number) {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
            this._koleksi.hapusBuku(id);
        }
    }

    // Bersihkan form setelah operasi
    bersihkanForm() {
        // Mengosongkan semua input form
        ['judul', 'penulis', 'tahunTerbit', 'detailSpesifik'].forEach(id => 
            (document.getElementById(id) as HTMLInputElement).value = ''
        );
        (document.getElementById('jenisBuku') as HTMLSelectElement).selectedIndex = 0;
        this._idSedangDiedit = null;
        (document.getElementById('tambahBukuBtn') as HTMLButtonElement).textContent = 'Tambah Buku';
    }

    // Selesai edit buku
    selesaiEdit() {
        this._idSedangDiedit = null;
        (document.getElementById('tambahBukuBtn') as HTMLButtonElement).textContent = 'Tambah Buku';
    }

    // Inisialisasi aplikasi
    inisialisasi() {
        const tambahBukuBtn = document.getElementById('tambahBukuBtn');
        if (tambahBukuBtn) {
            // Menambahkan event listener untuk tombol tambah buku
            tambahBukuBtn.addEventListener('click', () => this.prosesForm());
        } else {
            console.error("Tombol 'Tambah Buku' tidak ditemukan.");
        }
        this._koleksi.tampilkanBuku();
    }
}

// Inisialisasi aplikasi
const manager = new ManagerBuku(new KoleksiBuku());
// Event listener untuk memastikan DOM telah dimuat sebelum inisialisasi
document.addEventListener('DOMContentLoaded', () => manager.inisialisasi());
