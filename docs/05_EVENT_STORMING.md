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
