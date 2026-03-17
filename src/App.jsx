import { useState } from "react";

const POIDS_LIST = [30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];

const RASS_DATA = [
  { score: "+4", label: "Combatif",            desc: "Danger immédiat envers l'équipe",                              color: "#7f1d1d", bg: "#fef2f2" },
  { score: "+3", label: "Très agité",           desc: "Tire, arrache tuyaux/cathéters, agressif",                    color: "#991b1b", bg: "#fee2e2" },
  { score: "+2", label: "Agité",                desc: "Mouvements fréquents sans but, désadaptation",               color: "#c2410c", bg: "#fff7ed" },
  { score: "+1", label: "Ne tient pas en place",desc: "Anxieux, mouvements orientés, non vigoureux",                color: "#b45309", bg: "#fffbeb" },
  { score: "0",  label: "Éveillé et calme",     desc: "Yeux ouverts, répond aux ordres simples",                    color: "#166534", bg: "#f0fdf4" },
  { score: "-1", label: "Somnolent",            desc: "Contact visuel à l'appel > 10 sec",                          color: "#1e40af", bg: "#eff6ff" },
  { score: "-2", label: "Diminution légère",    desc: "Contact visuel à l'appel < 10 sec",                         color: "#1d4ed8", bg: "#dbeafe" },
  { score: "-3", label: "Diminution modérée",   desc: "Ouverture des yeux à l'appel, pas de contact visuel",       color: "#1e3a8a", bg: "#bfdbfe" },
  { score: "-4", label: "Diminution profonde",  desc: "Mouvement à la stimulation physique seulement",             color: "#312e81", bg: "#e0e7ff" },
  { score: "-5", label: "Non réveillable",      desc: "Aucun mouvement ni à l'appel ni à la stimulation physique", color: "#1f2937", bg: "#f3f4f6" },
];

const cardBase = { borderRadius: 16, padding: "14px 16px", marginBottom: 12, border: "1.5px solid" };

// ─── Helpers ───────────────────────────────────────────────
function round10(v) { return Math.round(v / 10) * 10; }
function capR(v, max) { return Math.min(Math.round(v * 10) / 10, max); }

// ─── Dose calculators ──────────────────────────────────────
function dosesIntube(w, tas) {
  if (tas === "p1") return {
    fChargeLo: capR(w * 1, 100), fChargeHi: capR(w * 2, 100),
    mChargeLo: capR(w * 0.05, 5), mChargeHi: capR(w * 0.1, 5),
    fSuppLo: capR(w * 0.5, 50), fSuppHi: capR(w * 1, 50),
    mSuppLo: capR(w * 0.025, 2.5), mSuppHi: capR(w * 0.05, 2.5),
    midaCharge: true, midaSupp: true,
  };
  if (tas === "p2") return {
    fChargeLo: capR(w * 0.5, 50), fChargeHi: capR(w * 1, 50),
    mChargeLo: capR(w * 0.025, 2.5), mChargeHi: capR(w * 0.05, 2.5),
    fSuppLo: capR(w * 0.25, 25), fSuppHi: capR(w * 0.5, 25),
    midaCharge: true, midaSupp: false,
  };
  return {
    fChargeLo: capR(w * 0.5, 50), fChargeHi: capR(w * 1, 50),
    fSuppLo: capR(w * 0.25, 25), fSuppHi: capR(w * 0.5, 25),
    midaCharge: false, midaSupp: false,
  };
}

function dosesCardio(w, tas) {
  const fCharge = Math.min(round10(w * 2), 100);
  const mCharge = capR(w * 0.05, 2.5);
  const fSuppl  = Math.min(round10(w * 1), 50);
  return { fCharge, mCharge, fSuppl, midaOK: tas === "p1" };
}

function dosesPace(w, tas) {
  const fCharge = Math.min(round10(w * 1), 50);
  const mSuppl  = capR(w * 0.05, 2.5);
  const fSuppl  = Math.min(round10(w * 0.5), 25);
  return { fCharge, mSuppl, fSuppl, midaSupp: tas === "p1" };
}

