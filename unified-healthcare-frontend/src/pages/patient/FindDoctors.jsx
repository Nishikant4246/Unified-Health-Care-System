import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

const injectLeafletCSS = () => {
  if (document.getElementById("leaflet-css")) return;
  const link  = document.createElement("link");
  link.id     = "leaflet-css";
  link.rel    = "stylesheet";
  link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
};

const getDirectionsUrl = (lat, lng, name) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;

// ─── Specialization suggestions ───────────────────────────────
const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Orthopedic",
  "Gynecologist", "Pediatrician", "Neurologist", "Dentist",
  "Ophthalmologist", "ENT Specialist", "Psychiatrist", "Urologist",
  "Oncologist", "Endocrinologist", "Pulmonologist", "Gastroenterologist",
  "Emergency Medicine", "Internal Medicine",
];

// ─── OSM type → searchable keywords mapping ───────────────────
// So "Dentist" also matches OSM hospitals/clinics with dental in name
const OSM_SEARCH_KEYWORDS = {
  dentist:      ["dental", "dentist", "teeth", "orthodontic"],
  dermatologist:["skin", "derma"],
  cardiologist: ["heart", "cardiac", "cardio"],
  orthopedic:   ["ortho", "bone", "joint", "spine"],
  gynecologist: ["gynec", "maternity", "women", "obstet"],
  pediatrician: ["child", "pediatric", "kids"],
  neurologist:  ["neuro", "brain"],
  ophthalmologist:["eye", "vision", "optic"],
  ent:          ["ent", "ear", "nose", "throat"],
};

const getOSMKeywords = (query) => {
  const q = query.toLowerCase();
  for (const [key, words] of Object.entries(OSM_SEARCH_KEYWORDS)) {
    if (q.includes(key) || words.some((w) => q.includes(w))) {
      return words;
    }
  }
  return [q]; // fallback — search query itself
};

