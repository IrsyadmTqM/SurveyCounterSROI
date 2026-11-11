// Naikkan angka ?v= (juga di index.html) setiap kali file ini atau config diubah.
import { firebaseConfig } from "./firebase-config.js?v=13";
import { TASK_GROUPS, SOURCE } from "./tasks.js?v=13";

// ---------------------------------------------------------------------------
// Pengaturan survei. Ubah target di sini kalau kuota berubah.
// ---------------------------------------------------------------------------
const COUNTERS = [
  { key: "total", label: "Total responden", note: "Semua ditanya carbon footprint", target: 45 },
  { key: "fr", label: "Pengguna FR KAI", note: "Pakai Face Recognition", target: 20 },
  { key: "nonfr", label: "Non-pengguna FR", note: "Tidak pakai Face Recognition", target: 20 },
  { key: "ws", label: "Pengguna Water Station", note: "Pakai Water Station", target: 10 },
];

// Pilihan nama surveyor. Tambahkan nama di sini kalau anggota tim bertambah.
const SURVEYORS = ["Irsyad", "Aldo"];

const FIREBASE_VERSION = "13.2.0";
const DATA_PATH = "surveyCounterSROI"; // lokasi data di Realtime Database (harus sama dengan database.rules.json)
const UNDO_MS = 6000;

// Setiap responden disimpan sebagai satu catatan:
//   { fr: "fr" | "nonfr" | "none", ws: boolean, by, at, editedBy?, editedAt?, deletedBy?, deletedAt? }
// Semua angka dihitung dari daftar ini, jadi tidak ada angka yang bisa diubah manual.
//
// Ceklis tugas disimpan per id tugas (lihat tasks.js): { by, at } kalau sudah dicentang,
// tidak ada catatan kalau belum.

