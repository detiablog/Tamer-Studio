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
# Tamer Studio Event Storming

Version: 1.0

Status: Approved

---

# Purpose

Dokumen ini mendefinisikan alur bisnis utama Tamer Studio menggunakan pendekatan Event Storming.

Database, API, Queue, AI Orchestrator, dan UI harus mengikuti event yang didefinisikan di sini.

---

# Core Business Flow

```text
User Login

↓

Workspace Created

↓

Project Created

↓

Production Created

↓

Production Configured

↓

Specification Generated

↓

Specification Approved

↓

Execution Started

↓

Tasks Created

↓

Tasks Completed

↓

Assets Generated

↓

Assets Reviewed

↓

Production Exported

↓

Execution Completed
```

---

# Aggregate

## Workspace

Bertanggung jawab atas:

* Workspace
* Settings
* Wallet

---

## Project

Bertanggung jawab atas:

* Production Collection

---

## Production

Bertanggung jawab atas:

* Intent
* Specification
* Version
* Executions

Production adalah Blueprint.

Production bukan hasil AI.

---

## Execution

Execution adalah satu kali proses menjalankan Production.

Execution menyimpan:

* Status
* AI Provider
* Runtime
* Cost
* Tasks
* Assets
* Events

---

# Commands

Command adalah aksi yang dilakukan user atau sistem.

## Workspace

* Create Workspace
* Update Workspace
* Delete Workspace

---

## Project

* Create Project
* Rename Project
* Archive Project

---

## Production

* Create Production
* Update Intent
* Generate Specification
* Approve Specification
* Start Execution
* Cancel Execution
* Archive Production

---

## Execution

* Retry Execution
* Resume Execution
* Export Execution

---

## Asset

* Download Asset
* Delete Asset
* Regenerate Asset

---

# Domain Events

## Workspace

* WorkspaceCreated
* WorkspaceUpdated

---

## Project

* ProjectCreated
* ProjectArchived

---

## Production

* ProductionCreated
* IntentUpdated
* SpecificationGenerated
* SpecificationApproved

---

## Execution

* ExecutionStarted
* ExecutionPaused
* ExecutionResumed
* ExecutionCompleted
* ExecutionFailed

---

## Task

* TaskCreated
* TaskStarted
* TaskCompleted
* TaskFailed
* TaskRetried

---

## Asset

* AssetGenerated
* AssetDeleted
* AssetDownloaded

---

## Export

* ExportStarted
* ExportCompleted
* ExportFailed

---

# Policies

Policy menghubungkan Event dengan Command berikutnya.

## Policy 1

Event:

SpecificationApproved

↓

Command:

StartExecution

---

## Policy 2

Event:

ExecutionStarted

↓

Command:

CreateTasks

---

## Policy 3

Event:

TaskCompleted

↓

Jika masih ada Task berikutnya

↓

StartNextTask

---

## Policy 4

Semua Task selesai

↓

GenerateAssets

---

## Policy 5

AssetsGenerated

↓

ExecutionCompleted

---

# State Machine

Production

Draft

↓

Configured

↓

Ready

↓

Archived

Execution

Pending

↓

Running

↓

Completed

atau

Failed

atau

Cancelled

Task

Pending

↓

Running

↓

Completed

atau

Failed

↓

Retry

---

# Business Rules

1. Production tidak boleh dijalankan sebelum Specification disetujui.
2. Satu Production dapat memiliki banyak Execution.
3. Satu Execution hanya boleh memiliki satu status aktif.
4. Asset selalu dimiliki oleh Execution.
5. Task selalu dimiliki oleh Execution.
6. Event tidak boleh dihapus.
7. Snapshot dibuat ketika Execution selesai atau sebelum proses penting.

---

# Golden Rule

Production menyimpan **apa yang ingin dibuat**.

Execution menyimpan **apa yang benar-benar terjadi**.

Task menyimpan **pekerjaan yang dilakukan**.

Asset menyimpan **hasil akhirnya**.
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
