import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// ✅ Set Mapbox Access Token (User to provide in .env)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MapContainer = ({ markers = [], route = [], center = [77.209, 28.613], interactive = true }) => {
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

    mapRef.current.on('load', () => {
      // Add route line if provided
      if (route && route.length > 1) {
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }
        });

        mapRef.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#f43f5e', // primary-500
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Fit map to route
        const bounds = new mapboxgl.LngLatBounds();
        route.forEach(coord => bounds.extend(coord));
        mapRef.current.fitBounds(bounds, { padding: 40 });
      }
    });

    // Add navigation control
    if (interactive) {
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    // Add markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = `marker ${marker.type === "alert" ? "bg-red-500" : "bg-primary-500"} w-5 h-5 rounded-full border-2 border-white shadow-lg ${marker.type === 'alert' ? 'animate-bounce' : 'animate-pulse'}`;

      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${marker.title}</h3><p>${marker.description}</p>`))
        .addTo(mapRef.current);
    });

    return () => mapRef.current.remove();
  }, [markers, route, center, interactive]);

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