// ---------------------------------------------------------------------------
// Backend realtime: Firebase Realtime Database.
// ---------------------------------------------------------------------------
async function connectFirebase(config) {
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
  const [{ initializeApp }, fdb] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-database.js`),
  ]);
  const db = fdb.getDatabase(initializeApp(config));
  const listRef = fdb.ref(db, `${DATA_PATH}/respondents`);
  const checkRef = fdb.ref(db, `${DATA_PATH}/checklist`);

  return {
    mode: "firebase",
    now: () => fdb.serverTimestamp(),
    onRespondents(cb, onError) {
      fdb.onValue(listRef, (snap) => cb(snap.val() || {}), onError);
    },
    onConnection(cb) {
      fdb.onValue(fdb.ref(db, ".info/connected"), (snap) => cb(snap.val() === true));
    },
    add(record) {
      return fdb.push(listRef, { ...record, at: fdb.serverTimestamp() });
    },
    update(id, patch) {
      return fdb.update(fdb.child(listRef, id), patch);
    },
    reset() {
      return fdb.set(listRef, null);
    },
    onChecklist(cb, onError) {
      fdb.onValue(checkRef, (snap) => cb(snap.val() || {}), onError);
    },
    setTask(id, value) {
      return fdb.set(fdb.child(checkRef, id), value);
    },
  };
}

// ---------------------------------------------------------------------------
// Cadangan: mode lokal (localStorage). Hanya sinkron antar tab di perangkat
// yang sama, dipakai kalau Firebase belum diisi atau gagal terhubung.
// ---------------------------------------------------------------------------
function connectLocal() {
  // Satu "store" per kunci localStorage, sinkron antar tab lewat event storage.
  const store = (key) => {
    const subs = new Set();
    const read = () => {
      try {
        return JSON.parse(localStorage.getItem(key)) || {};
      } catch {
        return {};
      }
    };
    const save = (all) => {
      localStorage.setItem(key, JSON.stringify(all));
      subs.forEach((cb) => cb(all));
    };
    window.addEventListener("storage", (e) => {
      if (e.key === key || e.key === null) {
        const all = read();
        subs.forEach((cb) => cb(all));
      }
    });
    const subscribe = (cb) => {
      subs.add(cb);
      cb(read());
    };
    return { read, save, subscribe };
  };
  const respondents = store("scs:respondents");
  const checklist = store("scs:checklist");
  const read = respondents.read;
  const save = respondents.save;
  let seq = 0;
  // ID berurutan menurut waktu, sama seperti push ID Firebase.
  const newId = () =>
    Date.now().toString(36).padStart(9, "0") + (seq++ % 1296).toString(36).padStart(2, "0") + Math.random().toString(36).slice(2, 6);

  return {
    mode: "local",
    now: () => Date.now(),
    onRespondents(cb) {
      respondents.subscribe(cb);
    },
    onConnection(cb) {
      cb(true);
    },
    async add(record) {
      const all = read();
      all[newId()] = { ...record, at: Date.now() };
      save(all);
    },
    async update(id, patch) {
      const all = read();
      if (!all[id]) throw new Error("responden tidak ditemukan");
      const rec = { ...all[id] };
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) delete rec[k];
        else rec[k] = v;
      }
      all[id] = rec;
      save(all);
    },
    async reset() {
      save({});
    },
    onChecklist(cb) {
      checklist.subscribe(cb);
    },
    async setTask(id, value) {
      const all = checklist.read();
      if (value === null) delete all[id];
      else all[id] = { ...value };
      checklist.save(all);
    },
  };
}

// ---------------------------------------------------------------------------
// Tampilan
// ---------------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const ui = {
  backend: null,
  online: true,
  byId: new Map(),
  form: { fr: "none", ws: false },
  editing: null, // id responden yang sedang diubah
  surveyor: null,
  checklist: {},
  cooldown: false,
  firstRender: true,
};

function normalize(map) {
  return Object.entries(map || {})
    .filter(([, r]) => r && typeof r === "object")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)) // ID berurutan menurut waktu dibuat
    .map(([id, r], i) => ({
      id,
      no: i + 1,
      fr: r.fr === "fr" || r.fr === "nonfr" ? r.fr : "none",
      ws: r.ws === true,
      by: r.by,
      at: r.at,
      editedBy: r.editedBy,
      editedAt: r.editedAt,
      deletedBy: r.deletedBy,
      deleted: r.deletedAt != null,
    }));
}

function cats(rec) {
  const parts = [];
  if (rec.fr === "fr") parts.push("FR");
  if (rec.fr === "nonfr") parts.push("Non-FR");
  if (rec.ws) parts.push("WS");
  return parts;
}

function catsText(rec) {
  const parts = cats(rec);
  return parts.length ? parts.join(" + ") : "tanpa kategori";
}

function buildCounters() {
  const wrap = $("#counters");
  for (const c of COUNTERS) {
    const el = document.createElement("article");
    el.className = `counter c-${c.key}`;
    el.dataset.key = c.key;
    el.innerHTML = `
      <h3>${c.label}</h3>
      <p class="note">${c.note}</p>
      <p class="value"><span class="num">–</span><span class="target">/ ${c.target}</span></p>
      <div class="bar" aria-hidden="true"><div class="fill"></div></div>
      <p class="remain">&nbsp;</p>`;
    wrap.append(el);
  }
}

function render(map) {
  const all = normalize(map);
  ui.byId = new Map(all.map((r) => [r.id, r]));
  const active = all.filter((r) => !r.deleted);
  const deleted = all.filter((r) => r.deleted);

  renderCounts({
    total: active.length,
    fr: active.filter((r) => r.fr === "fr").length,
    nonfr: active.filter((r) => r.fr === "nonfr").length,
    ws: active.filter((r) => r.ws).length,
  });
  renderList($("#list"), active.slice().reverse(), false);
  renderList($("#trash-list"), deleted.slice().reverse(), true);
  $("#trash").hidden = deleted.length === 0;
  $("#trash-count").textContent = deleted.length;

  if (ui.editing) {
    const rec = ui.byId.get(ui.editing);
    if (!rec || rec.deleted) {
      exitEdit();
      toast("Responden yang sedang kamu ubah baru saja dihapus", "warn");
    } else {
      $("#form-title").textContent = `Ubah responden #${rec.no}`;
    }
  }
}

