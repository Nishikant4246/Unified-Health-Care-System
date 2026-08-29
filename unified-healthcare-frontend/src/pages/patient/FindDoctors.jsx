import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";
import { useLanguage } from "../../context/LanguageContext";

// ─── Leaflet from a reliable CDN ──────────────────────────────
const LEAFLET_CSS = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS  = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";

const injectLeafletCSS = () => {
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
};

const loadLeaflet = () =>
  new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    injectLeafletCSS();
    const existing = document.getElementById("leaflet-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", () => reject(new Error("leaflet failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.id = "leaflet-js";
    s.src = LEAFLET_JS;
    s.onload = () => resolve(window.L);
    s.onerror = () => reject(new Error("leaflet failed to load"));
    document.head.appendChild(s);
  });

// ─── Geo helpers ─────────────────────────────────────────────
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
};

const getDirectionsUrl = (lat, lng, name) => {
  if (lat == null || lng == null) return "https://www.google.com/maps";
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(
    name || "",
  )}`;
};

// Avoid "Dr. Dr. Name" when a doctor registered their name with a title already
const drName = (name = "") => {
  const n = name.trim();
  return /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`;
};

const uhcsCoords = (d) =>
  d?.location?.lat != null && d?.location?.lng != null ? [d.location.lat, d.location.lng] : null;

// ─── Specialization suggestions ──────────────────────────────
const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Orthopedic",
  "Gynecologist", "Pediatrician", "Neurologist", "Dentist",
  "Ophthalmologist", "ENT Specialist", "Psychiatrist", "Urologist",
  "Oncologist", "Endocrinologist", "Pulmonologist", "Gastroenterologist",
  "Emergency Medicine", "Internal Medicine",
];

const OSM_SEARCH_KEYWORDS = {
  dentist: ["dental", "dentist", "teeth", "orthodontic"],
  dermatologist: ["skin", "derma"],
  cardiologist: ["heart", "cardiac", "cardio"],
  orthopedic: ["ortho", "bone", "joint", "spine"],
  gynecologist: ["gynec", "maternity", "women", "obstet"],
  pediatrician: ["child", "pediatric", "kids"],
  neurologist: ["neuro", "brain"],
  ophthalmologist: ["eye", "vision", "optic"],
  ent: ["ent", "ear", "nose", "throat"],
};

const getOSMKeywords = (query) => {
  const q = query.toLowerCase();
  for (const [key, words] of Object.entries(OSM_SEARCH_KEYWORDS)) {
    if (q.includes(key) || words.some((w) => q.includes(w))) return words;
  }
  return [q];
};

// Overpass has flaky mirrors — try each in turn
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// ─── Search input + suggestion chips (hoisted so it keeps focus) ──
function SearchBox({ query, setQuery, placeholder, show, setShow, suggestions, boxRef }) {
  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <svg
          width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2}
          style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShow(true); }}
          onFocus={() => setShow(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setShow(false); }}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              background: "var(--border)", border: "none", color: "var(--text-secondary)",
              borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        )}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="mt-1 rounded-xl overflow-hidden absolute left-0 right-0 z-[500]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="p-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); setShow(false); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: query === s ? "#a855f7" : "rgba(168,85,247,0.1)",
                    color: query === s ? "#fff" : "#a855f7",
                    border: "1px solid rgba(168,85,247,0.3)",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── One clickable result (doctor or hospital) ───────────────
function ResultRow({ item, isActive, onOpen }) {
  const isUHCS = item.source === "uhcs";
  const accent = isUHCS ? "#a855f7" : "#3b82f6";
  return (
    <button
      onClick={() => onOpen(item)}
      className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all"
      style={{
        background: isActive ? `${accent}14` : "var(--bg-hover)",
        border: `1px solid ${isActive ? accent + "66" : "var(--border)"}`,
        cursor: "pointer",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: `${accent}22`, color: accent }}
      >
        {isUHCS ? item.name?.[0]?.toUpperCase() || "D" : "🏥"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
          {isUHCS ? drName(item.name) : item.name}
        </div>
        <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
          {isUHCS
            ? [item.specialization, item.hospital].filter(Boolean).join(" · ") || "General"
            : item.address || item.type}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {item.distance != null && (
          <span className="text-xs" style={{ color: "#10b981" }}>{item.distance} km</span>
        )}
        {isUHCS && item.available !== undefined && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: item.available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              color: item.available ? "#10b981" : "#ef4444",
            }}
          >
            {item.available ? "Available" : "Unavailable"}
          </span>
        )}
      </div>
    </button>
  );
}

