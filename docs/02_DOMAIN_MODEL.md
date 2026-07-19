# Domain Model

Version: 1.0

Status: Approved

---

# Purpose

Dokumen ini mendefinisikan seluruh domain bisnis Tamer Studio.

Semua desain database, API, UI, dan implementasi harus mengacu pada model domain ini.

---

# Domain Hierarchy

```text
Workspace
│
├── Project
│   │
│   ├── Production
│   │   │
│   │   ├── Specification
│   │   ├── Task
│   │   ├── Asset
│   │   ├── Event
│   │   └── Snapshot
│   │
│   └── Production
│
├── Wallet
│
├── Settings
│
└── Members (Future)
```

---

# Workspace

Workspace adalah ruang kerja utama.

Workspace memiliki:

* Projects
* Wallet
* Settings

Workspace menjadi batas kepemilikan seluruh data.

---

# Project

Project adalah wadah pekerjaan jangka panjang.

Contoh:

* Brand
* Campaign
* Drama Series
* Client

Project memiliki banyak Production.

---

# Production

Production adalah satu proses produksi.

Production memiliki:

* Intent
* Specification
* Tasks
* Assets
* Events
* Snapshots

Production merupakan pusat workflow.

---

# Specification

Specification adalah hasil interpretasi Intent.

Specification menjelaskan bagaimana AI akan bekerja.

Specification bersifat versionable.

---

# Task

Task adalah pekerjaan asynchronous.

Contoh:

* Generate Image
* Generate Video
* Generate Voice
* Export
* Compress

Task mempunyai status sendiri.

---

# Asset

Asset adalah hasil produksi.

Jenis Asset:

* Image
* Video
* Audio
* Subtitle
* Thumbnail
* Caption
* Storyboard

---

# Event

Event mencatat seluruh aktivitas penting.

Contoh:

* Production Created
* Task Completed
* Asset Generated
* Export Finished

Event digunakan sebagai audit log dan timeline.

---

# Snapshot

Snapshot menyimpan kondisi Production pada waktu tertentu.

Snapshot digunakan untuk:

* Restore
* Reproduce
* Compare

---

# Wallet

Wallet menyimpan saldo pengguna.

Wallet digunakan untuk:

* Top Up
* Credit Usage
* Refund

---

# Settings

Settings menyimpan konfigurasi Workspace.

Contoh:

* Language
* Timezone
* Feature Flags

---

# Future Domains

Belum termasuk dalam v1:

* Collaboration
* Organization
* Marketplace
* Public API
* SDK Management

---

# Domain Rules

1. Semua Production harus berada di dalam Project.
2. Semua Project harus berada di dalam Workspace.
3. Asset tidak boleh berdiri sendiri.
4. Task selalu dimiliki Production.
5. Snapshot hanya dibuat dari Production.
6. Wallet dimiliki Workspace.
7. Semua perubahan penting menghasilkan Event.

---

# Aggregate Root

Aggregate Root utama adalah:

* Workspace
* Project
* Production

Entity lain bergantung pada Aggregate Root tersebut.

---

# Golden Rule

Jika terjadi konflik desain:

Business Domain selalu lebih penting daripada desain database.

Database harus mengikuti Domain Model, bukan sebaliknya.