function renderCounts(n) {
  for (const c of COUNTERS) {
    const el = document.querySelector(`.counter[data-key="${c.key}"]`);
    const value = n[c.key];
    const num = el.querySelector(".num");
    if (num.textContent !== String(value)) {
      num.textContent = value;
      if (!ui.firstRender) pulse(el);
    }
    el.querySelector(".fill").style.width = `${Math.min(100, (value / c.target) * 100)}%`;
    el.classList.toggle("done", value >= c.target);
    const diff = c.target - value;
    el.querySelector(".remain").textContent =
      diff > 0 ? `Kurang ${diff} lagi` : diff === 0 ? "Target tercapai ✓" : `Target tercapai ✓ (lebih ${-diff})`;
  }
  ui.firstRender = false;
  document.title = `${n.total}/${COUNTERS[0].target} · Survey Counter SROI`;
}

function pulse(el) {
  el.classList.remove("pulse");
  void el.offsetWidth; // restart animasi
  el.classList.add("pulse");
}

function renderList(listEl, items, isTrash) {
  listEl.replaceChildren();
  if (!items.length) {
    if (!isTrash) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Belum ada responden.";
      listEl.append(li);
    }
    return;
  }
  for (const rec of items) {
    const li = document.createElement("li");
    li.className = "resp";
    li.dataset.id = rec.id;
    if (rec.id === ui.editing) li.classList.add("editing");

    const no = document.createElement("span");
    no.className = "no";
    no.textContent = `#${rec.no}`;

    const tags = document.createElement("span");
    tags.className = "tags";
    const parts = cats(rec);
    for (const p of parts.length ? parts : ["Tanpa kategori"]) {
      const tag = document.createElement("span");
      tag.className = `tag t-${p.toLowerCase().replace(/[^a-z]/g, "")}`;
      tag.textContent = p;
      tags.append(tag);
    }

    const meta = document.createElement("span");
    meta.className = "meta";
    const bits = [`oleh ${rec.by || "Anonim"}`, formatTime(rec.at)];
    if (isTrash) bits.push(`dihapus ${rec.deletedBy || "Anonim"}`);
    else if (rec.editedBy) bits.push(`diubah ${rec.editedBy}`);
    meta.textContent = bits.filter(Boolean).join(" · ");

    const actions = document.createElement("span");
    actions.className = "actions";
    const buttons = isTrash ? [["restore", "Pulihkan"]] : [["edit", "Ubah"], ["delete", "Hapus"]];
    for (const [act, label] of buttons) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.act = act;
      b.className = `mini ${act}`;
      b.textContent = label;
      b.setAttribute("aria-label", `${label} responden #${rec.no}`);
      actions.append(b);
    }

    li.append(no, tags, actions, meta);
    listEl.append(li);
  }
}

function formatTime(at) {
  if (typeof at !== "number") return "";
  const d = new Date(at);
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString()
    ? time
    : `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ${time}`;
}

function setStatus(mode, online) {
  const el = $("#status");
  el.className = "status";
  if (mode === "local") {
    el.textContent = "Mode lokal";
    el.classList.add("local");
  } else if (online) {
    el.textContent = "● Live";
    el.classList.add("live");
  } else {
    el.textContent = "Offline";
    el.classList.add("offline");
  }
}

function showBanner(html) {
  const el = $("#banner");
  el.innerHTML = html;
  el.hidden = false;
}

let toastTimer;
function toast(message, kind = "ok", action) {
  const el = $("#toast");
  const btn = $("#toast-action");
  $("#toast-text").textContent = message;
  el.className = `toast ${kind}`;
  el.hidden = false;
  btn.hidden = !action;
  btn.onclick = null;
  if (action) {
    btn.textContent = action.label;
    btn.onclick = () => {
      el.hidden = true;
      action.run();
    };
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), action ? UNDO_MS : kind === "error" ? 9000 : 2600);
}

function surveyor() {
  return ui.surveyor;
}

