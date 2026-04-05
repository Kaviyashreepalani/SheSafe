import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// ✅ Set Mapbox Access Token (User to provide in .env)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MapContainer = ({ markers = [], center = [77.209, 28.613], interactive = true }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: center,
      zoom: 12,
      interactive: interactive
    });

    // Add navigation control
    if (interactive) {
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    // Add markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = `marker ${marker.type === "alert" ? "bg-danger" : "bg-primary"} w-6 h-6 rounded-full border-2 border-white shadow-lg animate-pulse`;

      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${marker.title}</h3><p>${marker.description}</p>`))
        .addTo(mapRef.current);
    });

    return () => mapRef.current.remove();
  }, [markers, center, interactive]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} className="absolute inset-0" />
      {!mapboxgl.accessToken.includes("pk.ey") && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center p-6 text-center">
          <p className="text-white font-medium">Please add VITE_MAPBOX_TOKEN to your .env to enable maps.</p>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
