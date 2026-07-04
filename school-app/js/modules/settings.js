const Settings = {
  render() {
    const s = DB.data.settings;
    return `
      <div class="page-head">
        <div>
          <h1 class="page-title">${i18n.t("settings.title")}</h1>
        </div>
      </div>

      <!-- Org + Appearance -->
      <div class="split settings-section">
        <div class="card">
          <div class="card-head"><h3>${i18n.t("settings.org")}</h3></div>
          <div class="card-body">
            <div class="form-grid">
              <div class="field full">
                <label>${i18n.t("settings.orgName")}</label>
                <input data-s="orgName" value="${UI.escape(s.orgName || "")}"/>
              </div>
              <div class="field">
                <label>${i18n.t("settings.currency")}</label>
                <input data-s="currency" value="${UI.escape(s.currency || "")}" placeholder="IQD, USD, …"/>
              </div>
              <div class="field">
                <label>${i18n.t("settings.logo")}</label>
                <input type="file" id="logoFile" accept="image/*"/>
                ${s.logo ? `<img src="${s.logo}" alt="logo" style="width:60px;height:60px;object-fit:cover;border-radius:8px;margin-top:6px"/>` : ""}
              </div>
            </div>
            <div style="text-align:end;margin-top:14px">
              <button class="btn primary" id="saveOrg">${icon("save")} ${i18n.t("common.save")}</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>${i18n.t("settings.appearance")}</h3></div>
          <div class="card-body">
            <div class="form-grid">
              <div class="field">
                <label>${i18n.t("settings.theme")}</label>
                <select id="s_theme">
                  <option value="light" ${s.theme === "light" ? "selected" : ""}>${i18n.t("settings.themeLight")}</option>
                  <option value="dark"  ${s.theme === "dark"  ? "selected" : ""}>${i18n.t("settings.themeDark")}</option>
                </select>
              </div>
              <div class="field">
                <label>${i18n.t("settings.lang")}</label>
                <select id="s_lang">
                  <option value="en" ${i18n.lang === "en" ? "selected" : ""}>English</option>
                  <option value="ar" ${i18n.lang === "ar" ? "selected" : ""}>العربية</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grades & Classes -->
      <div class="split settings-section">
        <div class="card">
          <div class="card-head">
            <h3>${i18n.t("settings.grades")}</h3>
            <button class="btn sm" id="addGrade">${icon("plus","sm")} ${i18n.t("common.add")}</button>
          </div>
          <div class="card-body">
            <div class="lookup-list" id="gradesList">
              ${DB.list("grades").length ? DB.list("grades").map(g => `
                <div class="lookup-row simple" data-id="${UI.escape(g.id)}">
                  <input data-gf="name" value="${UI.escape(g.name || "")}" placeholder="${i18n.t("settings.shift.name")}"/>
                  <button class="btn sm danger" data-del-grade="${UI.escape(g.id)}" title="${i18n.t("common.delete")}">${icon("trash","sm")}</button>
                </div>
              `).join("") : `<div class="hint">${i18n.t("common.none")}</div>`}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <h3>${i18n.t("settings.classes")}</h3>
            <button class="btn sm" id="addClass"
              ${DB.list("grades").length ? "" : "disabled title='Add a grade first'"}>
              ${icon("plus","sm")} ${i18n.t("common.add")}
            </button>
          </div>
          <div class="card-body">
            <div class="lookup-list" id="classesList">
              ${DB.list("classes").length ? DB.list("classes").map(c => `
                <div class="lookup-row class-row" data-id="${UI.escape(c.id)}">
                  <input data-cf="name" value="${UI.escape(c.name || "")}" placeholder="${i18n.t("settings.shift.name")}"/>
                  <select data-cf="gradeId">
                    <option value="">— ${i18n.t("settings.class.grade")} —</option>
                    ${DB.list("grades").map(g =>
                      `<option value="${UI.escape(g.id)}" ${c.gradeId === g.id ? "selected" : ""}>${UI.escape(g.name)}</option>`
                    ).join("")}
                  </select>
                  <button class="btn sm danger" data-del-class="${UI.escape(c.id)}" title="${i18n.t("common.delete")}">${icon("trash","sm")}</button>
                </div>
              `).join("") : `<div class="hint">${DB.list("grades").length ? i18n.t("common.none") : "Add a grade first"}</div>`}
            </div>
          </div>
        </div>
      </div>

      <!-- Shifts & Book Types -->
      <div class="split settings-section">
        <div class="card">
          <div class="card-head">
            <h3>${i18n.t("settings.shifts")}</h3>
            <button class="btn sm" id="addShift">${icon("plus","sm")} ${i18n.t("common.add")}</button>
          </div>
          <div class="card-body">
            <div class="lookup-list" id="shiftsList">
              ${DB.list("shifts").length ? DB.list("shifts").map(sh => `
                <div class="lookup-row" data-id="${UI.escape(sh.id)}">
                  <input data-sf="name" value="${UI.escape(sh.name || "")}" placeholder="${i18n.t("settings.shift.name")}"/>
                  <input data-sf="start" type="time" value="${UI.escape(sh.start || "")}"/>
                  <input data-sf="end" type="time" value="${UI.escape(sh.end || "")}"/>
                  <button class="btn sm danger" data-del-shift="${UI.escape(sh.id)}" title="${i18n.t("common.delete")}">${icon("trash","sm")}</button>
                </div>
              `).join("") : `<div class="hint">${i18n.t("common.none")}</div>`}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <h3>${i18n.t("settings.bookTypes")}</h3>
            <button class="btn sm" id="addType">${icon("plus","sm")} ${i18n.t("common.add")}</button>
          </div>
          <div class="card-body">
            <div class="lookup-list" id="typesList">
              ${DB.list("bookTypes").length ? DB.list("bookTypes").map(bt => `
                <div class="lookup-row simple" data-id="${UI.escape(bt.id)}">
                  <input data-tf="name" value="${UI.escape(bt.name || "")}" placeholder="${i18n.t("settings.shift.name")}"/>
                  <button class="btn sm danger" data-del-type="${UI.escape(bt.id)}" title="${i18n.t("common.delete")}">${icon("trash","sm")}</button>
                </div>
              `).join("") : `<div class="hint">${i18n.t("common.none")}</div>`}
            </div>
          </div>
        </div>
      </div>

      <!-- Getting started -->
      <div class="split settings-section">
        <div class="card">
          <div class="card-head"><h3>${icon("info")} ${i18n.t("settings.howto")}</h3></div>
          <div class="card-body">
            <p style="color:var(--text-soft);margin-top:0">Learn how the app is used day-to-day.</p>
            <button class="btn primary" id="btnHowto">${icon("info")} ${i18n.t("settings.howtoBtn")}</button>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>${icon("play")} ${i18n.t("settings.sample")}</h3></div>
          <div class="card-body">
            <p style="color:var(--text-soft);margin-top:0">${i18n.t("settings.sampleDesc")}</p>
            <button class="btn" id="btnSample">${icon("play")} ${i18n.t("settings.sampleBtn")}</button>
          </div>
        </div>
      </div>

      <!-- Data -->
      <div class="split settings-section">
        <div class="card">
          <div class="card-head"><h3>${i18n.t("settings.data")}</h3></div>
          <div class="card-body">
            <p style="color:var(--text-soft);margin-top:0">Save or restore all data as a JSON file.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <button class="btn primary" id="btnBackup">${icon("download")} ${i18n.t("settings.backup")}</button>
              <input type="file" id="restoreFile" accept="application/json" style="display:none"/>
              <button class="btn" id="btnRestore">${icon("upload")} ${i18n.t("settings.restore")}</button>
            </div>
          </div>
        </div>
        <div class="card" style="border-color:var(--danger)">
          <div class="card-head">
            <h3 style="color:var(--danger);display:inline-flex;gap:6px;align-items:center">${icon("alert")} ${i18n.t("settings.danger")}</h3>
          </div>
          <div class="card-body">
            <p style="color:var(--text-soft);margin-top:0">${i18n.t("settings.resetConfirm")}</p>
            <button class="btn danger" id="btnReset">${icon("trash")} ${i18n.t("settings.reset")}</button>
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    // Save org
    document.getElementById("saveOrg")?.addEventListener("click", () => {
      DB.data.settings.orgName  = document.querySelector('[data-s="orgName"]').value.trim();
      DB.data.settings.currency = document.querySelector('[data-s="currency"]').value.trim();
      const f = document.getElementById("logoFile").files[0];
      const done = () => { DB.save(); App.applySettings(); UI.toast(i18n.t("common.saved"), "success"); };
      if (f) {
        if (f.size > 2 * 1024 * 1024) return UI.toast("Image too large (max 2 MB)", "error");
        const fr = new FileReader();
        fr.onload = () => { DB.data.settings.logo = fr.result; done(); };
        fr.onerror = () => UI.toast("Could not read image", "error");
        fr.readAsDataURL(f);
      } else done();
    });

    // Theme & language
    document.getElementById("s_theme")?.addEventListener("change", e => {
      DB.data.settings.theme = e.target.value; DB.save(); App.applySettings();
    });
    document.getElementById("s_lang")?.addEventListener("change", e => {
      DB.data.settings.lang = e.target.value; DB.save(); i18n.setLang(e.target.value);
    });

    // Grades CRUD (inline)
    document.getElementById("addGrade")?.addEventListener("click", () => {
      DB.upsert("grades", { name: "" });
      App.renderPageOnly();
    });
    document.querySelectorAll("[data-del-grade]").forEach(b => {
      b.onclick = () => UI.confirm(
        `${i18n.t("common.confirmDelete")} — this also removes its classes and unassigns students.`,
        () => { DB.remove("grades", b.dataset.delGrade); App.renderPageOnly(); }
      );
    });
    document.querySelectorAll("#gradesList .lookup-row").forEach(row => {
      const id = row.dataset.id;
      row.querySelectorAll("[data-gf]").forEach(inp => {
        inp.addEventListener("change", () => {
          const g = DB.get("grades", id); if (!g) return;
          g[inp.dataset.gf] = inp.value.trim();
          DB.upsert("grades", g);
          UI.toast(i18n.t("common.saved"), "success");
          App.renderPageOnly();
        });
      });
    });

    // Classes CRUD (inline)
    document.getElementById("addClass")?.addEventListener("click", () => {
      const firstGrade = DB.list("grades")[0];
      DB.upsert("classes", { name: "", gradeId: firstGrade ? firstGrade.id : "" });
      App.renderPageOnly();
    });
    document.querySelectorAll("[data-del-class]").forEach(b => {
      b.onclick = () => UI.confirm(i18n.t("common.confirmDelete"), () => {
        DB.remove("classes", b.dataset.delClass);
        App.renderPageOnly();
      });
    });
    document.querySelectorAll("#classesList .lookup-row").forEach(row => {
      const id = row.dataset.id;
      row.querySelectorAll("[data-cf]").forEach(inp => {
        inp.addEventListener("change", () => {
          const c = DB.get("classes", id); if (!c) return;
          c[inp.dataset.cf] = inp.value.trim();
          DB.upsert("classes", c);
          UI.toast(i18n.t("common.saved"), "success");
        });
      });
    });

    // Shifts CRUD (inline)
    document.getElementById("addShift")?.addEventListener("click", () => {
      DB.upsert("shifts", { name: "", start: "", end: "" });
      App.renderPageOnly();
    });
    document.querySelectorAll("[data-del-shift]").forEach(b => {
      b.onclick = () => UI.confirm(i18n.t("common.confirmDelete"), () => {
        DB.remove("shifts", b.dataset.delShift);
        App.renderPageOnly();
      });
    });
    document.querySelectorAll("#shiftsList .lookup-row").forEach(row => {
      const id = row.dataset.id;
      row.querySelectorAll("[data-sf]").forEach(inp => {
        inp.addEventListener("change", () => {
          const sh = DB.get("shifts", id);
          if (!sh) return;
          sh[inp.dataset.sf] = inp.value.trim();
          DB.upsert("shifts", sh);
          UI.toast(i18n.t("common.saved"), "success");
        });
      });
    });

    // Book types CRUD (inline)
    document.getElementById("addType")?.addEventListener("click", () => {
      DB.upsert("bookTypes", { name: "" });
      App.renderPageOnly();
    });
    document.querySelectorAll("[data-del-type]").forEach(b => {
      b.onclick = () => UI.confirm(i18n.t("common.confirmDelete"), () => {
        DB.remove("bookTypes", b.dataset.delType);
        App.renderPageOnly();
      });
    });
    document.querySelectorAll("#typesList .lookup-row").forEach(row => {
      const id = row.dataset.id;
      row.querySelectorAll("[data-tf]").forEach(inp => {
        inp.addEventListener("change", () => {
          const t = DB.get("bookTypes", id);
          if (!t) return;
          t[inp.dataset.tf] = inp.value.trim();
          DB.upsert("bookTypes", t);
          UI.toast(i18n.t("common.saved"), "success");
        });
      });
    });

    // Backup
    document.getElementById("btnBackup")?.addEventListener("click", () => {
      const blob = new Blob([DB.export()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `school_backup_${DB.today()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.toast(i18n.t("common.saved"), "success");
    });
    // Restore
    document.getElementById("btnRestore")?.addEventListener("click", () => {
      document.getElementById("restoreFile").click();
    });
    document.getElementById("restoreFile")?.addEventListener("change", e => {
      const f = e.target.files[0];
      if (!f) return;
      const fr = new FileReader();
      fr.onload = () => {
        try {
          DB.import(fr.result);
          UI.toast(i18n.t("common.saved"), "success");
          App.applySettings();
          App.renderPageOnly();
        } catch (err) { UI.toast(err.message, "error"); }
      };
      fr.onerror = () => UI.toast("Could not read file", "error");
      fr.readAsText(f);
    });

    // Reset
    document.getElementById("btnReset")?.addEventListener("click", () => {
      UI.confirm(i18n.t("settings.resetConfirm"), () => {
        DB.reset();
        UI.toast(i18n.t("common.saved"), "success");
        App.applySettings();
        App.renderPageOnly();
      }, { okLabel: i18n.t("settings.reset") });
    });

    // Sample data
    document.getElementById("btnSample")?.addEventListener("click", () => {
      UI.confirm(i18n.t("settings.sampleDesc"), () => {
        DB.loadSample();
        UI.toast(i18n.t("settings.sampleAdded"), "success");
        App.go("dashboard");
      }, { okLabel: i18n.t("settings.sampleBtn"), danger: false });
    });

    // How-to guide
    document.getElementById("btnHowto")?.addEventListener("click", () => Settings.showHowto());
  },

  showHowto() {
    UI.modal({
      title: i18n.t("settings.howto"),
      wide: true,
      bodyHTML: `
        <div style="line-height:1.65;color:var(--text-soft)">
          <div class="howto-step">
            <div class="howto-num">1</div>
            <div>
              <div class="howto-title">Set up once — <em>Grades, Classes, Teachers, Subjects, Students</em></div>
              <div>In <strong>Settings</strong> define your grades (e.g. Grade 11, Grade 12) and classes under each grade (e.g. 12-A, 12-B). Then add teachers, create subjects (like <em>"Math — Grade 12"</em>) assigning a teacher and optional target grade. Finally add students, pick their grade + class, and tick the subjects they're enrolled in.</div>
            </div>
          </div>
          <div class="howto-step">
            <div class="howto-num">2</div>
            <div>
              <div class="howto-title">Every day — record book sales</div>
              <div>Open <strong>Sales</strong>. In the quick-add bar, type the book name, pick the teacher, type, <strong>grade &amp; class</strong>, enter quantity &amp; price, and press <kbd>Enter</kbd>. The row appears in today's ledger. Book names remembered from previous days will autocomplete and refill teacher / type / grade / class / price for you — so repeat sales are just <em>type → Enter</em>.</div>
            </div>
          </div>
          <div class="howto-step">
            <div class="howto-num">3</div>
            <div>
              <div class="howto-title">End of day — click <em>Start new day</em></div>
              <div>This closes today's session and starts a new one. Nothing is deleted — all records stay saved and appear in Reports.</div>
            </div>
          </div>
          <div class="howto-step">
            <div class="howto-num">4</div>
            <div>
              <div class="howto-title">Anytime — check <em>Reports</em></div>
              <div>See revenue for Today, Last 7 days, Last 30 days, or a custom range. See top-selling books, top teachers, best days of the week, and export to CSV or print.</div>
            </div>
          </div>
          <div class="howto-step">
            <div class="howto-num">5</div>
            <div>
              <div class="howto-title">Weekly — download a backup</div>
              <div>Settings → <em>Download backup</em> saves everything into one JSON file. If you switch computers or the browser data is cleared, use <em>Restore</em> to bring everything back.</div>
            </div>
          </div>
          <div style="margin-top:16px;padding:12px 14px;background:var(--panel-2);border-radius:8px;color:var(--text-soft);font-size:13px">
            💡 Tip — Book Types (Full Course / First Half / Second Half) and Shifts are managed in this Settings page. Add or edit them anytime.
          </div>
        </div>
      `,
      footerHTML: `
        <button class="btn primary" data-close>${i18n.t("common.close")}</button>
      `,
      onOpen(m) {
        m.querySelector("[data-close]").onclick = UI.closeModal;
      }
    });
  }
};
