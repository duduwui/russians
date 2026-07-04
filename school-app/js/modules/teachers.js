const Teachers = {
  filter: { q: "" },

  render() {
    const q = this.filter.q.toLowerCase();
    const rows = DB.list("teachers").filter(t =>
      !q || (t.name || "").toLowerCase().includes(q) || (t.phone || "").includes(this.filter.q)
    );

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("teachers.title")}</h1>
          <div class="page-sub">${i18n.t("teachers.sub")} • ${UI.fmtNumber(rows.length)}</div>
        </div>
        <div class="page-actions">
          <button class="btn primary" id="addBtn">${icon("plus")} ${i18n.t("teachers.add")}</button>
        </div>
      </div>

      ${DB.list("teachers").length ? `
        <div class="toolbar">
          <input class="search" id="q" placeholder="${i18n.t("common.search")}" value="${UI.escape(this.filter.q)}"/>
        </div>
      ` : ""}

      ${rows.length ? UI.table({
        columns: [
          { key: "name", label: i18n.t("common.name"),
            render: r => `<strong>${UI.escape(r.name)}</strong>` },
          { key: "phone", label: i18n.t("teachers.phone"),
            render: r => UI.escape(r.phone || "—") },
          { key: "subjects", label: i18n.t("teachers.subjects"),
            render: r => {
              const subs = DB.list("subjects").filter(s => s.teacherId === r.id);
              if (!subs.length) return `<span class="tag muted">${i18n.t("common.none")}</span>`;
              return subs.map(s => `<span class="tag">${UI.escape(s.name)}</span>`).join(" ");
            } },
          { key: "actions", label: "", className: "num",
            render: r => UI.rowActions(r.id) }
        ],
        rows
      }) : `<div class="card"><div class="card-body">
        ${UI.empty(i18n.t("teachers.none"),
          `<div style="margin-top:8px;color:var(--text-mute)">${i18n.t("teachers.emptyCta")}</div>
           <button class="btn primary" id="emptyAdd" style="margin-top:14px">${icon("plus")} ${i18n.t("teachers.add")}</button>`)}
      </div></div>`}
    `;
  },

  bind() {
    document.getElementById("q")?.addEventListener("input", e => { this.filter.q = e.target.value; App.renderPageOnly(); });
    document.getElementById("addBtn")?.addEventListener("click", () => this.openForm());
    document.getElementById("emptyAdd")?.addEventListener("click", () => this.openForm());
    UI.bindRowActions("teachers", id => this.openForm(id));
  },

  openForm(id) {
    const t = id ? { ...DB.get("teachers", id) } : {};
    UI.modal({
      title: id ? i18n.t("common.edit") + " — " + i18n.t("teachers.title") : i18n.t("teachers.add"),
      bodyHTML: `
        <div class="form-grid">
          <div class="field full">
            <label>${i18n.t("common.name")} <span class="req">*</span></label>
            <input data-f="name" value="${UI.escape(t.name || "")}"/>
          </div>
          <div class="field full">
            <label>${i18n.t("teachers.phone")}</label>
            <input data-f="phone" value="${UI.escape(t.phone || "")}"/>
          </div>
          <div class="field full">
            <label>${i18n.t("common.notes")}</label>
            <textarea data-f="notes">${UI.escape(t.notes || "")}</textarea>
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
          const data = { ...t };
          m.querySelectorAll("[data-f]").forEach(el => { data[el.dataset.f] = el.value.trim(); });
          if (!data.name) return UI.toast(i18n.t("common.name") + " *", "error");
          DB.upsert("teachers", data);
          UI.toast(i18n.t("common.saved"), "success");
          if (thenAnother) {
            UI.closeModal();
            App.renderPageOnly();
            Teachers.openForm();
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
