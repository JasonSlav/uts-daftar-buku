// Kelas abstrak Buku: Mendefinisikan struktur dasar untuk semua jenis buku
abstract class Buku {
    // Variabel statis untuk menghasilkan ID unik, dimulai dari 1
    public static nextId: number = 1;
    // Properti private untuk menyimpan data buku
    private _id: number;
    private _judul: string;
    private _penulis: string;
    private _tahunTerbit: number;

    // Konstruktor untuk inisialisasi objek Buku
    constructor(judul: string, penulis: string, tahunTerbit: number) {
        // Mengatur ID buku dan menaikkan nextId untuk buku berikutnya
        this._id = Buku.nextId++;
        this._judul = judul;
        this._penulis = penulis;
        this._tahunTerbit = tahunTerbit;
    }

    // Getter dan setter untuk properti buku
    // Getter: Metode untuk mengakses nilai properti private
    // Setter: Metode untuk mengubah nilai properti private
    get id(): number { return this._id; }
    get judul(): string { return this._judul; }
    set judul(value: string) { this._judul = value; }
    get penulis(): string { return this._penulis; }
    set penulis(value: string) { this._penulis = value; }
    get tahunTerbit(): number { return this._tahunTerbit; }
    set tahunTerbit(value: number) { this._tahunTerbit = value; }

    // Metode abstrak yang harus diimplementasikan oleh kelas turunan
    protected abstract getDeskripsiGenre(): string;
    
    // Metode untuk mendapatkan deskripsi lengkap buku
    public getDeskripsiLengkap(): string {
        return `${this._judul} oleh ${this._penulis} (${this._tahunTerbit}) - ${this.getDeskripsiGenre()}`;
    }
}

// Kelas BukuFiksi: Turunan dari Buku untuk buku-buku fiksi
class BukuFiksi extends Buku {
    private _subGenre: string;

    // Konstruktor BukuFiksi memanggil konstruktor Buku (super) dan menambahkan subGenre
    constructor(judul: string, penulis: string, tahunTerbit: number, subGenre: string) {
        super(judul, penulis, tahunTerbit);
        this._subGenre = subGenre;
    }

    // Getter dan setter untuk subGenre
    get subGenre(): string { return this._subGenre; }
    set subGenre(value: string) { this._subGenre = value; }

    // Implementasi getDeskripsiGenre untuk buku fiksi
    protected getDeskripsiGenre(): string {
        return `Fiksi - ${this._subGenre}`;
    }
}

// Kelas BukuNonFiksi: Turunan dari Buku untuk buku-buku non-fiksi
class BukuNonFiksi extends Buku {
    private _topik: string;

    // Konstruktor BukuNonFiksi memanggil konstruktor Buku (super) dan menambahkan topik
    constructor(judul: string, penulis: string, tahunTerbit: number, topik: string) {
        super(judul, penulis, tahunTerbit);
        this._topik = topik;
    }

    // Getter dan setter untuk topik
    get topik(): string { return this._topik; }
    set topik(value: string) { this._topik = value; }

    // Implementasi getDeskripsiGenre untuk buku non-fiksi
    protected getDeskripsiGenre(): string {
        return `Non-Fiksi - ${this._topik}`;
    }
}

// Kelas KoleksiBuku: Mengelola koleksi buku dan operasi terkait
class KoleksiBuku {
    // Array untuk menyimpan semua buku dalam koleksi
    private daftarBuku: Buku[] = [];

    // Tambahkan metode baru untuk mengatur nextId
    private aturNextId(): void {
        if (this.daftarBuku.length > 0) {
            const maxId = Math.max(...this.daftarBuku.map(buku => buku.id));
            Buku.nextId = maxId + 1;
        } else {
            Buku.nextId = 1;
        }
    }

    // Menambahkan buku baru ke koleksi
    public tambahBukuKeKoleksi(buku: Buku): void {
        this.daftarBuku.push(buku);
        this.aturNextId(); // Atur nextId setelah menambah buku
        this.perbaruiTampilanDaftarBuku();
    }

    // Memperbarui informasi buku yang sudah ada
    public perbaruiInfoBuku(id: number, judul: string, penulis: string, tahunTerbit: number, jenisBuku: string, detailSpesifik: string): void {
        const bukuLama = this.cariBukuBerdasarkanId(id);
        if (bukuLama) {
            let bukuBaru: Buku;
            if (jenisBuku === 'fiksi') {
                bukuBaru = new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik);
            } else {
                bukuBaru = new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
            }
            // Mempertahankan ID buku yang lama
            (bukuBaru as any)._id = id;
            // Mengganti buku lama dengan buku baru dalam array
            const index = this.daftarBuku.findIndex(b => b.id === id);
            if (index !== -1) {
                this.daftarBuku[index] = bukuBaru;
            }
            this.perbaruiTampilanDaftarBuku();
        }
    }

    // Memperbarui tampilan daftar buku di UI
    public perbaruiTampilanDaftarBuku(): void {
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
    public hapusBukuDariKoleksi(id: number): void {
        this.daftarBuku = this.daftarBuku.filter(b => b.id !== id);
        this.aturNextId(); // Atur nextId setelah menghapus buku
        this.perbaruiTampilanDaftarBuku();
    }
    
    // Mencari buku berdasarkan ID
    public cariBukuBerdasarkanId(id: number): Buku | undefined {
        return this.daftarBuku.find(b => b.id === id);
    }
}

