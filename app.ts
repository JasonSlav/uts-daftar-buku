// Kelas abstrak Buku: Mendefinisikan struktur dasar untuk semua jenis buku
// Abstraksi: Kelas ini menyediakan kerangka umum untuk semua jenis buku
abstract class Buku {
    // Variabel statis untuk menghasilkan ID unik, dimulai dari 1
    // Enkapsulasi: nextId adalah private dan hanya diakses melalui konstruktor
    private static nextId = 1;

    // Konstruktor: Inisialisasi properti buku
    // Enkapsulasi: _id adalah private, sementara properti lain adalah public
    constructor(
        private _id: number = Buku.nextId++,
        public judul: string,
        public penulis: string,
        public tahunTerbit: number
    ) {}

    // Getter untuk id: Memungkinkan akses read-only ke _id
    get id(): number { return this._id; }

    // Metode abstrak: Harus diimplementasikan oleh kelas turunan
    // Polimorfisme: Setiap jenis buku akan memiliki implementasi sendiri
    abstract getDeskripsiGenre(): string;

    // Metode untuk mendapatkan deskripsi lengkap buku
    getDeskripsiLengkap(): string {
        return `${this.judul} oleh ${this.penulis} (${this.tahunTerbit}) - ${this.getDeskripsiGenre()}`;
    }
}

// Kelas BukuFiksi: Turunan dari Buku untuk buku-buku fiksi
// Pewarisan: BukuFiksi mewarisi properti dan metode dari Buku
class BukuFiksi extends Buku {
    // Konstruktor BukuFiksi
    constructor(judul: string, penulis: string, tahunTerbit: number, public subGenre: string) {
        // super: Memanggil konstruktor kelas induk (Buku)
        super(undefined, judul, penulis, tahunTerbit);
    }

    // Implementasi metode abstrak dari kelas Buku
    // Polimorfisme: Implementasi spesifik untuk BukuFiksi
    getDeskripsiGenre(): string { return `Fiksi - ${this.subGenre}`; }
}

// Kelas BukuNonFiksi: Turunan dari Buku untuk buku-buku non-fiksi
// Pewarisan: BukuNonFiksi mewarisi properti dan metode dari Buku
class BukuNonFiksi extends Buku {
    // Konstruktor BukuNonFiksi
    constructor(judul: string, penulis: string, tahunTerbit: number, public topik: string) {
        // super: Memanggil konstruktor kelas induk (Buku)
        super(undefined, judul, penulis, tahunTerbit);
    }

    // Implementasi metode abstrak dari kelas Buku
    // Polimorfisme: Implementasi spesifik untuk BukuNonFiksi
    getDeskripsiGenre(): string { return `Non-Fiksi - ${this.topik}`; }
}

// Kelas KoleksiBuku: Mengelola koleksi buku dan operasi terkait
// Enkapsulasi: Menyembunyikan detail implementasi dan menyediakan antarmuka publik
class KoleksiBuku {
    // Array private untuk menyimpan semua buku dalam koleksi
    private daftarBuku: Buku[] = [];

    // Menambahkan buku baru ke koleksi
    tambahBukuKeKoleksi(buku: Buku): void {
        this.daftarBuku.push(buku);
        this.perbaruiTampilanDaftarBuku();
    }

    // Memperbarui informasi buku yang sudah ada
    perbaruiInfoBuku(id: number, judul: string, penulis: string, tahunTerbit: number, jenisBuku: string, detailSpesifik: string): void {
        const index = this.daftarBuku.findIndex(b => b.id === id);
        if (index !== -1) {
            // Polimorfisme: Membuat objek BukuFiksi atau BukuNonFiksi berdasarkan jenis
            this.daftarBuku[index] = jenisBuku === 'fiksi' 
                ? new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik)
                : new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
            (this.daftarBuku[index] as any)._id = id;
            this.perbaruiTampilanDaftarBuku();
        }
    }

    // Memperbarui tampilan daftar buku di UI
    perbaruiTampilanDaftarBuku(): void {
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
    hapusBukuDariKoleksi(id: number): void {
        this.daftarBuku = this.daftarBuku.filter(b => b.id !== id);
        this.perbaruiTampilanDaftarBuku();
    }

    // Mencari buku berdasarkan ID
    cariBukuBerdasarkanId(id: number): Buku | undefined {
        return this.daftarBuku.find(b => b.id === id);
    }
}

