const UI = {
  escape(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])
    );
  },

  toast(msg, type = "") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.className = "toast" + (type ? " " + type : "");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 2400);
  },

  modal({ title, bodyHTML, footerHTML = "", onOpen, wide = false }) {
    const back = document.getElementById("modalBackdrop");
    const modal = document.getElementById("modal");
    modal.classList.toggle("wide", !!wide);
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHTML;
    document.getElementById("modalFoot").innerHTML = footerHTML;
    back.hidden = false;
    if (onOpen) onOpen(modal);
    setTimeout(() => {
      const f = modal.querySelector("input, select, textarea");
      if (f) f.focus();
    }, 40);
  },
  closeModal() {
    const back = document.getElementById("modalBackdrop");
    back.hidden = true;
    document.getElementById("modalBody").innerHTML = "";
    document.getElementById("modalFoot").innerHTML = "";
  },
  confirm(msg, onYes, { okLabel, danger = true } = {}) {
    UI.modal({
      title: i18n.t("common.confirm"),
      bodyHTML: `<p style="margin:0;color:var(--text-soft);line-height:1.5">${UI.escape(msg)}</p>`,
      footerHTML: `
        <button class="btn ghost" data-a="cancel">${i18n.t("common.cancel")}</button>
        <button class="btn ${danger ? "danger" : "primary"}" data-a="ok">${UI.escape(okLabel || i18n.t(danger ? "common.delete" : "common.confirm"))}</button>
      `,
      onOpen(m) {
        m.querySelector('[data-a="cancel"]').onclick = UI.closeModal;
        m.querySelector('[data-a="ok"]').onclick = () => { UI.closeModal(); onYes && onYes(); };
      }
    });
  },

  fmtMoney(n) {
    const c = DB.data.settings.currency || "";
    const num = new Intl.NumberFormat(i18n.lang === "ar" ? "ar-EG" : "en-US").format(+n || 0);
    return c ? `${num} ${c}` : num;
  },
  fmtNumber(n) {
    return new Intl.NumberFormat(i18n.lang === "ar" ? "ar-EG" : "en-US").format(+n || 0);
  },
  fmtDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date)) return UI.escape(d);
    return date.toLocaleDateString(i18n.lang === "ar" ? "ar-EG" : "en-GB");
  },
  fmtTime(d) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date)) return "";
    return date.toLocaleTimeString(i18n.lang === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  },

  // Empty state
  empty(msg, cta = "") {
    return `<div class="empty">
      <div class="em">${icon("inbox", "lg")}</div>
      <div class="empty-text">${UI.escape(msg)}</div>
      ${cta ? `<div class="empty-cta">${cta}</div>` : ""}
    </div>`;
  },

  // Table
  table({ columns, rows, empty }) {
    if (!rows || !rows.length) return empty || UI.empty(i18n.t("common.noResults"));
    const th = columns.map(c => `<th${c.numeric ? ' class="num"' : ""}>${UI.escape(c.label || "")}</th>`).join("");
    const body = rows.map(r => {
      const tds = columns.map(c => {
        let v;
        if (c.render) v = c.render(r);
        else {
          const raw = r[c.key];
          switch (c.type) {
            case "money":  v = UI.fmtMoney(raw); break;
            case "date":   v = UI.fmtDate(raw); break;
            case "number": v = UI.fmtNumber(raw); break;
            default:       v = UI.escape(raw ?? "");
          }
        }
        return `<td${c.numeric ? ' class="num"' : (c.className ? ` class="${c.className}"` : "")}>${v}</td>`;
      }).join("");
      return `<tr data-id="${UI.escape(r.id || "")}">${tds}</tr>`;
    }).join("");
    return `<div class="table-wrap"><table class="data">
      <thead><tr>${th}</tr></thead>
      <tbody>${body}</tbody>
    </table></div>`;
  },

  // Common action buttons for rows
  rowActions(id, { edit = true, del = true } = {}) {
    return `${edit ? `<button class="btn sm" data-edit="${UI.escape(id)}" title="${i18n.t("common.edit")}">${icon("edit","sm")}</button>` : ""}
    ${del ? `<button class="btn sm danger" data-del="${UI.escape(id)}" title="${i18n.t("common.delete")}">${icon("trash","sm")}</button>` : ""}`;
  },

  bindRowActions(entity, onEdit, { confirmLabel } = {}) {
    document.querySelectorAll("[data-edit]").forEach(b => {
      b.onclick = () => onEdit(b.dataset.edit);
    });
    document.querySelectorAll("[data-del]").forEach(b => {
      b.onclick = () => {
        const item = DB.get(entity, b.dataset.del);
        const name = item ? (item.name || item.fullName || item.book || "") : "";
        UI.confirm(
          confirmLabel || `${i18n.t("common.confirmDelete")}${name ? ` — "${name}"` : ""}`,
          () => {
            DB.remove(entity, b.dataset.del);
            UI.toast(i18n.t("common.deleted"), "success");
            App.renderPageOnly();
          }
        );
      };
    });
  },

  // Render a chip row OR a dropdown depending on item count.
  // items: [{ id, name }]
  // Returns HTML with data-* attributes: data-{attrName}="value"
  // If > threshold, uses <select>; else buttons.
  smartFilter({ items, selectedId, attrName, allLabel = "All", threshold = 5 }) {
    if (!items.length) return "";
    if (items.length <= threshold) {
      return `<div class="chip-row">
        <button class="chip ${!selectedId ? "active" : ""}" data-${attrName}="">${UI.escape(allLabel)}</button>
        ${items.map(it => `
          <button class="chip ${selectedId === it.id ? "active" : ""}" data-${attrName}="${UI.escape(it.id)}">${UI.escape(it.name)}</button>
        `).join("")}
      </div>`;
    }
    // Dropdown
    return `<select class="filter-select" data-${attrName}-select>
      <option value="">${UI.escape(allLabel)}</option>
      ${items.map(it => `
        <option value="${UI.escape(it.id)}" ${selectedId === it.id ? "selected" : ""}>${UI.escape(it.name)}</option>
      `).join("")}
    </select>`;
  },

  // <option> list — escapes
  options(entity, selected, { placeholder = null } = {}) {
    const items = DB.list(entity);
    let html = placeholder !== null
      ? `<option value="">${UI.escape(placeholder)}</option>`
      : "";
    items.forEach(it => {
      const name = (i18n.lang === "ar" && it.nameAr) ? it.nameAr : (it.name || it.fullName || "");
      html += `<option value="${UI.escape(it.id)}" ${selected === it.id ? "selected" : ""}>${UI.escape(name)}</option>`;
    });
    return html;
  },

  lookupName(entity, id) {
    const item = DB.get(entity, id);
    if (!item) return "—";
    if (i18n.lang === "ar" && item.nameAr) return item.nameAr;
    return item.name || item.fullName || "—";
  }
};