function setSurveyor(name) {
  ui.surveyor = SURVEYORS.includes(name) ? name : null;
  document.querySelectorAll("[data-surveyor]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.surveyor === ui.surveyor)));
  if (ui.surveyor) {
    localStorage.setItem("scs:surveyor", ui.surveyor);
    $("#surveyor-field").classList.remove("need");
  }
}

// Semua perubahan dicatat atas nama surveyor, jadi nama wajib dipilih dulu.
function needSurveyor() {
  if (ui.surveyor) return false;
  const field = $("#surveyor-field");
  field.classList.add("need");
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  toast(`Pilih nama surveyor dulu (${SURVEYORS.join(" atau ")})`, "warn");
  return true;
}

function buildSurveyors() {
  const wrap = $("#surveyors");
  for (const name of SURVEYORS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.surveyor = name;
    b.setAttribute("aria-pressed", "false");
    b.textContent = name;
    b.addEventListener("click", () => setSurveyor(name));
    wrap.append(b);
  }
  // Pakai pilihan terakhir di HP ini (juga nama yang dulu diketik manual, kalau cocok).
  const saved = localStorage.getItem("scs:surveyor") || localStorage.getItem("scs:name") || "";
  setSurveyor(SURVEYORS.find((n) => n.toLowerCase() === saved.trim().toLowerCase()));
}

// Jalankan perubahan tanpa menunggu server (Firebase menampilkannya langsung
// dan mengirimkannya begitu online); tampilkan error kalau ditolak.
function run(promise) {
  Promise.resolve(promise).catch((err) => {
    console.error(err);
    const denied = /permission[_ ]denied/i.test(`${err.code} ${err.message}`);
    toast(
      denied
        ? "Gagal menyimpan: ditolak Rules Firebase. Publish ulang isi database.rules.json terbaru (yang berisi \"respondents\")."
        : `Gagal menyimpan: ${err.message || err}`,
      "error",
    );
  });
}

function offlineSuffix() {
  return ui.backend.mode === "firebase" && !ui.online ? " (offline — dikirim saat online lagi)" : "";
}

function setForm(fr, ws) {
  ui.form = { fr, ws };
  document.querySelectorAll("[data-fr]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fr === fr)));
  $("#q-ws").setAttribute("aria-pressed", String(ws));
}

function startEdit(id) {
  const rec = ui.byId.get(id);
  if (!rec || rec.deleted) return;
  ui.editing = id;
  setForm(rec.fr, rec.ws);
  $("#form").classList.add("is-editing");
  $("#form-title").textContent = `Ubah responden #${rec.no}`;
  $("#form-hint").textContent = "Pilih kategori yang benar, lalu tekan Simpan perubahan.";
  $("#save").textContent = "Simpan perubahan";
  $("#cancel-edit").hidden = false;
  document.querySelectorAll(".resp.editing").forEach((el) => el.classList.remove("editing"));
  document.querySelector(`.resp[data-id="${id}"]`)?.classList.add("editing");
  $("#form").scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitEdit() {
  ui.editing = null;
  setForm("none", false);
  $("#form").classList.remove("is-editing");
  $("#form-title").textContent = "Catat responden baru";
  $("#form-hint").innerHTML =
    "Satu responden = satu kali simpan. <b>Total</b> (carbon footprint) otomatis +1, ditambah kategori yang kamu pilih.";
  $("#save").textContent = "+ Simpan responden";
  $("#cancel-edit").hidden = true;
  document.querySelectorAll(".resp.editing").forEach((el) => el.classList.remove("editing"));
}

function save() {
  const { backend } = ui;
  if (!backend || ui.cooldown || needSurveyor()) return;
  ui.cooldown = true; // cegah ketuk dua kali tidak sengaja
  setTimeout(() => (ui.cooldown = false), 700);
  const { fr, ws } = ui.form;

  if (ui.editing) {
    const rec = ui.byId.get(ui.editing);
    exitEdit();
    if (!rec || rec.deleted) return toast("Responden ini sudah dihapus", "warn");
    if (rec.fr === fr && rec.ws === ws) return toast("Tidak ada perubahan");
    run(backend.update(rec.id, { fr, ws, editedBy: surveyor(), editedAt: backend.now() }));
    return toast(`Responden #${rec.no} diubah: ${catsText(rec)} → ${catsText({ fr, ws })}${offlineSuffix()}`);
  }

  run(backend.add({ fr, ws, by: surveyor() }));
  setForm("none", false);
  toast(`Responden tersimpan (${catsText({ fr, ws })})${offlineSuffix()}`);
}

function remove(id) {
  const rec = ui.byId.get(id);
  if (!rec || needSurveyor()) return;
  if (ui.editing === id) exitEdit();
  run(ui.backend.update(id, { deletedBy: surveyor(), deletedAt: ui.backend.now() }));
  toast(`Responden #${rec.no} dihapus`, "ok", { label: "Batalkan", run: () => restore(id) });
}

function restore(id) {
  const rec = ui.byId.get(id);
  run(ui.backend.update(id, { deletedBy: null, deletedAt: null }));
  toast(`Responden #${rec?.no ?? ""} dipulihkan`);
}

// ---------------------------------------------------------------------------
// Ceklis tugas
// ---------------------------------------------------------------------------
const ALL_TASKS = TASK_GROUPS.flatMap((g) => g.tasks);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Tombol "Rujukan" di kanan tugas: membuka folder proyek di OneDrive (SOURCE di tasks.js) di tab baru.
function refLink(drivePath) {
  const a = el("a", "ref");
  a.href = SOURCE.url;
  a.target = "_blank";
  a.rel = "noopener";
  a.title = `OneDrive: ${drivePath}`;
  a.setAttribute("aria-label", `Buka rujukan di OneDrive: ${drivePath}`);
  a.append(el("span", "ref-cap", "Rujukan ↗"), el("span", "ref-label", "OneDrive"));
  return a;
}

function buildChecklist() {
  const source = $("#ceklis-source");
  source.href = SOURCE.url;
  source.textContent = `${SOURCE.title} ↗`;
  const wrap = $("#groups");
  for (const g of TASK_GROUPS) {
    const sec = el("section", "card group");
    sec.dataset.group = g.id;
    const head = el("div", "group-head");
    head.append(el("h2", null, g.title), el("span", "group-count", `0/${g.tasks.length}`));
    sec.append(head);
    if (g.subtitle) sec.append(el("p", "hint", g.subtitle));
    const list = el("ul", "tasks");
    for (const t of g.tasks) {
      const li = el("li", "task");
      li.dataset.task = t.id;
      const label = el("label");
      const box = el("input");
      box.type = "checkbox";
      box.dataset.task = t.id;
      const body = el("span", "task-body");
      body.append(el("span", "task-title", t.title));
      if (t.note) body.append(el("span", "task-note", t.note));
      body.append(el("span", "task-meta"));
      label.append(box, body);
      li.append(label);
      if (t.drive) li.append(refLink(t.drive)); // hanya kalau rujukannya ada di OneDrive
      list.append(li);
    }
    sec.append(list);
    wrap.append(sec);
  }
}

function renderChecklist(map) {
  ui.checklist = map || {};
  let doneAll = 0;
  for (const g of TASK_GROUPS) {
    let done = 0;
    for (const t of g.tasks) {
      const rec = ui.checklist[t.id];
      const li = document.querySelector(`.task[data-task="${t.id}"]`);
      li.classList.toggle("done", Boolean(rec));
      li.querySelector("input").checked = Boolean(rec);
      const time = rec ? formatTime(rec.at) : "";
      li.querySelector(".task-meta").textContent = rec ? `✓ ${rec.by || "Anonim"}${time ? ` · ${time}` : ""}` : "";
      if (rec) done++;
    }
    doneAll += done;
    const sec = document.querySelector(`.group[data-group="${g.id}"]`);
    sec.querySelector(".group-count").textContent = `${done}/${g.tasks.length}`;
    sec.classList.toggle("complete", done === g.tasks.length);
  }
  const total = ALL_TASKS.length;
  const pct = Math.round((doneAll / total) * 100);
  $("#ceklis-summary").textContent = `${doneAll} dari ${total} tugas selesai`;
  $("#ceklis-percent").textContent = `${pct}%`;
  $("#ceklis-fill").style.width = `${pct}%`;
  $("#tab-ceklis-count").textContent = `${doneAll}/${total}`;
}

function toggleTask(box) {
  const id = box.dataset.task;
  const task = ALL_TASKS.find((t) => t.id === id);
  if (!task || !ui.backend) return;
  if (needSurveyor()) {
    box.checked = !box.checked; // kembalikan, belum ada nama
    return;
  }
  if (box.checked) {
    run(ui.backend.setTask(id, { by: surveyor(), at: ui.backend.now() }));
    toast(`Selesai: ${task.title}${offlineSuffix()}`);
  } else {
    const prev = ui.checklist[id];
    run(ui.backend.setTask(id, null));
    toast(
      `Centang dibatalkan: ${task.title}`,
      "ok",
      prev && { label: "Kembalikan", run: () => run(ui.backend.setTask(id, { by: prev.by, at: prev.at })) },
    );
  }
}

function showView(view) {
  const v = view === "ceklis" ? "ceklis" : "counter";
  document.querySelectorAll('[role="tab"]').forEach((btn) => {
    const active = btn.dataset.view === v;
    btn.setAttribute("aria-selected", String(active));
    btn.tabIndex = active ? 0 : -1;
  });
  $("#view-counter").hidden = v !== "counter";
  $("#view-ceklis").hidden = v !== "ceklis";
  const hash = v === "ceklis" ? "#ceklis" : "";
  if (location.hash !== hash) history.replaceState(null, "", hash || location.pathname + location.search);
}

function bindEvents() {
  document.querySelectorAll('[role="tab"]').forEach((btn) => btn.addEventListener("click", () => showView(btn.dataset.view)));
  window.addEventListener("hashchange", () => showView(location.hash.slice(1)));
  $("#groups").addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"][data-task]')) toggleTask(e.target);
  });

  document.querySelectorAll("[data-fr]").forEach((btn) =>
    btn.addEventListener("click", () => setForm(ui.form.fr === btn.dataset.fr ? "none" : btn.dataset.fr, ui.form.ws)),
  );
  $("#q-ws").addEventListener("click", () => setForm(ui.form.fr, !ui.form.ws));
  $("#save").addEventListener("click", save);
  $("#cancel-edit").addEventListener("click", exitEdit);

  for (const listEl of [$("#list"), $("#trash-list")]) {
    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const id = btn.closest(".resp").dataset.id;
      if (btn.dataset.act === "edit") startEdit(id);
      if (btn.dataset.act === "delete") remove(id);
      if (btn.dataset.act === "restore") restore(id);
    });
  }

  $("#reset").addEventListener("click", () => {
    const answer = prompt(
      "SEMUA data responden (termasuk yang terhapus) akan dihapus permanen dan tidak bisa dipulihkan.\n" +
        "Pakai ini hanya untuk membersihkan data uji coba.\n\nKetik RESET untuk melanjutkan:",
    );
    if (answer?.trim().toUpperCase() !== "RESET") return;
    exitEdit();
    Promise.resolve(ui.backend?.reset())
      .then(() => toast("Semua data dihapus, mulai dari 0"))
      .catch((err) => toast(`Gagal menghapus: ${err.message || err}`, "error"));
  });
}

