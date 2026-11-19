/* =====================================================================
   Entwicklungsbüro JPS Embedded – Projektplan (Gantt, PSP, Projektampel)
   ---------------------------------------------------------------------
   Die Schüler haken ihre Aufgaben selbst ab und planen die Arbeitspakete
   ihres eigenen Projekts. Alles liegt im localStorage dieses Browsers;
   es wird nichts verschickt.
   ===================================================================== */
"use strict";

const P = PROJEKT;
const K_HAKEN = "buero-" + P.fach + "-haken";
const K_EIGENE = "buero-" + P.fach + "-eigene";
const K_NAME = "buero-" + P.fach + "-name";
const K_STUFE = "buero-" + P.fach + "-stufe";
const K_ANSICHT = "buero-" + P.fach + "-ansicht";

const TAG = 864e5;
const PX = 4.3; // Pixel pro Tag
const LABEL = 300; // Breite der Namensspalte
const KOPF = 54; // Höhe der Zeitleiste
const ZH = 30; // Zeilenhöhe
const TPH = 36; // Höhe einer Teilprojekt-Zeile

let speicherOk = true;
let haken = {}; // paket-id -> { aufgabe-id: true }
let eigene = []; // eigene Arbeitspakete
let gewaehlt = null;
let ansicht = "gantt";

