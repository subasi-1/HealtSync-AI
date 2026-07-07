import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { useHospitalsQuery, useInventoryQuery, useBedsQuery, useDoctorsQuery, useRedistributionsQuery } from '../../hooks';
import { cn } from '../../utils';

interface DistrictMapProps {
  viewMode: 'incidents' | 'medicine' | 'beds' | 'staff' | 'patients' | 'cargo';
}

export const DistrictMap: React.FC<DistrictMapProps> = ({ viewMode }) => {
  const { theme } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);

  const { data: hospitals = [] } = useHospitalsQuery();
  const { data: inventory = [] } = useInventoryQuery();
  const { data: beds = [] } = useBedsQuery();
  const { data: doctors = [] } = useDoctorsQuery();
  const { data: cargoRequests = [] } = useRedistributionsQuery();

  // Coordinates mapping
  const coordMap: Record<string, [number, number]> = {
    'hosp-1': [12.9716, 77.5946], // Metro Gen
    'hosp-2': [12.9816, 77.6046], // Valley CHC
    'hosp-3': [12.9516, 77.5846], // Sunset PHC
    'hosp-4': [12.9916, 77.6246]  // Apex Specialty
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([12.9716, 77.5946], 13);
    
    leafletMap.current = map;

    // Create active layers
    const lg = L.layerGroup().addTo(map);
    layerGroup.current = lg;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // 2. Manage Map Tile Theme (Dark Mode vs Light Mode)
  useEffect(() => {
    if (!leafletMap.current) return;

    if (tileLayer.current) {
      tileLayer.current.remove();
    }

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(leafletMap.current);

    tileLayer.current = tiles;
  }, [theme]);

  // 3. Render telemetry overlays based on viewMode
  useEffect(() => {
    if (!leafletMap.current || !layerGroup.current) return;

    // Clear previous vector layers
    layerGroup.current.clearLayers();
    const map = leafletMap.current;
    const lg = layerGroup.current;
    const activeIntervals: number[] = [];

    hospitals.forEach((hosp) => {
      const coords = coordMap[hosp.id] || [12.9716, 77.5946];

      // Overlay rendering
      if (viewMode === 'incidents') {
        // Red, amber, or green indicators
        const alertCount = hosp.activeAlertsCount;
        const colorClass = alertCount > 2 
          ? 'bg-destructive ring-destructive/40 animate-pulse' 
          : alertCount > 0 
            ? 'bg-warning ring-warning/40' 
            : 'bg-success ring-success/40';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="flex h-6 w-6 items-center justify-center rounded-full border border-white/60 text-white shadow-fluentLg ring-4 ${colorClass} font-bold text-[10px]">${alertCount}</div>`,
          iconSize: [24, 24]
        });

        L.marker(coords, { icon: customIcon })
          .bindPopup(`
            <div class="p-2 text-xs">
              <strong class="text-slate-900 font-bold">${hosp.name}</strong>
              <p class="text-slate-600 mt-1 uppercase font-semibold text-[9px]">${hosp.type}</p>
              <div class="mt-2 text-slate-800">Alerts: <span class="font-bold text-red-600">${alertCount} active</span></div>
            </div>
          `)
          .addTo(lg);
      } 
      
      else if (viewMode === 'medicine') {
        // Medicine stock deficiencies heatmap
        const hospInv = inventory.filter(i => i.hospitalId === hosp.id);
        const lowItems = hospInv.filter(i => i.stockLevel <= i.safetyStockThreshold);
        
        if (lowItems.length > 0) {
          // Render deficit zone circle
          const radius = lowItems.length * 150;
          L.circle(coords, {
            radius: radius,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.25,
            weight: 1.5
          })
          .bindPopup(`
            <div class="p-2 text-xs">
              <strong class="text-slate-900 font-bold">${hosp.name}</strong>
              <p class="text-slate-500 font-semibold text-[9px] mt-0.5">Medicine Stockout Deficits</p>
              <ul class="mt-2 text-slate-700 list-disc pl-3">
                ${lowItems.map(item => `<li>${item.name}: ${item.stockLevel} left</li>`).join('')}
              </ul>
            </div>
          `)
          .addTo(lg);
        }

        // Base pin for status
        const pinIcon = L.divIcon({
          className: 'hosp-pin',
          html: `<div class="h-4.5 w-4.5 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white">${lowItems.length}</div>`,
          iconSize: [18, 18]
        });
        L.marker(coords, { icon: pinIcon }).addTo(lg);
      } 
      
      else if (viewMode === 'beds') {
        // Beds occupancy strain heatmap
        const total = hosp.bedsCount.total;
        const occupied = hosp.bedsCount.occupied;
        const pct = Math.round((occupied / total) * 100);

        const circleColor = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#10b981';
        L.circle(coords, {
          radius: pct * 4,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.2,
          weight: 1.5
        })
        .bindPopup(`
          <div class="p-2 text-xs">
            <strong class="text-slate-900 font-bold">${hosp.name}</strong>
            <div class="mt-2 text-slate-800">Bed Occupancy: <span class="font-bold">${pct}%</span> (${occupied}/${total} occupied)</div>
          </div>
        `)
        .addTo(lg);

        const pinIcon = L.divIcon({
          className: 'beds-pin',
          html: `<div class="h-4.5 w-4.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[7px] font-bold text-white" style="background-color: ${circleColor}">${pct}%</div>`,
          iconSize: [18, 18]
        });
        L.marker(coords, { icon: pinIcon }).addTo(lg);
      } 
      
      else if (viewMode === 'staff') {
        // Doctor shifts and attendance markers
        const activeCount = hosp.doctorCount.active;
        const total = hosp.doctorCount.total;

        const pinIcon = L.divIcon({
          className: 'staff-pin',
          html: `<div class="h-5 w-5 rounded-full bg-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-white">${activeCount}/${total}</div>`,
          iconSize: [20, 20]
        });

        L.marker(coords, { icon: pinIcon })
          .bindPopup(`
            <div class="p-2 text-xs">
              <strong class="text-slate-900 font-bold">${hosp.name}</strong>
              <div class="mt-2 text-slate-800 font-medium">Checked-In Clinicians: <span class="font-bold">${activeCount} active shifts</span></div>
              <p class="text-[10px] text-slate-500 mt-1">Total standing staff: ${total}</p>
            </div>
          `)
          .addTo(lg);
      } 
      
      else if (viewMode === 'patients') {
        // Patient density heatzones
        const rate = hosp.bedsCount.occupied;
        const zoneColor = rate > 80 ? '#ef4444' : rate > 40 ? '#f59e0b' : '#3b82f6';
        
        L.circle(coords, {
          radius: rate * 6,
          color: zoneColor,
          fillColor: zoneColor,
          fillOpacity: 0.22,
          weight: 0.5
        })
        .bindPopup(`
          <div class="p-2 text-xs">
            <strong class="text-slate-900 font-bold">${hosp.name}</strong>
            <p class="mt-2 text-slate-700">Patient load zone: <span class="font-bold">${rate} Admissions</span></p>
          </div>
        `)
        .addTo(lg);
      }
    });

    // 4. Render Cargo redistribution lines
    if (viewMode === 'cargo') {
      const activeTransfers = cargoRequests.filter(req => req.status === 'Approved' || req.status === 'Shipped');

      activeTransfers.forEach((req) => {
        const sourceCoords = coordMap[req.fromHospitalId];
        const destCoords = coordMap[req.toHospitalId];

        if (sourceCoords && destCoords) {
          // Draw Cargo transfer route polyline
          const line = L.polyline([sourceCoords, destCoords], {
            color: '#6366f1',
            weight: 3,
            dashArray: '5, 8',
            opacity: 0.8
          })
          .bindPopup(`
            <div class="p-2 text-xs">
              <strong class="text-slate-900 font-bold">In-Transit Cargo Transfer</strong>
              <p class="text-slate-600 mt-1">${req.medicineName} (x${req.quantity})</p>
              <div class="mt-2 text-[10px] text-slate-500 font-semibold">STATUS: ${req.status} • CODE: ${req.trackingCode}</div>
            </div>
          `)
          .addTo(lg);

          // Animate vector polyline (Standard Leaflet polyline offset rotation trick)
          let offset = 0;
          const interval = setInterval(() => {
            offset = (offset + 1) % 13;
            line.setStyle({ dashOffset: `${-offset}` });
          }, 150);
          activeIntervals.push(interval as any);

          // Base icons
          const truckIcon = L.divIcon({
            className: 'truck-pin',
            html: `<div class="h-6 w-6 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center text-white"><svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-10.5l2.25 3H17V8h3z"/></svg></div>`,
            iconSize: [24, 24]
          });

          // Place truck marker midpoint
          const midLatLng: [number, number] = [
            (sourceCoords[0] + destCoords[0]) / 2,
            (sourceCoords[1] + destCoords[1]) / 2
          ];
          L.marker(midLatLng, { icon: truckIcon }).addTo(lg);
        }
      });
    }

    return () => {
      activeIntervals.forEach(clearInterval);
    };
  }, [viewMode, hospitals, inventory, beds, doctors, cargoRequests]);

  return (
    <div className="relative h-full w-full rounded-lg border border-border/80 bg-slate-900 overflow-hidden min-h-[400px]">
      <div ref={mapRef} className="h-full w-full" style={{ zIndex: 1 }} />
      
      {/* Map Control Info overlay HUD */}
      <div className="absolute bottom-3 right-3 z-[1000] rounded-md bg-card/90 backdrop-blur border border-border/80 p-2.5 text-[9px] font-semibold text-foreground/80 shadow-md flex items-center gap-4 select-none">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success" /> Optimal Status
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-warning" /> Warning Threshold
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> Urgent Deficit
        </span>
      </div>
    </div>
  );
};
export default DistrictMap;
