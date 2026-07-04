const Subjects = {
  filter: { q: "", gradeId: "" },

  render() {
    const q = this.filter.q.toLowerCase();
    const rows = DB.list("subjects").filter(s => {
      if (q && !(s.name || "").toLowerCase().includes(q)) return false;
      if (this.filter.gradeId) {
        // "All grades" (gradeId="") subjects always match; specific ones must match
        if (s.gradeId && s.gradeId !== this.filter.gradeId) return false;
      }
      return true;
    });

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("subjects.title")}</h1>
          <div class="page-sub">${i18n.t("subjects.sub")} • ${UI.fmtNumber(rows.length)}</div>
        </div>
        <div class="page-actions">
          <button class="btn primary" id="addBtn">${icon("plus")} ${i18n.t("subjects.add")}</button>
        </div>
      </div>

      ${DB.list("subjects").length ? `
        ${DB.list("grades").length ? `
          <div class="filter-bar">
            <div class="filter-group">
              <span class="filter-label">${i18n.t("students.grade")}</span>
              ${UI.smartFilter({ items: DB.list("grades"), selectedId: this.filter.gradeId, attrName: "fgrade", allLabel: i18n.t("common.all") })}
            </div>
          </div>
        ` : ""}
        <div class="toolbar">
          <input class="search" id="q" placeholder="${i18n.t("common.search")}" value="${UI.escape(this.filter.q)}"/>
        </div>
      ` : ""}

      ${rows.length ? UI.table({
        columns: [
          { key: "name", label: i18n.t("subjects.name"),
            render: r => `<strong>${UI.escape(r.name)}</strong>` },
          { key: "grade", label: i18n.t("subjects.grade"),
            render: r => {
              const g = DB.get("grades", r.gradeId);
              return g ? `<span class="tag muted">${UI.escape(g.name)}</span>`
                       : `<span class="tag muted">${i18n.t("subjects.gradeAll")}</span>`;
            } },
          { key: "teachers", label: i18n.t("subjects.teacher"),
            render: r => {
              const ids = r.teacherIds || (r.teacherId ? [r.teacherId] : []);
              if (!ids.length) return "—";
              return ids.map(id => {
                const t = DB.get("teachers", id);
                return t ? `<span class="tag">${UI.escape(t.name)}</span>` : "";
              }).join(" ");
            } },
          { key: "shift", label: i18n.t("subjects.shift"),
            render: r => {
              const s = DB.get("shifts", r.shiftId);
              return s ? `<span class="tag muted">${UI.escape(s.name)}</span>` : "—";
            } },
          { key: "price", label: i18n.t("subjects.price"), numeric: true, type: "money" },
          { key: "students", label: i18n.t("subjects.students"), numeric: true,
            render: r => `<span class="tag">${UI.fmtNumber((r.studentIds || []).length)}</span>` },
          { key: "actions", label: "", className: "num",
            render: r => `
              <button class="btn sm" data-manage="${UI.escape(r.id)}" title="${i18n.t("subjects.manage")}">${icon("users","sm")}</button>
              ${UI.rowActions(r.id)}
            ` }
        ],
        rows
      }) : `<div class="card"><div class="card-body">
        ${UI.empty(i18n.t("subjects.none"),
          `<div style="margin-top:8px;color:var(--text-mute)">${i18n.t("subjects.emptyCta")}</div>
           <button class="btn primary" id="emptyAdd" style="margin-top:14px">${icon("plus")} ${i18n.t("subjects.add")}</button>`)}
      </div></div>`}
    `;
  },

  bind() {
    document.getElementById("q")?.addEventListener("input", e => { this.filter.q = e.target.value; App.renderPageOnly(); });
    document.querySelectorAll("[data-fgrade]").forEach(b => {
      if (b.tagName === "BUTTON") b.onclick = () => {
        this.filter.gradeId = b.dataset.fgrade;
        App.renderPageOnly();
      };
    });
    document.querySelector("[data-fgrade-select]")?.addEventListener("change", e => {
      this.filter.gradeId = e.target.value;
      App.renderPageOnly();
    });
    document.getElementById("addBtn")?.addEventListener("click", () => this.openForm());
    document.getElementById("emptyAdd")?.addEventListener("click", () => this.openForm());
    document.querySelectorAll("[data-manage]").forEach(b => {
      b.onclick = () => this.manageStudents(b.dataset.manage);
    });
    UI.bindRowActions("subjects", id => this.openForm(id));
  },

  openForm(id) {
    const s = id ? { ...DB.get("subjects", id) } : { studentIds: [], teacherIds: [] };
    s.teacherIds = Array.isArray(s.teacherIds) ? [...s.teacherIds] : (s.teacherId ? [s.teacherId] : []);
    const chosenTeachers = new Set(s.teacherIds);
    const allTeachers = DB.list("teachers");

    UI.modal({
      title: id ? i18n.t("common.edit") + " — " + i18n.t("subjects.title") : i18n.t("subjects.add"),
      bodyHTML: `
        <div class="form-grid">
          <div class="field full">
            <label>${i18n.t("subjects.name")} <span class="req">*</span></label>
            <input data-f="name" value="${UI.escape(s.name || "")}"/>
          </div>
          <div class="field">
            <label>${i18n.t("subjects.grade")}</label>
            <select data-f="gradeId">
              <option value="">${i18n.t("subjects.gradeAll")}</option>
              ${DB.list("grades").map(g =>
                `<option value="${UI.escape(g.id)}" ${s.gradeId === g.id ? "selected" : ""}>${UI.escape(g.name)}</option>`
              ).join("")}
            </select>
          </div>
          <div class="field">
            <label>${i18n.t("subjects.shift")}</label>
            <select data-f="shiftId">${UI.options("shifts", s.shiftId, { placeholder: "—" })}</select>
          </div>
          <div class="field">
            <label>${i18n.t("subjects.price")}</label>
            <input type="number" min="0" step="0.01" data-f="price" value="${+s.price || 0}"/>
          </div>
          <div class="field"></div>
          <div class="field full">
            <label>${i18n.t("subjects.teacher")} <span style="color:var(--text-mute);font-weight:400;font-size:11.5px">— pick one or more</span></label>
            ${allTeachers.length ? `
              <div class="checklist" id="teachCl">
                ${allTeachers.map(t => `
                  <label>
                    <input type="checkbox" value="${UI.escape(t.id)}" ${chosenTeachers.has(t.id) ? "checked" : ""}/>
                    <span>${UI.escape(t.name)}</span>
                    <span class="meta">${UI.escape(t.phone || "")}</span>
                  </label>
                `).join("")}
              </div>
            ` : `<div class="hint">${i18n.t("teachers.none")} — ${i18n.t("teachers.emptyCta")}</div>`}
          </div>
          <div class="field full">
            <label>${i18n.t("common.notes")}</label>
            <textarea data-f="notes">${UI.escape(s.notes || "")}</textarea>
          </div>
        </div>
      `,
      footerHTML: `
        <button class="btn ghost" data-close>${i18n.t("common.cancel")}</button>
        ${id ? "" : `<button class="btn" data-save-add>${icon("plus","sm")} ${i18n.t("common.saveAdd")}</button>`}
        <button class="btn primary" data-save>${icon("save")} ${i18n.t("common.save")}</button>
      `,
      onOpen(m) {
        m.querySelector("[data-close]").onclick = UI.closeModal;

        const doSave = (thenAnother) => {
          const data = { ...s };
          m.querySelectorAll("[data-f]").forEach(el => {
            data[el.dataset.f] = el.type === "number"
              ? Math.max(0, +el.value || 0)
              : el.value.trim();
          });
          data.teacherIds = [...m.querySelectorAll("#teachCl input:checked")].map(c => c.value);
          delete data.teacherId; // remove legacy single field
          if (!data.name) return UI.toast(i18n.t("subjects.name") + " *", "error");
          DB.upsert("subjects", data);
          UI.toast(i18n.t("common.saved"), "success");
          if (thenAnother) {
            const rememberedTeachers = data.teacherIds;
            const rememberedGrade = data.gradeId;
            const rememberedShift = data.shiftId;
            UI.closeModal();
            App.renderPageOnly();
            Subjects.openForm();
            setTimeout(() => {
              const g = document.querySelector('[data-f="gradeId"]');
              const sh = document.querySelector('[data-f="shiftId"]');
              if (g) g.value = rememberedGrade;
              if (sh) sh.value = rememberedShift;
              // Re-check remembered teachers
              document.querySelectorAll("#teachCl input").forEach(cb => {
                cb.checked = rememberedTeachers.includes(cb.value);
              });
              document.querySelector('[data-f="name"]')?.focus();
            }, 80);
          } else {
            UI.closeModal();
            App.renderPageOnly();
          }
        };

        m.querySelector("[data-save]").onclick = () => doSave(false);
        m.querySelector("[data-save-add]")?.addEventListener("click", () => doSave(true));
      }
    });
  },

  manageStudents(subjectId) {
    const sub = DB.get("subjects", subjectId);
    if (!sub) return;
    const enrolled = new Set(sub.studentIds || []);
    const allStudents = DB.list("students");
    const targetGrade = sub.gradeId;
    // If the subject has a target grade, default to filtering by it
    let showAll = !targetGrade;

    const renderList = (filterOn) => {
      const list = filterOn
        ? allStudents.filter(s => s.gradeId === targetGrade)
        : allStudents;
      if (!list.length) return UI.empty(i18n.t("students.none"));
      return `<div class="checklist" id="cl">
        ${list.map(st => {
          const g = DB.get("grades", st.gradeId);
          const c = DB.get("classes", st.classId);
          const meta = [g?.name, c?.name].filter(Boolean).join(" · ");
          return `<label>
            <input type="checkbox" value="${UI.escape(st.id)}" ${enrolled.has(st.id) ? "checked" : ""}/>
            <span>${UI.escape(st.fullName)}</span>
            <span class="meta">${UI.escape(meta || st.phone || "")}</span>
          </label>`;
        }).join("")}
      </div>`;
    };

    UI.modal({
      title: `${i18n.t("subjects.enrolled")} — ${sub.name}`,
      wide: true,
      bodyHTML: `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    margin-bottom:10px;color:var(--text-soft);font-size:13px">
          <div>${UI.escape(i18n.t("students.pickSubjects"))}
            <span id="clCount" style="color:var(--text-mute);margin-inline-start:6px"></span>
          </div>
          ${targetGrade ? `
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="checkbox" id="showAllBox" ${showAll ? "checked" : ""}/>
              <span>${i18n.t("common.all")}</span>
            </label>
          ` : ""}
        </div>
        <div id="clWrap">${renderList(!showAll)}</div>
      `,
      footerHTML: `
        <button class="btn ghost" data-close>${i18n.t("common.cancel")}</button>
        <button class="btn primary" data-save>${icon("save")} ${i18n.t("common.save")}</button>
      `,
      onOpen(m) {
        // Preserve current selections across filter toggles
        const selections = new Set(enrolled);
        const wire = () => {
          m.querySelectorAll("#cl input[type='checkbox']").forEach(c => {
            c.onchange = () => {
              if (c.checked) selections.add(c.value); else selections.delete(c.value);
              m.querySelector("#clCount").textContent = `— ${selections.size}/${allStudents.length}`;
            };
          });
          m.querySelector("#clCount").textContent = `— ${selections.size}/${allStudents.length}`;
        };
        wire();
        m.querySelector("#showAllBox")?.addEventListener("change", (e) => {
          showAll = e.target.checked;
          // Apply current selections to the rerendered checkboxes
          m.querySelector("#clWrap").innerHTML = renderList(!showAll);
          // Re-mark checkboxes based on `selections`
          m.querySelectorAll("#cl input[type='checkbox']").forEach(c => {
            c.checked = selections.has(c.value);
          });
          wire();
        });

        m.querySelector("[data-close]").onclick = UI.closeModal;
        m.querySelector("[data-save]").onclick = () => {
          DB.setSubjectStudents(subjectId, [...selections]);
          UI.closeModal();
          UI.toast(i18n.t("common.saved"), "success");
          App.renderPageOnly();
        };
      }
    });
  }
};
