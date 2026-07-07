import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Hospital as HospitalIcon, MapPin, AlertCircle, ShieldAlert, BedDouble, Pill } from 'lucide-react';
import { cn } from '../../utils';

export const InteractiveMap: React.FC = () => {
  const { hospitals, inventory, beds } = useApp();
  const [selectedNode, setSelectedNode] = useState<string>('hosp-1');

  const selectedHospital = hospitals.find(h => h.id === selectedNode) || hospitals[0];

  // Mock details for selected node
  const activeAlerts = selectedHospital.activeAlertsCount;
  const bedsPercentage = Math.round(
    (selectedHospital.bedsCount.occupied / selectedHospital.bedsCount.total) * 100
  );
  
  // Find low stock items for this hospital
  const facilityInventory = inventory.filter(i => i.hospitalId === selectedNode);
  const lowStockCount = facilityInventory.filter(i => i.stockLevel <= i.safetyStockThreshold).length;

  return (
    <Card className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Visual Map Render (Premium interactive SVG mapping fallback + Leaflet representation) */}
      <div className="lg:col-span-2 relative h-[300px] md:h-[350px] rounded-lg border border-border/80 bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Sleek Dark Tech Grid Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 opacity-90" />

        {/* Region Map HUD text */}
        <div className="absolute top-3 left-3 z-10 text-left">
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
            Geo-Spatial Grid Sensor
          </span>
          <h4 className="text-xs font-semibold text-white leading-tight">
            District-A Operations Mapping
          </h4>
        </div>

        {/* Vector SVG Mock Map representing clinical centers coordinates */}
        <svg viewBox="0 0 400 300" className="relative z-10 w-full max-w-[320px] h-auto text-slate-800">
          {/* Region boundaries */}
          <path
            d="M 50,50 L 350,30 L 370,250 L 150,280 L 30,200 Z"
            fill="none"
            stroke="rgba(99, 102, 241, 0.15)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 50,50 Q 200,80 350,30 T 370,250 Q 260,240 150,280 T 30,200 Z"
            fill="rgba(99, 102, 241, 0.03)"
            stroke="rgba(99, 102, 241, 0.25)"
            strokeWidth="1.5"
          />

          {/* Sector divider */}
          <line x1="200" y1="55" x2="210" y2="260" stroke="rgba(99, 102, 241, 0.12)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Hospital nodes coordinates in SVG space */}
          {/* hosp-1: Metro General [200, 140] */}
          {/* hosp-2: Valley CHC [280, 90] */}
          {/* hosp-3: Sunset PHC [120, 190] */}
          {/* hosp-4: Apex Cardiac [320, 170] */}

          {hospitals.map((h, index) => {
            const coords = [
              { x: 190, y: 130 }, // hosp-1
              { x: 270, y: 80 },  // hosp-2
              { x: 100, y: 180 }, // hosp-3
              { x: 310, y: 160 }  // hosp-4
            ][index] || { x: 200, y: 150 };

            const isSelected = h.id === selectedNode;

            return (
              <g
                key={h.id}
                className="cursor-pointer group transition-all"
                onClick={() => setSelectedNode(h.id)}
              >
                {/* Highlight ring */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 16 : 8}
                  className={cn(
                    "fill-primary/10 stroke-primary/30 transition-all duration-300",
                    isSelected ? "animate-pulse" : "group-hover:scale-125 group-hover:stroke-primary/50"
                  )}
                />
                
                {/* Core dot color based on alerts */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 6 : 4}
                  className={cn(
                    "transition-all duration-200",
                    h.activeAlertsCount > 2 
                      ? "fill-destructive animate-ping" 
                      : h.activeAlertsCount > 0 
                        ? "fill-warning" 
                        : "fill-success"
                  )}
                />
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 5 : 4}
                  className={cn(
                    h.activeAlertsCount > 2 
                      ? "fill-destructive" 
                      : h.activeAlertsCount > 0 
                        ? "fill-warning" 
                        : "fill-success"
                  )}
                />

                {/* Node name tooltip label */}
                <text
                  x={coords.x}
                  y={coords.y - (isSelected ? 20 : 12)}
                  textAnchor="middle"
                  className={cn(
                    "text-[8px] font-bold transition-all uppercase tracking-wider select-none",
                    isSelected ? "fill-primary font-extrabold" : "fill-slate-400 group-hover:fill-slate-200"
                  )}
                >
                  {h.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay HUD */}
        <div className="absolute bottom-3 left-3 flex gap-4 text-[9px] font-semibold text-slate-300 z-10">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Secure Status
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" /> Warning Flag
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" /> Critical Alert
          </span>
        </div>
      </div>

      {/* Selected Node Sidebar details */}
      <div className="flex flex-col justify-between p-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
              <HospitalIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground truncate max-w-[190px]">
                {selectedHospital.name}
              </h4>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none mt-0.5">
                {selectedHospital.type} • {selectedHospital.district}
              </p>
            </div>
          </div>

          <div className="border-t border-border/80 pt-3 mt-1 space-y-3">
            {/* KPI 1: Bed Allocation Ratio */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5" /> Bed Occupancy Rate
                </span>
                <span className="font-bold text-foreground">
                  {bedsPercentage}% ({selectedHospital.bedsCount.occupied}/{selectedHospital.bedsCount.total})
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    bedsPercentage > 90 
                      ? "bg-destructive" 
                      : bedsPercentage > 75 
                        ? "bg-warning" 
                        : "bg-success"
                  )}
                  style={{ width: `${bedsPercentage}%` }}
                />
              </div>
            </div>

            {/* KPI 2: Stock Deficiency Card */}
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Pill className="h-3.5 w-3.5" /> Out-of-Stock Warnings
              </span>
              <Badge variant={lowStockCount > 0 ? 'destructive' : 'success'}>
                {lowStockCount > 0 ? `${lowStockCount} items low` : 'Stock Stable'}
              </Badge>
            </div>

            {/* KPI 3: activeAlerts */}
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Alarm Dispatches
              </span>
              <Badge variant={activeAlerts > 0 ? 'warning' : 'default'}>
                {activeAlerts} unresolved
              </Badge>
            </div>
          </div>
        </div>

        {/* Context click to view details */}
        <div className="pt-4 border-t border-border/80">
          <div className="rounded bg-muted/40 p-2 border border-border/60 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Click geo pins on the grid to route state data. Double-click pin to initiate AI supply reallocation.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