// ---------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------
const $ = (s) => document.querySelector(s);
function esc(t) {
  return String(t).replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[z]);
}
function lies(k) {
  try {
    const r = localStorage.getItem(k);
    return r === null ? null : JSON.parse(r);
  } catch (e) {
    return null;
  }
}
function schreib(k, w) {
  try {
    localStorage.setItem(k, JSON.stringify(w));
  } catch (e) {
    /* kein Speicher */
  }
}
function pruefeSpeicher() {
  try {
    localStorage.setItem("__buero_test", "1");
    localStorage.removeItem("__buero_test");
    return true;
  } catch (e) {
    return false;
  }
}
// Tag als Zahl (UTC, ohne Zeitzone)
function tag(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / TAG;
}
function heute() {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / TAG;
}
const T0 = tag(P.start);
const T1 = tag(P.ende);
function X(iso) {
  return LABEL + (tag(iso) - T0) * PX;
}
function xTag(t) {
  return LABEL + (t - T0) * PX;
}
// Meilensteine mit "termin" haben keinen festen Tag (z. B. Schulaufgabe): nur den Text zeigen
function termin(el, mitJahr) {
  return el.termin ? el.termin : datum(el.datum, mitJahr);
}
function datum(iso, mitJahr) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.${mitJahr ? y : ""}`;
}
function isoAus(t) {
  return new Date(t * TAG).toISOString().slice(0, 10);
}
function kw(t) {
  const d = new Date(t * TAG);
  const wt = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - wt + 3);
  const j = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d - j) / TAG - 3 + ((j.getUTCDay() + 6) % 7)) / 7);
}
const tpVon = (id) => P.teilprojekte.find((t) => t.id === id);
const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// ---------------------------------------------------------------------
// Fortschritt und Status
// ---------------------------------------------------------------------
function element(id) {
  return P.pakete.find((p) => p.id === id) || P.meilensteine.find((m) => m.id === id) || eigene.find((e) => e.id === id);
}
function istMeilenstein(el) {
  return !!(el && el.datum);
}
function istOptional(el) {
  const tp = el && P.teilprojekte.find((t) => t.id === el.tp);
  return !!(tp && tp.optional);
}
function istEigen(el) {
  return !!(el && el.eigen);
}
function anteil(ap) {
  if (istEigen(ap)) {
    return (ap.pct || 0) / 100;
  }
  const h = haken[ap.id] || {};
  const n = ap.aufgaben.filter((a) => h[a.id]).length;
  return ap.aufgaben.length ? n / ap.aufgaben.length : 0;
}
function erledigteAufgaben(ap) {
  const h = haken[ap.id] || {};
  return ap.aufgaben.filter((a) => h[a.id]).length;
}
// Status eines Arbeitspakets im Vergleich zum Plan
function status(ap) {
  const a = anteil(ap);
  const jetzt = heute();
  const s = tag(ap.start);
  const e = tag(ap.ende);
  if (a >= 1) {
    return { id: "fertig", text: "erledigt" };
  }
  if (istOptional(ap)) {
    return { id: "optional", text: "optional" };
  }
  if (jetzt < s) {
    return { id: "geplant", text: "geplant" };
  }
  if (jetzt > e) {
    return { id: "rot", text: "überfällig" };
  }
  const soll = Math.min(1, (jetzt - s + 1) / (e - s + 1));
  if (a + 0.25 < soll) {
    return { id: "gelb", text: "verzögert" };
  }
  return { id: "gruen", text: "im Plan" };
}
function erreicht(m) {
  return !!(m.braucht && m.braucht.length && m.braucht.every((id) => anteil(element(id)) >= 1));
}
function msStatus(m) {
  if (!m.braucht) {
    if (heute() > tag(m.datum)) {
      return { id: "fertig", text: "vorbei" };
    }
    return { id: "geplant", text: m.art === "optional" ? "optional" : m.termin ? "Termin folgt" : "Termin" };
  }
  if (erreicht(m)) {
    return { id: "fertig", text: "erreicht" };
  }
  return heute() > tag(m.datum) ? { id: "rot", text: "überfällig" } : { id: "geplant", text: "offen" };
}
function alleAPs() {
  return P.pakete.concat(eigene);
}

// ---------------------------------------------------------------------
// Zeilen für Gantt und PSP
// ---------------------------------------------------------------------
function zeilen() {
  const z = [];
  P.teilprojekte.forEach((tp) => {
    z.push({ art: "tp", tp });
    P.zeilen[tp.id].forEach((id) => z.push({ art: istMeilenstein(element(id)) ? "ms" : "ap", el: element(id), tp }));
    if (tp.id === "tp3" && eigene.length) {
      eigene.slice().sort((a, b) => tag(a.start) - tag(b.start)).forEach((e) => z.push({ art: "ap", el: e, tp }));
    }
  });
  return z;
}
function tpAnteil(tp) {
  const aps = alleAPs().filter((a) => a.tp === tp.id);
  if (!aps.length) {
    return 0;
  }
  return aps.reduce((s, a) => s + anteil(a), 0) / aps.length;
}
function tpSpanne(tp) {
  const aps = alleAPs().filter((a) => a.tp === tp.id);
  const ms = P.meilensteine.filter((m) => m.tp === tp.id);
  const s = Math.min(...aps.map((a) => tag(a.start)), ...ms.map((m) => tag(m.datum)));
  const e = Math.max(...aps.map((a) => tag(a.ende)), ...ms.map((m) => tag(m.datum)));
  return [s, e];
}

// ---------------------------------------------------------------------
// Gantt-Diagramm
// ---------------------------------------------------------------------
function zeichneGantt() {
  const z = zeilen();
  let y = KOPF;
  const pos = {};
  z.forEach((r) => {
    const h = r.art === "tp" ? TPH : ZH;
    r.y = y;
    r.h = h;
    if (r.el) {
      pos[r.el.id] = r;
    }
    y += h;
  });
  const H = y + 10;
  const B = xTag(T1) + 20;
  const t = [];
  t.push(`<defs><marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pfeil-spitze"/></marker></defs>`);

  // Zeilenhintergrund
  z.forEach((r, i) => {
    t.push(`<rect class="${r.art === "tp" ? "zeile-tp" : i % 2 ? "zeile-a" : "zeile-b"}" x="0" y="${r.y}" width="${B}" height="${r.h}"/>`);
  });

  // Ferien
  P.frei.forEach((f) => {
    const x0 = X(f.von);
    const w = (tag(f.bis) - tag(f.von) + 1) * PX;
    t.push(`<g class="frei"><title>${esc(f.name)} (${datum(f.von)}–${datum(f.bis, true)})</title><rect x="${x0}" y="${KOPF}" width="${w}" height="${H - KOPF}"/></g>`);
    if (w > 18) {
      t.push(`<text class="frei-text" transform="translate(${x0 + w / 2 + 3} ${KOPF + 8}) rotate(90)">${esc(f.name)}</text>`);
    }
  });

  // Zeitleiste: Monate und Kalenderwochen
  t.push(`<rect class="kopf-grund" x="0" y="0" width="${B}" height="${KOPF}"/>`);
  for (let d = T0; d <= T1; d++) {
    const dt = new Date(d * TAG);
    if (dt.getUTCDate() === 1 || d === T0) {
      const x = xTag(d);
      t.push(`<line class="monat-linie" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
      t.push(`<text class="monat" x="${x + 5}" y="20">${MONATE[dt.getUTCMonth()]} ${String(dt.getUTCFullYear()).slice(2)}</text>`);
    }
    if (dt.getUTCDay() === 1) {
      const x = xTag(d);
      t.push(`<line class="kw-linie" x1="${x}" y1="${KOPF - 18}" x2="${x}" y2="${H}"/>`);
      t.push(`<text class="kw" x="${x + 3.5 * PX}" y="${KOPF - 6}">${kw(d)}</text>`);
    }
  }
  t.push(`<text class="kw-kopf" x="${LABEL - 10}" y="${KOPF - 6}">KW</text>`);
  t.push(`<line class="achse" x1="0" y1="${KOPF}" x2="${B}" y2="${KOPF}"/>`);
  t.push(`<line class="achse" x1="${LABEL}" y1="0" x2="${LABEL}" y2="${H}"/>`);

  // Prüfungszeitraum
  if (P.pruefung) {
    const x = X(P.pruefung.datum);
    if (x < B) {
      t.push(`<line class="pruefung" x1="${x}" y1="${KOPF}" x2="${x}" y2="${H}"/>`);
    }
  }

  // Abhängigkeiten
  z.forEach((r) => {
    if (!r.el || !r.el.nach) {
      return;
    }
    r.el.nach.forEach((vid) => {
      const v = pos[vid];
      if (!v) {
        return;
      }
      const vx = istMeilenstein(v.el) ? X(v.el.datum) + 7 : X(v.el.ende) + PX;
      const vy = v.y + v.h / 2;
      const nx = istMeilenstein(r.el) ? X(r.el.datum) - 8 : X(r.el.start);
      const ny = r.y + r.h / 2;
      const knick = Math.max(vx + 6, Math.min(nx - 6, vx + 10));
      t.push(`<path class="abh" d="M${vx} ${vy}H${knick}V${ny}H${nx - 1}" marker-end="url(#pfeil)"/>`);
    });
  });

  // Zeilen
  z.forEach((r) => {
    if (r.art === "tp") {
      const tp = r.tp;
      const [s, e] = tpSpanne(tp);
      const a = tpAnteil(tp);
      const yy = r.y + r.h / 2;
      t.push(`<g class="tp-zeile">`);
      t.push(`<rect class="tp-marke" x="10" y="${r.y + 10}" width="6" height="${r.h - 20}" rx="2" fill="${tp.farbe}"/>`);
      t.push(`<text class="tp-name" x="24" y="${yy + 5}">${esc(tp.nr)} ${esc(tp.name)}</text>`);
      t.push(`<text class="tp-pct" x="${LABEL - 10}" y="${yy + 5}">${Math.round(a * 100)} %</text>`);
      t.push(`<path class="tp-klammer" d="M${xTag(s)} ${yy + 6}V${yy - 4}H${xTag(e + 1)}V${yy + 6}" stroke="${tp.farbe}"/>`);
      t.push(`<rect x="${xTag(s)}" y="${yy - 4}" width="${(xTag(e + 1) - xTag(s)) * a}" height="4" fill="${tp.farbe}"/>`);
      t.push(`</g>`);
      return;
    }
    const el = r.el;
    const tp = r.tp;
    const yy = r.y + r.h / 2;
    const sel = gewaehlt === el.id ? " gewaehlt" : "";
    t.push(`<g class="zeile${sel}" data-id="${el.id}" tabindex="0" role="button">`);
    t.push(`<rect class="treffer" x="0" y="${r.y}" width="${B}" height="${r.h}"/>`);
    if (r.art === "ms") {
      const st = msStatus(el);
      const x = X(el.datum);
      const voll = st.id === "fertig" && el.braucht;
      t.push(`<title>${esc(el.name)} · ${termin(el, true)} · ${st.text}</title>`);
      t.push(`<text class="name ms-name" x="40" y="${yy + 4}">${esc(el.name)}</text>`);
      t.push(`<path class="raute ${st.id}${el.art === "optional" ? " optional" : ""}" d="M${x} ${yy - 8}L${x + 8} ${yy}L${x} ${yy + 8}L${x - 8} ${yy}Z" stroke="${tp.farbe}" ${voll ? `fill="${tp.farbe}"` : ""}/>`);
      const msText = el.art === "nachweis" ? `${el.name} · ${termin(el)}` : termin(el);
      const links = x + 13 + msText.length * 6.4 > B - 6; // am rechten Rand: Text links der Raute
      const tx = links ? x - 13 : x + 13;
      t.push(`<text class="${el.art === "nachweis" ? "nachweis-chip" : "ms-datum"}" x="${tx}" y="${yy + 4}" ${links ? 'text-anchor="end"' : ""}>${esc(msText)}</text>`);
      t.push(`<path class="raute-klein" d="M24 ${yy - 5}L29 ${yy}L24 ${yy + 5}L19 ${yy}Z" stroke="${tp.farbe}" ${voll ? `fill="${tp.farbe}"` : ""}/>`);
    } else {
      const st = status(el);
      const a = anteil(el);
      const x0 = X(el.start);
      const w = (tag(el.ende) - tag(el.start) + 1) * PX;
      const nr = istEigen(el) ? "3." + (eigene.indexOf(el) + 1) + "*" : el.nr;
      t.push(`<title>${esc(nr)} ${esc(el.name)} · ${datum(el.start)}–${datum(el.ende, true)} · ${Math.round(a * 100)} % · ${st.text}</title>`);
      t.push(`<text class="nr" x="20" y="${yy + 4}">${esc(nr)}</text>`);
      t.push(`<text class="name${istEigen(el) ? " eigen" : ""}" x="58" y="${yy + 4}">${esc(kuerze(el.name, 30))}</text>`);
      t.push(`<circle class="status-punkt ${st.id}" cx="${LABEL - 14}" cy="${yy}" r="4.5"/>`);
      t.push(`<rect class="balken${istEigen(el) ? " eigen" : ""}${istOptional(el) ? " optional" : ""}" x="${x0}" y="${yy - 8}" width="${w}" height="16" rx="4" stroke="${tp.farbe}" fill="${tp.farbe}"/>`);
      if (a > 0) {
        t.push(`<rect class="fortschritt" x="${x0}" y="${yy - 8}" width="${Math.max(4, w * a)}" height="16" rx="4" fill="${tp.farbe}"/>`);
      }
      if (st.id === "rot") {
        t.push(`<rect class="verzug" x="${x0 - 2}" y="${yy - 10}" width="${w + 4}" height="20" rx="6"/>`);
      }
      const pctText = `${Math.round(a * 100)} %`;
      t.push(`<text class="pct" x="${x0 + w + 6}" y="${yy + 4}">${pctText}</text>`);
    }
    t.push(`</g>`);
  });

  // Heute
  const jetzt = heute();
  if (jetzt >= T0 && jetzt <= T1) {
    const x = xTag(jetzt + 0.5);
    t.push(`<g class="heute"><line x1="${x}" y1="${KOPF - 2}" x2="${x}" y2="${H}"/><rect x="${x - 22}" y="${KOPF - 16}" width="44" height="15" rx="7"/><text x="${x}" y="${KOPF - 5}">heute</text></g>`);
  }

  // Namensspalte bleibt beim Scrollen stehen: dieselbe Zeichnung zweimal, mit verschiedenem Ausschnitt
  const inhalt = t.join("");
  $("#gantt").innerHTML =
    `<div class="g-links"><svg viewBox="0 0 ${LABEL} ${H}" width="${LABEL}" height="${H}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inhalt}</svg></div>` +
    `<div class="g-rechts"><svg viewBox="${LABEL} 0 ${B - LABEL} ${H}" width="${B - LABEL}" height="${H}" role="img" aria-label="Gantt-Diagramm des Projekts" xmlns="http://www.w3.org/2000/svg">${inhalt}</svg></div>`;
  document.querySelectorAll("#gantt .zeile").forEach((g) => bindeWahl(g));
  // beim ersten Zeichnen zur aktuellen Woche scrollen
  if (!zeichneGantt.gescrollt) {
    zeichneGantt.gescrollt = true;
    const box = $("#gantt");
    const x = xTag(Math.min(Math.max(jetzt, T0), T1));
    box.scrollLeft = Math.max(0, x - LABEL - 260);
  }
}
function kuerze(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function bindeWahl(el) {
  el.addEventListener("click", () => waehle(el.dataset.id));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      waehle(el.dataset.id);
    }
  });
}

