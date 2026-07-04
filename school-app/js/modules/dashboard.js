const Dashboard = {
  render() {
    const students = DB.list("students").length;
    const teachers = DB.list("teachers").length;
    const subjects = DB.list("subjects").length;
    const sales    = DB.list("sales");

    const today = DB.today();
    const monthPrefix = today.slice(0, 7);
    const revToday = sales.filter(s => (s.session || s.ts || "").slice(0, 10) === today)
      .reduce((sum, s) => sum + (+s.total || 0), 0);
    const revMonth = sales.filter(s => (s.session || (s.ts || "").slice(0, 10) || "").startsWith(monthPrefix))
      .reduce((sum, s) => sum + (+s.total || 0), 0);
    const countToday = sales.filter(s => (s.session || s.ts || "").slice(0, 10) === today).length;

    // Recent 5
    const recent = [...sales].sort((a, b) => (b.ts || "").localeCompare(a.ts || "")).slice(0, 5);

    // Top-selling books
    const topMap = {};
    sales.forEach(s => {
      const k = (s.book || "").trim();
      if (!k) return;
      if (!topMap[k]) topMap[k] = { qty: 0, revenue: 0 };
      topMap[k].qty += (+s.qty || 0);
      topMap[k].revenue += (+s.total || 0);
    });
    const top = Object.entries(topMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([book, v]) => ({ book, ...v }));

    const isEmpty = students === 0 && teachers === 0 && subjects === 0 && sales.length === 0;

    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("dash.title")}</h1>
          <div class="page-sub">${UI.fmtDate(today)}</div>
        </div>
      </div>

      ${isEmpty ? this.renderOnboarding() : `
        <div class="stat-grid">
          ${this.stat({ label: i18n.t("dash.today"),    value: UI.fmtMoney(revToday),
                        sub: `${UI.fmtNumber(countToday)} ${i18n.t("sales.count")}`,
                        iconName: "sales", tone: "success" })}
          ${this.stat({ label: i18n.t("dash.month"),    value: UI.fmtMoney(revMonth),
                        iconName: "trending", tone: "info" })}
          ${this.stat({ label: i18n.t("dash.students"), value: UI.fmtNumber(students), iconName: "user" })}
          ${this.stat({ label: i18n.t("dash.subjects"), value: UI.fmtNumber(subjects), iconName: "subject" })}
          ${this.stat({ label: i18n.t("dash.teachers"), value: UI.fmtNumber(teachers), iconName: "teacher" })}
        </div>

        <div class="split-2fr-1fr">
          <div class="card">
            <div class="card-head">
              <h3>${i18n.t("dash.recent")}</h3>
              <button class="btn sm ghost" data-go="sales">${i18n.t("nav.sales")} →</button>
            </div>
            <div class="card-body" style="padding:0">
              ${recent.length ? UI.table({
                columns: [
                  { key: "when", label: i18n.t("common.date"),
                    render: r => UI.fmtDate(r.ts || r.session) },
                  { key: "book", label: i18n.t("sales.book"),
                    render: r => `<strong>${UI.escape(r.book || "—")}</strong>` },
                  { key: "qty",   label: i18n.t("sales.qty"),   numeric: true, type: "number" },
                  { key: "total", label: i18n.t("sales.total"), numeric: true,
                    render: r => `<strong>${UI.fmtMoney(r.total)}</strong>` }
                ],
                rows: recent
              }) : UI.empty(i18n.t("sales.empty"))}
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <h3>${i18n.t("dash.top")}</h3>
              <button class="btn sm ghost" data-go="reports">${i18n.t("nav.reports")} →</button>
            </div>
            <div class="card-body">
              ${top.length ? this.renderTop(top) : UI.empty(i18n.t("sales.empty"))}
            </div>
          </div>
        </div>
      `}
    `;
  },

  stat({ label, value, sub = "", iconName, tone = "" }) {
    return `
      <div class="stat ${tone}">
        <div>
          <div class="lbl">${UI.escape(label)}</div>
          <div class="val">${value}</div>
          ${sub ? `<div class="sub">${UI.escape(sub)}</div>` : ""}
        </div>
        <div class="stat-ic">${icon(iconName)}</div>
      </div>
    `;
  },

  renderTop(items) {
    const max = Math.max(...items.map(i => i.qty), 1);
    return `<div class="rank-list">
      ${items.map((it, i) => `
        <div class="rank-item">
          <span class="rank">${i + 1}</span>
          <div>
            <div class="name" title="${UI.escape(it.book)}">${UI.escape(it.book)}</div>
            <div class="meta">${UI.fmtMoney(it.revenue)}</div>
            <div class="rank-bar"><div style="width:${(it.qty / max * 100).toFixed(1)}%"></div></div>
          </div>
          <span class="val">${UI.fmtNumber(it.qty)}</span>
        </div>
      `).join("")}
    </div>`;
  },

  renderOnboarding() {
    return `
      <div class="card" style="margin-bottom:16px">
        <div class="card-body" style="padding:32px; text-align:center">
          <div style="display:inline-flex;align-items:center;justify-content:center;
                      width:64px;height:64px;border-radius:50%;background:var(--primary-soft);
                      color:var(--primary);margin-bottom:12px">
            ${icon("dashboard", "lg")}
          </div>
          <h2 style="margin:0 0 6px;font-size:20px">${UI.escape(DB.data.settings.orgName || "Welcome")}</h2>
          <p style="color:var(--text-soft);margin:0 0 24px;max-width:480px;margin-inline:auto">
            ${i18n.t("dash.empty")}
          </p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <button class="btn primary" data-go="teachers">${icon("teacher")} ${i18n.t("teachers.add")}</button>
            <button class="btn" data-go="subjects">${icon("subject")} ${i18n.t("subjects.add")}</button>
            <button class="btn" data-go="students">${icon("user")} ${i18n.t("students.add")}</button>
            <button class="btn" data-go="sales">${icon("sales")} ${i18n.t("nav.sales")}</button>
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;padding-top:16px;border-top:1px solid var(--border)">
            <button class="btn ghost" id="loadSampleBtn">${icon("play")} ${i18n.t("settings.sampleBtn")}</button>
            <button class="btn ghost" id="howtoBtn">${icon("info")} ${i18n.t("settings.howtoBtn")}</button>
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    document.querySelectorAll("[data-go]").forEach(b => {
      b.onclick = () => App.go(b.dataset.go);
    });
    document.getElementById("loadSampleBtn")?.addEventListener("click", () => {
      UI.confirm(i18n.t("settings.sampleDesc"), () => {
        DB.loadSample();
        UI.toast(i18n.t("settings.sampleAdded"), "success");
        App.renderPageOnly();
      }, { okLabel: i18n.t("settings.sampleBtn"), danger: false });
    });
    document.getElementById("howtoBtn")?.addEventListener("click", () => Settings.showHowto());
  }
};
