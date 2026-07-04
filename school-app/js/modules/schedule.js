// Weekly Schedule Builder
// - Chip filters: Grade → Class → Shift (with smart defaults)
// - 6-column grid: Sun..Fri (or user's set of days)
// - Click a slot to add; click an entry to edit
// - Save & add another supported

const Schedule = {
  filter: { gradeId: "", classId: "", shiftId: "", day: "" },
  DAYS: [
    { id: "Sun", label: "Sunday" },
    { id: "Mon", label: "Monday" },
    { id: "Tue", label: "Tuesday" },
    { id: "Wed", label: "Wednesday" },
    { id: "Thu", label: "Thursday" },
    { id: "Fri", label: "Friday" }
  ],

  // Set smart defaults on first render:
  // prefer the grade/class that already has schedule entries so the user sees data.
  ensureDefaults() {
    const grades = DB.list("grades");
    const shifts = DB.list("shifts");
    const entries = DB.list("schedule");

    if (!this.filter.gradeId && grades.length) {
      // Grade with most entries wins; fall back to first grade
      const counts = {};
      entries.forEach(e => { counts[e.gradeId] = (counts[e.gradeId] || 0) + 1; });
      const bestGrade = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0];
      this.filter.gradeId = grades.find(g => g.id === bestGrade)?.id || grades[0].id;
    }
    if (this.filter.gradeId) {
      const classes = DB.classesForGrade(this.filter.gradeId);
      const stillValid = classes.some(c => c.id === this.filter.classId);
      if (!stillValid) {
        const gradeEntries = entries.filter(e => e.gradeId === this.filter.gradeId);
        const cCounts = {};
        gradeEntries.forEach(e => { cCounts[e.classId] = (cCounts[e.classId] || 0) + 1; });
        const bestClass = Object.entries(cCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
        this.filter.classId = classes.find(c => c.id === bestClass)?.id || classes[0]?.id || "";
      }
    }
    if (!this.filter.shiftId && shifts.length) {
      this.filter.shiftId = shifts[0].id;
    }
  },

  render() {
    this.ensureDefaults();
    const grades = DB.list("grades");
    const classes = DB.classesForGrade(this.filter.gradeId);
    const shifts = DB.list("shifts");

    if (!grades.length) {
      return `
        <div class="page-head">
          <div>
            <h1 class="page-title">${i18n.t("sched.title")}</h1>
            <div class="page-sub">${i18n.t("sched.sub")}</div>
          </div>
        </div>
        <div class="card"><div class="card-body">
          ${UI.empty(i18n.t("sched.pickClassFirst"),
            `<button class="btn primary" onclick="App.go('settings')">${icon("settings")} ${i18n.t("nav.settings")}</button>`)}
        </div></div>
      `;
    }

    const entries = DB.scheduleFor({
      gradeId: this.filter.gradeId,
      classId: this.filter.classId,
      shiftId: this.filter.shiftId
    });

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("sched.title")}</h1>
          <div class="page-sub">${i18n.t("sched.sub")}</div>
        </div>
        <div class="page-actions">
          <button class="btn" onclick="window.print()">${icon("print")} ${i18n.t("common.print")}</button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">${i18n.t("students.grade")}</span>
          ${Schedule.renderScopedFilter(grades, this.filter.gradeId, "fgrade")}
        </div>

        ${classes.length ? `
          <div class="filter-group">
            <span class="filter-label">${i18n.t("students.class")}</span>
            ${Schedule.renderScopedFilter(classes, this.filter.classId, "fclass")}
          </div>
        ` : ""}

        ${shifts.length ? `
          <div class="filter-group">
            <span class="filter-label">${i18n.t("subjects.shift")}</span>
            ${Schedule.renderScopedFilter(shifts, this.filter.shiftId, "fshift")}
          </div>
        ` : ""}

        <div class="filter-summary">
          ${icon("check")} ${UI.escape(UI.lookupName("grades", this.filter.gradeId))}
          · ${UI.escape(UI.lookupName("classes", this.filter.classId))}
          ${this.filter.shiftId ? ` · ${UI.escape(UI.lookupName("shifts", this.filter.shiftId))}` : ""}
        </div>
      </div>

      ${!this.filter.classId ? `
        <div class="card"><div class="card-body">${UI.empty(i18n.t("sched.pickClass"))}</div></div>
      ` : this.renderGrid(entries)}
    `;
  },

  renderGrid(entries) {
    // Group entries by day
    const byDay = {};
    this.DAYS.forEach(d => byDay[d.id] = []);
    entries.forEach(e => {
      if (!byDay[e.day]) byDay[e.day] = [];
      byDay[e.day].push(e);
    });
    // Sort by start time
    Object.values(byDay).forEach(arr => arr.sort((a,b) => (a.startTime||"").localeCompare(b.startTime||"")));

    return `
      <div class="sched-grid">
        ${this.DAYS.map(d => `
          <div class="sched-col">
            <div class="sched-day-head">${d.label}</div>
            <div class="sched-day-body">
              ${byDay[d.id].map(e => this.renderEntry(e)).join("")}
              <button class="sched-add" data-add-day="${d.id}" title="${i18n.t("sched.add")}">
                ${icon("plus")}
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  renderEntry(e) {
    const subject = DB.get("subjects", e.subjectId);
    const teacher = DB.get("teachers", e.teacherId);
    return `
      <div class="sched-entry lecture" data-edit="${UI.escape(e.id)}">
        <div class="sched-entry-head">
          <span class="sched-title">${UI.escape(subject?.name || "—")}</span>
          <span class="sched-time">${UI.escape(e.startTime || "")}–${UI.escape(e.endTime || "")}</span>
        </div>
        <div class="sched-entry-meta">
          ${teacher ? `<span>${icon("user","sm")} ${UI.escape(teacher.name)}</span>` : ""}
        </div>
        ${e.room ? `<div class="sched-entry-room">${icon("location","sm")} ${UI.escape(e.room)}</div>` : ""}
      </div>
    `;
  },

  // Scoped filter: chips if ≤5, dropdown otherwise. No "All" — user must pick one.
  renderScopedFilter(items, selectedId, attrName) {
    if (items.length <= 5) {
      return `<div class="chip-row">
        ${items.map(it => `
          <button class="chip ${selectedId === it.id ? "active" : ""}" data-${attrName}="${UI.escape(it.id)}">${UI.escape(it.name)}</button>
        `).join("")}
      </div>`;
    }
    return `<select class="filter-select" data-${attrName}-select>
      ${items.map(it => `
        <option value="${UI.escape(it.id)}" ${selectedId === it.id ? "selected" : ""}>${UI.escape(it.name)}</option>
      `).join("")}
    </select>`;
  },

  bind() {
    const wire = (attr, key, resetClass = false) => {
      document.querySelectorAll(`[data-${attr}]`).forEach(b => {
        if (b.tagName === "BUTTON") b.onclick = () => {
          this.filter[key] = b.dataset[attr.replace(/-([a-z])/g, (_,c) => c.toUpperCase())];
          if (resetClass) this.filter.classId = "";
          App.renderPageOnly();
        };
      });
      const sel = document.querySelector(`[data-${attr}-select]`);
      if (sel) sel.onchange = e => {
        this.filter[key] = e.target.value;
        if (resetClass) this.filter.classId = "";
        App.renderPageOnly();
      };
    };
    wire("fgrade", "gradeId", true);
    wire("fclass", "classId");
    wire("fshift", "shiftId");
    document.querySelectorAll("[data-add-day]").forEach(b => b.onclick = () => {
      this.openForm(null, { day: b.dataset.addDay });
    });
    document.querySelectorAll("[data-edit]").forEach(el => el.onclick = () => this.openForm(el.dataset.edit));
  },

  openForm(id, presets = {}) {
    if (!this.filter.classId) {
      UI.toast(i18n.t("sched.pickClass"), "error");
      return;
    }
    const e = id
      ? { ...DB.get("schedule", id) }
      : {
          gradeId: this.filter.gradeId,
          classId: this.filter.classId,
          shiftId: this.filter.shiftId,
          day: presets.day || "Sun",
          type: "lecture",
          startTime: "08:30",
          endTime: "10:00"
        };

    const isEdit = !!id;
    // Only subjects that target this grade (or have no target grade)
    const subjects = DB.list("subjects").filter(s =>
      !s.gradeId || s.gradeId === e.gradeId
    );
    const gradeName = UI.lookupName("grades", e.gradeId);
    const className = UI.lookupName("classes", e.classId);

    const dayLabel = Schedule.DAYS.find(d => d.id === e.day)?.label || e.day || "—";
    // Encode teacher IDs so we can auto-filter teacher dropdown when subject picked
    const subjectTeacherMap = {};
    subjects.forEach(s => {
      const ids = Array.isArray(s.teacherIds) ? s.teacherIds : (s.teacherId ? [s.teacherId] : []);
      subjectTeacherMap[s.id] = ids;
    });

    UI.modal({
      title: isEdit ? i18n.t("sched.edit") : i18n.t("sched.add"),
      bodyHTML: `
        <div class="form-grid">
          <div class="full" style="padding:10px 12px;background:var(--primary-soft);border-radius:6px;font-size:13px;color:var(--primary);display:flex;gap:6px;align-items:center">
            ${icon("info","sm")} <span><strong>${UI.escape(gradeName)}</strong> · <strong>${UI.escape(className)}</strong> · <strong>${UI.escape(dayLabel)}</strong></span>
          </div>
          <div class="field full">
            <label>${icon("bookOpen","sm")} ${i18n.t("sched.subject")} <span class="req">*</span></label>
            <select data-f="subjectId" id="schSub">
              <option value="">${i18n.t("sched.chooseSubject")}</option>
              ${subjects.map(s =>
                `<option value="${UI.escape(s.id)}" ${e.subjectId === s.id ? "selected" : ""}>${UI.escape(s.name)}</option>`
              ).join("")}
            </select>
            ${subjects.length === 0 ? `<div class="hint" style="color:var(--warning)">No subjects for ${UI.escape(gradeName)} yet. Add one in Subjects.</div>` : ""}
          </div>

          <div class="field full">
            <label>${icon("user","sm")} ${i18n.t("sched.instructor")} <span id="schInstrHint" style="color:var(--text-mute);font-weight:400;font-size:11.5px"></span></label>
            <select data-f="teacherId" id="schTeach" disabled>
              <option value="">${i18n.t("sched.chooseSubject")} first</option>
            </select>
          </div>

          <div class="field">
            <label>${icon("clock","sm")} ${i18n.t("sched.start")}</label>
            <input type="time" data-f="startTime" value="${UI.escape(e.startTime || "08:30")}"/>
          </div>
          <div class="field">
            <label>${icon("clock","sm")} ${i18n.t("sched.end")}</label>
            <input type="time" data-f="endTime" value="${UI.escape(e.endTime || "10:00")}"/>
          </div>

          <div class="field full">
            <label>${icon("location","sm")} ${i18n.t("sched.room")}</label>
            <input data-f="room" value="${UI.escape(e.room || "")}" placeholder="${i18n.t("sched.roomHint")}"/>
          </div>

          <input type="hidden" data-f="day" value="${UI.escape(e.day || "Sun")}"/>
          <input type="hidden" data-f="type" value="lecture"/>
        </div>
      `,
      footerHTML: `
        ${isEdit ? `<button class="btn danger" data-delete>${icon("trash","sm")} ${i18n.t("common.delete")}</button>` : ""}
        <div style="flex:1"></div>
        <button class="btn ghost" data-close>${i18n.t("common.cancel")}</button>
        ${!isEdit ? `<button class="btn" data-save-add>${icon("plus","sm")} ${i18n.t("common.saveAdd")}</button>` : ""}
        <button class="btn primary" data-save>${icon("save")} ${i18n.t("common.save")}</button>
      `,
      onOpen: (m) => {
        const subSel = m.querySelector("#schSub");
        const teachSel = m.querySelector("#schTeach");
        const hint = m.querySelector("#schInstrHint");

        // Populate teacher dropdown from subject's teachers only
        const refreshTeachers = () => {
          const sid = subSel.value;
          const teacherIds = subjectTeacherMap[sid] || [];
          if (!sid) {
            teachSel.innerHTML = `<option value="">${i18n.t("sched.chooseSubject")} first</option>`;
            teachSel.disabled = true;
            hint.textContent = "";
            return;
          }
          if (!teacherIds.length) {
            teachSel.innerHTML = `<option value="">— no teachers assigned to this subject —</option>`;
            teachSel.disabled = true;
            hint.textContent = "";
            return;
          }
          teachSel.disabled = false;
          teachSel.innerHTML = teacherIds.map(tid => {
            const t = DB.get("teachers", tid);
            if (!t) return "";
            const selected = (e.teacherId === tid) || (teacherIds.length === 1);
            return `<option value="${UI.escape(tid)}" ${selected ? "selected" : ""}>${UI.escape(t.name)}</option>`;
          }).join("");
          hint.textContent = `— ${teacherIds.length} available`;
        };

        subSel.addEventListener("change", refreshTeachers);
        refreshTeachers();

        m.querySelector("[data-close]").onclick = UI.closeModal;

        m.querySelector("[data-delete]")?.addEventListener("click", () => {
          UI.confirm(i18n.t("common.confirmDelete"), () => {
            DB.remove("schedule", id);
            UI.closeModal();
            UI.toast(i18n.t("common.deleted"), "success");
            App.renderPageOnly();
          });
        });

        const collect = () => {
          const data = { ...e };
          m.querySelectorAll("[data-f]").forEach(el => data[el.dataset.f] = el.value);
          return data;
        };

        const doSave = (thenReopen) => {
          const data = collect();
          if (!data.subjectId && data.type !== "break") {
            UI.toast(i18n.t("sched.subject") + " *", "error");
            return null;
          }
          if (data.startTime && data.endTime && data.startTime >= data.endTime) {
            UI.toast(i18n.t("sched.start") + " < " + i18n.t("sched.end"), "error");
            return null;
          }
          DB.upsert("schedule", data);
          UI.toast(i18n.t("common.saved"), "success");
          if (thenReopen) {
            // Rebuild the form for a new entry on the same day
            const day = data.day;
            UI.closeModal();
            App.renderPageOnly();
            Schedule.openForm(null, { day });
          } else {
            UI.closeModal();
            App.renderPageOnly();
          }
          return data;
        };

        m.querySelector("[data-save]").onclick = () => doSave(false);
        m.querySelector("[data-save-add]")?.addEventListener("click", () => doSave(true));
      }
    });
  }
};
