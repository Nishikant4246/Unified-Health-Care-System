import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import PageTransition from "../../components/common/PageTransition";

// ── Leaflet CSS injected dynamically ──────────────────────────
const injectLeafletCSS = () => {
  if (document.getElementById("leaflet-css")) return;
  const link  = document.createElement("link");
  link.id     = "leaflet-css";
  link.rel    = "stylesheet";
  link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
};

export default function FindDoctors() {
  const mapRef          = useRef(null);
  const mapInstanceRef  = useRef(null);
  const markersRef      = useRef([]);

  const [status,         setStatus]         = useState("idle"); // idle | locating | loading | ready | error
  const [userLocation,   setUserLocation]   = useState(null);
  const [uhcsDoctors,    setUhcsDoctors]    = useState([]);
  const [realHospitals,  setRealHospitals]  = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [errorMsg,       setErrorMsg]       = useState("");

  // ── Step 1: Get patient GPS location ──────────────────────
  const getLocation = () => {
    setStatus("locating");
    setErrorMsg("");

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchDoctors(loc);
      },
      () => {
        setErrorMsg("Location access denied. Please allow location permission and try again.");
        setStatus("error");
      }
    );
  };

  // ── Step 2: Fetch UHCS doctors + OpenStreetMap hospitals ──
  const fetchDoctors = async (loc) => {
    setStatus("loading");
    try {
      // UHCS registered doctors from our backend
      const uhcsRes = await api.get(
        `/patient/nearby-doctors?lat=${loc.lat}&lng=${loc.lng}&radius=20`
      );
      setUhcsDoctors(uhcsRes.data || []);

      // Real hospitals/clinics from OpenStreetMap Overpass API (free)
      const overpassQuery = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](around:10000,${loc.lat},${loc.lng});
          node["amenity"="clinic"](around:10000,${loc.lat},${loc.lng});
          node["healthcare"="doctor"](around:10000,${loc.lat},${loc.lng});
        );
        out body;
      `;
      const osmRes = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
      );
      const osmData = await osmRes.json();

      const hospitals = (osmData.elements || [])
        .filter((el) => el.tags?.name)
        .map((el) => ({
          id:      el.id,
          name:    el.tags.name,
          type:    el.tags.amenity || el.tags.healthcare || "hospital",
          lat:     el.lat,
          lng:     el.lon,
          address: el.tags["addr:full"] || el.tags["addr:street"] || "",
          phone:   el.tags.phone || el.tags["contact:phone"] || "",
          source:  "osm",
          distance: getDistance(loc.lat, loc.lng, el.lat, el.lon),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 30); // max 30 real hospitals

      setRealHospitals(hospitals);
      setStatus("ready");
    } catch (err) {
      setErrorMsg("Failed to load doctors. Please try again.");
      setStatus("error");
    }
  };

  // ── Step 3: Initialize Leaflet map ────────────────────────
  useEffect(() => {
    if (status !== "ready" || !userLocation || !mapRef.current) return;

    injectLeafletCSS();

    const initMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L   = window.L;
      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [userLocation.lat, userLocation.lng], 14
      );

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = [];

      // ── User location marker (green pulsing dot) ──────────
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#10b981;border-radius:50%;
                    border:3px solid #fff;box-shadow:0 0 0 6px rgba(16,185,129,0.25);"></div>`,
        className: "", iconAnchor: [9, 9],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
       .addTo(map)
       .bindPopup('<div style="color:#10b981;font-size:12px;font-weight:600;color:#1e2130;">📍 You are here</div>');

      // ── UHCS doctor markers (purple pins) ─────────────────
      uhcsDoctors.forEach((doc) => {
        if (!doc.location?.lat || !doc.location?.lng) return;

        const icon = L.divIcon({
          html: `<div style="width:38px;height:38px;background:#a855f7;border-radius:50%;
                      border:3px solid #1e2130;display:flex;align-items:center;justify-content:center;
                      font-size:15px;font-weight:700;color:#fff;cursor:pointer;
                      box-shadow:0 2px 10px rgba(168,85,247,0.5);">
                   ${doc.name?.[0]?.toUpperCase() || "D"}
                 </div>`,
          className: "", iconAnchor: [19, 19],
        });

        const marker = L.marker([doc.location.lat, doc.location.lng], { icon }).addTo(map);
        marker.on("click", () => setSelectedDoctor({ ...doc, source: "uhcs" }));
        markersRef.current.push(marker);
      });

      // ── Real hospital markers (blue pins) ─────────────────
      realHospitals.forEach((h) => {
        const icon = L.divIcon({
          html: `<div style="width:32px;height:32px;background:#3b82f6;border-radius:50%;
                      border:3px solid #1e2130;display:flex;align-items:center;justify-content:center;
                      font-size:13px;cursor:pointer;
                      box-shadow:0 2px 8px rgba(59,130,246,0.4);">
                   🏥
                 </div>`,
          className: "", iconAnchor: [16, 16],
        });

        const marker = L.marker([h.lat, h.lng], { icon }).addTo(map);
        marker.on("click", () => setSelectedDoctor(h));
        markersRef.current.push(marker);
      });
    };

    // Load Leaflet JS if not already loaded
    if (window.L) {
      initMap();
    } else {
      const script    = document.createElement("script");
      script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload   = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [status, userLocation, uhcsDoctors, realHospitals]);

  // ── Haversine distance ─────────────────────────────────────
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R    = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a    =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return parseFloat((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  };

  // ── Google Maps directions link ────────────────────────────
  const getDirectionsUrl = (lat, lng, name) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <PageTransition>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
          Find Nearby Doctors
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          UHCS registered doctors + real hospitals near you
        </p>
      </div>

      {/* ── IDLE: Show steps + button ── */}
      {status === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
        >
          {/* Steps */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#94a3b8" }}>
              HOW IT WORKS
            </h2>
            <div className="space-y-3">
              {[
                { step: "1", icon: "📍", title: "Share your location",       desc: "Browser will ask for GPS permission — click Allow" },
                { step: "2", icon: "🔍", title: "We find nearby doctors",    desc: "UHCS registered doctors + real hospitals within 20km" },
                { step: "3", icon: "🗺️", title: "View on interactive map",  desc: "Purple pins = UHCS doctors · Blue pins = Real hospitals" },
                { step: "4", icon: "📋", title: "Click any pin for details", desc: "See name, specialization, fee, distance" },
                { step: "5", icon: "🧭", title: "Get directions",            desc: "One click opens Google Maps with route to that doctor" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}>
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "14px" }}>{s.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>{s.title}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 p-3 rounded-xl" style={{ background: "#252837" }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: "#a855f7" }} />
              <span className="text-xs" style={{ color: "#94a3b8" }}>UHCS Registered Doctor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: "#3b82f6" }} />
              <span className="text-xs" style={{ color: "#94a3b8" }}>Real Hospital / Clinic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-xs" style={{ color: "#94a3b8" }}>Your Location</span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={getLocation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: "#3b82f6", color: "white", cursor: "pointer" }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2"  x2="12" y2="5"  />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2"  y1="12" x2="5"  y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
            Find Doctors Near Me
          </motion.button>
        </motion.div>
      )}

      {/* ── LOCATING / LOADING ── */}
      {(status === "locating" || status === "loading") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
        >
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 animate-spin mb-4"
            style={{ borderColor: "#2a2d3e", borderTopColor: "#3b82f6" }} />
          <p className="font-semibold" style={{ color: "#f1f5f9" }}>
            {status === "locating" ? "Getting your location..." : "Finding nearby doctors..."}
          </p>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {status === "locating" ? "Please allow location access" : "Searching within 20km radius"}
          </p>
        </motion.div>
      )}

      {/* ── ERROR ── */}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl text-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold mb-1" style={{ color: "#f87171" }}>{errorMsg}</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#3b82f6", color: "white", cursor: "pointer" }}
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* ── READY: Map + Doctor Card ── */}
      {status === "ready" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Stats bar */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
              🟣 {uhcsDoctors.length} UHCS Doctor{uhcsDoctors.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}>
              🔵 {realHospitals.length} Hospitals/Clinics
            </span>
            <button
              onClick={() => { setStatus("idle"); setSelectedDoctor(null); }}
              className="ml-auto text-xs px-3 py-1.5 rounded-full"
              style={{ background: "#252837", color: "#94a3b8", border: "1px solid #2a2d3e", cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden mb-4"
            style={{ height: "420px", border: "1px solid #2a2d3e" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          </div>

          {/* Selected Doctor Card */}
          <AnimatePresence>
            {selectedDoctor && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="p-5 rounded-2xl"
                style={{
                  background: "#1e2130",
                  border: `1px solid ${selectedDoctor.source === "uhcs" ? "rgba(168,85,247,0.4)" : "rgba(59,130,246,0.4)"}`,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{
                      background: selectedDoctor.source === "uhcs" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                      color:      selectedDoctor.source === "uhcs" ? "#a855f7" : "#3b82f6",
                    }}>
                    {selectedDoctor.source === "uhcs"
                      ? selectedDoctor.name?.[0]?.toUpperCase()
                      : "🏥"}
                  </div>

                  <div className="flex-1">
                    {/* Name + badge */}
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

                    {/* Details */}
                    <div className="space-y-1 text-sm" style={{ color: "#94a3b8" }}>
                      {selectedDoctor.specialization && (
                        <div>🩺 {selectedDoctor.specialization}</div>
                      )}
                      {selectedDoctor.hospital && (
                        <div>🏥 {selectedDoctor.hospital}</div>
                      )}
                      {selectedDoctor.address && (
                        <div>📍 {selectedDoctor.address}</div>
                      )}
                      {selectedDoctor.phone && (
                        <div>📞 {selectedDoctor.phone}</div>
                      )}
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

                  {/* Close */}
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    style={{ background: "#252837", border: "1px solid #2a2d3e", borderRadius: "8px",
                             color: "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: "13px" }}
                  >✕</button>
                </div>

                {/* Get Directions button */}
                <a
                  href={getDirectionsUrl(
                    selectedDoctor.source === "uhcs" ? selectedDoctor.location.lat : selectedDoctor.lat,
                    selectedDoctor.source === "uhcs" ? selectedDoctor.location.lng : selectedDoctor.lng,
                    selectedDoctor.name
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: "#3b82f6", color: "white", textDecoration: "none" }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  Get Directions in Google Maps
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No doctors found */}
          {uhcsDoctors.length === 0 && realHospitals.length === 0 && (
            <div className="text-center py-8 rounded-2xl" style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold" style={{ color: "#f1f5f9" }}>No doctors found nearby</p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Try increasing the search radius</p>
            </div>
          )}
        </motion.div>
      )}

    </PageTransition>
  );
}