# Product Requirements Document (PRD)

**Project:** Tamer Studio

**Version:** 1.0

**Status:** Draft Approved

---

# Executive Summary

Tamer Studio adalah AI Production Platform yang membantu creator menghasilkan konten berkualitas tinggi melalui workflow produksi yang terstruktur.

Pengguna tidak perlu memahami prompt engineering, model AI, atau workflow teknis yang kompleks.

Mereka cukup menyampaikan **Intent**, lalu Tamer Studio mengelola proses produksi dari awal hingga hasil akhir.

---

# Vision

Menjadi AI Production Operating System terbaik bagi creator.

---

# Mission

Menyederhanakan proses produksi konten menggunakan Artificial Intelligence sehingga creator dapat fokus pada kreativitas dan tujuan bisnis.

---

# Problem Statement

Saat ini creator harus:

* berpindah-pindah antar banyak AI tool,
* mengulang prompt berkali-kali,
* mengelola aset secara manual,
* kehilangan konsistensi karakter dan gaya visual,
* menghabiskan banyak waktu untuk pekerjaan teknis.

Tamer Studio hadir untuk menyatukan seluruh proses tersebut dalam satu platform.

---

# Target Users

## Primary

* Affiliate Marketer
* Content Creator
* TikTok Creator
* YouTube Creator

## Secondary

* Digital Agency
* Freelancer
* Small Business
* AI Content Team

---

# Product Scope (v1)

Tamer Studio v1 hanya memiliki dua workflow utama.

## Affiliate Production

Membuat konten promosi produk menggunakan AI.

Output dapat berupa:

* gambar,
* video,
* caption,
* thumbnail.

---

## Drama Production

Membuat serial atau cerita menggunakan karakter yang konsisten.

Output dapat berupa:

* storyboard,
* adegan,
* video,
* aset pendukung.

---

# Out of Scope (v1)

Fitur berikut tidak termasuk dalam versi pertama:

* Marketplace template publik
* Mobile application
* Desktop application
* Public API
* Team collaboration tingkat lanjut
* Multi-tenant enterprise

---

# Core Value Proposition

Tamer Studio menawarkan:

* satu workflow,
* satu dashboard,
* satu production engine,

untuk menghasilkan berbagai jenis konten AI.

---

# Success Metrics

Target awal:

* Production berhasil dibuat.
* Asset berhasil dihasilkan.
* Workflow mudah dipahami pengguna baru.
* Waktu produksi lebih singkat dibanding proses manual.
* Pengguna dapat mengulang produksi menggunakan Snapshot.

---

# Functional Modules

* Authentication
* Workspace
* Production
* Asset
* AI Gateway
* Wallet
* Payment
* Product
* Story
* Talent
* Admin

---

# Non-Functional Requirements

* Aman
* Cepat
* Modular
* Mudah dikembangkan
* Mudah diuji
* Mudah dipelihara

---

# Core Principles

* Intent First
* Production First
* Human in Control
* Context is King
* Everything Reproducible

---

# Product Roadmap

## Phase 1

Repository Foundation

## Phase 2

Database

## Phase 3

Authentication

## Phase 4

Production Engine

## Phase 5

AI Integration

## Phase 6

Wallet & Payment

## Phase 7

Public Release

---

# Definition of Success

Tamer Studio dianggap berhasil apabila seorang creator dapat membuat satu produksi lengkap dari Intent hingga hasil akhir tanpa harus memahami detail teknis AI maupun menulis prompt secara manual.
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