# Tamer Studio Coding Rules

Version: 1.0

Status: Active

---

# Purpose

Dokumen ini mendefinisikan standar coding yang wajib diikuti oleh seluruh developer dan AI coding assistant yang berkontribusi pada Tamer Studio.

Jika terdapat konflik antara kode dan dokumen ini, lakukan review terlebih dahulu sebelum mengubah standar.

---

# Core Philosophy

## 1. Readability First

Kode harus mudah dipahami oleh developer lain.

Jangan mengorbankan keterbacaan hanya demi membuat kode lebih singkat.

---

## 2. Simplicity Over Cleverness

Pilih solusi yang sederhana.

Hindari abstraksi yang tidak memberikan manfaat nyata.

---

## 3. Feature First

Semua business logic berada di dalam feature masing-masing.

Jangan membuat folder global hanya karena terlihat lebih rapi.

---

## 4. Server First

Gunakan Server Components dan Server Actions sebagai pilihan utama.

Gunakan Client Components hanya jika benar-benar membutuhkan interaktivitas di browser.

---

## Folder Rules

Setiap feature menggunakan struktur berikut.

```text
feature-name/

components/

actions/

schemas/

types/

hooks/

lib/
```

Tidak semua folder wajib ada.

Buat hanya jika diperlukan.

---

# Naming Rules

Folder:

- kebab-case

File:

- kebab-case

Component:

- PascalCase

Function:

- camelCase

Variable:

- camelCase

Constant:

- UPPER_SNAKE_CASE

Type:

- PascalCase

Enum:

- PascalCase

---

# TypeScript Rules

Gunakan strict mode.

Hindari penggunaan:

- any

Gunakan:

- unknown
- generic
- union
- discriminated union

bila lebih tepat.

---

# Validation

Semua input wajib divalidasi menggunakan Zod.

Tidak boleh ada data dari user yang langsung diproses tanpa validasi.

---

# Database Rules

Seluruh akses database dilakukan melalui Database Layer.

Jangan mengakses database langsung dari React Component.

---

# AI Rules

Seluruh komunikasi dengan model AI wajib melalui AI Gateway.

Jangan memanggil provider AI secara langsung dari feature.

---

# Error Handling

Gunakan error yang jelas.

Jangan mengembalikan string error yang ambigu.

Seluruh error harus dapat ditelusuri melalui log.

---

# Logging

Gunakan logger terpusat.

Jangan menggunakan console.log pada production.

console.warn dan console.error hanya digunakan saat proses development atau debugging yang terkontrol.

---

# Testing

Feature baru idealnya memiliki:

- Unit Test
- Integration Test (jika relevan)

Bug yang sudah diperbaiki sebaiknya ditambahkan test agar tidak muncul kembali.

---

# Code Review Checklist

Sebelum merge, pastikan:

- Nama file sesuai standar.
- Tidak ada any yang tidak diperlukan.
- Validasi menggunakan Zod.
- Tidak ada business logic di UI.
- Tidak ada hardcoded secret.
- Kode mudah dibaca.
- Tidak ada dependency yang tidak digunakan.
- Dokumentasi fitur telah diperbarui bila ada perubahan perilaku.

---

# Golden Rule

Jika ragu antara dua solusi, pilih solusi yang:

- lebih sederhana,
- lebih mudah dipahami,
- lebih mudah diuji,
- dan lebih mudah dipelihara.
