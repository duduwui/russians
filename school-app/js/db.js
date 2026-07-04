// LocalStorage-backed DB with in-memory fallback for sandboxed environments.
//
// Data model (simplified):
//   settings   { orgName, logo, theme, lang, currency }
//   shifts     [{ id, name, nameAr, start, end }]        // used by subjects (lookup, in Settings)
//   bookTypes  [{ id, name }]                            // e.g. "Full Course", "First Half" (lookup)
//   teachers   [{ id, name, phone, notes }]
//   subjects   [{ id, name, teacherId, shiftId, price, notes, studentIds:[] }]
//   students   [{ id, fullName, phone, gender, dob, guardian, address, notes, subjectIds:[], enrolled }]
//   sales      [{ id, ts, session, book, teacherId, typeId, qty, price, total, notes }]
//   session    { current: "YYYY-MM-DD", startedAt }     // "day" bucket for the sales tab

const DB = {
  KEY: "school.db.v2",
  data: null,
  _mem: null,
  _storageOk: null,

  storageAvailable() {
    if (this._storageOk !== null) return this._storageOk;
    try {
      localStorage.setItem("__p__", "1");
      localStorage.removeItem("__p__");
      this._storageOk = true;
    } catch (e) {
      this._storageOk = false;
      console.warn("localStorage unavailable — using in-memory store");
    }
    return this._storageOk;
  },
  _read()  { return this.storageAvailable() ? localStorage.getItem(this.KEY) : this._mem; },
  _write(v){ if (this.storageAvailable()) localStorage.setItem(this.KEY, v); else this._mem = v; },

  defaults() {
    return {
      settings: {
        orgName: "",
        logo: null,
        theme: "light",
        lang: "en",
        currency: "IQD"
      },
      shifts:    [],
      grades:    [],
      classes:   [],   // { id, name, gradeId }
      bookTypes: [
        { id: "type_full",  name: "Full Course" },
        { id: "type_first", name: "First Half"  },
        { id: "type_second",name: "Second Half" }
      ],
      teachers:  [],
      subjects:  [],   // may have gradeId (optional target grade)
      students:  [],   // gradeId + classId
      sales:     [],
      schedule:  [],   // { id, gradeId, classId, shiftId, day, startTime, endTime, subjectId, teacherId, room, type, notes }
      session:   { current: null, startedAt: null }
    };
  },

  load() {
    try {
      const raw = this._read();
      if (raw) {
        this.data = JSON.parse(raw);
        const d = this.defaults();
        for (const k of Object.keys(d)) {
          if (!(k in this.data)) this.data[k] = d[k];
        }
        this.data.settings = { ...d.settings, ...(this.data.settings || {}) };
        // Migration: subject.teacherId (single) → subject.teacherIds (array)
        this.list("subjects").forEach(sub => {
          if (!Array.isArray(sub.teacherIds)) {
            sub.teacherIds = sub.teacherId ? [sub.teacherId] : [];
          }
        });
      } else {
        this.data = this.defaults();
        this.save();
      }
    } catch (e) {
      console.error("DB load", e);
      this.data = this.defaults();
    }
  },

  save() {
    try {
      this._write(JSON.stringify(this.data));
    } catch (e) {
      console.error("DB save", e);
      this._storageOk = false;
      this._mem = JSON.stringify(this.data);
      if (typeof UI !== "undefined") {
        UI.toast("Storage unavailable — changes won't persist", "error");
      }
    }
  },

  reset() {
    this.data = this.defaults();
    this.save();
  },

  // Small demo dataset (3 teachers, 3 subjects, 5 students, 4 sales)
  loadSample() {
    // Shifts
    const morning = this.upsert("shifts", { name: "Morning", start: "08:00", end: "12:00" });
    const evening = this.upsert("shifts", { name: "Evening", start: "16:00", end: "20:00" });

    // Grades + Classes
    const g11 = this.upsert("grades", { name: "Grade 11" });
    const g12 = this.upsert("grades", { name: "Grade 12" });
    const c11a = this.upsert("classes", { name: "11-A", gradeId: g11.id });
    const c12a = this.upsert("classes", { name: "12-A", gradeId: g12.id });
    const c12b = this.upsert("classes", { name: "12-B", gradeId: g12.id });

    // Teachers
    const t1 = this.upsert("teachers", { name: "Ahmed Hassan",  phone: "0770-100-0001", notes: "Math & Physics" });
    const t2 = this.upsert("teachers", { name: "Sara Mahmoud",  phone: "0770-100-0002", notes: "English" });
    const t3 = this.upsert("teachers", { name: "Omar Ali",      phone: "0770-100-0003", notes: "Chemistry" });

    // Subjects (with target grade & possibly multiple teachers)
    const s1 = this.upsert("subjects", { name: "Math — Grade 12", teacherIds: [t1.id], shiftId: morning.id, gradeId: g12.id, price: 50000, notes: "Preparation for final exam" });
    const s2 = this.upsert("subjects", { name: "English Intensive", teacherIds: [t2.id], shiftId: evening.id, gradeId: "", price: 40000, notes: "" });
    const s3 = this.upsert("subjects", { name: "Chemistry — Grade 12", teacherIds: [t3.id, t1.id], shiftId: morning.id, gradeId: g12.id, price: 45000, notes: "Also taught by Ahmed for extra sections" });

    // Students — with grade & class
    const st1 = this.upsert("students", { fullName: "Layla Ibrahim", phone: "0750-111-0001", gender: "female", gradeId: g12.id, classId: c12a.id, enrolled: this.today(), custom: [{ label: "Guardian", value: "Ibrahim Karim" }] });
    const st2 = this.upsert("students", { fullName: "Yousif Karim",  phone: "0750-111-0002", gender: "male",   gradeId: g12.id, classId: c12a.id, enrolled: this.today() });
    const st3 = this.upsert("students", { fullName: "Noor Salim",    phone: "0750-111-0003", gender: "female", gradeId: g11.id, classId: c11a.id, enrolled: this.today() });
    const st4 = this.upsert("students", { fullName: "Hassan Ali",    phone: "0750-111-0004", gender: "male",   gradeId: g12.id, classId: c12b.id, enrolled: this.today() });
    const st5 = this.upsert("students", { fullName: "Fatima Zaki",   phone: "0750-111-0005", gender: "female", gradeId: g11.id, classId: c11a.id, enrolled: this.today() });

    // Enrollments (M2M)
    this.setStudentSubjects(st1.id, [s1.id, s3.id]);
    this.setStudentSubjects(st2.id, [s1.id]);
    this.setStudentSubjects(st3.id, [s2.id]);
    this.setStudentSubjects(st4.id, [s1.id, s2.id]);
    this.setStudentSubjects(st5.id, [s3.id, s2.id]);

    // A few sample sales for today's session
    this.addSale({ book: "Math — Full Course", teacherId: t1.id, typeId: "type_full",   qty: 2, price: 15000 });
    this.addSale({ book: "Physics Part 1",     teacherId: t1.id, typeId: "type_first",  qty: 1, price: 8000  });
    this.addSale({ book: "English Grammar",    teacherId: t2.id, typeId: "type_full",   qty: 3, price: 12000 });
    this.addSale({ book: "Chemistry Workbook", teacherId: t3.id, typeId: "type_second", qty: 1, price: 10000 });

    // Sample schedule for Grade 12 / 12-A / Morning
    this.upsert("schedule", { gradeId: g12.id, classId: c12a.id, shiftId: morning.id, day: "Sun", startTime: "08:30", endTime: "10:00", subjectId: s1.id, teacherId: t1.id, room: "Room 101" });
    this.upsert("schedule", { gradeId: g12.id, classId: c12a.id, shiftId: morning.id, day: "Sun", startTime: "10:15", endTime: "11:45", subjectId: s3.id, teacherId: t3.id, room: "Room 203" });
    this.upsert("schedule", { gradeId: g12.id, classId: c12a.id, shiftId: morning.id, day: "Mon", startTime: "08:30", endTime: "10:00", subjectId: s1.id, teacherId: t1.id, room: "Room 101" });
    this.upsert("schedule", { gradeId: g12.id, classId: c12a.id, shiftId: morning.id, day: "Wed", startTime: "10:15", endTime: "11:45", subjectId: s3.id, teacherId: t1.id, room: "Room 203" });
    this.upsert("schedule", { gradeId: g11.id, classId: c11a.id, shiftId: morning.id, day: "Tue", startTime: "08:30", endTime: "10:00", subjectId: s2.id, teacherId: t2.id, room: "Room 105" });

    this.save();
  },

  today() { return new Date().toISOString().slice(0, 10); },
  now()   { return new Date().toISOString(); },

  newId(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  },

  // ---------- Generic CRUD ----------
  list(entity) { return this.data[entity] || []; },
  get(entity, id) {
    if (!id) return null;
    return (this.data[entity] || []).find(x => x.id === id) || null;
  },
  upsert(entity, item) {
    const arr = this.data[entity];
    if (!arr) throw new Error("Unknown entity: " + entity);
    if (!item.id) {
      item.id = this.newId(entity.slice(0, 3));
      item.createdAt = this.now();
      arr.push(item);
    } else {
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...item, updatedAt: this.now() };
      else { item.createdAt = this.now(); arr.push(item); }
    }
    this.save();
    return item;
  },
  remove(entity, id) {
    this.data[entity] = (this.data[entity] || []).filter(x => x.id !== id);
    // Cascade cleanup
    if (entity === "subjects") {
      this.list("students").forEach(s => {
        if (Array.isArray(s.subjectIds)) s.subjectIds = s.subjectIds.filter(x => x !== id);
      });
    }
    if (entity === "students") {
      this.list("subjects").forEach(sub => {
        if (Array.isArray(sub.studentIds)) sub.studentIds = sub.studentIds.filter(x => x !== id);
      });
    }
    if (entity === "teachers") {
      this.list("subjects").forEach(s => {
        if (Array.isArray(s.teacherIds)) {
          s.teacherIds = s.teacherIds.filter(x => x !== id);
        }
        if (s.teacherId === id) s.teacherId = "";
      });
    }
    if (entity === "shifts") {
      this.list("subjects").forEach(s => { if (s.shiftId === id) s.shiftId = ""; });
    }
    if (entity === "grades") {
      this.list("students").forEach(s => { if (s.gradeId === id) s.gradeId = ""; });
      this.list("subjects").forEach(s => { if (s.gradeId === id) s.gradeId = ""; });
      // Classes belong to a grade — cascade remove those too
      const orphanClasses = this.list("classes").filter(c => c.gradeId === id).map(c => c.id);
      this.data.classes = this.list("classes").filter(c => c.gradeId !== id);
      orphanClasses.forEach(cid => {
        this.list("students").forEach(s => { if (s.classId === cid) s.classId = ""; });
      });
    }
    if (entity === "classes") {
      this.list("students").forEach(s => { if (s.classId === id) s.classId = ""; });
      this.data.schedule = this.list("schedule").filter(e => e.classId !== id);
    }
    if (entity === "subjects") {
      this.data.schedule = this.list("schedule").filter(e => e.subjectId !== id);
    }
    if (entity === "bookTypes") {
      // Sales keep the historical typeName; typeId can dangle
    }
    this.save();
  },

  // Classes filtered by grade (used in student form)
  classesForGrade(gradeId) {
    if (!gradeId) return this.list("classes");
    return this.list("classes").filter(c => c.gradeId === gradeId);
  },

  // Schedule helpers
  scheduleFor({ gradeId, classId, shiftId }) {
    return this.list("schedule").filter(e =>
      (!gradeId || e.gradeId === gradeId) &&
      (!classId || e.classId === classId) &&
      (!shiftId || e.shiftId === shiftId)
    );
  },

  // ---------- Enrollment (M2M student <-> subject) ----------
  enroll(studentId, subjectId) {
    const stu = this.get("students", studentId);
    const sub = this.get("subjects", subjectId);
    if (!stu || !sub) return;
    stu.subjectIds = Array.from(new Set([...(stu.subjectIds || []), subjectId]));
    sub.studentIds = Array.from(new Set([...(sub.studentIds || []), studentId]));
    this.save();
  },
  unenroll(studentId, subjectId) {
    const stu = this.get("students", studentId);
    const sub = this.get("subjects", subjectId);
    if (stu) stu.subjectIds = (stu.subjectIds || []).filter(x => x !== subjectId);
    if (sub) sub.studentIds = (sub.studentIds || []).filter(x => x !== studentId);
    this.save();
  },
  setStudentSubjects(studentId, subjectIds) {
    const stu = this.get("students", studentId);
    if (!stu) return;
    const oldIds = new Set(stu.subjectIds || []);
    const newIds = new Set(subjectIds);
    stu.subjectIds = [...newIds];
    // Sync the reverse side
    this.list("subjects").forEach(sub => {
      const has = (sub.studentIds || []).includes(studentId);
      if (newIds.has(sub.id) && !has) {
        sub.studentIds = [...(sub.studentIds || []), studentId];
      } else if (!newIds.has(sub.id) && has) {
        sub.studentIds = (sub.studentIds || []).filter(x => x !== studentId);
      }
    });
    this.save();
  },
  setSubjectStudents(subjectId, studentIds) {
    const sub = this.get("subjects", subjectId);
    if (!sub) return;
    const newIds = new Set(studentIds);
    sub.studentIds = [...newIds];
    this.list("students").forEach(stu => {
      const has = (stu.subjectIds || []).includes(subjectId);
      if (newIds.has(stu.id) && !has) {
        stu.subjectIds = [...(stu.subjectIds || []), subjectId];
      } else if (!newIds.has(stu.id) && has) {
        stu.subjectIds = (stu.subjectIds || []).filter(x => x !== subjectId);
      }
    });
    this.save();
  },

  // ---------- Sales ----------
  currentSession() {
    if (!this.data.session.current) {
      this.data.session.current = this.today();
      this.data.session.startedAt = this.now();
      this.save();
    }
    return this.data.session;
  },
  startNewDay() {
    this.data.session.current = this.today();
    this.data.session.startedAt = this.now();
    this.save();
  },
  sessionSales() {
    const s = this.currentSession();
    return this.list("sales").filter(x => x.session === s.current);
  },
  addSale(sale) {
    const s = this.currentSession();
    const qty = Math.max(1, parseInt(sale.qty, 10) || 0);
    const price = Math.max(0, parseFloat(sale.price) || 0);
    const rec = {
      id: this.newId("sal"),
      ts: this.now(),
      session: s.current,
      book: (sale.book || "").trim(),
      teacherId: sale.teacherId || "",
      typeId: sale.typeId || "",
      qty,
      price,
      total: +(qty * price).toFixed(2),
      notes: (sale.notes || "").trim()
    };
    if (!rec.book) throw new Error("Book name required");
    this.data.sales.push(rec);
    this.save();
    return rec;
  },
  updateSale(id, patch) {
    const rec = this.get("sales", id);
    if (!rec) return null;
    Object.assign(rec, patch);
    if ("qty" in patch || "price" in patch) {
      rec.qty = Math.max(1, parseInt(rec.qty, 10) || 1);
      rec.price = Math.max(0, parseFloat(rec.price) || 0);
      rec.total = +(rec.qty * rec.price).toFixed(2);
    }
    this.save();
    return rec;
  },
  removeSale(id) {
    this.data.sales = this.list("sales").filter(s => s.id !== id);
    this.save();
  },

  // Autocomplete history for the Sales quick-add
  bookHistory() {
    const map = new Map();
    // most-recent-first
    [...this.list("sales")].reverse().forEach(s => {
      const key = (s.book || "").toLowerCase();
      if (!key || map.has(key)) return;
      map.set(key, {
        book: s.book,
        teacherId: s.teacherId,
        typeId: s.typeId,
        price: s.price
      });
    });
    return [...map.values()];
  },

  // ---------- Backup / Restore ----------
  export() {
    return JSON.stringify({ ...this.data, _v: 2, _at: this.now() }, null, 2);
  },
  import(json) {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid file");
    const d = this.defaults();
    for (const k of Object.keys(d)) if (!(k in parsed)) parsed[k] = d[k];
    delete parsed._v; delete parsed._at;
    parsed.settings = { ...d.settings, ...(parsed.settings || {}) };
    this.data = parsed;
    this.save();
  }
};
