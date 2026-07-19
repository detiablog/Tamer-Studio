# Tamer Studio Ubiquitous Language

Version: 1.0

Status: Locked (v1)

---

# Purpose

Dokumen ini mendefinisikan bahasa yang digunakan di seluruh Tamer Studio.

Istilah yang ada di sini harus digunakan secara konsisten pada:

* UI
* Database
* API
* Dokumentasi
* Source Code
* AI Prompt
* GitHub Copilot Context

Satu istilah hanya memiliki satu arti.

---

# Workspace

## Definisi

Ruang kerja utama milik pengguna.

Workspace menjadi batas kepemilikan seluruh data.

## Contoh

* Tamer Store
* My Agency
* Personal Studio

---

# Project

## Definisi

Container untuk mengelompokkan Production berdasarkan tujuan bisnis.

## Contoh

* Pokémon GO Affiliate
* The Last Guardians
* Summer Campaign 2027

---

# Production

## Definisi

Blueprint yang mendefinisikan **apa** yang ingin dibuat.

Production bersifat jangka panjang.

Production tidak menghasilkan AI output secara langsung.

Production dapat dijalankan berkali-kali.

---

# Run

## Definisi

Satu kali eksekusi dari sebuah Production.

Run menyimpan seluruh proses dan hasil produksi.

Run bersifat immutable setelah selesai.

## Contoh

Production:

TikTok Affiliate

Run:

* Run #1
* Run #2
* Run #3

---

# Intent

## Definisi

Tujuan yang ditulis pengguna menggunakan bahasa alami.

Intent adalah input awal Production.

## Contoh

"Buat video affiliate Pokémon GO berdurasi 30 detik dengan gaya sinematik."

---

# Specification

## Definisi

Rencana produksi yang dihasilkan AI berdasarkan Intent.

Specification menjelaskan bagaimana Production akan dijalankan.

Specification harus disetujui pengguna sebelum Run dimulai.

---

# Task

## Definisi

Unit pekerjaan asynchronous di dalam sebuah Run.

Task dijalankan oleh AI Engine.

## Contoh

* Generate Image
* Generate Video
* Generate Subtitle
* Export

---

# Media

## Definisi

Semua file digital yang digunakan atau dihasilkan selama Production.

## Jenis

* Image
* Video
* Audio
* Subtitle
* Thumbnail
* ZIP
* Preview

Media menggantikan istilah "Asset" untuk menjaga domain tetap sederhana dan fleksibel.

---

# Event

## Definisi

Catatan fakta yang sudah terjadi di dalam sistem.

Event tidak boleh diubah atau dihapus.

## Contoh

* ProductionCreated
* RunStarted
* TaskCompleted
* MediaGenerated

---

# Snapshot

## Definisi

Salinan kondisi sebuah Run pada waktu tertentu.

Digunakan untuk:

* Restore
* Reproduce
* Audit

---

# Wallet

## Definisi

Saldo milik Workspace yang digunakan untuk membayar penggunaan sistem.

Wallet bukan metode pembayaran.

---

# Transaction

## Definisi

Perubahan saldo Wallet.

## Contoh

* Top Up
* Refund
* AI Usage
* Adjustment

---

# AI Provider

## Definisi

Plugin yang menyediakan kemampuan AI.

Contoh:

* OpenAI
* Google
* Anthropic
* Kling
* BytePlus

Provider tidak dipanggil langsung oleh fitur.

Semua akses melalui AI Gateway.

---

# Capability

## Definisi

Kemampuan yang disediakan AI Provider.

## Contoh

* Text Generation
* Image Generation
* Video Generation
* Voice Generation

Run memilih Capability.

Gateway menentukan Provider terbaik.

---

# Production Type

## Definisi

Jenis Production yang dipilih pengguna.

Pada v1:

* Affiliate
* Drama

Production Type menentukan pengalaman pengguna.

Bukan menentukan implementasi AI.

---

# AI Gateway

## Definisi

Lapisan yang memilih Provider AI berdasarkan Capability, biaya, ketersediaan, dan konfigurasi sistem.

---

# Golden Rules

1. Production adalah Blueprint.
2. Run adalah eksekusi.
3. Task adalah pekerjaan.
4. Media adalah hasil digital.
5. Event adalah fakta.
6. Specification adalah rencana.
7. Intent adalah tujuan pengguna.
8. Workspace adalah pemilik seluruh data.

---

# Reserved Terms

Istilah berikut tidak boleh digunakan sebagai sinonim:

* Project ≠ Production
* Production ≠ Run
* Run ≠ Task
* Task ≠ Media
* Media ≠ File
* Wallet ≠ Payment
* Event ≠ Log

Gunakan istilah sesuai definisi pada dokumen ini.