export default function FindDoctors() {
  const { t } = useLanguage();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const searchRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [userLocation, setUserLocation] = useState(null);
  const [uhcsDoctors, setUhcsDoctors] = useState([]);
  const [realHospitals, setRealHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [osmStatus, setOsmStatus] = useState("idle"); // idle | loading | done | empty | failed
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapReady, setMapReady] = useState(0);

  // ─── Filtered lists (memoised so the map effect isn't thrashed) ──
  const filteredUHCS = useMemo(() => {
    if (!searchQuery) return uhcsDoctors;
    const q = searchQuery.toLowerCase();
    return uhcsDoctors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q),
    );
  }, [uhcsDoctors, searchQuery]);

  const filteredHospitals = useMemo(() => {
    if (!searchQuery) return realHospitals;
    const q = searchQuery.toLowerCase();
    const keywords = getOSMKeywords(q);
    return realHospitals.filter((h) => {
      const haystack = `${h.name} ${h.type} ${h.address}`.toLowerCase();
      return haystack.includes(q) || keywords.some((kw) => haystack.includes(kw));
    });
  }, [realHospitals, searchQuery]);

  const filteredSuggestions =
    searchQuery.length > 0
      ? SPECIALIZATIONS.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
      : SPECIALIZATIONS.slice(0, 8);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── GPS ───────────────────────────────────────────────────
  const getLocation = () => {
    setShowSuggestions(false);
    setStatus("locating");
    setErrorMsg("");
    setUhcsDoctors([]);
    setRealHospitals([]);
    setSelected(null);
    setOsmStatus("idle");

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchUHCSDoctors(loc);
      },
      (err) => {
        console.error("GPS error:", err);
        setErrorMsg("Location access denied. Please allow location permission and try again.");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  // ─── UHCS doctors ──────────────────────────────────────────
  const fetchUHCSDoctors = async (loc) => {
    setStatus("loading");
    try {
      const res = await api.get(`/patient/nearby-doctors?lat=${loc.lat}&lng=${loc.lng}&radius=75`);
      setUhcsDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("UHCS fetch error:", err);
      setUhcsDoctors([]);
    }
    setStatus("ready");
    fetchOSMHospitals(loc);
  };

  // ─── Real hospitals via Overpass (with mirror fallback) ─────
  const fetchOSMHospitals = async (loc) => {
    setOsmStatus("loading");
    const query = `[out:json][timeout:20];(
      node["amenity"~"hospital|clinic|doctors|dentist"](around:12000,${loc.lat},${loc.lng});
      node["healthcare"](around:12000,${loc.lat},${loc.lng});
    );out body 80;`;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 18000);
        const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        clearTimeout(to);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const list = (data.elements || [])
          .filter((el) => el.tags?.name && el.lat && el.lon)
          .map((el) => ({
            id: el.id,
            name: el.tags.name,
            type: el.tags.amenity || el.tags.healthcare || "hospital",
            lat: el.lat,
            lng: el.lon,
            address:
              [el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(", ") ||
              el.tags["addr:full"] ||
              "",
            phone: el.tags.phone || el.tags["contact:phone"] || "",
            source: "osm",
            distance: getDistance(loc.lat, loc.lng, el.lat, el.lon),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 50);

        setRealHospitals(list);
        setOsmStatus(list.length ? "done" : "empty");
        return;
      } catch (e) {
        console.warn("Overpass mirror failed:", endpoint, e.message);
      }
    }
    setOsmStatus("failed");
  };

  // ─── Create the map once we're "ready" ─────────────────────
  useEffect(() => {
    if (status !== "ready" || !userLocation || !mapRef.current) return;
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current) return;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        const map = L.map(mapRef.current, { zoomControl: true }).setView(
          [userLocation.lat, userLocation.lng],
          13,
        );
        // Free, key-less OpenStreetMap tiles. Dark mode is handled by a CSS
        // filter on .leaflet-tile-pane (see index.css) so no paid dark basemap.
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
        if (map.attributionControl) {
          map.attributionControl.setPrefix(
            '<span style="font-weight:700;color:#a855f7;">UHCS</span>',
          );
        }
        mapInstanceRef.current = map;
        markersRef.current = [];
        setMapReady((n) => n + 1);
      })
      .catch((e) => console.error("Map init failed:", e.message));

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [status, userLocation]);

  // ─── (Re)draw markers when data / filters change ───────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !userLocation) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const userIcon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#10b981;border-radius:50%;
              border:3px solid #fff;box-shadow:0 0 0 6px rgba(16,185,129,0.25);"></div>`,
      className: "",
      iconAnchor: [9, 9],
    });
    markersRef.current.push(
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div style="font-size:12px;font-weight:600;color:#1e2130;">📍 You are here</div>'),
    );

    filteredUHCS.forEach((doc) => {
      const c = uhcsCoords(doc);
      if (!c) return;
      const icon = L.divIcon({
        html: `<div style="width:38px;height:38px;background:#a855f7;border-radius:50%;
                border:3px solid #fff;display:flex;align-items:center;justify-content:center;
                font-size:15px;font-weight:700;color:#fff;cursor:pointer;
                box-shadow:0 4px 12px rgba(168,85,247,0.6);">${doc.name?.[0]?.toUpperCase() || "D"}</div>`,
        className: "",
        iconAnchor: [19, 19],
      });
      const m = L.marker(c, { icon }).addTo(map);
      m.on("click", () => setSelected({ ...doc, source: "uhcs" }));
      markersRef.current.push(m);
    });

    filteredHospitals.forEach((h) => {
      const icon = L.divIcon({
        html: `<div style="width:30px;height:30px;background:#3b82f6;border-radius:50%;
                border:3px solid #fff;display:flex;align-items:center;justify-content:center;
                font-size:13px;cursor:pointer;box-shadow:0 2px 8px rgba(59,130,246,0.5);">🏥</div>`,
        className: "",
        iconAnchor: [15, 15],
      });
      const m = L.marker([h.lat, h.lng], { icon }).addTo(map);
      m.on("click", () => setSelected(h));
      markersRef.current.push(m);
    });
  }, [mapReady, filteredUHCS, filteredHospitals, userLocation]);

  // Pan the map to a result when it's picked from a list
  const focusOnResult = (item) => {
    setSelected(item);
    const map = mapInstanceRef.current;
    const c = item.source === "uhcs" ? uhcsCoords(item) : [item.lat, item.lng];
    if (map && c && c[0] != null) map.flyTo(c, 15, { duration: 0.6 });
  };

  const resetAll = () => {
    setStatus("idle");
    setSelected(null);
    setSearchQuery("");
    setUhcsDoctors([]);
    setRealHospitals([]);
    setOsmStatus("idle");
  };

  const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border)" };
  const activeId = selected?._id || selected?.id;

  // ══════════════════════════════════════════════════════════
  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {t("findNearbyDoctors")}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          UHCS registered doctors and real hospitals near you
        </p>
      </div>

      {/* ── IDLE ── */}
      {status === "idle" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl" style={cardStyle}>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            How it works
          </h2>
          <div className="space-y-3 mb-6">
            {[
              { step: "1", title: "Share your location", desc: "Your browser will ask for GPS — tap Allow" },
              { step: "2", title: "We find nearby doctors", desc: "UHCS doctors plus real hospitals around you" },
              { step: "3", title: "Browse the map or the list", desc: "Purple = UHCS doctor · Blue = hospital / clinic" },
              { step: "4", title: "Open a result", desc: "See specialization, fee, availability and distance" },
              { step: "5", title: "Get directions", desc: "One tap opens Google Maps with the route" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
                >
                  {s.step}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.title}</div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-5 p-3 rounded-xl flex-wrap" style={{ background: "var(--bg-hover)" }}>
            {[
              { color: "#a855f7", label: "UHCS Doctor" },
              { color: "#3b82f6", label: "Hospital / Clinic" },
              { color: "#10b981", label: "Your Location" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{l.label}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <SearchBox
              query={searchQuery}
              setQuery={setSearchQuery}
              placeholder="Optional — filter by specialization or name"
              show={showSuggestions}
              setShow={setShowSuggestions}
              suggestions={filteredSuggestions}
              boxRef={searchRef}
            />
          </div>

          <button
            onClick={getLocation}
            className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: "#a855f7", color: "white", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#9333ea")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#a855f7")}
          >
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
            {searchQuery ? `Find "${searchQuery}" near me` : "Find doctors near me"}
          </button>
        </motion.div>
      )}

      {/* ── LOCATING / LOADING ── */}
      {(status === "locating" || status === "loading") && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl" style={cardStyle}
        >
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin mb-4"
            style={{ borderColor: "var(--border)", borderTopColor: "#a855f7" }}
          />
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {status === "locating" ? "Getting your location…" : "Finding nearby doctors…"}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {status === "locating" ? "Please allow location access" : "Searching around you"}
          </p>
        </motion.div>
      )}

      {/* ── ERROR ── */}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-6 rounded-2xl text-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold mb-1" style={{ color: "#f87171" }}>{errorMsg}</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#a855f7", color: "white", cursor: "pointer" }}
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* ── READY ── */}
      {status === "ready" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-3">
            <SearchBox
              query={searchQuery}
              setQuery={setSearchQuery}
              placeholder="Filter by specialization or name…"
              show={showSuggestions}
              setShow={setShowSuggestions}
              suggestions={filteredSuggestions}
              boxRef={searchRef}
            />
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
            >
              {filteredUHCS.length} UHCS doctor{filteredUHCS.length !== 1 ? "s" : ""}
              {searchQuery && uhcsDoctors.length !== filteredUHCS.length ? ` of ${uhcsDoctors.length}` : ""}
            </span>
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              {osmStatus === "loading"
                ? "Loading hospitals…"
                : osmStatus === "failed"
                ? "Hospitals unavailable"
                : `${filteredHospitals.length} hospital${filteredHospitals.length !== 1 ? "s" : ""}`}
            </span>
            <button
              onClick={resetAll}
              className="ml-auto text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden mb-4" style={{ height: "380px", border: "1px solid var(--border)" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          </div>

          {/* Selected result card */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                className="p-5 rounded-2xl mb-4"
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${selected.source === "uhcs" ? "rgba(168,85,247,0.4)" : "rgba(59,130,246,0.4)"}`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{
                      background: selected.source === "uhcs" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                      color: selected.source === "uhcs" ? "#a855f7" : "#3b82f6",
                    }}
                  >
                    {selected.source === "uhcs" ? selected.name?.[0]?.toUpperCase() : "🏥"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                        {selected.source === "uhcs" ? drName(selected.name) : selected.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: selected.source === "uhcs" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                          color: selected.source === "uhcs" ? "#a855f7" : "#3b82f6",
                        }}
                      >
                        {selected.source === "uhcs" ? "UHCS Registered" : "Real Hospital"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {selected.specialization && <div>🩺 {selected.specialization}</div>}
                      {selected.qualification && <div>🎓 {selected.qualification}</div>}
                      {selected.hospital && <div>🏥 {selected.hospital}</div>}
                      {selected.address && <div>📍 {selected.address}</div>}
                      {selected.phone && <div>📞 {selected.phone}</div>}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {selected.consultationFee > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                            ₹{selected.consultationFee} fee
                          </span>
                        )}
                        {selected.distance != null && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                            📍 {selected.distance} km away
                          </span>
                        )}
                        {selected.available !== undefined && (
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: selected.available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                              color: selected.available ? "#10b981" : "#ef4444",
                            }}
                          >
                            {selected.available ? "● Available" : "● Unavailable"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "8px",
                      color: "var(--text-secondary)", padding: "4px 10px", cursor: "pointer", fontSize: "13px",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <a
                  href={getDirectionsUrl(
                    selected.source === "uhcs" ? uhcsCoords(selected)?.[0] : selected.lat,
                    selected.source === "uhcs" ? uhcsCoords(selected)?.[1] : selected.lng,
                    selected.name,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "#a855f7", color: "white", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#9333ea")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#a855f7")}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Get Directions in Google Maps
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Results lists ── */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* UHCS doctors */}
            <div className="p-4 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#a855f7" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  UHCS Doctors ({filteredUHCS.length})
                </span>
              </div>
              {filteredUHCS.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-secondary)" }}>
                  {searchQuery
                    ? `No UHCS doctor matches "${searchQuery}"`
                    : "No UHCS doctors have set a location yet."}
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredUHCS.map((d) => (
                    <ResultRow
                      key={d._id || d.uniqueId}
                      item={{ ...d, source: "uhcs" }}
                      isActive={activeId === d._id}
                      onOpen={focusOnResult}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Hospitals */}
            <div className="p-4 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3b82f6" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Nearby Hospitals ({filteredHospitals.length})
                </span>
              </div>
              {osmStatus === "loading" ? (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-secondary)" }}>Loading…</p>
              ) : filteredHospitals.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-secondary)" }}>
                  {osmStatus === "failed"
                    ? "Hospital data source is unavailable right now."
                    : searchQuery
                    ? `No hospital matches "${searchQuery}"`
                    : "No hospitals found nearby."}
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredHospitals.map((h) => (
                    <ResultRow key={h.id} item={h} isActive={activeId === h.id} onOpen={focusOnResult} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </PageTransition>
  );
}