// Kelas ManagerBuku: Mengelola interaksi antara UI dan KoleksiBuku
class ManagerBuku {
    private koleksiBuku: KoleksiBuku;
    private idBukuYangSedangDiedit: number | null = null;

    constructor(koleksiBuku: KoleksiBuku) {
        this.koleksiBuku = koleksiBuku;
    }

    // Memproses input form untuk menambah atau memperbarui buku
    public prosesFormBuku(): void {
        // Mengambil nilai dari form input
        const judul = (document.getElementById('judul') as HTMLInputElement).value;
        const penulis = (document.getElementById('penulis') as HTMLInputElement).value;
        const tahunTerbit = parseInt((document.getElementById('tahunTerbit') as HTMLInputElement).value);
        const jenisBuku = (document.getElementById('jenisBuku') as HTMLSelectElement).value;
        const detailSpesifik = (document.getElementById('detailSpesifik') as HTMLInputElement).value;

        // Validasi input
        if (this.validasiInputBuku(judul, penulis, tahunTerbit, jenisBuku, detailSpesifik)) {
            if (this.idBukuYangSedangDiedit !== null) {
                // Update buku yang ada
                this.koleksiBuku.perbaruiInfoBuku(this.idBukuYangSedangDiedit, judul, penulis, tahunTerbit, jenisBuku, detailSpesifik);
                this.selesaiEditBuku();
            } else {
                // Tambah buku baru
                const bukuBaru = this.buatObjekBuku(judul, penulis, tahunTerbit, jenisBuku, detailSpesifik);
                this.koleksiBuku.tambahBukuKeKoleksi(bukuBaru);
            }
            this.bersihkanFormBuku();
        } else {
            alert("Mohon isi semua field dengan benar.");
        }
    }

    // Menampilkan form edit untuk buku tertentu
    public tampilkanFormEditBuku(id: number): void {
        const buku = this.koleksiBuku.cariBukuBerdasarkanId(id);
        if (buku) {
            this.isiFormDenganDataBuku(buku);
            this.idBukuYangSedangDiedit = id;
        }
    }

    // Konfirmasi dan proses penghapusan buku
    public konfirmasiHapusBuku(id: number): void {
        if (confirm("Apakah Anda yakin ingin menghapus buku ini dari koleksi?")) {
            this.koleksiBuku.hapusBukuDariKoleksi(id);
        }
    }

    // Inisialisasi aplikasi: set up event listener dan tampilkan daftar buku awal
    public inisialisasiAplikasi(): void {
        const tambahBukuBtn = document.getElementById('tambahBukuBtn');
        if (tambahBukuBtn) {
            tambahBukuBtn.addEventListener('click', () => this.prosesFormBuku());
        } else {
            console.error("Tombol 'Tambah Buku' tidak ditemukan.");
        }
        this.koleksiBuku.perbaruiTampilanDaftarBuku();
    }

    // Validasi input form buku
    private validasiInputBuku(judul: string, penulis: string, tahunTerbit: number, jenisBuku: string, detailSpesifik: string): boolean {
        return !!(judul && penulis && !isNaN(tahunTerbit) && jenisBuku && detailSpesifik);
    }

    // Membuat objek buku baru berdasarkan input
    private buatObjekBuku(judul: string, penulis: string, tahunTerbit: number, jenisBuku: string, detailSpesifik: string): Buku {
        return jenisBuku === 'fiksi' ?
            new BukuFiksi(judul, penulis, tahunTerbit, detailSpesifik) :
            new BukuNonFiksi(judul, penulis, tahunTerbit, detailSpesifik);
    }

    // Mengisi form dengan data buku yang akan diedit
    private isiFormDenganDataBuku(buku: Buku): void {
        (document.getElementById('judul') as HTMLInputElement).value = buku.judul;
        (document.getElementById('penulis') as HTMLInputElement).value = buku.penulis;
        (document.getElementById('tahunTerbit') as HTMLInputElement).value = buku.tahunTerbit.toString();
        (document.getElementById('jenisBuku') as HTMLSelectElement).value = buku instanceof BukuFiksi ? 'fiksi' : 'nonfiksi';
        (document.getElementById('detailSpesifik') as HTMLInputElement).value = buku instanceof BukuFiksi ? buku.subGenre : (buku as BukuNonFiksi).topik;
        
        (document.getElementById('tambahBukuBtn') as HTMLButtonElement).textContent = 'Update Buku';
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
const koleksiBukuSaya = new KoleksiBuku();
const managerBuku = new ManagerBuku(koleksiBukuSaya);

// Event listener untuk memastikan DOM telah dimuat sebelum menjalankan inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    managerBuku.inisialisasiAplikasi();
});
