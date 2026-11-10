import { firebaseConfig } from "./firebase-config.js";

// ---------------------------------------------------------------------------
// Pengaturan survei. Ubah target di sini kalau kuota berubah.
// ---------------------------------------------------------------------------
const COUNTERS = [
  { key: "total", label: "Total responden", short: "Total", note: "Semua ditanya carbon footprint", target: 45 },
  { key: "fr", label: "Pengguna FR KAI", short: "FR", note: "Pakai Face Recognition", target: 20 },
  { key: "nonfr", label: "Non-pengguna FR", short: "Non-FR", note: "Tidak pakai Face Recognition", target: 20 },
  { key: "ws", label: "Pengguna Water Station", short: "WS", note: "Pakai Water Station", target: 10 },
];

const FIREBASE_VERSION = "13.2.0";
const DATA_PATH = "survey"; // lokasi data di Realtime Database
const LOG_LIMIT = 30;

const KEYS = COUNTERS.map((c) => c.key);
const BY_KEY = Object.fromEntries(COUNTERS.map((c) => [c.key, c]));
const zeros = () => Object.fromEntries(KEYS.map((k) => [k, 0]));

// Terapkan perubahan ke angka saat ini tanpa membiarkan angka jadi negatif.
// `applied` hanya berisi perubahan yang benar-benar terjadi.
function applyDeltas(current, deltas) {
  const next = {};
  const applied = {};
  for (const k of KEYS) {
    const before = Number(current?.[k]) || 0;
    const after = Math.max(0, before + (deltas[k] || 0));
    next[k] = after;
    if (after !== before) applied[k] = after - before;
  }
  return { next, applied };
}

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
  const countsRef = fdb.ref(db, `${DATA_PATH}/counts`);
  const logRef = fdb.ref(db, `${DATA_PATH}/log`);

  return {
    mode: "firebase",
    onCounts(cb, onError) {
      fdb.onValue(countsRef, (snap) => cb(snap.val() || {}), onError);
    },
    onLog(cb) {
      fdb.onValue(fdb.query(logRef, fdb.limitToLast(LOG_LIMIT)), (snap) => {
        const items = [];
        snap.forEach((child) => {
          items.push(child.val());
        });
        cb(items.reverse());
      });
    },
    onConnection(cb) {
      fdb.onValue(fdb.ref(db, ".info/connected"), (snap) => cb(snap.val() === true));
    },
    // Transaksi menjamin klik bersamaan dari beberapa HP tidak saling menimpa.
    async apply(deltas, entry) {
      let applied = {};
      const result = await fdb.runTransaction(countsRef, (current) => {
        const r = applyDeltas(current, deltas);
        applied = r.applied;
        return r.next;
      });
      if (result.committed && Object.keys(applied).length) {
        await fdb.push(logRef, { ...entry, deltas: applied, at: fdb.serverTimestamp() });
      }
      return applied;
    },
    async reset(entry) {
      await fdb.set(countsRef, zeros());
      await fdb.push(logRef, { ...entry, at: fdb.serverTimestamp() });
    },
  };
}

// ---------------------------------------------------------------------------
// Cadangan: mode lokal (localStorage). Hanya sinkron antar tab di perangkat
// yang sama, dipakai kalau Firebase belum diisi atau gagal terhubung.
// ---------------------------------------------------------------------------
function connectLocal() {
  const K_COUNTS = "scs:counts";
  const K_LOG = "scs:log";
  const read = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const countSubs = new Set();
  const logSubs = new Set();
  const emit = () => {
    const counts = read(K_COUNTS, {});
    const log = read(K_LOG, []);
    countSubs.forEach((cb) => cb(counts));
    logSubs.forEach((cb) => cb(log));
  };
  const addLog = (entry) => write(K_LOG, [{ ...entry, at: Date.now() }, ...read(K_LOG, [])].slice(0, LOG_LIMIT));
  window.addEventListener("storage", (e) => {
    if (e.key === K_COUNTS || e.key === K_LOG || e.key === null) emit();
  });

  return {
    mode: "local",
    onCounts(cb) {
      countSubs.add(cb);
      cb(read(K_COUNTS, {}));
    },
    onLog(cb) {
      logSubs.add(cb);
      cb(read(K_LOG, []));
    },
    onConnection(cb) {
      cb(true);
    },
    async apply(deltas, entry) {
      const { next, applied } = applyDeltas(read(K_COUNTS, {}), deltas);
      write(K_COUNTS, next);
      if (Object.keys(applied).length) addLog({ ...entry, deltas: applied });
      emit();
      return applied;
    },
    async reset(entry) {
      write(K_COUNTS, zeros());
      addLog(entry);
      emit();
    },
  };
}

