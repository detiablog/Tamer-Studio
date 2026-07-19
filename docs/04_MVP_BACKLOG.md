# Tamer Studio MVP Backlog

Version: 1.0

Status: Active

---

# Goal

Membangun Tamer Studio MVP yang dapat digunakan oleh creator untuk menghasilkan konten AI dari **Intent → Production → Export**.

---

# MVP Release Criteria

MVP dinyatakan selesai jika pengguna dapat:

* Login.
* Membuat Workspace.
* Membuat Project.
* Membuat Production.
* Memilih Production Type.
* Menulis Intent.
* Menjalankan Production.
* Melihat hasil Asset.
* Mengekspor hasil.

---

# Epic 1 — Foundation

Priority: Critical

* [ ] Inisialisasi Next.js
* [ ] Konfigurasi TypeScript
* [ ] Konfigurasi Tailwind CSS
* [ ] Konfigurasi ESLint
* [ ] Konfigurasi Prettier
* [ ] Konfigurasi Husky
* [ ] GitHub Actions (CI)
* [ ] Environment Configuration

Definition of Done:

* Repository dapat dijalankan oleh developer baru dalam satu perintah instalasi.

---

# Epic 2 — Authentication

Priority: Critical

* [ ] Login
* [ ] Register
* [ ] Logout
* [ ] Session Management
* [ ] Protected Routes

Definition of Done:

* Pengguna dapat masuk dan keluar dengan aman.

---

# Epic 3 — Workspace

Priority: Critical

* [ ] Create Workspace
* [ ] Update Workspace
* [ ] Delete Workspace
* [ ] Workspace Settings

Definition of Done:

* Pengguna memiliki Workspace aktif.

---

# Epic 4 — Project

Priority: Critical

* [ ] Create Project
* [ ] Rename Project
* [ ] Archive Project
* [ ] Delete Project

Definition of Done:

* Satu Workspace dapat memiliki banyak Project.

---

# Epic 5 — Production

Priority: Critical

* [ ] Create Production
* [ ] Production Type
* [ ] Intent Input
* [ ] AI Specification
* [ ] Production Status
* [ ] Production Detail

Definition of Done:

* Pengguna dapat membuat satu Production lengkap.

---

# Epic 6 — AI Engine

Priority: Critical

* [ ] AI Gateway
* [ ] Provider Adapter
* [ ] Context Builder
* [ ] Prompt Builder
* [ ] Task Runner

Definition of Done:

* Production dapat menghasilkan Task AI.

---

# Epic 7 — Asset

Priority: High

* [ ] Asset Library
* [ ] Image Preview
* [ ] Video Preview
* [ ] Download
* [ ] Delete Asset

Definition of Done:

* Semua hasil Production dapat dikelola.

---

# Epic 8 — Export

Priority: High

* [ ] Export MP4
* [ ] Export PNG
* [ ] Export ZIP

Definition of Done:

* Pengguna dapat mengunduh hasil produksi.

---

# Epic 9 — Wallet & Payment

Priority: Medium

* [ ] Wallet
* [ ] Top Up
* [ ] Transaction History
* [ ] iPaymu Integration

Definition of Done:

* Pengguna dapat mengisi saldo dan menggunakannya untuk produksi.

---

# Epic 10 — Admin

Priority: Medium

* [ ] Dashboard
* [ ] AI Provider Settings
* [ ] Feature Flags
* [ ] System Logs

Definition of Done:

* Administrator dapat mengelola sistem.

---

# MVP Rules

1. Selesaikan Epic berdasarkan urutan prioritas.
2. Jangan memulai Epic baru sebelum Epic sebelumnya memenuhi Definition of Done.
3. Setiap Epic harus menghasilkan fitur yang dapat diuji.
4. Semua fitur harus memiliki dokumentasi singkat dan pengujian dasar.

---

# Sprint 1 Target

* Foundation
* Authentication
* Workspace

Target akhir Sprint 1:

Pengguna dapat login dan memiliki Workspace yang siap digunakan.

---

# Sprint 2 Target

* Project
* Production

Target akhir Sprint 2:

Pengguna dapat membuat Project dan Production pertama.

---

# Sprint 3 Target

* AI Engine
* Asset
* Export

Target akhir Sprint 3:

Pengguna dapat menghasilkan dan mengunduh aset AI pertama.

---

# Sprint 4 Target

* Wallet
* Payment
* Admin

Target akhir Sprint 4:

Tamer Studio siap diuji oleh pengguna awal (closed beta).