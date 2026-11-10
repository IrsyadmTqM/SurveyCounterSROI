// Naikkan angka ?v= (juga di index.html) setiap kali file ini atau config diubah.
import { firebaseConfig } from "./firebase-config.js?v=6";

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
  };
}

// ---------------------------------------------------------------------------
// Cadangan: mode lokal (localStorage). Hanya sinkron antar tab di perangkat
// yang sama, dipakai kalau Firebase belum diisi atau gagal terhubung.
// ---------------------------------------------------------------------------
function connectLocal() {
  const KEY = "scs:respondents";
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  };
  const subs = new Set();
  const save = (all) => {
    localStorage.setItem(KEY, JSON.stringify(all));
    subs.forEach((cb) => cb(all));
  };
  window.addEventListener("storage", (e) => {
    if (e.key === KEY || e.key === null) {
      const all = read();
      subs.forEach((cb) => cb(all));
    }
  });
  let seq = 0;
  // ID berurutan menurut waktu, sama seperti push ID Firebase.
  const newId = () =>
    Date.now().toString(36).padStart(9, "0") + (seq++ % 1296).toString(36).padStart(2, "0") + Math.random().toString(36).slice(2, 6);

  return {
    mode: "local",
    now: () => Date.now(),
    onRespondents(cb) {
      subs.add(cb);
      cb(read());
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

function bindEvents() {
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
  backend.onRespondents(render, (err) => {
    console.error(err);
    showBanner(
      `<b>Tidak bisa membaca data Firebase:</b> ${escapeHtml(err.message)}. ` +
        "Pastikan <i>Rules</i> di Realtime Database sudah diisi dengan isi <code>database.rules.json</code> lalu di-Publish.",
    );
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

async function start() {
  buildCounters();
  buildSurveyors();
  bindEvents();

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