// ─── Sub-components ────────────────────────────────────────
function Header({ title, subtitle, target, onBack }) {
  return (
    <div style={{ background: "#1a1f36", borderRadius: 16, padding: "16px 18px", marginBottom: 14, color: "white", position: "relative" }}>
      {onBack && (
        <button onClick={onBack} style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8,
          color: "white", fontSize: 12, fontWeight: 700, padding: "4px 10px", cursor: "pointer"
        }}>← Menu</button>
      )}
      <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#9fa8c7", textTransform: "uppercase", marginBottom: 4 }}>SA24 · Procédure SMD</div>
      <div style={{ fontSize: 20, fontWeight: 700, paddingRight: onBack ? 70 : 0 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#9fa8c7", marginTop: 4 }}>{subtitle}</div>
      {target && (
        <div style={{ marginTop: 8, background: "rgba(240,180,41,0.15)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#f0b429", fontWeight: 600 }}>
          Objectif RASS : {target}
        </div>
      )}
    </div>
  );
}

function Tabs({ tab, setTab }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      {[["doses","Dosages"],["rass","Echelle RASS"]].map(([key, label]) => (
        <button key={key} onClick={() => setTab(key)} style={{
          flex: 1, padding: "10px 0", borderRadius: 12, border: "2px solid",
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          background: tab === key ? "#1a1f36" : "white",
          color: tab === key ? "white" : "#1a1f36",
          borderColor: tab === key ? "#1a1f36" : "#dde1ea"
        }}>{label}</button>
      ))}
    </div>
  );
}

