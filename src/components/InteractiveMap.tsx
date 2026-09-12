import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as L from 'leaflet';
import { Activity, ActivityCategory, User } from '../types';
import { getCategoryMeta } from '../data/categories';
import { calculateDistanceKm } from '../services/store';
import {
  isActivityNow,
  clusterActivities,
  MapQuickFilter,
  SPORTS_CATEGORIES,
  GAMING_CATEGORIES,
  SOCIAL_CATEGORIES,
  RADIUS_OPTIONS
} from './map/mapUtils';
import { MapTopFilterBar } from './map/MapTopFilterBar';
import { MapPreviewCard } from './map/MapPreviewCard';
import { MapControls } from './map/MapControls';
import { MapBottomSheet, BottomSheetState } from './map/MapBottomSheet';
import { MapPin, Locate, Plus, X, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface InteractiveMapProps {
  activities: Activity[];
  userLocation: { lat: number; lng: number; name: string };
  currentUser?: User;
  selectedActivityId?: string | null;
  onSelectActivity: (activity: Activity) => void;
  onQuickJoin?: (activityId: string) => void;
  onQuickLeave?: (activityId: string) => void;
  onOpenCreate?: (lat?: number, lng?: number) => void;
  onOpenSquadChat?: (activity: Activity) => void;
  isLocationPicker?: boolean;
  pickedLocation?: { lat: number; lng: number; name: string } | null;
  onPickLocation?: (location: { lat: number; lng: number; name: string }) => void;
  filterCategory?: ActivityCategory | 'All';
  onFilterCategoryChange?: (category: ActivityCategory | 'All') => void;
  isMiniPreview?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activities,
  userLocation,
  currentUser,
  selectedActivityId: externalSelectedId,
  onSelectActivity,
  onQuickJoin,
  onQuickLeave,
  onOpenCreate,
  onOpenSquadChat,
  isLocationPicker = false,
  pickedLocation,
  onPickLocation,
  filterCategory: externalCategory = 'All',
  onFilterCategoryChange,
  isMiniPreview = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Map Filter & View State
  const [quickFilter, setQuickFilter] = useState<MapQuickFilter>('all');
  const [internalCategory, setInternalCategory] = useState<ActivityCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(9999); // Show all city activities by default so user sees everything when panning
  const [sheetState, setSheetState] = useState<BottomSheetState>('collapsed');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [mapViewportVersion, setMapViewportVersion] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Fullscreen View
  const handleToggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fallback to CSS-only fullscreen
        setIsFullscreen(prev => !prev);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // Guarantee map recalculates bounds immediately on any fullscreen transition
  useEffect(() => {
    const timers = [10, 50, 150, 300, 600, 1000].map(delay =>
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isFullscreen]);

  const activeCategory = externalCategory !== 'All' ? externalCategory : internalCategory;

  const handleCategoryChange = (cat: ActivityCategory | 'All') => {
    setInternalCategory(cat);
    if (onFilterCategoryChange) {
      onFilterCategoryChange(cat);
    }
  };

  // Sync external selected ID if provided
  useEffect(() => {
    if (externalSelectedId) {
      const match = activities.find(a => a.id === externalSelectedId);
      if (match) {
        setSelectedActivity(match);
      }
    }
  }, [externalSelectedId, activities]);

  // Compute Count of NOW Activities
  const nowCount = useMemo(() => {
    return activities.filter(a => isActivityNow(a)).length;
  }, [activities]);

  // Filter and Sort Activities
  const filteredActivities = useMemo(() => {
    if (isLocationPicker) return [];

    return activities.filter(activity => {
      // 1. Category Filter
      if (activeCategory !== 'All' && activity.category !== activeCategory) {
        return false;
      }

      // 2. Quick Group Filter
      if (quickFilter === 'now' && !isActivityNow(activity)) {
        return false;
      }
      if (quickFilter === 'sports' && !SPORTS_CATEGORIES.includes(activity.category)) {
        return false;
      }
      if (quickFilter === 'gaming' && !GAMING_CATEGORIES.includes(activity.category)) {
        return false;
      }
      if (quickFilter === 'social' && !SOCIAL_CATEGORIES.includes(activity.category)) {
        return false;
      }

      // 3. Distance Radius Filter
      const distKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        activity.approximateLatitude,
        activity.approximateLongitude
      );
      if (quickFilter === 'nearby' && distKm > 3) {
        return false;
      }
      if (selectedRadiusKm < 9999 && distKm > selectedRadiusKm) {
        return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = (activity.title || '').toLowerCase().includes(query);
        const matchCat = (activity.category || '').toLowerCase().includes(query);
        const matchLoc = (activity.locationName || '').toLowerCase().includes(query);
        const matchDesc = (activity.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchCat && !matchLoc && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [activities, activeCategory, quickFilter, selectedRadiusKm, searchQuery, userLocation, isLocationPicker]);

  // Sorted Activities for Bottom Sheet (NOW first, then closest, then open spots)
  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      const aNow = isActivityNow(a);
      const bNow = isActivityNow(b);
      if (aNow && !bNow) return -1;
      if (!aNow && bNow) return 1;

      const distA = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        a.approximateLatitude,
        a.approximateLongitude
      );
      const distB = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        b.approximateLatitude,
        b.approximateLongitude
      );
      if (distA !== distB) return distA - distB;

      const spotsA = a.maxParticipants - a.participants.length;
      const spotsB = b.maxParticipants - b.participants.length;
      return spotsB - spotsA;
    });
  }, [filteredActivities, userLocation]);

  // Initialize Map with full dragging and cursor support
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    const centerLat = pickedLocation ? pickedLocation.lat : userLocation.lat;
    const centerLng = pickedLocation ? pickedLocation.lng : userLocation.lng;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: isLocationPicker ? 15 : isMiniPreview ? 13 : 14,
      zoomControl: false,
      attributionControl: !isMiniPreview,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      fadeAnimation: true,
      zoomAnimation: true,
      trackResize: true
    });

    // Explicitly enable drag and interaction handlers
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();

    // OpenStreetMap standard tiles (free, no API key required).
    // A CSS filter (see .leaflet-tile-pane in index.css) recolors these dark to match the app's theme.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Track zoom level & map movement (pan/drag) for dynamic clustering & marker updates
    const handleViewportChange = () => {
      setZoomLevel(map.getZoom());
      setMapViewportVersion(v => v + 1);
    };

    map.on('zoomend', handleViewportChange);
    map.on('moveend', handleViewportChange);

    // Map Click Handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 10000) / 10000;
      const lng = Math.round(e.latlng.lng * 10000) / 10000;

      if (isLocationPicker && onPickLocation) {
        onPickLocation({
          lat,
          lng,
          name: `Selected Venue (${lat.toFixed(3)}, ${lng.toFixed(3)})`
        });
      } else if (!isLocationPicker && !isMiniPreview) {
        setSelectedActivity(null);
        setClickedCoords({ lat, lng });
      }
    });

    mapInstanceRef.current = map;

    // Invalidate size on mount and after layout animations
    const resizeTimers = [0, 50, 150, 300, 600, 1000].map(delay =>
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      }, delay)
    );

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    const targetElem = wrapperRef.current || mapContainerRef.current;
    if (targetElem) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      });
      resizeObserver.observe(targetElem);
      if (mapContainerRef.current && mapContainerRef.current !== targetElem) {
        resizeObserver.observe(mapContainerRef.current);
      }
    }

    return () => {
      resizeTimers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLocationPicker, isMiniPreview]);

  // Update "YOU" User Location Marker and Discovery Radius Ring
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Outer approximate radius halo matching selected discovery radius
    const radiusMeters =
      RADIUS_OPTIONS.find(r => r.value === selectedRadiusKm)?.circleRadiusMeters ||
      Math.min(selectedRadiusKm * 1000, 25000);

    const radiusCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: radiusMeters,
      color: '#FF5C00',
      fillColor: '#FF5C00',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '4, 8'
    }).addTo(map);
    userCircleRef.current = radiusCircle;

    // Center "YOU" Pin with subtle pulsating halo
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-8 w-8 rounded-full bg-[#FF5C00] opacity-35 animate-ping"></span>
        <div class="relative flex items-center justify-center w-7 h-7 bg-[#FF5C00] border-2 border-black rounded-full shadow-[0_0_15px_rgba(255,92,0,0.6)] text-[9px] font-black text-black">
          YOU
        </div>
      </div>
    `;

    const customUserIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-loc-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: customUserIcon,
      zIndexOffset: 1000
    }).addTo(map);

    userMarker.bindTooltip(
      `<div class="text-xs font-bold px-2.5 py-1 text-slate-100 bg-[#161722] rounded-xl border border-white/10 shadow-lg">
        📍 You are here · Approximate Discovery Area
      </div>`,
      { permanent: false, direction: 'top', className: 'activity-map-tooltip' }
    );
    userMarkerRef.current = userMarker;

    return () => {
      if (userCircleRef.current) userCircleRef.current.remove();
      if (userMarkerRef.current) userMarkerRef.current.remove();
    };
  }, [userLocation, selectedRadiusKm]);

  // Update Location Picker Pin (when hosting activity)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLocationPicker) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (pickedLocation) {
      const pinHtml = `
        <div class="relative flex flex-col items-center justify-center">
          <div class="w-10 h-10 bg-[#FF5C00] rounded-2xl shadow-xl border-2 border-white flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,92,0,0.6)]">
            <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <div class="w-2 h-2 bg-black rounded-full mt-1 border border-white"></div>
        </div>
      `;

      const pickerIcon = L.divIcon({
        html: pinHtml,
        className: 'picker-pin-icon',
        iconSize: [40, 48],
        iconAnchor: [20, 48]
      });

      const marker = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon: pickerIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', e => {
        const markerPos = e.target.getLatLng();
        if (onPickLocation) {
          const lat = Math.round(markerPos.lat * 10000) / 10000;
          const lng = Math.round(markerPos.lng * 10000) / 10000;
          onPickLocation({
            lat,
            lng,
            name: `Selected Venue (${lat.toFixed(3)}, ${lng.toFixed(3)})`
          });
        }
      });

      pickerMarkerRef.current = marker;
    }
  }, [pickedLocation, isLocationPicker, onPickLocation]);

  // Render Clustered and Individual Activity Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || isLocationPicker) return;

    markersLayer.clearLayers();

    // Calculate clusters at current map zoom
    const clusters = clusterActivities(filteredActivities, map, isMiniPreview ? 45 : 55);

    clusters.forEach(cluster => {
      if (cluster.isCluster) {
        // Render Cluster Badge: "[ 8 ] 8 VYBES"
        const count = cluster.activities.length;
        const clusterHtml = `
          <div class="group relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-150 active:scale-95">
            <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#14151D]/95 border-2 border-[#FF5C00] shadow-[0_0_20px_rgba(255,92,0,0.6)] group-hover:shadow-[0_0_25px_rgba(255,92,0,0.85)] group-hover:scale-105 transition-all backdrop-blur-md">
              <span class="text-xs font-bold text-white leading-none">${count}</span>
              <span class="absolute -bottom-1 text-[8px] font-black text-black bg-[#FF5C00] px-1 py-0.2 rounded-full uppercase tracking-wider">
                VYBES
              </span>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: 'activity-custom-marker',
          iconSize: [44, 48],
          iconAnchor: [22, 24]
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });

        // Tooltip showing count of activities in cluster
        marker.bindTooltip(
          `<div class="text-xs font-bold px-2.5 py-1.5 bg-[#14151D] text-white rounded-xl border border-white/15 shadow-2xl space-y-0.5">
            <div class="text-[#FF5C00] text-[10px] font-bold uppercase tracking-wider">${count} Activities in this area</div>
            <div class="text-xs text-slate-300">Click to zoom in</div>
          </div>`,
          { direction: 'top', offset: [0, -16], className: 'activity-map-tooltip' }
        );

        // Click on cluster: smooth zoom in to split the cluster naturally!
        marker.on('click', () => {
          setClickedCoords(null);
          const bounds = L.latLngBounds(
            cluster.activities.map(a => [a.approximateLatitude, a.approximateLongitude])
          );
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        });

        markersLayer.addLayer(marker);
      } else {
        // Individual Activity Marker
        const activity = cluster.activities[0];
        const meta = getCategoryMeta(activity.category);
        const isSelected = selectedActivity?.id === activity.id;
        const isNow = isActivityNow(activity);
        const isFull = activity.participants.length >= activity.maxParticipants;
        const spotsLeft = Math.max(0, activity.maxParticipants - activity.participants.length);

        const markerHtml = `
          <div id="map-pin-${activity.id}" class="group relative flex flex-col items-center justify-center transform transition-transform duration-200 cursor-pointer ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#14151D]/95 border ${
              isSelected
                ? 'border-[#FF5C00] ring-2 ring-[#FF5C00] shadow-[0_0_24px_rgba(255,92,0,0.85)]'
                : 'border-white/15 hover:border-[#FF5C00] shadow-xl hover:shadow-[0_0_16px_rgba(255,92,0,0.35)]'
            } backdrop-blur-md transition-all">
              <span class="text-base leading-none">${meta.emoji}</span>
              ${
                isNow
                  ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5C00] border-2 border-[#14151D] shadow-[0_0_6px_#FF5C00]"></span>`
                  : ''
              }
              <span class="absolute -bottom-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-black bg-[#FF5C00] border border-[#14151D]">
                ${isFull ? 'F' : spotsLeft}
              </span>
            </div>
            <div class="w-1.5 h-1.5 bg-black border border-white/40 rounded-full mx-auto -mt-0.5 shadow-sm"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'activity-custom-marker',
          iconSize: [40, 44],
          iconAnchor: [20, 38]
        });

        const marker = L.marker([activity.approximateLatitude, activity.approximateLongitude], {
          icon: customIcon,
          zIndexOffset: isSelected ? 500 : 100
        });

        // Hover Tooltip
        marker.bindTooltip(
          `<div class="text-xs font-bold px-2.5 py-1.5 bg-[#14151D] text-white rounded-xl border border-white/15 shadow-2xl space-y-0.5 max-w-[200px]">
            <div class="flex items-center gap-1.5 text-[#FF5C00] text-[10px] uppercase font-bold">
              <span>${meta.emoji}</span>
              <span>${activity.category}</span>
              ${isNow ? '<span class="px-1 py-0.1 bg-[#FF5C00] text-black text-[9px] rounded font-black">NOW</span>' : ''}
            </div>
            <p class="font-bold text-white truncate text-xs">${activity.title}</p>
            <div class="text-[10px] text-slate-400 font-medium">${activity.startTime} · ${isFull ? 'Full' : `${spotsLeft} spots left`}</div>
          </div>`,
          { direction: 'top', offset: [0, -18], className: 'activity-map-tooltip' }
        );

        marker.on('click', () => {
          if (isMiniPreview) {
            onSelectActivity(activity);
          } else {
            setClickedCoords(null);
            setSelectedActivity(activity);
            map.panTo([activity.approximateLatitude, activity.approximateLongitude], {
              animate: true,
              duration: 0.3
            });
          }
        });

        markersLayer.addLayer(marker);
      }
    });
  }, [filteredActivities, selectedActivity, zoomLevel, mapViewportVersion, isMiniPreview, isLocationPicker, onSelectActivity]);

  // Center on user location
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return;
    setIsLocating(true);
    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 0.8 });
    setTimeout(() => setIsLocating(false), 800);
  }, [userLocation]);

  // Zoom handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Focus marker from Bottom Sheet
  const handleFocusActivityFromSheet = (activity: Activity) => {
    setSelectedActivity(activity);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([activity.approximateLatitude, activity.approximateLongitude], {
        animate: true,
        duration: 0.35
      });
    }
  };

  return (
    <div
      ref={wrapperRef}
      id="interactive-map-wrapper"
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'relative w-full h-full min-h-0 flex-1'
      } ${
        isMiniPreview ? 'min-h-[240px]' : ''
      } bg-[#0A0A0B] overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col pointer-events-auto [touch-action:pan-x_pan-y]`}
      style={{ pointerEvents: 'auto', touchAction: 'pan-x pan-y' }}
    >
      {/* The Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        id="leaflet-map-element"
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing pointer-events-auto [touch-action:pan-x_pan-y]"
        style={{ pointerEvents: 'auto', touchAction: 'pan-x pan-y' }}
      />

      {/* TOP BAR: Clean Horizontal Filter System & Search (Full Map Only) */}
      {!isLocationPicker && !isMiniPreview && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-2xl z-20 pointer-events-none">
          <MapTopFilterBar
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            selectedCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            nowCount={nowCount}
            totalCount={activities.length}
          />
        </div>
      )}

      {/* MAP CONTROLS: Zoom, Recenter, Radius, Fullscreen & Create a VYBE */}
      {!isMiniPreview && !isLocationPicker && (
        <div className="absolute right-3 top-20 sm:top-20 z-20 pointer-events-none">
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRecenter={handleRecenter}
            isLocating={isLocating}
            selectedRadiusKm={selectedRadiusKm}
            onRadiusChange={setSelectedRadiusKm}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenCreate={
              onOpenCreate ? () => onOpenCreate(userLocation.lat, userLocation.lng) : undefined
            }
          />
        </div>
      )}

      {/* Mini Preview Simple Recenter Button */}
      {isMiniPreview && (
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <button
            onClick={handleRecenter}
            title="Recenter Map"
            className="p-2 rounded-xl bg-[#14151D]/90 hover:bg-[#1C1D28] border border-white/8 text-slate-300 hover:text-[#FF5C00] shadow-lg backdrop-blur-md transition cursor-pointer pointer-events-auto"
          >
            <Locate className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CLICKED COORDS TOAST: Quick-Host on tapped location */}
      {clickedCoords && !isLocationPicker && !isMiniPreview && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-[#14151D]/95 border border-[#FF5C00]/40 shadow-2xl backdrop-blur-xl text-white text-xs pointer-events-auto">
            <MapPin className="w-4 h-4 text-[#FF5C00] shrink-0" />
            <span>Spot selected ({clickedCoords.lat.toFixed(3)}, {clickedCoords.lng.toFixed(3)})</span>
            {onOpenCreate && (
              <button
                onClick={() => {
                  onOpenCreate(clickedCoords.lat, clickedCoords.lng);
                  setClickedCoords(null);
                }}
                className="px-3 py-1 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold transition cursor-pointer"
              >
                Host Here
              </button>
            )}
            <button
              onClick={() => setClickedCoords(null)}
              className="text-slate-400 hover:text-white ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SELECTED ACTIVITY FLOATING PREVIEW CARD (on Map) */}
      <AnimatePresence>
        {selectedActivity && !isLocationPicker && !isMiniPreview && (
          <div className="absolute bottom-20 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-30 pointer-events-none">
            <div className="pointer-events-auto">
              <MapPreviewCard
                activity={selectedActivity}
                userLocation={userLocation}
                currentUser={currentUser}
                onSelect={act => {
                  onSelectActivity(act);
                }}
                onClose={() => setSelectedActivity(null)}
                onQuickJoin={onQuickJoin}
                onOpenSquadChat={onOpenSquadChat}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAGGABLE BOTTOM SHEET / SYNCHRONIZED FEED (Full Map View Only) */}
      {!isLocationPicker && !isMiniPreview && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center">
          <MapBottomSheet
            activities={sortedActivities}
            userLocation={userLocation}
            currentUser={currentUser}
            selectedActivityId={selectedActivity?.id}
            sheetState={sheetState}
            onSheetStateChange={setSheetState}
            onSelectActivity={onSelectActivity}
            onFocusMarker={handleFocusActivityFromSheet}
            onExpandRadius={() => setSelectedRadiusKm(9999)}
            onCreateActivity={onOpenCreate ? () => onOpenCreate(userLocation.lat, userLocation.lng) : undefined}
            onQuickJoin={onQuickJoin}
          />
        </div>
      )}

      {/* EMPTY STATE OVERLAY IF NO ACTIVITIES (when Bottom Sheet is collapsed) */}
      {filteredActivities.length === 0 && !isLocationPicker && !isMiniPreview && sheetState === 'collapsed' && !selectedActivity && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none max-w-sm w-[90%]">
          <div className="p-4 rounded-3xl bg-[#14151D]/95 border border-white/10 shadow-2xl backdrop-blur-xl text-center space-y-2.5 pointer-events-auto">
            <span className="text-2xl">📍</span>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white">Nothing nearby yet</h4>
              <p className="text-xs text-slate-400">
                Try expanding your search area or create your own VYBE.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setSelectedRadiusKm(9999)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition cursor-pointer"
              >
                Show All City VYBES
              </button>
              {onOpenCreate && (
                <button
                  onClick={() => onOpenCreate(userLocation.lat, userLocation.lng)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold transition cursor-pointer"
                >
                  Create a VYBE
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOCATION PICKER INSTRUCTION BANNER (When creating activity venue) */}
      {isLocationPicker && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between p-3 rounded-2xl bg-[#14151D]/95 border border-[#FF5C00]/40 shadow-2xl backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <MapPin className="w-4 h-4 text-[#FF5C00] shrink-0" />
            <span className="text-xs font-semibold text-slate-200">
              Click map or drag the orange pin to select venue location
            </span>
          </div>
          {pickedLocation && (
            <span className="text-[11px] font-mono text-[#FF5C00] font-bold hidden sm:inline">
              {pickedLocation.lat.toFixed(3)}, {pickedLocation.lng.toFixed(3)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