// ---------------------------------------------------------------------
// Projektstrukturplan
// ---------------------------------------------------------------------
function zeichnePSP() {
  const ges = alleAPs().reduce((s, a) => s + anteil(a), 0) / alleAPs().length;
  const spalten = P.teilprojekte.map((tp) => {
    const ids = P.zeilen[tp.id].filter((id) => !istMeilenstein(element(id)));
    const aps = ids.map(element).concat(tp.id === "tp3" ? eigene : []);
    const ms = P.zeilen[tp.id].filter((id) => istMeilenstein(element(id))).map(element);
    const kaesten = aps.map((ap) => {
      const st = status(ap);
      const a = anteil(ap);
      const nr = istEigen(ap) ? "3." + (eigene.indexOf(ap) + 1) + "*" : ap.nr;
      return `<button type="button" class="psp-ap${istEigen(ap) ? " eigen" : ""}${gewaehlt === ap.id ? " gewaehlt" : ""}" data-id="${ap.id}" style="--tp:${tp.farbe}">
        <span class="psp-kopf"><b>${esc(nr)}</b><i class="status-punkt ${st.id}" title="${esc(st.text)}"></i></span>
        <span class="psp-name">${esc(ap.name)}</span>
        <span class="psp-balken"><i style="width:${Math.round(a * 100)}%"></i></span>
        <small>${datum(ap.start)}–${datum(ap.ende)} · ${Math.round(a * 100)} %</small>
      </button>`;
    });
    const steine = ms.map((m) => {
      const st = msStatus(m);
      return `<button type="button" class="psp-ms ${st.id}" data-id="${m.id}" style="--tp:${tp.farbe}"><span class="mini-raute${st.id === "fertig" && m.braucht ? " voll" : ""}"></span>${esc(m.name)} <small>${termin(m)}</small></button>`;
    });
    return `<div class="psp-spalte">
      <div class="psp-tp" style="--tp:${tp.farbe}"><b>${esc(tp.nr)} ${esc(tp.name)}</b><small>${esc(tp.info)}</small><span class="psp-balken"><i style="width:${Math.round(tpAnteil(tp) * 100)}%"></i></span></div>
      <div class="psp-aps">${kaesten.join("")}</div>
      ${steine.length ? `<div class="psp-steine"><span class="psp-steine-kopf">Meilensteine</span>${steine.join("")}</div>` : ""}
    </div>`;
  });
  $("#psp").innerHTML = `<div class="psp-wurzel"><b>${esc(P.titel)}</b><small>Gesamtprojekt · ${Math.round(ges * 100)} % erledigt</small></div>
    <div class="psp-spalten">${spalten.join("")}</div>`;
  document.querySelectorAll("#psp [data-id]").forEach((b) => b.addEventListener("click", () => waehle(b.dataset.id)));
}

