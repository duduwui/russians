// 7-tab flat navigation.
const ROUTES = [
  { id: "dashboard", label: "nav.dashboard", icon: "dashboard", module: () => Dashboard },
  { id: "sales",     label: "nav.sales",     icon: "sales",     module: () => Sales     },
  { id: "schedule",  label: "nav.schedule",  icon: "calendar",  module: () => Schedule  },
  { id: "students",  label: "nav.students",  icon: "user",      module: () => Students  },
  { id: "subjects",  label: "nav.subjects",  icon: "subject",   module: () => Subjects  },
  { id: "teachers",  label: "nav.teachers",  icon: "teacher",   module: () => Teachers  },
  { id: "reports",   label: "nav.reports",   icon: "reports",   module: () => Reports   },
  { id: "settings",  label: "nav.settings",  icon: "settings",  module: () => Settings  }
];

const App = {
  current: "dashboard",

  init() {
    try { DB.load(); } catch (e) { console.error(e); DB.data = DB.defaults(); }

    // Language
    const lang = (DB.data.settings && DB.data.settings.lang) || i18n.lang || "en";
    i18n.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    try { this.buildSidebar(); }    catch (e) { console.error("sidebar", e); }
    try { this.applySettings(); }   catch (e) { console.error("settings", e); }
    try { this.paintChromeIcons(); }catch (e) { console.error("icons", e); }
    try { this.bindChrome(); }      catch (e) { console.error("chrome", e); }

    UI.closeModal();
    i18n.apply();
    this.go("dashboard");
  },

  buildSidebar() {
    const nav = document.getElementById("sideNav");
    if (!nav) return;
    nav.innerHTML = ROUTES.map(r => `
      <a class="nav-item" data-route="${r.id}" href="#">
        <span class="ic">${icon(r.icon)}</span>
        <span data-i18n="${r.label}">${UI.escape(i18n.t(r.label))}</span>
      </a>
    `).join("");
    nav.querySelectorAll(".nav-item[data-route]").forEach(a => {
      a.addEventListener("click", e => { e.preventDefault(); this.go(a.dataset.route); });
    });
    this.highlightNav();
  },

  paintChromeIcons() {
    const menu   = document.getElementById("menuToggle");
    const theme  = document.getElementById("themeToggle");
    const closeB = document.getElementById("modalClose");
    if (menu)   menu.innerHTML   = icon("menu");
    if (closeB) closeB.innerHTML = icon("close");
    if (theme)  theme.innerHTML  = icon(DB.data.settings.theme === "dark" ? "sun" : "moon");
  },

  bindChrome() {
    document.querySelectorAll(".lang-switch button[data-lang]").forEach(b => {
      b.addEventListener("click", () => {
        DB.data.settings.lang = b.dataset.lang;
        DB.save();
        i18n.setLang(b.dataset.lang);
      });
    });
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      DB.data.settings.theme = DB.data.settings.theme === "dark" ? "light" : "dark";
      DB.save();
      this.applySettings();
      this.paintChromeIcons();
    });
    document.getElementById("menuToggle")?.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });
    document.getElementById("globalSearch")?.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const q = e.target.value.trim();
        if (!q) return;
        Students.filter.q = q;
        this.go("students");
        e.target.value = "";
      }
    });
    document.getElementById("modalClose")?.addEventListener("click", UI.closeModal);
    document.getElementById("modalBackdrop")?.addEventListener("click", e => {
      if (e.target.id === "modalBackdrop") UI.closeModal();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") UI.closeModal();
    });
  },

  applySettings() {
    document.documentElement.dataset.theme = DB.data.settings.theme || "light";
    const brandName = document.getElementById("brandName");
    if (brandName) brandName.textContent = DB.data.settings.orgName || "School Manager";
    const brandLogo = document.getElementById("brandLogo");
    if (brandLogo) {
      if (DB.data.settings.logo) {
        brandLogo.innerHTML = `<img src="${DB.data.settings.logo}" alt="logo"/>`;
      } else {
        brandLogo.innerHTML = "";
        brandLogo.textContent = (DB.data.settings.orgName || "S").charAt(0).toUpperCase();
      }
    }
    this.paintChromeIcons();
  },

  highlightNav() {
    document.querySelectorAll(".nav-item").forEach(a =>
      a.classList.toggle("active", a.dataset.route === this.current)
    );
  },

  routeCfg(id) { return ROUTES.find(r => r.id === id); },

  go(routeId) {
    if (!this.routeCfg(routeId)) routeId = "dashboard";
    this.current = routeId;
    this.highlightNav();
    document.body.classList.remove("sidebar-open");
    const crumb = document.getElementById("crumbPage");
    if (crumb) crumb.textContent = i18n.t(this.routeCfg(routeId).label);
    this.renderPageOnly();
  },

  renderPageOnly() {
    const content = document.getElementById("content");
    if (!content) return;
    const mod = this.routeCfg(this.current).module();
    try {
      content.innerHTML = mod.render();
      if (mod.bind) mod.bind();
      i18n.apply();
    } catch (e) {
      console.error("Render error", e);
      content.innerHTML = `<div class="card"><div class="card-body">
        ${UI.empty("Something went wrong: " + UI.escape(e.message))}
      </div></div>`;
    }
  },

  rerender() {
    this.buildSidebar();
    this.applySettings();
    const crumb = document.getElementById("crumbPage");
    if (crumb) crumb.textContent = i18n.t(this.routeCfg(this.current).label);
    this.renderPageOnly();
  }
};

window.addEventListener("DOMContentLoaded", () => App.init());
window.App = App;
window.DB = DB;
window.UI = UI;
window.i18n = i18n;
window.Dashboard = Dashboard;
window.Students = Students;
window.Subjects = Subjects;
window.Teachers = Teachers;
window.Sales = Sales;
window.Schedule = Schedule;
window.Reports = Reports;
window.Settings = Settings;
