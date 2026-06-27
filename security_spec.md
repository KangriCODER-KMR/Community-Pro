# security_spec.md
# KNIT Sultanpur Portal - Zero-Trust Firestore Security Specification

This document details the Zero-Trust security rules specification and the "Dirty Dozen" hostile payloads designed to compromise the integrity, privacy, and financial controls of Knit-Gate.

---

## 1. Core Data Invariants

| Invariant ID | Rule/Constraint | Owner Division | Severity |
| :--- | :--- | :--- | :--- |
| **INV-AUTH** | No anonymous document writes. All standard operations require Verified Email state. | Core Routing | Critical |
| **INV-USER-RBAC** | A user cannot modify their own `role`, `department`, or administrative permissions. | Admin Terminal | Critical |
| **INV-DEP-BUDGET** | Only administrators can modify division budget metrics. | Financial Ops | High |
| **INV-STUDENT-GPA** | Students are strictly forbidden from writing or altering GPA records. | Academic Control | High |
| **INV-COURSE-SEATS** | Students cannot increment course seat capacities. Instructor matching must belong to active faculty. | Course Catalog | High |
| **INV-FINANCIAL** | Payment status fields are read-only for students. Complete status require gateway confirmation. | Treasury | Critical |
| **INV-COMPLAINT-ID** | Students can file complaints but cannot delete complaints or edit resolution status field. | Grievance Office | Medium |
| **INV-EXAM-SCORES** | Exam scores/results are read-only to students; only authenticated instructors can submit or scale grades. | Proctor Control | Critical |

---

## 2. The "Dirty Dozen" (Hostile Payloads & State Shortcuts)

The following JSON payloads are engineered to test our security rules. Each must be rejected as `PERMISSION_DENIED`.

### Attack 1: Identity Spoofing (User Registration Elevation)
A student attempts to register their profile in the database but assigns themselves the `"admin"` role to bypass UI gates.
```json
{
  "path": "/users/exploiter_student",
  "action": "create",
  "payload": {
    "id": "exploiter_student",
    "name": "Malicious Student",
    "email": "exploiter@knit.ac.in",
    "role": "admin"
  }
}
```

### Attack 2: Self-Allocated Financial Relief (GPA Forgery)
A student attempts to overwrite their demographic parameters to artificially upgrade their cumulative GPA.
```json
{
  "path": "/students/CS2024001",
  "action": "update",
  "payload": {
    "gpa": 10.0,
    "address": "Phony Mansion"
  }
}
```

### Attack 3: Course Allocation Hijacking (Instructor Forgery)
A student attempts to assign themselves as the registered lecturer/instructor of a core curriculum module.
```json
{
  "path": "/courses/CS304",
  "action": "update",
  "payload": {
    "instructor": "Student Aarav Sharma"
  }
}
```

### Attack 4: Unauthorized Budget Alteration
A guest actor attempts to modify a department's physical budget or HOD variables without admin authentication.
```json
{
  "path": "/departments/CS",
  "action": "update",
  "payload": {
    "budget": 99000000,
    "head": "Hacker Master"
  }
}
```

### Attack 5: Grievance Shortcut / Self-Resolution
A student student files a local complaint but immediately forces the state to `"resolved"` without administrator evaluation.
```json
{
  "path": "/complaints/g_011",
  "action": "create",
  "payload": {
    "id": "g_011",
    "studentId": "CS2024001",
    "subject": "Leaking Pipe",
    "message": "Immediate help needed",
    "status": "resolved",
    "date": "2026-06-06T00:00:00Z"
  }
}
```

### Attack 6: Fraudulent Tuition Clearance (Payment Bypass)
A scholar marks an overdue fee installment sequence as `"completed"` without submitting a payment gateway transaction code.
```json
{
  "path": "/payments/tx_hacker_99",
  "action": "create",
  "payload": {
    "id": "tx_hacker_99",
    "studentId": "CS2024001",
    "amount": 45000,
    "semester": "Sem 4",
    "status": "completed",
    "paymentDate": "2026-06-06T00:00:00Z"
  }
}
```

### Attack 7: Hostel Room Squatting
A student attempts to grant themselves active hostel occupancy status manually in a luxury double-room.
```json
{
  "path": "/allocations/squat_01",
  "action": "create",
  "payload": {
    "id": "squat_01",
    "studentId": "CS2024001",
    "hostelId": "BH-1",
    "roomNo": "Room A-101",
    "status": "active",
    "monthlyRent": 10
  }
}
```

### Attack 8: Exam Schedule Erasure (Practical Denial)
An unauthorized student attempts to change the date or completely delete an upcoming online practical examination.
```json
{
  "path": "/exams/practical_09",
  "action": "delete"
}
```

### Attack 9: Grade Scaling Arbitrage
A student attempts to create a high-score exam results ledger for themselves in a system-controlled proctored examination.
```json
{
  "path": "/results/res_hacked_grade",
  "action": "create",
  "payload": {
    "studentId": "CS2024001",
    "examId": "exam_midterm_01",
    "score": 100,
    "total": 100,
    "date": "2026-06-06T00:00:00Z"
  }
}
```

### Attack 10: Denial-of-Wallet (DOW) Payload Overflow
An attacker sends a write containing a massive 1MB noise key name inside an ID parameter to spike read/indexing costs.
```json
{
  "path": "/users/Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...",
  "action": "create",
  "payload": {
    "id": "Aaaaaaaaaaaaaaaaaaaaa...",
    "name": "Bloated User",
    "email": "bloat@knit.ac.in",
    "role": "student"
  }
}
```

### Attack 11: Spoofed Email Domain Privilege Claims
An attacker attempts to connect with an unverified email claiming admin privileges on an unauthorized domain name.
```json
{
  "path": "/departments/IT",
  "action": "update",
  "payload": {
    "budget": 0
  },
  "auth": {
    "email": "dean@knit.ac.in",
    "email_verified": false
  }
}
```

### Attack 12: Blanket Database Harvesting Query
A client attempts to query the entire `/payments` ledger without filtering records to their own authenticated student identifier.
```json
{
  "collection": "/payments",
  "action": "list",
  "query": "select * from payments",
  "expected": "DENIED"
}
```

---

## 3. The Security Assertion Test Suite

The firestore security test framework simulates client actions:

```typescript
import { assertFails, assertSucceeds, initializeTestApp } from '@firebase/rules-unit-testing';

describe("KNIT Sultanpur Firewall unit-tests", () => {
  it("denies unverified or anonymous user read/write access", async () => {
    const db = initializeTestApp({ projectId: "knit-gate", auth: null }).firestore();
    await assertFails(db.doc("users/student@knit.ac.in").get());
  });

  it("denies student from elevating their own profile roles", async () => {
    const db = initializeTestApp({ projectId: "knit-gate", auth: { uid: "std-01", email: "std@knit.ac.in", email_verified: true } }).firestore();
    await assertFails(db.doc("users/std-01").set({ role: "admin", name: "Attacker" }));
  });

  it("denies students from altering department configurations", async () => {
    const db = initializeTestApp({ projectId: "knit-gate", auth: { uid: "std-01", email: "std@knit.ac.in", email_verified: true } }).firestore();
    await assertFails(db.doc("departments/CS").update({ budget: 5000 }));
  });

  it("forces list queries to specify relational filters matched to uid", async () => {
    const db = initializeTestApp({ projectId: "knit-gate", auth: { uid: "std-01", email: "std@knit.ac.in", email_verified: true } }).firestore();
    await assertFails(db.collection("payments").get()); // No filter
    await assertSucceeds(db.collection("payments").where("studentId", "==", "std-01").get());
  });
});
```