// Kelas ManagerBuku: Mengelola interaksi antara UI dan KoleksiBuku
// Enkapsulasi: Menyembunyikan logika manajemen buku dari kode lain
class ManagerBuku {
    private idBukuYangSedangDiedit: number | null = null;

    constructor(private koleksiBuku: KoleksiBuku) {}

    // Memproses input form untuk menambah atau memperbarui buku
    prosesFormBuku(): void {
        const judul = (document.getElementById('judul') as HTMLInputElement).value;
        const penulis = (document.getElementById('penulis') as HTMLInputElement).value;
        const tahunTerbit = parseInt((document.getElementById('tahunTerbit') as HTMLInputElement).value);
        const jenisBuku = (document.getElementById('jenisBuku') as HTMLSelectElement).value;
        const detailSpesifik = (document.getElementById('detailSpesifik') as HTMLInputElement).value;

        if (judul && penulis && !isNaN(tahunTerbit) && jenisBuku && detailSpesifik) {
            if (this.idBukuYangSedangDiedit !== null) {
                // Update buku yang ada
                this.koleksiBuku.perbaruiInfoBuku(this.idBukuYangSedangDiedit, judul, penulis, tahunTerbit, jenisBuku, detailSpesifik);
                this.selesaiEditBuku();
            } else {
                // Tambah buku baru
                // Polimorfisme: Membuat objek BukuFiksi atau BukuNonFiksi berdasarkan input
                const bukuBaru = jenisBuku === 'fiksi'
                    ? new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik)
                    : new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
                this.koleksiBuku.tambahBukuKeKoleksi(bukuBaru);
            }
            this.bersihkanFormBuku();
        } else {
            alert("Mohon isi semua field dengan benar.");
        }
    }

    // Menampilkan form edit untuk buku tertentu
    tampilkanFormEditBuku(id: number): void {
        const buku = this.koleksiBuku.cariBukuBerdasarkanId(id);
        if (buku) {
            ['judul', 'penulis', 'tahunTerbit'].forEach(prop => 
                (document.getElementById(prop) as HTMLInputElement).value = buku[prop as keyof Buku].toString()
            );
            (document.getElementById('jenisBuku') as HTMLSelectElement).value = buku instanceof BukuFiksi ? 'fiksi' : 'nonfiksi';
            (document.getElementById('detailSpesifik') as HTMLInputElement).value = buku instanceof BukuFiksi ? buku.subGenre : (buku as BukuNonFiksi).topik;
            (document.getElementById('tambahBukuBtn') as HTMLButtonElement).textContent = 'Update Buku';
            this.idBukuYangSedangDiedit = id;
        }
    }

    // Konfirmasi dan proses penghapusan buku
    konfirmasiHapusBuku(id: number): void {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini dari koleksi?")) {
            this.koleksiBuku.hapusBukuDariKoleksi(id);
        }
    }

    // Inisialisasi aplikasi: set up event listener dan tampilkan daftar buku awal
    inisialisasiAplikasi(): void {
        const tambahBukuBtn = document.getElementById('tambahBukuBtn');
        if (tambahBukuBtn) {
            tambahBukuBtn.addEventListener('click', () => this.prosesFormBuku());
        } else {
            console.error("Tombol 'Tambah Buku' tidak ditemukan.");
        }
        this.koleksiBuku.perbaruiTampilanDaftarBuku();
    }

    // Menyelesaikan proses edit buku
    private selesaiEditBuku(): void {
        this.idBukuYangSedangDiedit = null;
        (document.getElementById('tambahBukuBtn') as HTMLButtonElement).textContent = 'Tambah Buku';
    }

    // Membersihkan form setelah menambah atau mengedit buku
    private bersihkanFormBuku(): void {
        ['judul', 'penulis', 'tahunTerbit', 'detailSpesifik'].forEach(id => 
            (document.getElementById(id) as HTMLInputElement).value = ''
        );
        (document.getElementById('jenisBuku') as HTMLSelectElement).selectedIndex = 0;
    }
}

// Inisialisasi aplikasi
const managerBuku = new ManagerBuku(new KoleksiBuku());
document.addEventListener('DOMContentLoaded', () => managerBuku.inisialisasiAplikasi());
