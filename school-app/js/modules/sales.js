// Daily sales ledger.
// - Sticky quick-add row at top: book -> teacher -> type -> qty -> price -> +
// - Enter key on any field adds the record.
// - Book field autocompletes from history and auto-fills teacher/type/price.
// - "Start new day" closes the current session; data stays in Reports.

const Sales = {
  draft: { book: "", teacherId: "", typeId: "", qty: 1, price: 0 },

  render() {
    const session = DB.currentSession();
    const rows = DB.sessionSales().sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
    const grand = rows.reduce((sum, r) => sum + (+r.total || 0), 0);
    const units = rows.reduce((sum, r) => sum + (+r.qty || 0), 0);

    const teachers = DB.list("teachers");
    const types    = DB.list("bookTypes");
    const history  = DB.bookHistory();

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("sales.title")}</h1>
          <div class="page-sub">${i18n.t("sales.sub")}</div>
        </div>
        <div class="page-actions">
          <button class="btn" id="newDayBtn" title="${i18n.t("sales.newDay")}">
            ${icon("refresh")} ${i18n.t("sales.newDay")}
          </button>
        </div>
      </div>

      <div class="session-bar">
        <div class="session-info">
          <div class="item">
            <div class="lbl">${i18n.t("sales.session")}</div>
            <div class="val">${UI.fmtDate(session.current)}</div>
          </div>
          <div class="item">
            <div class="lbl">${i18n.t("sales.count")}</div>
            <div class="val">${UI.fmtNumber(rows.length)}</div>
          </div>
          <div class="item">
            <div class="lbl">${i18n.t("common.quantity")}</div>
            <div class="val">${UI.fmtNumber(units)}</div>
          </div>
        </div>
        <div class="session-info">
          <div class="item" style="text-align:end">
            <div class="lbl">${i18n.t("sales.grand")}</div>
            <div class="val big">${UI.fmtMoney(grand)}</div>
          </div>
        </div>
      </div>

      <div class="quickbar-wrap">
        <div class="quickbar-title">${icon("plus","sm")} ${i18n.t("sales.add")}</div>
        <form class="quickbar" id="quickForm" autocomplete="off">
          <div class="qb-field qb-book">
            <label for="qBook">${i18n.t("sales.book")} <span style="color:var(--danger)">*</span></label>
            <input id="qBook" list="bookHist"
              placeholder="${i18n.t("sales.hintBook")}"
              value="${UI.escape(this.draft.book)}" />
            <datalist id="bookHist">
              ${history.map(h => `<option value="${UI.escape(h.book)}"></option>`).join("")}
            </datalist>
          </div>

          <div class="qb-field">
            <label for="qTeacher">${i18n.t("sales.teacher")}</label>
            <select id="qTeacher">
              <option value="">—</option>
              ${teachers.map(t =>
                `<option value="${UI.escape(t.id)}" ${this.draft.teacherId === t.id ? "selected" : ""}>${UI.escape(t.name)}</option>`
              ).join("")}
            </select>
          </div>

          <div class="qb-field">
            <label for="qType">${i18n.t("sales.type")}</label>
            <select id="qType">
              <option value="">—</option>
              ${types.map(t =>
                `<option value="${UI.escape(t.id)}" ${this.draft.typeId === t.id ? "selected" : ""}>${UI.escape(t.name)}</option>`
              ).join("")}
            </select>
          </div>

          <div class="qb-field qb-qty">
            <label for="qQty">${i18n.t("sales.qty")}</label>
            <input id="qQty" type="number" min="1" value="${+this.draft.qty || 1}"/>
          </div>

          <div class="qb-field">
            <label for="qPrice">${i18n.t("sales.price")}</label>
            <input id="qPrice" type="number" min="0" step="0.01" value="${+this.draft.price || 0}"/>
          </div>

          <div class="qb-field qb-add">
            <label style="opacity:0">.</label>
            <button type="button" class="btn primary add-btn" id="qAddBtn">
              ${icon("plus")} ${i18n.t("sales.add")}
            </button>
          </div>
        </form>
        <div class="kbd-hint">↵ Enter after typing a book name to add the record quickly.</div>
      </div>

      ${rows.length ? UI.table({
        columns: [
          { key: "time", label: i18n.t("common.time"),
            render: r => `<span class="tag muted">${UI.fmtTime(r.ts)}</span>` },
          { key: "book", label: i18n.t("sales.book"),
            render: r => `<strong>${UI.escape(r.book)}</strong>` },
          { key: "teacher", label: i18n.t("sales.teacher"),
            render: r => UI.escape(UI.lookupName("teachers", r.teacherId)) },
          { key: "type", label: i18n.t("sales.type"),
            render: r => {
              const t = DB.get("bookTypes", r.typeId);
              return t ? `<span class="tag muted">${UI.escape(t.name)}</span>` : "—";
            } },
          { key: "qty",   label: i18n.t("sales.qty"),   numeric: true, type: "number" },
          { key: "price", label: i18n.t("sales.price"), numeric: true, type: "money" },
          { key: "total", label: i18n.t("sales.total"), numeric: true,
            render: r => `<strong>${UI.fmtMoney(r.total)}</strong>` },
          { key: "actions", label: "", className: "num",
            render: r => `<button class="btn sm danger" data-del="${UI.escape(r.id)}" title="${i18n.t("common.delete")}">${icon("trash","sm")}</button>` }
        ],
        rows
      }) : `<div class="card"><div class="card-body">
        ${UI.empty(i18n.t("sales.empty"), `<div style="color:var(--text-mute)">${i18n.t("sales.emptyCta")}</div>`)}
      </div></div>`}
    `;
  },

  bind() {
    const form = document.getElementById("quickForm");
    if (form) {
      // Prevent native submit (belt & suspenders)
      form.addEventListener("submit", e => { e.preventDefault(); this.submit(); });

      // Direct click handler on the Add button — most reliable
      const addBtn = document.getElementById("qAddBtn");
      if (addBtn) addBtn.onclick = () => this.submit();

      // Enter key on any input in the quickbar → submit
      form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("keydown", e => {
          if (e.key === "Enter") { e.preventDefault(); this.submit(); }
        });
      });

      // Book autocomplete — fills teacher, type, price from history
      const bookIn = document.getElementById("qBook");
      if (bookIn) bookIn.addEventListener("input", e => {
        this.draft.book = e.target.value;
        const match = DB.bookHistory().find(h => h.book.toLowerCase() === e.target.value.trim().toLowerCase());
        if (match) {
          this.draft.teacherId = match.teacherId || "";
          this.draft.typeId    = match.typeId    || "";
          this.draft.price     = match.price     || 0;
          const t  = document.getElementById("qTeacher"); if (t)  t.value  = this.draft.teacherId;
          const ty = document.getElementById("qType");    if (ty) ty.value = this.draft.typeId;
          const p  = document.getElementById("qPrice");   if (p)  p.value  = this.draft.price;
        }
      });
      document.getElementById("qTeacher")?.addEventListener("change", e => this.draft.teacherId = e.target.value);
      document.getElementById("qType")?.addEventListener("change",    e => this.draft.typeId    = e.target.value);
      document.getElementById("qQty")?.addEventListener("input",      e => this.draft.qty      = e.target.value);
      document.getElementById("qPrice")?.addEventListener("input",    e => this.draft.price    = e.target.value);
    }

    // Delete row
    document.querySelectorAll("[data-del]").forEach(b => {
      b.onclick = () => {
        UI.confirm(i18n.t("common.confirmDelete"), () => {
          DB.removeSale(b.dataset.del);
          UI.toast(i18n.t("common.deleted"), "success");
          App.renderPageOnly();
        });
      };
    });

    document.getElementById("newDayBtn")?.addEventListener("click", () => {
      UI.confirm(i18n.t("sales.newDayConfirm"), () => {
        DB.startNewDay();
        this.draft = { book: "", teacherId: "", typeId: "", qty: 1, price: 0 };
        UI.toast(i18n.t("common.saved"), "success");
        App.renderPageOnly();
      }, { danger: false, okLabel: i18n.t("sales.newDay") });
    });
  },

  submit() {
    try {
      const book      = (document.getElementById("qBook")?.value || "").trim();
      const teacherId = document.getElementById("qTeacher")?.value || "";
      const typeId    = document.getElementById("qType")?.value    || "";
      const qty       = document.getElementById("qQty")?.value     || "1";
      const price     = document.getElementById("qPrice")?.value   || "0";

      if (!book) {
        UI.toast(i18n.t("sales.book") + " *", "error");
        document.getElementById("qBook")?.focus();
        return;
      }
      if (!(+qty >= 1)) {
        UI.toast(i18n.t("sales.qty") + " ≥ 1", "error");
        document.getElementById("qQty")?.focus();
        return;
      }

      DB.addSale({ book, teacherId, typeId, qty, price });

      // Keep teacher/type/price (repeat sales). Clear book+qty.
      this.draft = { book: "", teacherId, typeId, qty: 1, price };
      UI.toast(i18n.t("common.saved"), "success");
      App.renderPageOnly();
      setTimeout(() => document.getElementById("qBook")?.focus(), 40);
    } catch (e) {
      UI.toast(e.message || "Error", "error");
    }
  }
};
