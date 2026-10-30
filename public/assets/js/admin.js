/**
 * Simple CMS for the portfolio. Forms are generated from lib/schema.js and
 * every save writes straight to the JSON files in /content.
 */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const state = { schema: null, content: null, view: "profile", editing: null };

  /* ---------- helpers ---------- */

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false || child === "") continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }
  const icon = (name) => el("i", { class: `bi bi-${name}`, "aria-hidden": "true" });

  let toastTimer;
  function toast(message, isError) {
    const t = document.getElementById("toast");
    t.textContent = message;
    t.className = `toast show${isError ? " error" : ""}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.className = "toast"), isError ? 5000 : 2500);
  }

  async function api(method, url, body) {
    const opts = { method, headers: {} };
    if (body instanceof FormData) opts.body = body;
    else if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`/api/admin${url}`, opts);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && url !== "/login") {
      renderLogin();
      throw new Error("Session expired, please log in again");
    }
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  }

  /* ---------- login ---------- */

  function renderLogin(message) {
    const input = el("input", { type: "password", class: "form-control", id: "password", autocomplete: "current-password", required: true });
    const error = el("p", { class: "error-message", style: message ? "display:block" : "" }, message);
    app.replaceChildren(el("div", { class: "login" },
      el("form", {
        class: "card",
        onsubmit: async (e) => {
          e.preventDefault();
          try {
            await api("POST", "/login", { password: input.value });
            await loadDashboard();
          } catch (err) {
            error.textContent = err.message;
            error.style.display = "block";
          }
        },
      },
        el("span", { class: "eyebrow" }, "Portfolio CMS"),
        el("h1", {}, "Log in"),
        el("div", { class: "form-group" }, el("label", { for: "password" }, "Password"), input),
        el("div", { class: "contact-form", style: "padding:0" }, error),
        el("button", { class: "btn btn-primary", type: "submit", style: "width:100%;justify-content:center" }, "Log in"))));
    input.focus();
  }

  /* ---------- layout ---------- */

  async function loadDashboard() {
    [state.schema, state.content] = await Promise.all([api("GET", "/schema"), api("GET", "/content")]);
    render();
  }

  function render() {
    const { schema, content } = state;
    const navButton = (view, label, iconName, count) => el("button", {
      "aria-current": String(state.view === view),
      onclick: () => { state.view = view; state.editing = null; render(); },
    }, icon(iconName), label, count != null && el("span", { class: "count" }, count));

    const icons = { experience: "briefcase", projects: "grid", donations: "heart", blogs: "journal-text", education: "mortarboard", participations: "people", skills: "stars" };

    app.replaceChildren(el("div", { class: "admin" },
      el("aside", { class: "admin-side" },
        el("a", { class: "brand", href: "/", target: "_blank" }, el("span", { class: "brand-mark" }, "CMS"), "Portfolio"),
        navButton("profile", "Profile", "person"),
        navButton("cv", "CV file", "file-earmark-pdf"),
        el("hr"),
        Object.entries(schema.collections).map(([name, def]) =>
          navButton(name, def.label, icons[name] || "list", content[name].length)),
        el("div", { class: "spacer" }),
        el("hr"),
        el("a", { href: "/", target: "_blank" }, icon("box-arrow-up-right"), "View site"),
        el("button", {
          onclick: async () => { await api("POST", "/logout"); renderLogin(); },
        }, icon("box-arrow-left"), "Log out")),
      el("main", { class: "admin-main" }, renderView())));
  }

  function renderView() {
    if (state.view === "profile") return renderProfile();
    if (state.view === "cv") return renderCvUpload();
    return state.editing ? renderEditor() : renderList();
  }

  /* ---------- forms ---------- */

  function fieldInput(f, value) {
    const id = `f-${f.name}`;
    const common = { id, name: f.name, class: "form-control", placeholder: f.placeholder, required: f.required || null };
    switch (f.type) {
      case "textarea":
        return el("textarea", { ...common, rows: f.rows || 4 }, value || "");
      case "list":
        return el("textarea", { ...common, rows: Math.max(4, (value || []).length + 1) }, (value || []).join("\n"));
      case "tags":
        return el("input", { ...common, type: "text", value: (value || []).join(", ") });
      case "select":
        return el("select", common, f.options.map((o) => el("option", { value: o.value, selected: o.value === value || null }, o.label)));
      case "checkbox":
        return el("input", { id, name: f.name, type: "checkbox", checked: value ? true : null });
      case "url":
        return el("input", { ...common, type: "url", placeholder: f.placeholder || "https://", value: value || "" });
      case "date":
        return el("input", { ...common, type: "date", value: value || "" });
      default:
        return el("input", { ...common, type: "text", value: value || "" });
    }
  }

  function buildForm(fields, values, onSave, onCancel) {
    const form = el("form", { class: "card editor", novalidate: true },
      fields.map((f) => f.type === "checkbox"
        ? el("div", { class: "form-group" }, el("label", { class: "check" }, fieldInput(f, values[f.name]), f.label))
        : el("div", { class: "form-group" },
            el("label", { for: `f-${f.name}` }, f.label, f.required ? " *" : ""),
            fieldInput(f, values[f.name]))),
      el("div", { class: "editor-actions" },
        onCancel && el("button", { type: "button", class: "btn btn-ghost", onclick: onCancel }, "Cancel"),
        el("button", { type: "submit", class: "btn btn-primary" }, icon("check-lg"), " Save")));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {};
      for (const f of fields) {
        const input = form.elements[f.name];
        data[f.name] = f.type === "checkbox" ? input.checked : input.value;
      }
      const button = form.querySelector("[type=submit]");
      button.disabled = true;
      try {
        await onSave(data);
      } catch (err) {
        toast(err.message, true);
      } finally {
        button.disabled = false;
      }
    });
    return form;
  }

  /* ---------- profile ---------- */

  function renderProfile() {
    return [
      el("h1", {}, "Profile"),
      el("p", { class: "admin-hint" }, "Your name, intro, contact details and social links."),
      buildForm(state.schema.profile.fields, state.content.profile, async (data) => {
        const res = await api("PUT", "/profile", data);
        state.content.profile = res.data;
        toast("Profile saved");
      }),
    ];
  }

  /* ---------- CV ---------- */

  function renderCvUpload() {
    const current = state.content.profile.cvFile;
    const input = el("input", { type: "file", accept: "application/pdf", class: "form-control", id: "cv-file" });
    return [
      el("h1", {}, "CV file"),
      el("p", { class: "admin-hint" }, "The PDF visitors get from every \"Download CV\" button. Uploading replaces the current file."),
      current
        ? el("div", { class: "card cv-current" }, icon("file-earmark-pdf"),
            el("div", { class: "item-text" }, el("strong", {}, current.split("?")[0].split("/").pop()), el("small", {}, "Current CV")),
            el("a", { class: "btn btn-ghost btn-sm", href: current, target: "_blank" }, "Open"))
        : el("p", { class: "notice" }, "No CV uploaded yet."),
      el("form", {
        class: "card editor",
        onsubmit: async (e) => {
          e.preventDefault();
          if (!input.files[0]) return toast("Choose a PDF first", true);
          const body = new FormData();
          body.append("cv", input.files[0]);
          try {
            const res = await api("POST", "/cv", body);
            state.content.profile.cvFile = res.cvFile;
            toast("CV uploaded");
            render();
          } catch (err) {
            toast(err.message, true);
          }
        },
      },
        el("div", { class: "form-group" }, el("label", { for: "cv-file" }, "New CV (PDF, max 10 MB)"), input),
        el("div", { class: "editor-actions" }, el("button", { class: "btn btn-primary", type: "submit" }, icon("upload"), " Upload"))),
    ];
  }

  /* ---------- collections ---------- */

  async function saveCollection(name, items, message) {
    const res = await api("PUT", `/collections/${name}`, items);
    state.content[name] = res.data;
    toast(message);
  }

  function renderList() {
    const name = state.view;
    const def = state.schema.collections[name];
    const items = state.content[name];

    const move = async (i, dir) => {
      const next = [...items];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      try { await saveCollection(name, next, "Order saved"); render(); } catch (err) { toast(err.message, true); }
    };
    const remove = async (i) => {
      const title = items[i][def.titleField];
      if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
      try { await saveCollection(name, items.filter((_, j) => j !== i), "Deleted"); render(); } catch (err) { toast(err.message, true); }
    };

    return [
      el("div", { class: "admin-bar" },
        el("div", {}, el("h1", {}, def.label)),
        el("button", { class: "btn btn-primary", onclick: () => { state.editing = { index: -1 }; render(); } }, icon("plus-lg"), " Add new")),
      def.hint && el("p", { class: "admin-hint" }, def.hint),
      items.length
        ? el("ol", { class: "items" }, items.map((item, i) => el("li", { class: "card item" },
            el("div", { class: "item-text" },
              el("strong", {}, item[def.titleField] || "(untitled)"),
              el("small", {}, Array.isArray(item[def.subtitleField]) ? item[def.subtitleField].join(", ") : item[def.subtitleField]),
              item.featured && el("span", { class: "item-badge" }, "Featured"),
              item.type === "community" && el("span", { class: "item-badge" }, "Community")),
            el("button", { class: "icon-btn", title: "Move up", "aria-label": "Move up", disabled: i === 0 || null, onclick: () => move(i, -1) }, icon("arrow-up")),
            el("button", { class: "icon-btn", title: "Move down", "aria-label": "Move down", disabled: i === items.length - 1 || null, onclick: () => move(i, 1) }, icon("arrow-down")),
            el("button", { class: "icon-btn", title: "Edit", "aria-label": "Edit", onclick: () => { state.editing = { index: i }; render(); } }, icon("pencil")),
            el("button", { class: "icon-btn danger", title: "Delete", "aria-label": "Delete", onclick: () => remove(i) }, icon("trash")))))
        : el("p", { class: "empty" }, "Nothing here yet. Click \"Add new\" to create the first entry."),
    ];
  }

  function renderEditor() {
    const name = state.view;
    const def = state.schema.collections[name];
    const { index } = state.editing;
    const isNew = index === -1;
    const item = isNew ? {} : state.content[name][index];
    const close = () => { state.editing = null; render(); window.scrollTo(0, 0); };

    return [
      el("h1", {}, isNew ? `New ${def.label.toLowerCase().replace(/s$/, "")}` : `Edit: ${item[def.titleField]}`),
      el("p", { class: "admin-hint" }, "Fields marked * are required."),
      buildForm(def.fields, item, async (data) => {
        const items = [...state.content[name]];
        // New entries go to the top, since lists show newest first.
        if (isNew) items.unshift(data);
        else items[index] = { ...data, id: item.id };
        await saveCollection(name, items, isNew ? "Added" : "Saved");
        close();
      }, close),
    ];
  }

  /* ---------- boot ---------- */

  (async () => {
    try {
      const res = await fetch("/api/admin/status");
      const status = await res.json();
      if (!status.enabled) {
        app.replaceChildren(el("div", { class: "login" },
          el("div", { class: "card" }, el("h1", {}, "CMS is off"), el("p", { class: "notice" }, status.reason))));
      } else if (status.loggedIn) {
        await loadDashboard();
      } else {
        renderLogin();
      }
    } catch (err) {
      app.replaceChildren(el("p", { class: "empty" }, `Could not reach the server: ${err.message}`));
    }
  })();
})();
