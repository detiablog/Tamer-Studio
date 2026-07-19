# User Journey

Version: 1.0

Status: Approved

---

# Purpose

Dokumen ini mendefinisikan perjalanan pengguna dari pertama kali masuk ke Tamer Studio hingga berhasil menghasilkan sebuah produksi.

Semua desain UI, API, dan workflow harus mengikuti perjalanan ini.

---

# Primary User Flow

```text
Login
↓

Create Workspace
↓

Create Project
↓

Create Production
↓

Choose Workflow

↓

Fill Intent

↓

AI Generates Specification

↓

Review Specification

↓

Run Production

↓

AI Executes Tasks

↓

Review Assets

↓

Export Result
```

---

# Step 1 — Login

Tujuan:

Mengautentikasi pengguna.

Output:

* User Session aktif.
* Workspace terakhir dipilih secara otomatis (jika ada).

---

# Step 2 — Create Workspace

Jika pengguna baru.

Pengguna membuat Workspace pertama.

Contoh:

* Tamer Store
* My Agency
* Personal Studio

Output:

Workspace aktif.

---

# Step 3 — Create Project

Project digunakan untuk mengelompokkan produksi.

Contoh:

* Pokémon GO Affiliate
* The Last Guardians
* Shopee Campaign

Output:

Project aktif.

---

# Step 4 — Create Production

Pengguna membuat satu pekerjaan baru.

Contoh:

* Video TikTok #001
* Episode 01
* Product Showcase

Output:

Production dibuat.

Status:

Draft

---

# Step 5 — Choose Workflow

Pilihan pada v1:

* Affiliate Production
* Drama Production

Workflow menentukan proses berikutnya.

---

# Step 6 — Fill Intent

Pengguna menjelaskan tujuan.

Contoh:

"Membuat video affiliate Pokémon GO berdurasi 30 detik dengan gaya sinematik."

Pengguna tidak perlu menulis prompt AI.

---

# Step 7 — AI Generates Specification

AI menerjemahkan Intent menjadi Specification.

Specification dapat berisi:

* Objective
* Audience
* Visual Style
* Format
* Duration
* Required Assets

Pengguna dapat mengedit Specification sebelum produksi dimulai.

---

# Step 8 — Review Specification

Pengguna meninjau hasil interpretasi AI.

Pilihan:

* Approve
* Edit
* Regenerate

Tidak ada Task yang dijalankan sebelum Specification disetujui.

---

# Step 9 — Run Production

Setelah disetujui.

Production berubah menjadi:

Running

AI mulai membuat Task.

---

# Step 10 — AI Executes Tasks

Contoh Task:

* Generate Character
* Generate Image
* Generate Video
* Generate Voice
* Generate Subtitle

Setiap Task memiliki status sendiri.

---

# Step 11 — Review Assets

Semua hasil produksi dikumpulkan dalam Asset Library.

Pengguna dapat:

* Preview
* Download
* Regenerate
* Delete
* Approve

---

# Step 12 — Export

Pengguna memilih format ekspor.

Contoh:

* MP4
* PNG
* ZIP
* Project Package

Production berubah menjadi:

Completed

---

# Production Status

Draft

↓

Specification Ready

↓

Running

↓

Review

↓

Completed

↓

Archived

---

# Error Flow

Jika Task gagal:

Running

↓

Failed Task

↓

Retry

↓

Continue Production

Seluruh proses tidak perlu dimulai dari awal.

---

# UX Principles

* Satu langkah, satu tujuan.
* Jangan menampilkan opsi yang belum relevan.
* Selalu tampilkan progres produksi.
* Pengguna harus mengetahui status Production setiap saat.
* Semua aksi penting harus dapat dibatalkan atau diulang jika memungkinkan.

---

# Success Criteria

Perjalanan pengguna dianggap berhasil apabila:

* Pengguna dapat membuat Production tanpa memahami AI.
* Pengguna dapat menyelesaikan produksi dari Intent hingga Export.
* Workflow tetap sederhana meskipun proses internal kompleks.

---

# Golden Rule

User berbicara tentang tujuan.

AI mengurus proses.

Tamer Studio menyembunyikan kompleksitas teknis di balik pengalaman yang sederhana.