export default function FindDoctors() {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchRef      = useRef(null);

  const [status,         setStatus]         = useState("idle");
  const [userLocation,   setUserLocation]   = useState(null);
  const [uhcsDoctors,    setUhcsDoctors]    = useState([]);
  const [realHospitals,  setRealHospitals]  = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [errorMsg,       setErrorMsg]       = useState("");
  const [osmStatus,      setOsmStatus]      = useState("idle");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [showSuggestions,setShowSuggestions]= useState(false);
  const [hoveredBtn,     setHoveredBtn]     = useState(null);

  // ─── Filtered results ──────────────────────────────────────
  const filteredUHCS = uhcsDoctors.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.name?.toLowerCase().includes(q) ||
      doc.specialization?.toLowerCase().includes(q) ||
      doc.hospital?.toLowerCase().includes(q)
    );
  });

  // ── KEY FIX: OSM search includes name + type + keyword mapping ──
  const filteredHospitals = realHospitals.filter((h) => {
    if (!searchQuery) return true;
    const q        = searchQuery.toLowerCase();
    const keywords = getOSMKeywords(q);
    const haystack = `${h.name} ${h.type} ${h.address}`.toLowerCase();
    // Match if name contains query OR any keyword matches
    return haystack.includes(q) || keywords.some((kw) => haystack.includes(kw));
  });

  const filteredSuggestions = searchQuery.length > 0
    ? SPECIALIZATIONS.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : SPECIALIZATIONS.slice(0, 8);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── GPS ────────────────────────────────────────────────────
  const getLocation = () => {
    setStatus("locating");
    setErrorMsg("");
    setUhcsDoctors([]);
    setRealHospitals([]);
    setSelectedDoctor(null);

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("Patient GPS:", loc);
        setUserLocation(loc);
        fetchUHCSDoctors(loc);
      },
      (err) => {
        console.error("GPS error:", err);
        setErrorMsg("Location access denied. Please allow location permission and try again.");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchFind = () => {
    setShowSuggestions(false);
    getLocation();
  };

  // ── Fetch UHCS doctors ─────────────────────────────────────
  const fetchUHCSDoctors = async (loc) => {
    setStatus("loading");
    try {
      const res     = await api.get(`/patient/nearby-doctors?lat=${loc.lat}&lng=${loc.lng}&radius=50`);
      const doctors = res.data || [];
      console.log("UHCS doctors found:", doctors.length, doctors);
      setUhcsDoctors(doctors);
    } catch (err) {
      console.error("UHCS fetch error:", err);
    }
    setStatus("ready");
    fetchOSMHospitals(loc);
  };

  // ── Fetch OSM hospitals ────────────────────────────────────
  const fetchOSMHospitals = async (loc, attempt = 1) => {
    setOsmStatus("loading");
    try {
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:15000,${loc.lat},${loc.lng});
          node["amenity"="clinic"](around:15000,${loc.lat},${loc.lng});
          node["amenity"="dentist"](around:15000,${loc.lat},${loc.lng});
          node["healthcare"="doctor"](around:15000,${loc.lat},${loc.lng});
        );
        out body;
      `;
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 20000);
      const osmRes     = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!osmRes.ok) throw new Error(`OSM ${osmRes.status}`);

      const osmData   = await osmRes.json();
      const hospitals = (osmData.elements || [])
        .filter((el) => el.tags?.name)
        .map((el) => ({
          id:           el.id,
          name:         el.tags.name,
          // ── Store ALL searchable fields from OSM tags ──
          type:         el.tags.amenity || el.tags.healthcare || "hospital",
          specialty:    el.tags["healthcare:speciality"] || el.tags["medical_system:medicine"] || "",
          lat:          el.lat,
          lng:          el.lon,
          address:      [
            el.tags["addr:housenumber"],
            el.tags["addr:street"],
            el.tags["addr:city"],
          ].filter(Boolean).join(", ") || el.tags["addr:full"] || "",
          phone:        el.tags.phone || el.tags["contact:phone"] || "",
          source:       "osm",
          distance:     getDistance(loc.lat, loc.lng, el.lat, el.lon),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 40);

      console.log("OSM hospitals found:", hospitals.length);
      setRealHospitals(hospitals);
      setOsmStatus("done");
    } catch (err) {
      console.error(`OSM attempt ${attempt}:`, err.message);
      if (attempt < 2) setTimeout(() => fetchOSMHospitals(loc, 2), 3000);
      else setOsmStatus("failed");
    }
  };

  // ── Leaflet map ────────────────────────────────────────────
  useEffect(() => {
    if (status !== "ready" || !userLocation || !mapRef.current) return;
    injectLeafletCSS();

    const initMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      const L   = window.L;
      const map = L.map(mapRef.current, { zoomControl: true })
                   .setView([userLocation.lat, userLocation.lng], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;

      // User
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#10b981;border-radius:50%;
                    border:3px solid #fff;box-shadow:0 0 0 6px rgba(16,185,129,0.25);"></div>`,
        className: "", iconAnchor: [9, 9],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
       .addTo(map)
       .bindPopup('<div style="font-size:12px;font-weight:600;color:#1e2130;">📍 You are here</div>');

      // UHCS doctors
      filteredUHCS.forEach((doc) => {
        if (!doc.location?.lat || !doc.location?.lng) return;
        const icon = L.divIcon({
          html: `<div style="width:40px;height:40px;background:#a855f7;border-radius:50%;
                      border:3px solid #fff;display:flex;align-items:center;justify-content:center;
                      font-size:16px;font-weight:700;color:#fff;cursor:pointer;
                      box-shadow:0 4px 12px rgba(168,85,247,0.6);">
                   ${doc.name?.[0]?.toUpperCase() || "D"}
                 </div>`,
          className: "", iconAnchor: [20, 20],
        });
        const marker = L.marker([doc.location.lat, doc.location.lng], { icon }).addTo(map);
        marker.on("click", () => setSelectedDoctor({ ...doc, source: "uhcs" }));
      });

      // OSM hospitals
      filteredHospitals.forEach((h) => {
        const icon = L.divIcon({
          html: `<div style="width:32px;height:32px;background:#3b82f6;border-radius:50%;
                      border:3px solid #fff;display:flex;align-items:center;justify-content:center;
                      font-size:14px;cursor:pointer;
                      box-shadow:0 2px 8px rgba(59,130,246,0.5);">🏥</div>`,
          className: "", iconAnchor: [16, 16],
        });
        const marker = L.marker([h.lat, h.lng], { icon }).addTo(map);
        marker.on("click", () => setSelectedDoctor(h));
      });
    };

    if (window.L) initMap();
    else {
      const script  = document.createElement("script");
      script.src    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [status, userLocation, filteredUHCS, filteredHospitals]);

  // ══════════════════════════════════════════════════════════
  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Find Nearby Doctors</h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          UHCS registered doctors + real hospitals near you
        </p>
      </div>

      {/* ── IDLE ── */}
      {status === "idle" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>

          <h2 className="text-sm font-semibold mb-4" style={{ color: "#94a3b8" }}>HOW IT WORKS</h2>
          <div className="space-y-3 mb-6">
            {[
              { step: "1", icon: "📍", title: "Share your location",      desc: "Browser will ask for GPS — click Allow" },
              { step: "2", icon: "🔍", title: "We find nearby doctors",   desc: "UHCS doctors + real hospitals within 50km" },
              { step: "3", icon: "🗺️", title: "View on interactive map", desc: "Purple = UHCS doctors · Blue = Real hospitals" },
              { step: "4", icon: "📋", title: "Click any pin",            desc: "See name, specialization, fee, distance" },
              { step: "5", icon: "🧭", title: "Get directions",           desc: "One click opens Google Maps with route" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}>
                  {s.step}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "14px" }}>{s.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{s.title}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-5 p-3 rounded-xl flex-wrap" style={{ background: "#252837" }}>
            {[
              { color: "#a855f7", label: "UHCS Registered Doctor" },
              { color: "#3b82f6", label: "Real Hospital / Clinic"  },
              { color: "#10b981", label: "Your Location"           },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: "#94a3b8" }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* ── Search box — NO label, just input ── */}
          <div className="mb-4" ref={searchRef}>
            <div className="relative">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search by specialization or name (optional)..."
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#252837", border: "1px solid #2a2d3e", color: "#f1f5f9" }}
                onMouseEnter={(e) => (e.target.style.borderColor = "#3b82f6")}
                onMouseLeave={(e) => { if (!showSuggestions) e.target.style.borderColor = "#2a2d3e"; }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "#2a2d3e", border: "none", color: "#94a3b8",
                    borderRadius: "50%", width: "20px", height: "20px",
                    cursor: "pointer", fontSize: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
              )}
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                  className="mt-1 rounded-xl overflow-hidden"
                  style={{ background: "#252837", border: "1px solid #2a2d3e" }}>
                  <div className="p-2 flex flex-wrap gap-1.5">
                    {filteredSuggestions.map((s) => (
                      <button key={s}
                        onClick={() => { setSearchQuery(s); setShowSuggestions(false); }}
                        className="text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{
                          background: searchQuery === s ? "#3b82f6" : "rgba(59,130,246,0.1)",
                          color:      searchQuery === s ? "#fff" : "#3b82f6",
                          border:     "1px solid rgba(59,130,246,0.3)",
                          cursor:     "pointer",
                        }}
                        onMouseEnter={(e) => { e.target.style.background = "#3b82f6"; e.target.style.color = "#fff"; }}
                        onMouseLeave={(e) => {
                          if (searchQuery !== s) { e.target.style.background = "rgba(59,130,246,0.1)"; e.target.style.color = "#3b82f6"; }
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Two buttons ── */}
          <div className="flex flex-col gap-3">
            <motion.button onClick={getLocation}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredBtn("find")}
              onMouseLeave={() => setHoveredBtn(null)}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background:  hoveredBtn === "find" ? "#2563eb" : "#3b82f6",
                color:       "white", cursor: "pointer",
                transform:   hoveredBtn === "find" ? "translateY(-2px)" : "translateY(0)",
                boxShadow:   hoveredBtn === "find" ? "0 8px 24px rgba(59,130,246,0.4)" : "none",
              }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
              </svg>
              📍 Find All Doctors Near Me
            </motion.button>

            <motion.button onClick={handleSearchFind}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredBtn("search")}
              onMouseLeave={() => setHoveredBtn(null)}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background:  hoveredBtn === "search" ? "rgba(168,85,247,0.2)" : "rgba(168,85,247,0.1)",
                color:       "#a855f7",
                border:      `1px solid ${hoveredBtn === "search" ? "#a855f7" : "rgba(168,85,247,0.3)"}`,
                cursor:      "pointer",
                transform:   hoveredBtn === "search" ? "translateY(-2px)" : "translateY(0)",
                boxShadow:   hoveredBtn === "search" ? "0 8px 24px rgba(168,85,247,0.2)" : "none",
              }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              {searchQuery ? `🔍 Search "${searchQuery}" Near Me` : "🔍 Search by Specialization"}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── LOCATING / LOADING ── */}
      {(status === "locating" || status === "loading") && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
          <div className="w-12 h-12 rounded-full border-4 animate-spin mb-4"
            style={{ borderColor: "#2a2d3e", borderTopColor: "#3b82f6" }} />
          <p className="font-semibold" style={{ color: "#f1f5f9" }}>
            {status === "locating" ? "Getting your location..." : "Finding nearby doctors..."}
          </p>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {status === "locating" ? "Please allow location access"
              : searchQuery ? `Searching "${searchQuery}" within 50km`
              : "Searching all doctors within 50km"}
          </p>
        </motion.div>
      )}

      {/* ── ERROR ── */}
      {status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-6 rounded-2xl text-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold mb-1" style={{ color: "#f87171" }}>{errorMsg}</p>
          <button onClick={() => setStatus("idle")}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#3b82f6", color: "white", cursor: "pointer" }}>
            Try Again
          </button>
        </motion.div>
      )}

      {/* ── READY ── */}
      {status === "ready" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Search on map view */}
          <div className="mb-3 relative" ref={searchRef}>
            <div className="relative">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Filter by specialization or name..."
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
                style={{ background: "#1e2130", border: "1px solid #2a2d3e", color: "#f1f5f9" }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "#2a2d3e", border: "none", color: "#94a3b8",
                    borderRadius: "50%", width: "20px", height: "20px",
                    cursor: "pointer", fontSize: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
              )}
            </div>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                  style={{ background: "#1e2130", border: "1px solid #2a2d3e", borderRadius: "12px",
                           marginTop: "4px", position: "relative", zIndex: 50 }}>
                  <div className="p-2 flex flex-wrap gap-1.5">
                    {filteredSuggestions.map((s) => (
                      <button key={s}
                        onClick={() => { setSearchQuery(s); setShowSuggestions(false); }}
                        className="text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{
                          background: searchQuery === s ? "#3b82f6" : "rgba(59,130,246,0.1)",
                          color:      searchQuery === s ? "#fff" : "#3b82f6",
                          border:     "1px solid rgba(59,130,246,0.3)", cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.target.style.background = "#3b82f6"; e.target.style.color = "#fff"; }}
                        onMouseLeave={(e) => {
                          if (searchQuery !== s) { e.target.style.background = "rgba(59,130,246,0.1)"; e.target.style.color = "#3b82f6"; }
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
              🟣 {filteredUHCS.length} UHCS Doctor{filteredUHCS.length !== 1 ? "s" : ""}
              {searchQuery && uhcsDoctors.length !== filteredUHCS.length && ` (of ${uhcsDoctors.length})`}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}>
              {osmStatus === "loading" ? "🔵 Loading hospitals..." :
               osmStatus === "failed"  ? "🔵 Unavailable" :
               `🔵 ${filteredHospitals.length} Hospitals/Clinics`}
            </span>
            <button onClick={() => { setStatus("idle"); setSelectedDoctor(null); setSearchQuery(""); }}
              className="ml-auto text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: "#252837", color: "#94a3b8", border: "1px solid #2a2d3e", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2d3e"; e.currentTarget.style.color = "#f1f5f9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#252837"; e.currentTarget.style.color = "#94a3b8"; }}>
              Reset
            </button>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden mb-4"
            style={{ height: "420px", border: "1px solid #2a2d3e" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          </div>

          {/* Doctor card */}
          <AnimatePresence>
            {selectedDoctor && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }} className="p-5 rounded-2xl mb-4"
                style={{
                  background: "#1e2130",
                  border: `1px solid ${selectedDoctor.source === "uhcs" ? "rgba(168,85,247,0.4)" : "rgba(59,130,246,0.4)"}`,
                }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{
                      background: selectedDoctor.source === "uhcs" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                      color:      selectedDoctor.source === "uhcs" ? "#a855f7" : "#3b82f6",
                    }}>
                    {selectedDoctor.source === "uhcs" ? selectedDoctor.name?.[0]?.toUpperCase() : "🏥"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-base" style={{ color: "#f1f5f9" }}>
                        {selectedDoctor.source === "uhcs" ? `Dr. ${selectedDoctor.name}` : selectedDoctor.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: selectedDoctor.source === "uhcs" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                          color:      selectedDoctor.source === "uhcs" ? "#a855f7" : "#3b82f6",
                        }}>
                        {selectedDoctor.source === "uhcs" ? "UHCS Registered" : "Real Hospital"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "#94a3b8" }}>
                      {selectedDoctor.specialization && <div>🩺 {selectedDoctor.specialization}</div>}
                      {selectedDoctor.hospital       && <div>🏥 {selectedDoctor.hospital}</div>}
                      {selectedDoctor.address        && <div>📍 {selectedDoctor.address}</div>}
                      {selectedDoctor.phone          && <div>📞 {selectedDoctor.phone}</div>}
                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        {selectedDoctor.consultationFee > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full"
                            style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                            ₹{selectedDoctor.consultationFee} fee
                          </span>
                        )}
                        {selectedDoctor.distance && (
                          <span className="text-xs px-2 py-1 rounded-full"
                            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                            📍 {selectedDoctor.distance} km away
                          </span>
                        )}
                        {selectedDoctor.available !== undefined && (
                          <span className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: selectedDoctor.available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                              color:      selectedDoctor.available ? "#10b981" : "#ef4444",
                            }}>
                            {selectedDoctor.available ? "● Available" : "● Unavailable"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDoctor(null)}
                    style={{ background: "#252837", border: "1px solid #2a2d3e", borderRadius: "8px",
                             color: "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: "13px" }}>✕</button>
                </div>
                <a href={getDirectionsUrl(
                    selectedDoctor.source === "uhcs" ? selectedDoctor.location.lat : selectedDoctor.lat,
                    selectedDoctor.source === "uhcs" ? selectedDoctor.location.lng : selectedDoctor.lng,
                    selectedDoctor.name
                  )}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "#3b82f6", color: "white", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Get Directions in Google Maps
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No results */}
          {filteredUHCS.length === 0 && filteredHospitals.length === 0 && osmStatus !== "loading" && (
            <div className="text-center py-8 rounded-2xl"
              style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold" style={{ color: "#f1f5f9" }}>
                {searchQuery ? `No "${searchQuery}" found nearby` : "No doctors found nearby"}
              </p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                {searchQuery ? "Try a different specialization" : "Ask your doctor to set location on UHCS dashboard"}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "#3b82f6", color: "white", cursor: "pointer" }}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </PageTransition>
  );
}