// ---------------------------------------------------------------------
// Detailansicht
// ---------------------------------------------------------------------
function naechstes() {
  const offen = P.pakete.filter((p) => anteil(p) < 1 && !istOptional(p)).sort((a, b) => tag(a.start) - tag(b.start));
  return offen[0] || null;
}
function waehle(id) {
  gewaehlt = id;
  zeichneAlles();
  if (window.matchMedia("(max-width: 1180px)").matches) {
    $("#detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}
function chip(st) {
  return `<span class="status-chip ${st.id}">${esc(st.text)}</span>`;
}
function verweise(el) {
  const vor = (el.nach || []).map(element).filter(Boolean);
  const nach = P.pakete.concat(P.meilensteine).filter((x) => (x.nach || []).includes(el.id));
  const knopf = (x) => `<button type="button" class="link" data-id="${x.id}">${esc(x.nr ? x.nr + " " : "")}${esc(x.name)}</button>`;
  const teile = [];
  if (vor.length) {
    teile.push(`<span><b>Vorgänger:</b> ${vor.map(knopf).join(", ")}</span>`);
  }
  if (nach.length) {
    teile.push(`<span><b>Nachfolger:</b> ${nach.map(knopf).join(", ")}</span>`);
  }
  return teile.length ? `<p class="verweise">${teile.join("")}</p>` : "";
}
function zeichneDetail() {
  const box = $("#detail");
  let el = gewaehlt ? element(gewaehlt) : null;
  let ueber = "Arbeitspaket";
  if (!el) {
    el = naechstes();
    ueber = "Dein nächstes Arbeitspaket";
    if (!el) {
      box.innerHTML = `<div class="detail-kopf"><span class="punkt"></span>Alles erledigt</div><div class="detail-inhalt"><h2>Projekt abgeschlossen</h2><p>Alle Arbeitspakete sind abgehakt. Klick auf eine Zeile, um nachzulesen, worum es ging.</p></div>`;
      return;
    }
  }
  const tp = tpVon(el.tp);
  const t = [];
  if (istMeilenstein(el)) {
    const st = msStatus(el);
    t.push(`<div class="detail-kopf"><span class="punkt"></span>Meilenstein</div><div class="detail-inhalt">`);
    t.push(`<div class="linienkopf"><span class="linienpunkt" style="background:${tp.farbe}"></span>Teilprojekt ${esc(tp.nr)} · ${esc(tp.name)}</div>`);
    t.push(`<h2>${esc(el.name)}</h2>`);
    t.push(`<p class="meta">Termin: ${el.termin ? `${el.termin} (genauer Termin von deiner Lehrkraft)` : datum(el.datum, true)}${el.art === "nachweis" ? " · Leistungsnachweis" : ""} ${chip(st)}</p>`);
    if (el.bild) {
      t.push(`<img class="ms-bild" src="${esc(el.bild)}" alt="">`);
    }
    t.push(`<p>${esc(el.text)}</p>`);
    if (el.braucht) {
      const zeilen = el.braucht.map((id) => {
        const ap = element(id);
        const a = anteil(ap);
        return `<li class="${a >= 1 ? "hat" : ""}"><button type="button" class="link" data-id="${ap.id}">${esc(ap.nr)} ${esc(ap.name)}</button><span>${Math.round(a * 100)} %</span></li>`;
      });
      t.push(`<p class="fortschritt"><b>Erreicht, wenn erledigt:</b></p><ul class="braucht">${zeilen.join("")}</ul>`);
    }
    if (el.kriterien) {
      t.push(`<details class="kriterien"><summary>${esc(el.kriterienTitel || "So wird abgenommen")}</summary><ul>${el.kriterien.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></details>`);
    }
    t.push(verweise(el));
  } else if (istEigen(el)) {
    const st = status(el);
    t.push(`<div class="detail-kopf"><span class="punkt"></span>Eigenes Arbeitspaket</div><div class="detail-inhalt">`);
    t.push(`<div class="linienkopf"><span class="linienpunkt" style="background:${tp.farbe}"></span>Teilprojekt 3 · Mein Projektplan</div>`);
    t.push(`<h2>${esc(el.name)}</h2>`);
    t.push(`<p class="meta">Plan: ${datum(el.start)} – ${datum(el.ende, true)} ${chip(st)}</p>`);
    t.push(`<div class="eigen-bearbeiten">
      <label>Fortschritt <select id="eigen-pct">${[0, 25, 50, 75, 100].map((p) => `<option value="${p}" ${p === (el.pct || 0) ? "selected" : ""}>${p} %</option>`).join("")}</select></label>
      <label>Start <input type="date" id="eigen-start" value="${el.start}" min="${P.start}" max="${P.ende}"></label>
      <label>Ende <input type="date" id="eigen-ende" value="${el.ende}" min="${P.start}" max="${P.ende}"></label>
      <button type="button" class="knopf gefahr" id="eigen-loeschen">Arbeitspaket löschen</button>
    </div>`);
  } else {
    const st = status(el);
    const n = erledigteAufgaben(el);
    t.push(`<div class="detail-kopf"><span class="punkt"></span>${esc(ueber)}</div><div class="detail-inhalt">`);
    t.push(`<div class="linienkopf"><span class="linienpunkt" style="background:${tp.farbe}"></span>Teilprojekt ${esc(tp.nr)} · ${esc(tp.name)}</div>`);
    t.push(`<h2>${esc(el.nr)} ${esc(el.name)}${el.kurz ? ` <span class="kurz">· ${esc(el.kurz)}</span>` : ""}</h2>`);
    t.push(`<p class="meta">Plan: ${datum(el.start)} – ${datum(el.ende, true)} ${chip(st)}</p>`);
    t.push(`<p>${esc(el.text)}</p>`);
    if (istOptional(el)) {
      t.push(`<p class="optional-hinweis"><b>Optional:</b> Dieses Arbeitspaket ist ein freiwilliges Angebot. Nutze es, wenn du den Baustein für dein Projekt brauchst. Es zählt nicht für Projektampel, Stufen und Aufgabenzähler.</p>`);
    }
    if (el.auftrag) {
      t.push(`<blockquote class="auftrag"><div class="auftrag-kopf">Auftrag der Stadtwerke Musterstadt</div>${el.auftrag.text ? `<p>${esc(el.auftrag.text)}</p>` : ""}${el.auftrag.punkte ? `<ul>${el.auftrag.punkte.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</blockquote>`);
    }
    if (el.abgabe) {
      t.push(`<p class="material"><b>Abgabe:</b> ${esc(el.abgabe)}</p>`);
    }
    if (el.material) {
      t.push(`<p class="material"><b>Material:</b> ${esc(el.material)}</p>`);
    }
    if (el.praxis) {
      t.push(`<div class="praxis"><div class="praxis-kopf">Wie ist das in der Praxis?</div><p>${esc(el.praxis.text)}</p>${el.praxis.frage ? `<p class="praxis-frage"><b>Denk mal nach:</b> ${esc(el.praxis.frage)}</p>` : ""}</div>`);
    }
    t.push(`<p class="fortschritt"><b>${n} von ${el.aufgaben.length}</b> Aufgaben erledigt</p>`);
    const h = haken[el.id] || {};
    t.push(`<ul class="checkliste">${el.aufgaben.map((a) => `<li class="${h[a.id] ? "hat" : ""}"><label><input type="checkbox" class="aufgabe" data-id="${a.id}" ${h[a.id] ? "checked" : ""} ${speicherOk ? "" : "disabled"}><span>${esc(a.name)}${a.hinweis ? `<small>${esc(a.hinweis)}</small>` : ""}</span></label></li>`).join("")}</ul>`);
    t.push(verweise(el));
  }
  t.push(`</div>`);
  box.innerHTML = t.join("");

  box.querySelectorAll("button.link[data-id]").forEach((b) => b.addEventListener("click", () => waehle(b.dataset.id)));
  box.querySelectorAll("input.aufgabe").forEach((cb) => {
    cb.addEventListener("change", () => {
      haken[el.id] = haken[el.id] || {};
      haken[el.id][cb.dataset.id] = cb.checked;
      schreib(K_HAKEN, haken);
      gewaehlt = el.id;
      zeichneAlles();
    });
  });
  if (istEigen(el)) {
    const speichere = () => {
      const s = $("#eigen-start").value;
      const e = $("#eigen-ende").value;
      el.pct = Number($("#eigen-pct").value);
      if (s && e && s <= e) {
        el.start = s;
        el.ende = e;
      }
      schreib(K_EIGENE, eigene);
      zeichneAlles();
    };
    ["#eigen-pct", "#eigen-start", "#eigen-ende"].forEach((s) => $(s).addEventListener("change", speichere));
    $("#eigen-loeschen").addEventListener("click", () => {
      eigene = eigene.filter((x) => x !== el);
      schreib(K_EIGENE, eigene);
      gewaehlt = null;
      zeichneAlles();
    });
  }
}

// ---------------------------------------------------------------------
// Seitenleiste: Büroausweis, Projektampel, Mein Projektplan
// ---------------------------------------------------------------------
function stufeErreicht(s) {
  return s.pakete.every((id) => anteil(element(id)) >= 1);
}
function zeichneAusweis() {
  let rang = "Praktikum";
  let naechste = P.stufen[0];
  let anzahl = 0;
  P.stufen.forEach((s, i) => {
    if (stufeErreicht(s)) {
      rang = s.rang;
      naechste = P.stufen.slice(i + 1).find((x) => !stufeErreicht(x)) || null;
      anzahl++;
    }
  });
  $("#ausweis-name").textContent = ($("#name").value || "").trim() || "Dein Name";
  $("#ausweis-rang").textContent = rang;
  $("#ausweis-naechste").textContent = naechste ? "Nächste Stufe: " + naechste.rang : "Alle Stufen erreicht";
  $("#ausweis-balken").style.width = Math.round((anzahl / P.stufen.length) * 100) + "%";
  // neue Stufe melden
  const alt = lies(K_STUFE);
  if (typeof alt === "number" && anzahl > alt) {
    toast("Neue Stufe im Büro: „" + rang + "“");
  }
  schreib(K_STUFE, anzahl);
}
function zeichneAmpel() {
  const laufend = alleAPs().filter((a) => tag(a.start) <= heute());
  const rot = laufend.filter((a) => status(a).id === "rot");
  const gelb = laufend.filter((a) => status(a).id === "gelb");
  const msRot = P.meilensteine.filter((m) => msStatus(m).id === "rot");
  let farbe = "gruen";
  let text = "Im Plan. Weiter so!";
  if (!laufend.length) {
    text = "Das Projekt hat noch nicht begonnen.";
  }
  if (gelb.length) {
    farbe = "gelb";
    text = "Leicht verzögert. Plane die nächsten Stunden gezielt.";
  }
  if (rot.length || msRot.length) {
    farbe = "rot";
    text = "Kritisch: Termine sind überschritten. Sprich mit deiner Lehrkraft und kürze notfalls auf das Muss.";
  }
  $("#ampel").className = "ampel " + farbe;
  $("#ampel-text").textContent = text;
  const liste = rot.map((a) => ({ a, k: "rot", t: "überfällig" })).concat(gelb.map((a) => ({ a, k: "gelb", t: "verzögert" })));
  $("#ampel-liste").innerHTML = liste.length
    ? liste.map((x) => `<li><i class="status-punkt ${x.k}"></i><button type="button" class="link" data-id="${x.a.id}">${esc(x.a.nr || "eigen")} ${esc(x.a.name)}</button><span>${x.t}</span></li>`).join("")
    : "";
  document.querySelectorAll("#ampel-liste [data-id]").forEach((b) => b.addEventListener("click", () => waehle(b.dataset.id)));
}
function zeichneEigene() {
  $("#eigene-liste").innerHTML = eigene.length
    ? eigene
        .slice()
        .sort((a, b) => tag(a.start) - tag(b.start))
        .map((e) => `<li><button type="button" class="link" data-id="${e.id}">${esc(e.name)}</button><span>${datum(e.start)}–${datum(e.ende)} · ${e.pct || 0} %</span></li>`)
        .join("")
    : `<li class="leer">Noch keine eigenen Arbeitspakete.</li>`;
  document.querySelectorAll("#eigene-liste [data-id]").forEach((b) => b.addEventListener("click", () => waehle(b.dataset.id)));
}
function zeichneZaehler() {
  const pflicht = P.pakete.filter((p) => !istOptional(p));
  const alle = pflicht.reduce((s, p) => s + p.aufgaben.length, 0);
  const fertig = pflicht.reduce((s, p) => s + erledigteAufgaben(p), 0);
  const ms = P.meilensteine.filter((m) => m.braucht);
  const msFertig = ms.filter(erreicht).length;
  $("#zaehler").innerHTML =
    `<span class="zahlfeld"><b>${fertig}</b>/${alle}<small>Aufgaben</small></span>` +
    `<span class="zahlfeld"><b>${msFertig}</b>/${ms.length}<small>Meilensteine</small></span>`;
}
function toast(html) {
  const t = $("#toast");
  t.textContent = html;
  t.classList.add("zeigen");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("zeigen"), 5000);
}

// ---------------------------------------------------------------------
// Sicherung als CSV (Semikolon, UTF-8 mit BOM, öffnet sich in Excel)
// ---------------------------------------------------------------------
const CSV_KOPF = ["Typ", "Nr", "Name", "Start", "Ende", "Fortschritt_Prozent", "Paket", "Aufgabe"];
function csvFeld(v) {
  const t = v === undefined || v === null ? "" : String(v);
  return /[;"\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}
function csvExport() {
  const zeilen = [CSV_KOPF];
  zeilen.push(["Name", "", ($("#name").value || "").trim(), "", "", "", "", ""]);
  eigene
    .slice()
    .sort((a, b) => tag(a.start) - tag(b.start))
    .forEach((e, i) => zeilen.push(["Arbeitspaket", "3." + (i + 1) + "*", e.name, e.start, e.ende, e.pct || 0, "", ""]));
  P.pakete.forEach((ap) => {
    const h = haken[ap.id] || {};
    ap.aufgaben.forEach((au) => {
      if (h[au.id]) {
        zeilen.push(["Aufgabe", ap.nr, au.name, "", "", 100, ap.id, au.id]);
      }
    });
  });
  const text = "﻿" + zeilen.map((z) => z.map(csvFeld).join(";")).join("\r\n") + "\r\n";
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const name = (($("#name").value || "").trim().replace(/[^A-Za-z0-9ÄÖÜäöüß_-]+/g, "-") || "projektplan").slice(0, 40);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `projektplan-mct-${name}-${isoAus(heute())}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
  toast("Projektplan als CSV gespeichert.");
}
// CSV zerlegen: Trennzeichen ; oder , und Anführungszeichen
function csvLesen(text) {
  text = text.replace(/^﻿/, "");
  const erste = text.split(/\r?\n/)[0] || "";
  const trenner = (erste.match(/;/g) || []).length >= (erste.match(/,/g) || []).length ? ";" : ",";
  const zeilen = [];
  let feld = "";
  let zeile = [];
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        feld += '"';
        i++;
      } else if (c === '"') {
        inQ = false;
      } else {
        feld += c;
      }
    } else if (c === '"') {
      inQ = true;
    } else if (c === trenner) {
      zeile.push(feld);
      feld = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") {
        i++;
      }
      zeile.push(feld);
      zeilen.push(zeile);
      zeile = [];
      feld = "";
    } else {
      feld += c;
    }
  }
  if (feld || zeile.length) {
    zeile.push(feld);
    zeilen.push(zeile);
  }
  return zeilen.filter((z) => z.some((f) => f.trim() !== ""));
}
// Datum aus JJJJ-MM-TT oder TT.MM.JJJJ (so speichert Excel gern um)
function datumLesen(t) {
  t = (t || "").trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }
  m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (m) {
    const j = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${j}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}
function csvImport(datei) {
  const leser = new FileReader();
  leser.onload = () => {
    const zeilen = csvLesen(String(leser.result));
    const kopf = (zeilen.shift() || []).map((k) => k.trim().toLowerCase());
    const spalte = (n) => kopf.indexOf(n.toLowerCase());
    const iTyp = spalte("Typ");
    if (iTyp < 0) {
      toast("Das ist keine Sicherung dieser Seite (Spalte „Typ“ fehlt).");
      return;
    }
    const iName = spalte("Name");
    const iStart = spalte("Start");
    const iEnde = spalte("Ende");
    const iPct = spalte("Fortschritt_Prozent");
    const iPaket = spalte("Paket");
    const iAufgabe = spalte("Aufgabe");
    const neueEigene = [];
    const neueHaken = {};
    let name = null;
    let fehler = 0;
    zeilen.forEach((z, n) => {
      const typ = (z[iTyp] || "").trim().toLowerCase();
      if (typ === "name") {
        name = (z[iName] || "").trim().slice(0, 32);
      } else if (typ === "arbeitspaket") {
        const s = datumLesen(z[iStart]);
        const e = datumLesen(z[iEnde]);
        const titel = (z[iName] || "").trim().slice(0, 60);
        if (!titel || !s || !e || s > e) {
          fehler++;
          return;
        }
        let pct = Math.round(Number(String(z[iPct] || "0").replace(",", ".").replace("%", "")) / 25) * 25;
        pct = Math.min(100, Math.max(0, isNaN(pct) ? 0 : pct));
        neueEigene.push({ id: "e" + Date.now() + "-" + n, name: titel, start: s, ende: e, pct, tp: "tp3", eigen: true });
      } else if (typ === "aufgabe") {
        const pid = (z[iPaket] || "").trim();
        const aid = (z[iAufgabe] || "").trim();
        const ap = P.pakete.find((x) => x.id === pid);
        if (ap && ap.aufgaben.some((x) => x.id === aid)) {
          neueHaken[pid] = neueHaken[pid] || {};
          neueHaken[pid][aid] = true;
        } else {
          fehler++;
        }
      }
    });
    const anzHaken = Object.values(neueHaken).reduce((s, o) => s + Object.keys(o).length, 0);
    if (!neueEigene.length && !anzHaken && name === null) {
      toast("In der Datei wurde nichts zum Importieren gefunden.");
      return;
    }
    const frage = `Sicherung einlesen?\n\n${neueEigene.length} eigene Arbeitspakete und ${anzHaken} abgehakte Aufgaben ersetzen den aktuellen Stand in diesem Browser.` + (fehler ? `\n${fehler} Zeilen sind unvollständig und werden übersprungen.` : "");
    if (!window.confirm(frage)) {
      return;
    }
    eigene = neueEigene;
    haken = neueHaken;
    schreib(K_EIGENE, eigene);
    schreib(K_HAKEN, haken);
    if (name !== null) {
      $("#name").value = name;
      schreib(K_NAME, name);
    }
    gewaehlt = null;
    zeichneAlles();
    toast(`Importiert: ${neueEigene.length} Arbeitspakete, ${anzHaken} Haken.`);
  };
  leser.onerror = () => toast("Die Datei konnte nicht gelesen werden.");
  leser.readAsText(datei, "utf-8");
}

// ---------------------------------------------------------------------
// Ablauf
// ---------------------------------------------------------------------
function zeichneAlles() {
  if (ansicht === "gantt") {
    zeichneGantt();
  } else {
    zeichnePSP();
  }
  $("#gantt").hidden = ansicht !== "gantt";
  $("#legende-gantt").hidden = ansicht !== "gantt";
  $("#psp").hidden = ansicht !== "psp";
  document.querySelectorAll(".reiter button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ansicht === ansicht ? "true" : "false"));
  zeichneDetail();
  zeichneAusweis();
  zeichneAmpel();
  zeichneEigene();
  zeichneZaehler();
}
function laden() {
  speicherOk = pruefeSpeicher();
  haken = lies(K_HAKEN) || {};
  eigene = (lies(K_EIGENE) || []).filter((e) => e && e.start && e.ende).map((e) => ({ ...e, tp: "tp3", eigen: true }));
  $("#hinweis-speicher").hidden = speicherOk;
}
function start() {
  document.title = P.titel + " · Jakob-Preh-Schule";
  $("#titel").textContent = P.titel;
  $("#untertitel").textContent = P.untertitel;
  $("#einleitung").textContent = P.einleitung;
  $("#legende-tp").innerHTML = P.teilprojekte.map((tp) => `<li><span class="strich" style="background:${tp.farbe}"></span><b>${esc(tp.nr)} ${esc(tp.name)}</b> <small>${esc(tp.info)}</small></li>`).join("");
  ansicht = lies(K_ANSICHT) === "psp" ? "psp" : "gantt";
  laden();
  const name = lies(K_NAME);
  if (typeof name === "string") {
    $("#name").value = name;
  }
  $("#name").addEventListener("input", () => {
    schreib(K_NAME, $("#name").value.slice(0, 32));
    zeichneAusweis();
  });
  document.querySelectorAll(".reiter button").forEach((b) =>
    b.addEventListener("click", () => {
      ansicht = b.dataset.ansicht;
      schreib(K_ANSICHT, ansicht);
      zeichneAlles();
    })
  );
  // eigenes Arbeitspaket anlegen
  const f = $("#eigen-form");
  f.start.min = f.ende.min = P.start;
  f.start.max = f.ende.max = P.ende;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = f.name.value.trim();
    const s = f.start.value;
    const en = f.ende.value;
    if (!name || !s || !en || s > en) {
      toast("Bitte Name, Start und Ende angeben (Ende nicht vor dem Start).");
      return;
    }
    const neu = { id: "e" + Date.now(), name: name.slice(0, 60), start: s, ende: en, pct: 0, tp: "tp3", eigen: true };
    eigene.push(neu);
    schreib(K_EIGENE, eigene.map(({ id, name, start, ende, pct }) => ({ id, name, start, ende, pct })));
    f.reset();
    gewaehlt = neu.id;
    zeichneAlles();
  });
  $("#csv-export").addEventListener("click", csvExport);
  $("#csv-import-knopf").addEventListener("click", () => $("#csv-import").click());
  $("#csv-import").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      csvImport(f);
    }
    e.target.value = "";
  });
  $("#neu-laden").addEventListener("click", () => {
    laden();
    zeichneAlles();
    toast("Fortschritt neu eingelesen.");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && gewaehlt) {
      gewaehlt = null;
      zeichneAlles();
    }
  });
  window.addEventListener("storage", () => {
    laden();
    zeichneAlles();
  });
  zeichneAlles();
}
// eigene Pakete ohne Hilfsfelder speichern
const _schreib = schreib;
schreib = function (k, w) {
  if (k === K_EIGENE) {
    w = w.map(({ id, name, start, ende, pct }) => ({ id, name, start, ende, pct }));
  }
  _schreib(k, w);
};

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", start);
}