// ---------------------------------------------------------------------------
// Tampilan
// ---------------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const ui = { online: true, backend: null, fr: null, ws: false, firstRender: true, cooldown: false };

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
      <p class="remain">&nbsp;</p>
      <div class="steps">
        <button type="button" class="step" data-delta="-1" aria-label="Kurangi ${c.label}">−</button>
        <button type="button" class="step" data-delta="1" aria-label="Tambah ${c.label}">+</button>
      </div>`;
    wrap.append(el);
  }
}

function renderCounts(raw) {
  const n = Object.fromEntries(KEYS.map((k) => [k, Math.max(0, Number(raw?.[k]) || 0)]));
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
    el.querySelector('[data-delta="-1"]').disabled = value === 0;
  }
  ui.firstRender = false;

  const issues = [];
  if (n.fr + n.nonfr > n.total) {
    issues.push(`FR + Non-FR (${n.fr + n.nonfr}) lebih banyak dari total responden (${n.total}).`);
  }
  if (n.ws > n.total) {
    issues.push(`Water Station (${n.ws}) lebih banyak dari total responden (${n.total}).`);
  }
  const warn = $("#warn");
  warn.hidden = issues.length === 0;
  warn.textContent = issues.length ? `⚠ Cek lagi: ${issues.join(" ")}` : "";

  document.title = `${n.total}/${BY_KEY.total.target} · Survey Counter SROI`;
}

function pulse(el) {
  el.classList.remove("pulse");
  void el.offsetWidth; // restart animasi
  el.classList.add("pulse");
}

function describe(entry) {
  if (entry.kind === "reset") return "mereset semua counter ke 0";
  const deltas = entry.deltas || {};
  if (entry.kind === "respondent") {
    const cats = Object.keys(deltas)
      .filter((k) => k !== "total" && deltas[k] > 0)
      .map((k) => BY_KEY[k]?.short ?? k);
    return `mencatat responden baru${cats.length ? ` (${cats.join(" + ")})` : ""}`;
  }
  return Object.entries(deltas)
    .map(([k, d]) => `${BY_KEY[k]?.label ?? k} ${d > 0 ? "+" : "−"}${Math.abs(d)}`)
    .join(", ");
}

function formatTime(at) {
  if (typeof at !== "number") return "";
  const d = new Date(at);
  const sameDay = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return sameDay ? time : `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ${time}`;
}

function renderLog(items) {
  const list = $("#log");
  list.replaceChildren();
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Belum ada aktivitas.";
    list.append(li);
    return;
  }
  for (const entry of items) {
    const li = document.createElement("li");
    if (entry.kind === "reset") li.className = "is-reset";
    else if (Object.values(entry.deltas || {}).some((d) => d < 0)) li.className = "is-minus";
    const who = document.createElement("b");
    who.textContent = entry.by || "Anonim";
    const what = document.createElement("span");
    what.textContent = ` ${describe(entry)}`;
    const time = document.createElement("time");
    time.textContent = formatTime(entry.at);
    li.append(who, what, time);
    list.append(li);
  }
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
function toast(message, kind = "ok") {
  const el = $("#toast");
  el.textContent = message;
  el.className = `toast ${kind}`;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2600);
}

function surveyor() {
  return $("#name").value.trim().slice(0, 24) || "Anonim";
}

function submit(deltas, kind, okMessage) {
  const { backend } = ui;
  if (!backend) return;
  backend
    .apply(deltas, { by: surveyor(), kind })
    .catch((err) => {
      console.error(err);
      toast(`Gagal menyimpan: ${err.message || err}`, "error");
    });
  if (okMessage) {
    const offline = backend.mode === "firebase" && !ui.online;
    toast(offline ? `${okMessage} (offline — dikirim saat online lagi)` : okMessage, offline ? "warn" : "ok");
  }
}

function setFr(value) {
  ui.fr = value;
  document.querySelectorAll("[data-fr]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fr === value)));
}

function setWs(value) {
  ui.ws = value;
  $("#q-ws").setAttribute("aria-pressed", String(value));
}

function bindEvents() {
  $("#counters").addEventListener("click", (e) => {
    const btn = e.target.closest(".step");
    if (!btn) return;
    const key = btn.closest(".counter").dataset.key;
    submit({ [key]: Number(btn.dataset.delta) }, "manual");
  });

  document.querySelectorAll("[data-fr]").forEach((btn) =>
    btn.addEventListener("click", () => setFr(ui.fr === btn.dataset.fr ? null : btn.dataset.fr)),
  );
  $("#q-ws").addEventListener("click", () => setWs(!ui.ws));

  $("#save").addEventListener("click", () => {
    if (ui.cooldown) return; // cegah ketuk dua kali tidak sengaja
    ui.cooldown = true;
    setTimeout(() => (ui.cooldown = false), 700);

    const deltas = { total: 1 };
    if (ui.fr) deltas[ui.fr] = 1;
    if (ui.ws) deltas.ws = 1;
    const cats = [ui.fr && BY_KEY[ui.fr].short, ui.ws && "WS"].filter(Boolean);
    submit(deltas, "respondent", `Responden tersimpan${cats.length ? ` (${cats.join(" + ")})` : ""}`);
    setFr(null);
    setWs(false);
  });

  const name = $("#name");
  name.value = localStorage.getItem("scs:name") || "";
  name.addEventListener("input", () => localStorage.setItem("scs:name", name.value.trim()));

  $("#reset").addEventListener("click", () => {
    const answer = prompt("Semua counter tim akan kembali ke 0.\nKetik RESET untuk melanjutkan:");
    if (answer?.trim().toUpperCase() !== "RESET") return;
    ui.backend
      ?.reset({ by: surveyor(), kind: "reset" })
      .then(() => toast("Semua counter direset ke 0"))
      .catch((err) => toast(`Gagal reset: ${err.message || err}`, "error"));
  });
}

function attach(backend) {
  ui.backend = backend;
  backend.onConnection((online) => {
    ui.online = online;
    setStatus(backend.mode, online);
  });
  backend.onCounts(renderCounts, (err) => {
    console.error(err);
    showBanner(`<b>Tidak bisa membaca data Firebase.</b> ${escapeHtml(err.message)}. Cek <i>Rules</i> di Realtime Database (lihat README).`);
  });
  backend.onLog(renderLog);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

async function start() {
  buildCounters();
  bindEvents();

  if (!firebaseConfig) {
    showBanner(
      "<b>Mode lokal:</b> angka hanya tersimpan di perangkat ini, belum tersinkron ke tim. " +
        "Isi <code>firebase-config.js</code> supaya semua anggota tim melihat angka yang sama (lihat README).",
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
        "Sementara memakai mode lokal: angka <b>tidak</b> tersinkron ke tim.",
    );
    attach(connectLocal());
  }
}

start();
