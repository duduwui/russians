const Students = {
  filter: { q: "", subjectId: "", gradeId: "", classId: "" },

  render() {
    const grades = DB.list("grades");
    const classes = DB.classesForGrade(this.filter.gradeId);

    const q = this.filter.q.toLowerCase();
    const rows = DB.list("students").filter(s => {
      if (q && !(s.fullName || "").toLowerCase().includes(q)
           && !(s.phone || "").includes(this.filter.q)) return false;
      if (this.filter.subjectId && !(s.subjectIds || []).includes(this.filter.subjectId)) return false;
      if (this.filter.gradeId && s.gradeId !== this.filter.gradeId) return false;
      if (this.filter.classId && s.classId !== this.filter.classId) return false;
      return true;
    });

    const totalStudents = DB.list("students").length;
    const activeFilters = [
      this.filter.gradeId && UI.lookupName("grades", this.filter.gradeId),
      this.filter.classId && UI.lookupName("classes", this.filter.classId),
      this.filter.subjectId && UI.lookupName("subjects", this.filter.subjectId)
    ].filter(Boolean);

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("students.title")}</h1>
          <div class="page-sub">
            ${UI.fmtNumber(rows.length)} of ${UI.fmtNumber(totalStudents)}
            ${activeFilters.length ? ` · ${activeFilters.map(f => UI.escape(f)).join(" · ")}` : ""}
          </div>
        </div>
        <div class="page-actions">
          <button class="btn primary" id="addBtn">${icon("plus")} ${i18n.t("students.add")}</button>
        </div>
      </div>

      ${totalStudents ? `
        ${grades.length ? `
          <div class="filter-bar">
            <div class="filter-group">
              <span class="filter-label">${i18n.t("students.grade")}</span>
              ${UI.smartFilter({ items: grades, selectedId: this.filter.gradeId, attrName: "fgrade", allLabel: i18n.t("common.all") })}
            </div>
            ${this.filter.gradeId && classes.length ? `
              <div class="filter-group">
                <span class="filter-label">${i18n.t("students.class")}</span>
                ${UI.smartFilter({ items: classes, selectedId: this.filter.classId, attrName: "fclass", allLabel: i18n.t("common.all") })}
              </div>
            ` : ""}
            ${(() => {
              const relevantSubs = DB.list("subjects").filter(s =>
                !this.filter.gradeId || !s.gradeId || s.gradeId === this.filter.gradeId
              );
              if (!relevantSubs.length) return "";
              return `
                <div class="filter-group">
                  <span class="filter-label">${i18n.t("nav.subjects")}</span>
                  ${UI.smartFilter({ items: relevantSubs, selectedId: this.filter.subjectId, attrName: "fsubject", allLabel: i18n.t("common.all") })}
                </div>
              `;
            })()}
            ${(this.filter.gradeId || this.filter.classId || this.filter.subjectId) ? `
              <button class="btn sm ghost" id="resetFilters">${icon("x","sm")} ${i18n.t("common.reset")}</button>
            ` : ""}
          </div>
        ` : ""}
        <div class="toolbar">
          <input class="search" id="q" placeholder="${i18n.t("common.search")}" value="${UI.escape(this.filter.q)}"/>
        </div>
      ` : ""}

      ${rows.length ? UI.table({
        columns: [
          { key: "fullName", label: i18n.t("students.fullName"),
            render: r => `<strong>${UI.escape(r.fullName)}</strong>` },
          { key: "phone", label: i18n.t("students.phone"),
            render: r => UI.escape(r.phone || "—") },
          { key: "grade", label: i18n.t("students.grade"),
            render: r => {
              const g = DB.get("grades", r.gradeId);
              return g ? `<span class="tag muted">${UI.escape(g.name)}</span>` : "—";
            } },
          { key: "class", label: i18n.t("students.class"),
            render: r => {
              const c = DB.get("classes", r.classId);
              return c ? `<span class="tag muted">${UI.escape(c.name)}</span>` : "—";
            } },
          { key: "subjects", label: i18n.t("students.subjects"),
            render: r => {
              const ids = r.subjectIds || [];
              if (!ids.length) return `<span class="tag muted">${i18n.t("common.none")}</span>`;
              return ids.map(id => {
                const s = DB.get("subjects", id);
                return s ? `<span class="tag">${UI.escape(s.name)}</span>` : "";
              }).join(" ");
            } },
          { key: "actions", label: "", className: "num",
            render: r => UI.rowActions(r.id) }
        ],
        rows
      }) : `<div class="card"><div class="card-body">
        ${UI.empty(i18n.t("students.none"),
          `<div style="margin-top:8px;color:var(--text-mute)">${i18n.t("students.emptyCta")}</div>
           <button class="btn primary" id="emptyAdd" style="margin-top:14px">${icon("plus")} ${i18n.t("students.add")}</button>`)}
      </div></div>`}
    `;
  },

  bind() {
    document.getElementById("q")?.addEventListener("input", e => { this.filter.q = e.target.value; App.renderPageOnly(); });

    // Chip OR dropdown handlers (smartFilter uses whichever fits)
    const wireFilter = (attr, key, resetClass = false) => {
      document.querySelectorAll(`[data-${attr}]`).forEach(b => {
        // Chip button
        if (b.tagName === "BUTTON") {
          b.onclick = () => {
            this.filter[key] = b.dataset[toCamel(attr)];
            if (resetClass) this.filter.classId = "";
            App.renderPageOnly();
          };
        }
      });
      const sel = document.querySelector(`[data-${attr}-select]`);
      if (sel) sel.onchange = e => {
        this.filter[key] = e.target.value;
        if (resetClass) this.filter.classId = "";
        App.renderPageOnly();
      };
    };
    const toCamel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

    wireFilter("fgrade",   "gradeId", true);
    wireFilter("fclass",   "classId");
    wireFilter("fsubject", "subjectId");

    document.getElementById("resetFilters")?.addEventListener("click", () => {
      this.filter = { q: this.filter.q, subjectId: "", gradeId: "", classId: "" };
      App.renderPageOnly();
    });
    document.getElementById("addBtn")?.addEventListener("click", () => this.openForm());
    document.getElementById("emptyAdd")?.addEventListener("click", () => this.openForm());
    UI.bindRowActions("students", id => this.openForm(id));
  },

  openForm(id) {
    const s = id ? { ...DB.get("students", id) } : { subjectIds: [], enrolled: DB.today() };
    s.custom = Array.isArray(s.custom) ? [...s.custom] : [];
    const selectedSubs = new Set(s.subjectIds || []);
    const allSubs = DB.list("subjects");

    UI.modal({
      title: id ? i18n.t("common.edit") + " — " + i18n.t("students.title") : i18n.t("students.add"),
      wide: true,
      bodyHTML: `
        <div class="form-grid">
          <div class="field full">
            <label>${i18n.t("students.fullName")} <span class="req">*</span></label>
            <input data-f="fullName" value="${UI.escape(s.fullName || "")}" required/>
          </div>
          <div class="field">
            <label>${i18n.t("students.phone")}</label>
            <input data-f="phone" value="${UI.escape(s.phone || "")}"/>
          </div>
          <div class="field">
            <label>${i18n.t("students.gender")}</label>
            <select data-f="gender">
              <option value="">—</option>
              <option value="male"   ${s.gender === "male"   ? "selected" : ""}>${i18n.t("students.male")}</option>
              <option value="female" ${s.gender === "female" ? "selected" : ""}>${i18n.t("students.female")}</option>
            </select>
          </div>
          <div class="field">
            <label>${i18n.t("students.dob")}</label>
            <input type="date" data-f="dob" value="${UI.escape(s.dob || "")}"/>
          </div>
          <div class="field">
            <label>${i18n.t("students.enrolled")}</label>
            <input type="date" data-f="enrolled" value="${UI.escape(s.enrolled || DB.today())}"/>
          </div>
          <div class="field">
            <label>${i18n.t("students.guardian")}</label>
            <input data-f="guardian" value="${UI.escape(s.guardian || "")}"/>
          </div>

          <div class="field">
            <label>${i18n.t("students.grade")}</label>
            <select data-f="gradeId" id="stuGradeSel">
              <option value="">—</option>
              ${DB.list("grades").map(g =>
                `<option value="${UI.escape(g.id)}" ${s.gradeId === g.id ? "selected" : ""}>${UI.escape(g.name)}</option>`
              ).join("")}
            </select>
          </div>
          <div class="field">
            <label>${i18n.t("students.class")}</label>
            <select data-f="classId" id="stuClassSel">
              <option value="">${s.gradeId ? "—" : i18n.t("students.pickClassHint")}</option>
              ${DB.classesForGrade(s.gradeId).map(c =>
                `<option value="${UI.escape(c.id)}" ${s.classId === c.id ? "selected" : ""}>${UI.escape(c.name)}</option>`
              ).join("")}
            </select>
          </div>

          <div class="field full">
            <label>${i18n.t("students.address")}</label>
            <input data-f="address" value="${UI.escape(s.address || "")}"/>
          </div>
          <div class="field full">
            <label>${i18n.t("students.subjects")} <span id="subHint" style="color:var(--text-mute);font-weight:400;font-size:11.5px"></span></label>
            ${allSubs.length
              ? `<div class="checklist" id="subCl"></div>`
              : `<div class="hint">${i18n.t("subjects.none")} — ${i18n.t("subjects.emptyCta")}</div>`}
          </div>
          <div class="field full">
            <label>${i18n.t("students.custom")}</label>
            <div class="custom-fields" id="customFields"></div>
            <button type="button" class="btn sm" id="addCustom" style="margin-top:8px;align-self:flex-start">
              ${icon("plus","sm")} ${i18n.t("students.addField")}
            </button>
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
        // Grade → Class cascade + Grade → Subjects cascade
        const gradeSel = m.querySelector("#stuGradeSel");
        const classSel = m.querySelector("#stuClassSel");
        const subCl    = m.querySelector("#subCl");
        const subHint  = m.querySelector("#subHint");

        // Track selections across grade switches
        const chosen = new Set(selectedSubs);

        const renderSubList = () => {
          if (!subCl) return;
          const gid = gradeSel ? gradeSel.value : s.gradeId;
          // "All grades" subjects (no gradeId) always show; grade-specific match current grade
          const relevant = allSubs.filter(sub => !sub.gradeId || !gid || sub.gradeId === gid);
          if (!relevant.length) {
            subCl.innerHTML = `<div style="padding:12px;color:var(--text-mute);font-size:13px">
              ${gid ? "No subjects match this grade yet." : i18n.t("subjects.none")}
            </div>`;
            if (subHint) subHint.textContent = "";
            return;
          }
          subCl.innerHTML = relevant.map(sub => `
            <label>
              <input type="checkbox" value="${UI.escape(sub.id)}" ${chosen.has(sub.id) ? "checked" : ""}/>
              <span>${UI.escape(sub.name)}</span>
              <span class="meta">${UI.escape(UI.lookupName("teachers", sub.teacherId))}</span>
            </label>
          `).join("");
          subCl.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.onchange = () => {
              if (cb.checked) chosen.add(cb.value); else chosen.delete(cb.value);
            };
          });
          if (subHint) subHint.textContent = gid
            ? `— ${relevant.length} for this grade`
            : `— ${allSubs.length} total`;
        };

        if (gradeSel && classSel) {
          gradeSel.addEventListener("change", () => {
            const gid = gradeSel.value;
            const opts = DB.classesForGrade(gid);
            classSel.innerHTML =
              `<option value="">${gid ? "—" : i18n.t("students.pickClassHint")}</option>` +
              opts.map(c =>
                `<option value="${UI.escape(c.id)}">${UI.escape(c.name)}</option>`
              ).join("");
            renderSubList();
          });
        }
        renderSubList();

        // Custom fields renderer
        const cfWrap = m.querySelector("#customFields");
        const renderCF = () => {
          if (!s.custom.length) {
            cfWrap.innerHTML = `<div class="empty-line">${i18n.t("common.none")}</div>`;
            return;
          }
          cfWrap.innerHTML = s.custom.map((f, i) => `
            <div class="row">
              <input placeholder="${i18n.t("students.fieldLabel")}" value="${UI.escape(f.label)}" data-cf-lbl="${i}"/>
              <input placeholder="${i18n.t("students.fieldValue")}" value="${UI.escape(f.value)}" data-cf-val="${i}"/>
              <button type="button" class="btn sm ghost" data-cf-del="${i}" title="${i18n.t("common.remove")}">${icon("close","sm")}</button>
            </div>
          `).join("");
          cfWrap.querySelectorAll("[data-cf-lbl]").forEach(inp => {
            inp.oninput = e => { s.custom[+e.target.dataset.cfLbl].label = e.target.value; };
          });
          cfWrap.querySelectorAll("[data-cf-val]").forEach(inp => {
            inp.oninput = e => { s.custom[+e.target.dataset.cfVal].value = e.target.value; };
          });
          cfWrap.querySelectorAll("[data-cf-del]").forEach(btn => {
            btn.onclick = () => { s.custom.splice(+btn.dataset.cfDel, 1); renderCF(); };
          });
        };
        renderCF();
        m.querySelector("#addCustom").onclick = () => {
          s.custom.push({ label: "", value: "" });
          renderCF();
        };

        m.querySelector("[data-close]").onclick = UI.closeModal;

        const doSave = (thenAnother) => {
          const data = { ...s };
          m.querySelectorAll("[data-f]").forEach(el => {
            data[el.dataset.f] = el.value.trim ? el.value.trim() : el.value;
          });
          data.custom = s.custom.filter(f => f.label.trim() || f.value.trim());
          if (!data.fullName) return UI.toast(i18n.t("students.fullName") + " *", "error");
          const saved = DB.upsert("students", data);
          DB.setStudentSubjects(saved.id, [...chosen]);
          UI.toast(i18n.t("common.saved"), "success");
          if (thenAnother) {
            // Remember grade/class so multiple entries in the same class are fast
            const rememberedGrade = data.gradeId;
            const rememberedClass = data.classId;
            UI.closeModal();
            App.renderPageOnly();
            Students.openForm();
            // After reopen, pre-fill grade+class
            setTimeout(() => {
              const gs = document.getElementById("stuGradeSel");
              const cs = document.getElementById("stuClassSel");
              if (gs && rememberedGrade) {
                gs.value = rememberedGrade;
                gs.dispatchEvent(new Event("change", { bubbles: true }));
                if (cs && rememberedClass) cs.value = rememberedClass;
              }
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
  }
};
