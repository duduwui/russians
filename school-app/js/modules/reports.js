// Reports — insight-first, one chart, filterable transaction log.
const Reports = {
  range: "week",       // today | week | month | all | custom
  customFrom: "",
  customTo: "",
  logFilter: { q: "", teacherId: "", typeId: "" },

  ranges() {
    return [
      { id: "today", label: i18n.t("reports.rangeToday") },
      { id: "week",  label: i18n.t("reports.rangeWeek") },
      { id: "month", label: i18n.t("reports.rangeMonth") },
      { id: "all",   label: i18n.t("reports.rangeAll") },
      { id: "custom",label: i18n.t("reports.rangeCustom") }
    ];
  },

  // Returns { from, to } for the currently selected range
  bounds() {
    const now = new Date();
    const iso = d => d.toISOString().slice(0, 10);
    if (this.range === "today") return { from: iso(now), to: iso(now) };
    if (this.range === "week")  { const d = new Date(now); d.setDate(d.getDate() - 6);  return { from: iso(d), to: iso(now) }; }
    if (this.range === "month") { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: iso(d), to: iso(now) }; }
    if (this.range === "custom") return {
      from: this.customFrom || iso(now),
      to:   this.customTo   || iso(now)
    };
    return { from: null, to: null };
  },

  // Returns the equivalent prior period for delta comparisons
  prevBounds() {
    const { from, to } = this.bounds();
    if (!from || !to) return { from: null, to: null };
    const start = new Date(from), end = new Date(to);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (days - 1));
    const iso = d => d.toISOString().slice(0, 10);
    return { from: iso(prevStart), to: iso(prevEnd) };
  },

  salesIn(bounds) {
    const { from, to } = bounds;
    return DB.list("sales").filter(s => {
      const d = (s.session || (s.ts || "").slice(0, 10));
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    });
  },

  filtered() { return this.salesIn(this.bounds()); },

  // ---------- RENDER ----------
  render() {
    const rows = this.filtered();
    const prevRows = this.salesIn(this.prevBounds());
    const { from, to } = this.bounds();

    const revenue = rows.reduce((s, r) => s + (+r.total || 0), 0);
    const prevRev = prevRows.reduce((s, r) => s + (+r.total || 0), 0);
    const units   = rows.reduce((s, r) => s + (+r.qty || 0), 0);
    const prevUn  = prevRows.reduce((s, r) => s + (+r.qty || 0), 0);
    const txns    = rows.length;
    const prevTxns= prevRows.length;
    const avg     = txns ? revenue / txns : 0;
    const prevAvg = prevTxns ? prevRev / prevTxns : 0;

    // Best-day / best-book / best-teacher for the current range
    const dayMap = {}, bookMap = {}, teachMap = {};
    rows.forEach(r => {
      const d = r.session || (r.ts || "").slice(0, 10);
      dayMap[d] = (dayMap[d] || 0) + (+r.total || 0);
      const bk = (r.book || "").trim();
      if (bk) {
        if (!bookMap[bk]) bookMap[bk] = { qty: 0, revenue: 0 };
        bookMap[bk].qty += (+r.qty || 0);
        bookMap[bk].revenue += (+r.total || 0);
      }
      const tid = r.teacherId;
      if (tid) {
        if (!teachMap[tid]) teachMap[tid] = { qty: 0, revenue: 0 };
        teachMap[tid].qty += (+r.qty || 0);
        teachMap[tid].revenue += (+r.total || 0);
      }
    });
    const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
    const bestBook = Object.entries(bookMap).sort((a, b) => b[1].revenue - a[1].revenue)[0];
    const bestTeacher = Object.entries(teachMap).sort((a, b) => b[1].revenue - a[1].revenue)[0];

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("reports.title")}</h1>
          <div class="page-sub">${from ? `${UI.fmtDate(from)} — ${UI.fmtDate(to)}` : i18n.t("reports.rangeAll")}</div>
        </div>
        <div class="page-actions">
          <button class="btn" id="printBtn">${icon("print")} ${i18n.t("common.print")}</button>
          <button class="btn" id="csvBtn">${icon("download")} CSV</button>
        </div>
      </div>

      <div class="toolbar" style="margin-bottom:14px">
        ${this.ranges().map(r =>
          `<button class="btn ${this.range === r.id ? "primary" : ""}" data-range="${r.id}">${UI.escape(r.label)}</button>`
        ).join("")}
        ${this.range === "custom" ? `
          <input type="date" id="cFrom" value="${UI.escape(this.customFrom)}" title="${i18n.t("common.from")}"/>
          <input type="date" id="cTo"   value="${UI.escape(this.customTo)}"   title="${i18n.t("common.to")}"/>
        ` : ""}
      </div>

      ${!rows.length ? `
        <div class="card"><div class="card-body">${UI.empty(i18n.t("reports.empty"))}</div></div>
      ` : `
        <div class="stat-grid">
          ${this.metricCard(i18n.t("reports.revenue"),      UI.fmtMoney(revenue), revenue, prevRev, "sales", "success")}
          ${this.metricCard(i18n.t("reports.transactions"), UI.fmtNumber(txns),   txns,    prevTxns, "reports")}
          ${this.metricCard(i18n.t("reports.units"),        UI.fmtNumber(units),  units,   prevUn,   "subject")}
          ${this.metricCard(i18n.t("reports.avg"),          UI.fmtMoney(avg),     avg,     prevAvg,  "trending", "info")}
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><h3>${icon("info","sm")} ${i18n.t("reports.insights")}</h3></div>
          <div class="card-body">
            <div class="insight-grid">
              ${this.insightItem("bestDay", i18n.t("reports.bestDay"),
                bestDay ? UI.fmtDate(bestDay[0]) : "—",
                bestDay ? UI.fmtMoney(bestDay[1]) : "")}
              ${this.insightItem("bestBook", i18n.t("reports.bestBook"),
                bestBook ? bestBook[0] : "—",
                bestBook ? `${UI.fmtNumber(bestBook[1].qty)} units · ${UI.fmtMoney(bestBook[1].revenue)}` : "")}
              ${this.insightItem("bestTeacher", i18n.t("reports.bestTeacher"),
                bestTeacher ? UI.lookupName("teachers", bestTeacher[0]) : "—",
                bestTeacher ? UI.fmtMoney(bestTeacher[1].revenue) : "")}
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><h3>${icon("trending","sm")} ${i18n.t("reports.trend")}</h3></div>
          <div class="card-body">${this.renderTrend(rows)}</div>
        </div>
      `}

      ${this.renderLog()}
    `;
  },

  metricCard(label, value, cur, prev, iconName, tone = "") {
    const delta = prev > 0 ? ((cur - prev) / prev) * 100 : (cur > 0 ? 100 : 0);
    const up = delta >= 0;
    const deltaStr = prev === 0 && cur === 0
      ? "—"
      : (isFinite(delta) ? `${up ? "+" : ""}${delta.toFixed(0)}%` : "—");
    const deltaCls = prev === 0 && cur === 0 ? "flat" : (up ? "up" : "down");
    return `
      <div class="stat ${tone}">
        <div>
          <div class="lbl">${UI.escape(label)}</div>
          <div class="val">${value}</div>
          <div class="sub delta ${deltaCls}">
            ${deltaCls === "flat" ? "" : icon(up ? "arrowUp" : "arrowDown", "sm")}
            ${UI.escape(deltaStr)} ${i18n.t("reports.vsPrev")}
          </div>
        </div>
        <div class="stat-ic">${icon(iconName)}</div>
      </div>
    `;
  },

  insightItem(cls, title, big, sub) {
    return `
      <div class="insight-item ${cls}">
        <div class="insight-title">${UI.escape(title)}</div>
        <div class="insight-big">${UI.escape(big)}</div>
        ${sub ? `<div class="insight-sub">${UI.escape(sub)}</div>` : ""}
      </div>
    `;
  },

  renderTrend(rows) {
    const map = {};
    rows.forEach(r => {
      const d = r.session || (r.ts || "").slice(0, 10);
      if (!d) return;
      map[d] = (map[d] || 0) + (+r.total || 0);
    });
    const { from, to } = this.bounds();
    const days = [];
    if (from && to) {
      const cur = new Date(from), end = new Date(to);
      while (cur <= end && days.length < 90) {
        const iso = cur.toISOString().slice(0, 10);
        days.push({ date: iso, total: map[iso] || 0 });
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([date, total]) => days.push({ date, total }));
    }
    if (!days.length) return UI.empty(i18n.t("reports.empty"));
    const max = Math.max(...days.map(d => d.total), 1);
    const showLabels = days.length <= 14;
    return `
      <div class="chart-bars">
        ${days.map(d => `
          <div class="bar" style="height:${(d.total / max * 100).toFixed(1)}%" title="${UI.fmtDate(d.date)} — ${UI.fmtMoney(d.total)}">
            <span class="lbl">${UI.fmtMoney(d.total)}</span>
          </div>
        `).join("")}
      </div>
      <div class="chart-axis">
        ${days.map(d => showLabels
          ? `<span title="${UI.fmtDate(d.date)}">${d.date.slice(5)}</span>`
          : `<span></span>`).join("")}
      </div>
    `;
  },

  // ---------- LOG ----------
  renderLog() {
    // The log uses its own filter (independent of the range chips) so users can
    // track any past sale quickly.
    const all = [...DB.list("sales")];
    const q = this.logFilter.q.toLowerCase();
    const filtered = all.filter(r => {
      if (q && !(r.book || "").toLowerCase().includes(q)) return false;
      if (this.logFilter.teacherId && r.teacherId !== this.logFilter.teacherId) return false;
      if (this.logFilter.typeId && r.typeId !== this.logFilter.typeId) return false;
      return true;
    }).sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));

    // Cap for performance; can expand later with paging
    const cap = 200;
    const shown = filtered.slice(0, cap);
    const grandTotal = filtered.reduce((s, r) => s + (+r.total || 0), 0);

    return `
      <div class="card">
        <div class="card-head">
          <div>
            <h3>${icon("reports","sm")} ${i18n.t("reports.log")}</h3>
            <div style="color:var(--text-mute);font-size:12px;margin-top:2px">${i18n.t("reports.logSub")}</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;color:var(--text-soft);font-size:12.5px">
            <span>${i18n.t("reports.showing")} <strong>${UI.fmtNumber(shown.length)}</strong> ${i18n.t("reports.of")} ${UI.fmtNumber(filtered.length)} ${i18n.t("reports.records")}</span>
            <span class="tag success">${UI.fmtMoney(grandTotal)}</span>
          </div>
        </div>
        <div class="card-body" style="padding:14px 18px 0">
          <div class="log-filters">
            <input class="search" id="logQ" placeholder="${i18n.t("reports.filterBook")}" value="${UI.escape(this.logFilter.q)}"/>
            <select id="logT">
              <option value="">${i18n.t("common.all")} — ${i18n.t("reports.filterTeacher")}</option>
              ${DB.list("teachers").map(t =>
                `<option value="${UI.escape(t.id)}" ${this.logFilter.teacherId === t.id ? "selected" : ""}>${UI.escape(t.name)}</option>`
              ).join("")}
            </select>
            <select id="logType">
              <option value="">${i18n.t("common.all")} — ${i18n.t("reports.filterType")}</option>
              ${DB.list("bookTypes").map(bt =>
                `<option value="${UI.escape(bt.id)}" ${this.logFilter.typeId === bt.id ? "selected" : ""}>${UI.escape(bt.name)}</option>`
              ).join("")}
            </select>
            ${(this.logFilter.q || this.logFilter.teacherId || this.logFilter.typeId) ? `
              <button class="btn sm ghost" id="logReset">${icon("x","sm")} ${i18n.t("common.reset")}</button>
            ` : ""}
          </div>
        </div>
        <div class="card-body" style="padding:0">
          ${shown.length ? UI.table({
            columns: [
              { key: "date", label: i18n.t("common.date"),
                render: r => `<span style="color:var(--text-mute);font-variant-numeric:tabular-nums">${UI.fmtDate(r.session || r.ts)}</span>` },
              { key: "time", label: i18n.t("common.time"),
                render: r => `<span class="tag muted">${UI.fmtTime(r.ts)}</span>` },
              { key: "book", label: i18n.t("sales.book"),
                render: r => `<strong>${UI.escape(r.book || "—")}</strong>` },
              { key: "teacher", label: i18n.t("sales.teacher"),
                render: r => UI.escape(UI.lookupName("teachers", r.teacherId)) },
              { key: "type",  label: i18n.t("sales.type"),
                render: r => {
                  const t = DB.get("bookTypes", r.typeId);
                  return t ? `<span class="tag muted">${UI.escape(t.name)}</span>` : "—";
                } },
              { key: "qty",   label: i18n.t("sales.qty"),   numeric: true, type: "number" },
              { key: "price", label: i18n.t("sales.price"), numeric: true, type: "money" },
              { key: "total", label: i18n.t("sales.total"), numeric: true,
                render: r => `<strong>${UI.fmtMoney(r.total)}</strong>` }
            ],
            rows: shown
          }) : UI.empty(i18n.t("reports.empty"))}
          ${filtered.length > cap ? `
            <div style="padding:12px 18px;text-align:center;color:var(--text-mute);font-size:12.5px;border-top:1px solid var(--border)">
              Showing first ${cap} — refine filters to narrow further.
            </div>
          ` : ""}
        </div>
      </div>
    `;
  },

  bind() {
    document.querySelectorAll("[data-range]").forEach(b => {
      b.onclick = () => { this.range = b.dataset.range; App.renderPageOnly(); };
    });
    document.getElementById("cFrom")?.addEventListener("change", e => { this.customFrom = e.target.value; App.renderPageOnly(); });
    document.getElementById("cTo")?.addEventListener("change",   e => { this.customTo   = e.target.value; App.renderPageOnly(); });
    document.getElementById("printBtn")?.addEventListener("click", () => window.print());
    document.getElementById("csvBtn")?.addEventListener("click", () => this.exportCSV());

    // Log filters
    document.getElementById("logQ")?.addEventListener("input", e => { this.logFilter.q = e.target.value; App.renderPageOnly(); });
    document.getElementById("logT")?.addEventListener("change", e => { this.logFilter.teacherId = e.target.value; App.renderPageOnly(); });
    document.getElementById("logType")?.addEventListener("change", e => { this.logFilter.typeId = e.target.value; App.renderPageOnly(); });
    document.getElementById("logReset")?.addEventListener("click", () => {
      this.logFilter = { q: "", teacherId: "", typeId: "" };
      App.renderPageOnly();
    });
  },

  exportCSV() {
    // Export the currently-filtered LOG (independent of range)
    const q = this.logFilter.q.toLowerCase();
    const rows = DB.list("sales").filter(r => {
      if (q && !(r.book || "").toLowerCase().includes(q)) return false;
      if (this.logFilter.teacherId && r.teacherId !== this.logFilter.teacherId) return false;
      if (this.logFilter.typeId && r.typeId !== this.logFilter.typeId) return false;
      return true;
    }).sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));

    if (!rows.length) return UI.toast(i18n.t("reports.empty"), "error");
    const header = ["Date", "Time", "Book", "Teacher", "Type", "Qty", "Price", "Total"];
    const lines = [header.join(",")];
    rows.forEach(r => {
      const line = [
        r.session || (r.ts || "").slice(0, 10),
        UI.fmtTime(r.ts),
        r.book,
        UI.lookupName("teachers", r.teacherId),
        DB.get("bookTypes", r.typeId)?.name || "",
        r.qty, r.price, r.total
      ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
      lines.push(line);
    });
    const csv = "\ufeff" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_log_${DB.today()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.toast(i18n.t("common.export"), "success");
  }
};