function PoidsSelector({ poids, setPoids, onSelect }) {
  return (
    <div style={{ ...cardBase, background: "white", borderColor: "#e2e8f0" }}>
      <div style={{ fontWeight: 700, marginBottom: 10, color: "#1a1f36" }}>Poids du patient (kg)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {POIDS_LIST.map(p => (
          <button key={p} onClick={() => { setPoids(p); if (onSelect) onSelect(); }} style={{
            borderRadius: 10, padding: "6px 10px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", minWidth: 46, border: "2px solid",
            background: poids === p ? "#1a1f36" : "#f5f6fa",
            color: poids === p ? "white" : "#444",
            borderColor: poids === p ? "#1a1f36" : "#dde1ea"
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}

function TasSelector({ tas, setTas, options }) {
  return (
    <div style={{ ...cardBase, background: "white", borderColor: "#e2e8f0" }}>
      <div style={{ fontWeight: 700, marginBottom: 10, color: "#1a1f36" }}>Tension artérielle systolique</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(([val, label, ac, bg, bd]) => (
          <button key={val} onClick={() => setTas(val)} style={{
            padding: "11px 14px", borderRadius: 12, border: "2px solid " + bd,
            fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left",
            background: tas === val ? ac : bg,
            color: tas === val ? "white" : ac
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function DoseRow({ label, value, sub, accent }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "10px 14px", marginBottom: 8, borderLeft: "4px solid " + (accent || "#4299e1") }}>
      <div style={{ fontWeight: 700, color: accent || "#2b6cb0", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#1a365d" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#718096" }}>{sub}</div>
    </div>
  );
}

function AlertBox({ color, bg, border, children }) {
  return (
    <div style={{ ...cardBase, background: bg, borderColor: border || color }}>
      {children}
    </div>
  );
}

function RassScale({ target }) {
  return (
    <div>
      {RASS_DATA.map(r => {
        const isTarget = target.includes(r.score);
        return (
          <div key={r.score} style={{
            ...cardBase, background: r.bg,
            borderColor: isTarget ? r.color : "#e2e8f0",
            borderWidth: isTarget ? 2.5 : 1.5,
            position: "relative"
          }}>
            {isTarget && (
              <div style={{ position: "absolute", top: 10, right: 12, background: "#f0b429", color: "#7b5e00", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 7px" }}>
                CIBLE
              </div>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                minWidth: 44, height: 44, borderRadius: 10, background: r.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18, color: "white", flexShrink: 0
              }}>{r.score}</div>
              <div>
                <div style={{ fontWeight: 700, color: r.color, fontSize: 14 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>{r.desc}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Screen: Patient intubé ────────────────────────────────
function Intube({ onBack }) {
  const [poids, setPoids] = useState(null);
  const [tas, setTas] = useState(null);
  const [tab, setTab] = useState("doses");
  const d = poids && tas ? dosesIntube(poids, tas) : null;

  return (
    <div>
      <Header title="Maintien patient intubé" subtitle="Fentanyl + Midazolam IV" target="-4 (si possible)" onBack={onBack} />
      <Tabs tab={tab} setTab={setTab} />

      {tab === "doses" && (
        <>
          <AlertBox bg="#fff8e1" color="#b7791f" border="#f0b429">
            <div style={{ fontWeight: 700, color: "#b7791f", marginBottom: 4 }}>Précautions</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#7b5e1a", fontSize: 13 }}>
              <li>TA avant et après chaque dose</li>
              <li>Privilégier maintien hémodynamique sur profondeur de sédation</li>
              <li>Surdose: SA11 Intoxication/Surdose</li>
            </ul>
          </AlertBox>

          <PoidsSelector poids={poids} setPoids={setPoids} onSelect={() => setTas(null)} />

          {poids && (
            <TasSelector tas={tas} setTas={setTas} options={[
              ["p1","TAS > 90 mmHg","#22543d","#f0fff4","#68d391"],
              ["p2","TAS ≤ 90 mmHg","#744210","#fffbeb","#f6ad55"],
              ["p3","TAS ≤ 80 mmHg","#9b2c2c","#fff5f5","#fc8181"],
            ]} />
          )}

          {d && (
            <>
              <div style={{ ...cardBase, background: "#f0fff4", borderColor: "#68d391" }}>
                <div style={{ fontWeight: 700, color: "#22543d", marginBottom: 10, fontSize: 15 }}>Dose de charge — IV</div>
                <DoseRow
                  label="Fentanyl IV"
                  value={d.fChargeLo + "-" + d.fChargeHi + " mcg"}
                  sub={(tas === "p1" ? "1-2 mcg/kg" : "0,5-1 mcg/kg") + " · max " + (tas === "p1" ? "100" : "50") + " mcg · " + poids + " kg"}
                  accent="#2b6cb0"
                />
                {d.midaCharge ? (
                  <DoseRow
                    label="Midazolam IV"
                    value={d.mChargeLo + "-" + d.mChargeHi + " mg"}
                    sub={(tas === "p1" ? "0,05-0,1 mg/kg" : "0,025-0,05 mg/kg") + " · max " + (tas === "p1" ? "5" : "2,5") + " mg · " + poids + " kg"}
                    accent="#6b46c1"
                  />
                ) : (
                  <div style={{ background: "#fff5f5", borderRadius: 12, padding: "10px 14px", borderLeft: "4px solid #fc8181", fontSize: 13, color: "#9b2c2c", fontWeight: 600 }}>
                    Midazolam non indiqué si TAS &lt;= 80 mmHg
                  </div>
                )}
              </div>

              <div style={{ ...cardBase, background: "#ebf8ff", borderColor: "#63b3ed" }}>
                <div style={{ fontWeight: 700, color: "#2c5282", marginBottom: 10, fontSize: 15 }}>Doses supplémentaires — q 3-5 min IV</div>
                <DoseRow
                  label="Fentanyl IV"
                  value={d.fSuppLo + "-" + d.fSuppHi + " mcg"}
                  sub={(tas === "p1" ? "0,5-1 mcg/kg" : "0,25-0,5 mcg/kg") + " · max " + (tas === "p1" ? "50" : "25") + " mcg · " + poids + " kg"}
                  accent="#2b6cb0"
                />
                {d.midaSupp ? (
                  <DoseRow
                    label="Midazolam IV (ou fentanyl)"
                    value={d.mSuppLo + "-" + d.mSuppHi + " mg"}
                    sub={"0,025-0,05 mg/kg · max 2,5 mg · " + poids + " kg"}
                    accent="#6b46c1"
                  />
                ) : (
                  <div style={{ background: "#fff5f5", borderRadius: 12, padding: "10px 14px", borderLeft: "4px solid #fc8181", fontSize: 13, color: "#9b2c2c", fontWeight: 600 }}>
                    Doses supplémentaires : fentanyl uniquement
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      {tab === "rass" && <RassScale target={["-4"]} />}
    </div>
  );
}

// ─── Screen: Cardioversion ─────────────────────────────────
function Cardio({ onBack }) {
  const [poids, setPoids] = useState(null);
  const [tas, setTas] = useState(null);
  const [tab, setTab] = useState("doses");
  const d = poids && tas ? dosesCardio(poids, tas) : null;

  return (
    <div>
      <Header title="Sédation — Cardioversion électrique" subtitle="Fentanyl ± Midazolam IV · Patient A ou V sur AVPU" target="-2 à -3" onBack={onBack} />
      <Tabs tab={tab} setTab={setTab} />

      {tab === "doses" && (
        <>
          <AlertBox bg="#fff8e1" color="#b7791f" border="#f0b429">
            <div style={{ fontWeight: 700, color: "#b7791f", marginBottom: 4 }}>Précautions</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#7b5e1a", fontSize: 13 }}>
              <li>TA avant et après chaque administration</li>
              <li>Matériel de réanimation prêt au chevet</li>
              <li>Évaluer nécessité de renverser sédation si apnée</li>
            </ul>
          </AlertBox>

          <PoidsSelector poids={poids} setPoids={setPoids} onSelect={() => setTas(null)} />

          {poids && (
            <TasSelector tas={tas} setTas={setTas} options={[
              ["p1","TAS > 90 mmHg","#22543d","#f0fff4","#68d391"],
              ["p2","TAS ≤ 90 mmHg","#9b2c2c","#fff5f5","#fc8181"],
            ]} />
          )}

          {d && tas === "p1" && (
            <>
              <div style={{ ...cardBase, background: "#f0fff4", borderColor: "#68d391" }}>
                <div style={{ fontWeight: 700, color: "#22543d", marginBottom: 10, fontSize: 15 }}>Dose de charge</div>
                <DoseRow label="Fentanyl IV" value={d.fCharge + " mcg"} sub={"2 mcg/kg · max 100 mcg · " + poids + " kg"} accent="#2b6cb0" />
                <DoseRow label="Midazolam IV" value={d.mCharge + " mg"} sub={"0,05 mg/kg · max 2,5 mg · " + poids + " kg"} accent="#6b46c1" />
              </div>
              <div style={{ ...cardBase, background: "#ebf8ff", borderColor: "#63b3ed" }}>
                <div style={{ fontWeight: 700, color: "#2c5282", marginBottom: 10, fontSize: 15 }}>Doses supplémentaires — q 1-2 min</div>
                <DoseRow label="Fentanyl IV" value={d.fSuppl + " mcg"} sub={"1 mcg/kg · max 50 mcg · " + poids + " kg"} accent="#2b6cb0" />
                <div style={{ fontSize: 12, color: "#4a5568", fontStyle: "italic" }}>Midazolam non répété (dose unique de charge)</div>
              </div>
            </>
          )}

          {d && tas === "p2" && (
            <div style={{ ...cardBase, background: "#fff5f5", borderColor: "#fc8181" }}>
              <div style={{ fontWeight: 700, color: "#9b2c2c", marginBottom: 4, fontSize: 15 }}>TAS ≤ 90 — Fentanyl seulement</div>
              <div style={{ fontSize: 12, color: "#c53030", marginBottom: 10 }}>Midazolam contre-indiqué</div>
              <DoseRow label="Fentanyl IV — Dose de charge" value={d.fCharge + " mcg"} sub={"2 mcg/kg · max 100 mcg · " + poids + " kg"} accent="#2b6cb0" />
              <DoseRow label="Fentanyl IV — Doses suppl. (q 1-2 min)" value={d.fSuppl + " mcg"} sub={"1 mcg/kg · max 50 mcg · " + poids + " kg"} accent="#2b6cb0" />
            </div>
          )}
        </>
      )}
      {tab === "rass" && <RassScale target={["-2","-3"]} />}
    </div>
  );
}

// ─── Screen: Pace externe ──────────────────────────────────
function Pace({ onBack }) {
  const [poids, setPoids] = useState(null);
  const [tas, setTas] = useState(null);
  const [tab, setTab] = useState("doses");
  const d = poids && tas ? dosesPace(poids, tas) : null;

  return (
    <div>
      <Header title="Sédation — Stimulation cardiaque externe" subtitle="Fentanyl ± Midazolam IV · Patient A ou V sur AVPU" target="-1 à -2" onBack={onBack} />
      <Tabs tab={tab} setTab={setTab} />

      {tab === "doses" && (
        <>
          <AlertBox bg="#fff8e1" color="#b7791f" border="#f0b429">
            <div style={{ fontWeight: 700, color: "#b7791f", marginBottom: 4 }}>Précautions</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#7b5e1a", fontSize: 13 }}>
              <li>TA avant et après chaque administration</li>
              <li>Matériel de réanimation prêt au chevet</li>
              <li>Évaluer nécessité de renverser sédation si apnée</li>
            </ul>
          </AlertBox>

          <PoidsSelector poids={poids} setPoids={setPoids} onSelect={() => setTas(null)} />

          {poids && (
            <TasSelector tas={tas} setTas={setTas} options={[
              ["p1","TAS > 90 mmHg","#22543d","#f0fff4","#68d391"],
              ["p2","TAS ≤ 90 mmHg","#9b2c2c","#fff5f5","#fc8181"],
            ]} />
          )}

          {d && (
            <>
              <div style={{ ...cardBase, background: "#f0fff4", borderColor: "#68d391" }}>
                <div style={{ fontWeight: 700, color: "#22543d", marginBottom: 10, fontSize: 15 }}>Dose de charge</div>
                <DoseRow label="Fentanyl IV" value={d.fCharge + " mcg"} sub={"1 mcg/kg · max 50 mcg · " + poids + " kg"} accent="#2b6cb0" />
              </div>
              <div style={{ ...cardBase, background: "#ebf8ff", borderColor: "#63b3ed" }}>
                <div style={{ fontWeight: 700, color: "#2c5282", marginBottom: 10, fontSize: 15 }}>Doses supplémentaires — q 3-5 min</div>
                <DoseRow label="Fentanyl IV" value={d.fSuppl + " mcg"} sub={"0,5 mcg/kg · max 25 mcg · " + poids + " kg"} accent="#2b6cb0" />
                {d.midaSupp ? (
                  <DoseRow label="Midazolam IV (ou fentanyl)" value={d.mSuppl + " mg"} sub={"0,05 mg/kg · max 2,5 mg · " + poids + " kg"} accent="#6b46c1" />
                ) : (
                  <div style={{ background: "#fff5f5", borderRadius: 12, padding: "10px 14px", borderLeft: "4px solid #fc8181", fontSize: 13, color: "#9b2c2c", fontWeight: 600 }}>
                    Doses supplémentaires : fentanyl uniquement (TAS &lt;= 90 mmHg)
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      {tab === "rass" && <RassScale target={["-1","-2"]} />}
    </div>
  );
}

// ─── Main menu ─────────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: "intube",
    emoji: "🫁",
    title: "Maintien patient intubé",
    sub: "Fentanyl + Midazolam · RASS -4",
    color: "#1e3a8a", bg: "#dbeafe", border: "#3b82f6",
  },
  {
    id: "cardio",
    emoji: "⚡",
    title: "Cardioversion électrique",
    sub: "Fentanyl ± Midazolam · RASS -2 à -3",
    color: "#14532d", bg: "#dcfce7", border: "#22c55e",
  },
  {
    id: "pace",
    emoji: "💓",
    title: "Stimulation cardiaque externe",
    sub: "Fentanyl ± Midazolam · RASS -1 à -2",
    color: "#7c2d12", bg: "#ffedd5", border: "#f97316",
  },
];

export default function SA24App() {
  const [screen, setScreen] = useState("menu");

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto", padding: "16px 12px", background: "#f5f6fa", minHeight: "100vh" }}>

      {screen === "menu" && (
        <>
          <div style={{ background: "#1a1f36", borderRadius: 16, padding: "20px 18px", marginBottom: 20, color: "white" }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#9fa8c7", textTransform: "uppercase", marginBottom: 4 }}>PSA Québec 2024</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>SA24</div>
            <div style={{ fontSize: 14, color: "#9fa8c7", marginTop: 4 }}>Analgésie et sédation procédurale</div>
            <div style={{ marginTop: 10, background: "rgba(240,180,41,0.15)", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#f0b429", fontWeight: 600 }}>
              Ordonnance SMD requise
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MENU_ITEMS.map(item => (
              <button key={item.id} onClick={() => setScreen(item.id)} style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "white", border: "2px solid " + item.border,
                borderRadius: 16, padding: "16px 18px", cursor: "pointer", textAlign: "left",
                transition: "all .15s",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: item.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0,
                }}>{item.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, color: item.color, fontSize: 15 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", marginTop: 16, padding: "10px 8px", borderTop: "1px solid #e5e7eb", lineHeight: 1.5 }}>
            MSSS Québec · Protocoles PSA 2024 · SA24<br/>
            <span style={{ color: "#d1d5db" }}>
              Cet outil est fourni à titre de référence clinique uniquement. Il ne remplace pas le jugement clinique du professionnel de la santé ni les protocoles officiels en vigueur. L'utilisateur assume l'entière responsabilité de la validation des doses avant toute administration. L'auteur décline toute responsabilité en cas d'erreur ou d'utilisation inappropriée.
            </span>
          </div>
        </>
      )}

      {screen === "intube" && <Intube onBack={() => setScreen("menu")} />}
      {screen === "cardio" && <Cardio onBack={() => setScreen("menu")} />}
      {screen === "pace"   && <Pace   onBack={() => setScreen("menu")} />}
    </div>
  );
}