function attach(backend) {
  ui.backend = backend;
  backend.onConnection((online) => {
    ui.online = online;
    setStatus(backend.mode, online);
  });
  const onReadError = (err) => {
    console.error(err);
    showBanner(
      `<b>Tidak bisa membaca data Firebase:</b> ${escapeHtml(err.message)}. ` +
        "Pastikan <i>Rules</i> di Realtime Database sudah diisi dengan isi <code>database.rules.json</code> lalu di-Publish.",
    );
  };
  backend.onRespondents(render, onReadError);
  backend.onChecklist(renderChecklist, onReadError);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

async function start() {
  buildCounters();
  buildSurveyors();
  buildChecklist();
  bindEvents();
  showView(location.hash.slice(1));

  if (!firebaseConfig) {
    showBanner(
      "<b>Mode lokal:</b> data hanya tersimpan di perangkat ini, belum tersinkron ke tim. " +
        "Isi <code>firebase-config.js</code> supaya semua anggota tim melihat data yang sama (lihat README).",
    );
    attach(connectLocal());
    return;
  }

  try {
    attach(await connectFirebase(firebaseConfig));
  } catch (err) {
    console.error(err);
    showBanner(
      `<b>Gagal terhubung ke Firebase:</b> ${escapeHtml(err.message || err)}. ` +
        "Sementara memakai mode lokal: data <b>tidak</b> tersinkron ke tim.",
    );
    attach(connectLocal());
  }
}

start();
