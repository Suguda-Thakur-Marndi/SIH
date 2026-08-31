'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  Search,
  RotateCcw,
  ChevronRight,
  Phone,
  Sparkles,
  TrendingUp,
  X,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  Navigation,
  Compass,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { DistressFarmer } from '@/app/api/officer/farmers/route';

// MapLibre GL import
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface DistrictDistressMapProps {
  initialDistrict?: string;
  className?: string;
  onFarmerSelect?: (farmer: DistressFarmer) => void;
}

// Distance Calculation Helper (Haversine formula in KM)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function DistrictDistressMap({
  initialDistrict = 'Mayurbhanj',
  className = '',
  onFarmerSelect,
}: DistrictDistressMapProps) {
  const { t } = useLanguage();

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [farmers, setFarmers] = useState<DistressFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Real-Time Location Tracker State (from Real Time Tracker integration)
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Location Search State
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const onFarmerSelectRef = useRef(onFarmerSelect);
  useEffect(() => {
    onFarmerSelectRef.current = onFarmerSelect;
  }, [onFarmerSelect]);

  // Master Mayurbhanj & Regional Location Hubs
  const MAYURBHANJ_LOCATIONS = useMemo(() => [
    { name: 'Baripada Town & Sadar', type: 'Sub-Division Hub', block: 'Baripada', lat: 21.9324, lng: 86.7351 },
    { name: 'Betnoti Block', type: 'Block Headquarter', block: 'Betnoti', lat: 21.7382, lng: 86.8524 },
    { name: 'Badasahi Block', type: 'Block Headquarter', block: 'Badasahi', lat: 21.7241, lng: 86.7583 },
    { name: 'Kuliana Block', type: 'Block Headquarter', block: 'Kuliana', lat: 22.0425, lng: 86.6342 },
    { name: 'Rairangpur Sub-Division', type: 'Sub-Division Hub', block: 'Rairangpur', lat: 22.2684, lng: 86.1682 },
    { name: 'Udala Block', type: 'Block Headquarter', block: 'Udala', lat: 21.5842, lng: 86.5721 },
    { name: 'Karanjia Block', type: 'Block Headquarter', block: 'Karanjia', lat: 21.7845, lng: 85.9723 },
    { name: 'Jashipur (Similipal Buffer)', type: 'Forest & Agri Hub', block: 'Jashipur', lat: 21.9681, lng: 86.0824 },
    { name: 'Morada Block', type: 'Block Headquarter', block: 'Morada', lat: 21.8482, lng: 86.9925 },
    { name: 'Samakhunta Block', type: 'Block Headquarter', block: 'Samakhunta', lat: 21.9083, lng: 86.7121 },
    { name: 'Khunta Block', type: 'Block Headquarter', block: 'Khunta', lat: 21.6243, lng: 86.6281 },
    { name: 'Bangriposi Ghati & Mandi', type: 'Agri Market Hub', block: 'Bangriposi', lat: 22.1582, lng: 86.5342 },
    { name: 'Bahalda Block', type: 'Block Headquarter', block: 'Bahalda', lat: 22.4010, lng: 86.0850 },
    { name: 'Bisoi Block', type: 'Block Headquarter', block: 'Bisoi', lat: 22.1890, lng: 86.4120 },
    { name: 'Kaptipada Block', type: 'Block Headquarter', block: 'Kaptipada', lat: 21.5210, lng: 86.5320 },
    { name: 'Thakurmunda Block', type: 'Block Headquarter', block: 'Thakurmunda', lat: 21.5120, lng: 86.0120 },
    { name: 'Saraskana Block', type: 'Block Headquarter', block: 'Saraskana', lat: 22.2540, lng: 86.6120 },
    { name: 'Suliapada Block', type: 'Block Headquarter', block: 'Suliapada', lat: 21.9840, lng: 86.9210 },
    { name: 'Kusumi Block', type: 'Block Headquarter', block: 'Kusumi', lat: 22.3120, lng: 86.2150 },
    { name: 'Jamda Block', type: 'Block Headquarter', block: 'Jamda', lat: 22.1430, lng: 86.1340 },
    { name: 'Tiring Block', type: 'Block Headquarter', block: 'Tiring', lat: 22.5230, lng: 86.0450 },
    { name: 'Bijatala Block', type: 'Block Headquarter', block: 'Bijatala', lat: 22.3850, lng: 86.3210 },
    { name: 'Raruan Block', type: 'Block Headquarter', block: 'Raruan', lat: 21.8920, lng: 85.8450 },
    { name: 'Sukruli Block', type: 'Block Headquarter', block: 'Sukruli', lat: 21.8420, lng: 85.9120 },
    { name: 'Gopabandhunagar Block', type: 'Block Headquarter', block: 'Gopabandhunagar', lat: 21.6120, lng: 86.7450 },
    { name: 'Rasgovindpur Block', type: 'Block Headquarter', block: 'Rasgovindpur', lat: 21.8150, lng: 86.9320 },
  ], []);

  // Universal Geocoded Locations State
  const [geocodeResults, setGeocodeResults] = useState<any[]>([]);
  const [isGeocodeLoading, setIsGeocodeLoading] = useState(false);

  // Debounced Universal Geocoding fetch
  useEffect(() => {
    if (!locationSearchQuery.trim()) {
      fetch('/api/geocode')
        .then((res) => res.json())
        .then((data) => setGeocodeResults(data.results || []))
        .catch(() => {});
      return;
    }

    setIsGeocodeLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(locationSearchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGeocodeResults(data.results || []);
          }
        })
        .catch((err) => console.warn('Geocoding error:', err))
        .finally(() => setIsGeocodeLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  // Handle Universal Location Selection & FlyTo (Countries, States, Districts, Villages)
  const handleSelectUniversalLocation = (loc: {
    name: string;
    displayName?: string;
    type: string;
    lat: number;
    lng: number;
    zoom?: number;
    block?: string;
  }) => {
    setLocationSearchQuery(loc.displayName || loc.name);
    setIsLocationDropdownOpen(false);

    if (loc.block) {
      setSelectedBlock(loc.block);
    } else {
      setSelectedBlock('all');
    }

    const map = mapRef.current;
    if (!map) return;

    // Drop or update search location beacon
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
    }

    const targetZoom = loc.zoom || (loc.type === 'Country' ? 4.5 : loc.type === 'State' ? 7.0 : loc.type === 'District' ? 9.5 : 12.5);

    const typeBadge =
      loc.type === 'Country'
        ? '🌍 Country'
        : loc.type === 'State'
        ? '🏛️ State'
        : loc.type === 'District'
        ? '🏙️ District'
        : '📍 Village / Block';

    const el = document.createElement('div');
    el.className = 'relative flex flex-col items-center pointer-events-none z-50';
    el.innerHTML = `
      <div class="absolute -top-10 whitespace-nowrap bg-[#1A1A1A] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-2xl border border-white/20 flex items-center gap-1.5">
        <span class="text-[#CFE362]">${loc.name}</span>
        <span class="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-md font-medium text-neutral-200">${typeBadge}</span>
      </div>
      <div class="w-9 h-9 rounded-full bg-emerald-500/30 animate-ping absolute -top-1"></div>
      <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
        🎯
      </div>
    `;

    locationMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([loc.lng, loc.lat])
      .addTo(map);

    map.flyTo({
      center: [loc.lng, loc.lat],
      zoom: targetZoom,
      pitch: 0,
      duration: 1100,
    });
  };

  // Filters State
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Farmer state
  const [selectedFarmer, setSelectedFarmer] = useState<DistressFarmer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInterventionSuccess, setIsInterventionSuccess] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // 1. Fetch Farmer Data from Enriched Backend API
  const fetchFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/officer/farmers?district=${encodeURIComponent(initialDistrict)}`);
      if (!res.ok) {
        throw new Error(`Failed to load farmer distress telemetry (HTTP ${res.status})`);
      }
      const data = await res.json();
      const farmerList: DistressFarmer[] = data.farmers || [];
      setFarmers(farmerList);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('[DistrictDistressMap] Telemetry fetch error:', err);
      setError(err.message || 'Error fetching telemetry');
    } finally {
      setLoading(false);
    }
  }, [initialDistrict]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  // Real-Time Location Tracker: watchPosition implementation
  const toggleLiveLocation = useCallback(() => {
    if (isTrackingLocation) {
      // Stop tracking
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      setIsTrackingLocation(false);
      setLocationStatus(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('Acquiring GPS Signal...');
    setIsTrackingLocation(true);

    const updateMarkerPosition = (lat: number, lng: number) => {
      setLiveLocation({ latitude: lat, longitude: lng });
      setLocationStatus('GPS Active');

      const map = mapRef.current;
      if (!map) return;

      if (!userMarkerRef.current) {
        // Create custom pulsating radar marker
        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center';
        el.innerHTML = `
          <div class="absolute w-9 h-9 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div class="absolute -top-7 whitespace-nowrap bg-blue-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none">
            📍 You (Field Unit)
          </div>
        `;

        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat([lng, lat]);
      }

      // Fly smoothly to location
      map.flyTo({
        center: [lng, lat],
        zoom: 12.5,
        speed: 1.2,
      });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarkerPosition(latitude, longitude);
      },
      (geoError) => {
        console.warn('Live location error, using Mayurbhanj Field Office simulation:', geoError.message);
        // Fallback simulation: Baripada Field Unit coordinates
        const defaultLat = 21.932;
        const defaultLng = 86.735;
        updateMarkerPosition(defaultLat, defaultLng);
        setLocationStatus('Simulated Field GPS (Baripada)');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8000,
      }
    );
  }, [isTrackingLocation]);

  // Clean up location tracker on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
    };
  }, []);

  // 2. Filtered farmers list
  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      // Risk filter
      if (selectedRisk !== 'all' && farmer.riskLevel.toLowerCase() !== selectedRisk.toLowerCase()) {
        return false;
      }
      // Crop filter
      if (selectedCrop !== 'all' && !farmer.crop.toLowerCase().includes(selectedCrop.toLowerCase())) {
        return false;
      }
      // Block filter
      if (selectedBlock !== 'all' && farmer.block.toLowerCase() !== selectedBlock.toLowerCase()) {
        return false;
      }
      // Reason filter
      if (
        selectedReason !== 'all' &&
        !farmer.primaryReason.toLowerCase().includes(selectedReason.toLowerCase()) &&
        !farmer.riskFactors.some((rf) => rf.toLowerCase().includes(selectedReason.toLowerCase()))
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = farmer.name?.toLowerCase().includes(q);
        const matchId = farmer.farmerId?.toLowerCase().includes(q) || farmer.id?.toLowerCase().includes(q);
        const matchVillage = farmer.village?.toLowerCase().includes(q);
        const matchBlock = farmer.block?.toLowerCase().includes(q);
        const matchCrop = farmer.crop?.toLowerCase().includes(q);
        const matchReason = farmer.primaryReason?.toLowerCase().includes(q);
        const matchFactors = farmer.riskFactors?.some((rf) => rf.toLowerCase().includes(q));
        if (!matchName && !matchId && !matchVillage && !matchBlock && !matchCrop && !matchReason && !matchFactors) return false;
      }
      return true;
    });
  }, [farmers, selectedRisk, selectedCrop, selectedBlock, selectedReason, searchQuery]);

  const availableCrops = useMemo(() => {
    const crops = Array.from(
      new Set(farmers.map((f) => f.crop.split(' ')[0].replace(/[^a-zA-Z]/g, '')))
    ).filter(Boolean);
    return crops.sort();
  }, [farmers]);

  const availableBlocks = useMemo(() => {
    const blocks = Array.from(
      new Set(farmers.map((f) => f.block).filter(Boolean))
    );
    return blocks.sort();
  }, [farmers]);

  // Key Statistics
  const stats = useMemo(() => {
    const total = filteredFarmers.length;
    const high = filteredFarmers.filter((f) => f.riskLevel === 'HIGH').length;
    const moderate = filteredFarmers.filter((f) => f.riskLevel === 'MODERATE').length;
    const low = filteredFarmers.filter((f) => f.riskLevel === 'LOW').length;
    const increasing = filteredFarmers.filter((f) => f.riskTrend === 'INCREASING').length;
    return { total, high, moderate, low, increasing };
  }, [filteredFarmers]);

  const farmersRef = useRef<DistressFarmer[]>([]);
  useEffect(() => {
    farmersRef.current = farmers;
  }, [farmers]);

  // 3. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const rasterOsmStyle: maplibregl.StyleSpecification = {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: rasterOsmStyle,
        center: [86.735, 21.932], // Centered on Baripada, Mayurbhanj, Odisha
        zoom: 9.6,
        minZoom: 6,
        maxZoom: 18,
        pitch: 0,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.FullscreenControl(), 'top-right');

      // Auto-resize on window changes
      const handleResize = () => map.resize();
      window.addEventListener('resize', handleResize);

      map.on('error', (e) => {
        console.warn('MapLibre GL non-fatal notice:', e);
      });

      map.on('load', () => {
        setTimeout(() => map.resize(), 150);

        // Add GeoJSON source for clustered farmers
        map.addSource('farmer-distress', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 45,
        });

        // 1. Cluster background circles
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'farmer-distress',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#3B82F6', // Blue for <= 3
              4,
              '#F59E0B', // Amber for 4-9
              10,
              '#EF4444', // Red for >= 10
            ],
            'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 30],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        });

        // 2. Cluster text counts
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'farmer-distress',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Regular'],
            'text-size': 13,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        // 3. Unclustered Individual Farmer Points - Outer Glow
        map.addLayer({
          id: 'unclustered-glow',
          type: 'circle',
          source: 'farmer-distress',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match',
              ['get', 'riskLevel'],
              'HIGH',
              '#EF4444',
              'MODERATE',
              '#F59E0B',
              '#10B981',
            ],
            'circle-radius': [
              'match',
              ['get', 'riskLevel'],
              'HIGH',
              20,
              'MODERATE',
              15,
              12,
            ],
            'circle-opacity': 0.35,
            'circle-blur': 0.5,
          },
        });

        // 4. Unclustered Individual Farmer Points - Core Marker
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'farmer-distress',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match',
              ['get', 'riskLevel'],
              'HIGH',
              '#EF4444',
              'MODERATE',
              '#F59E0B',
              '#10B981',
            ],
            'circle-radius': [
              'match',
              ['get', 'riskLevel'],
              'HIGH',
              10,
              'MODERATE',
              8,
              7,
            ],
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Cluster Click -> Zoom in
        map.on('click', 'clusters', async (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (!features.length) return;
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('farmer-distress') as maplibregl.GeoJSONSource;
          if (source && clusterId !== undefined) {
            try {
              const zoom = await source.getClusterExpansionZoom(clusterId);
              const geom = features[0].geometry as GeoJSON.Point;
              map.easeTo({
                center: geom.coordinates as [number, number],
                zoom: zoom || (map.getZoom() + 2),
                duration: 600,
              });
            } catch (cErr) {
              console.warn('Cluster zoom error', cErr);
            }
          }
        });

        // Unclustered Point Click -> Open Details
        map.on('click', 'unclustered-point', (e) => {
          if (!e.features || !e.features.length) return;
          const feat = e.features[0];
          const farmerId = feat.properties?.id;
          const fullFarmer = farmersRef.current.find((f) => f.id === farmerId);
          if (fullFarmer) {
            setSelectedFarmer(fullFarmer);
            setIsDrawerOpen(true);
            if (onFarmerSelectRef.current) onFarmerSelectRef.current(fullFarmer);

            const geom = feat.geometry as GeoJSON.Point;
            map.flyTo({
              center: geom.coordinates as [number, number],
              zoom: Math.max(map.getZoom(), 12.5),
              essential: true,
              duration: 700,
            });
          }
        });

        // Change Cursor on hover
        map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''));
        map.on('mouseenter', 'unclustered-point', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'unclustered-point', () => (map.getCanvas().style.cursor = ''));
      });

      mapRef.current = map;
    } catch (mErr) {
      console.warn('[MapLibre Init fallback]:', mErr);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Center on farmer when selected from search or list
  const handleSelectFarmer = useCallback((farmer: DistressFarmer) => {
    setSelectedFarmer(farmer);
    setIsDrawerOpen(true);
    if (onFarmerSelect) onFarmerSelect(farmer);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [farmer.longitude, farmer.latitude],
        zoom: 13,
        duration: 900,
        pitch: 0,
      });
    }
  }, [onFarmerSelect]);

  // 4. Render Rich Interactive Farmer Markers & GeoJSON on Map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const renderMarkers = () => {
      if (!filteredFarmers.length) return;

      const bounds = new maplibregl.LngLatBounds();

      filteredFarmers.forEach((farmer) => {
        const lng = Number(farmer.longitude);
        const lat = Number(farmer.latitude);
        if (isNaN(lng) || isNaN(lat) || (lng === 0 && lat === 0)) return;

        bounds.extend([lng, lat]);

        const isHigh = farmer.riskLevel === 'HIGH';
        const isModerate = farmer.riskLevel === 'MODERATE';

        const colorBg = isHigh ? '#EF4444' : isModerate ? '#F59E0B' : '#10B981';
        const ringColor = isHigh ? 'rgba(239, 68, 68, 0.4)' : isModerate ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.25)';

        // Create Custom HTML Pin
        const el = document.createElement('div');
        el.className = 'group relative flex flex-col items-center cursor-pointer select-none';
        el.style.zIndex = isHigh ? '50' : isModerate ? '40' : '30';

        el.innerHTML = `
          <!-- Hover Popup Tooltip -->
          <div class="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap bg-[#1A1A1A]/95 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xl backdrop-blur-md border border-white/20 flex flex-col items-center">
            <span class="text-[#CFE362]">${farmer.name} (${farmer.farmerId})</span>
            <span class="text-[10px] text-neutral-300 font-medium">${farmer.village} • ${farmer.crop} • Score: ${farmer.riskScore}</span>
            <div class="w-2 h-2 bg-[#1A1A1A]/95 rotate-45 -mb-2 mt-0.5"></div>
          </div>

          <!-- Pulsing Ring for High Risk -->
          ${
            isHigh
              ? `<div class="absolute -inset-2.5 rounded-full animate-ping" style="background-color: ${ringColor};"></div>`
              : ''
          }

          <!-- Pin Badge -->
          <div class="relative flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-extrabold text-xs shadow-lg border-2 border-white transition-transform duration-200 group-hover:scale-125" style="background-color: ${colorBg};">
            <span>${isHigh ? '🔴' : isModerate ? '🟡' : '🟢'}</span>
            <span>${farmer.riskScore}</span>
          </div>

          <!-- Pin Stem & Shadow -->
          <div class="w-1.5 h-1.5 rounded-full mt-0.5" style="background-color: ${colorBg};"></div>
          <span class="text-[9px] font-black text-[#1A1A1A] bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs mt-0.5 border border-black/10 whitespace-nowrap">
            ${farmer.block}
          </span>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSelectFarmer(farmer);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'top' })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit map bounds to frame all matching farmers safely
      if (!bounds.isEmpty()) {
        if (filteredFarmers.length > 1) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 600 });
        } else if (filteredFarmers.length === 1) {
          const lng = Number(filteredFarmers[0].longitude);
          const lat = Number(filteredFarmers[0].latitude);
          if (!isNaN(lng) && !isNaN(lat)) {
            map.flyTo({
              center: [lng, lat],
              zoom: 12.5,
              duration: 600,
            });
          }
        }
      }
    };

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.once('load', renderMarkers);
    }
  }, [filteredFarmers, handleSelectFarmer]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedRisk('all');
    setSelectedCrop('all');
    setSelectedBlock('all');
    setSelectedReason('all');
    setSearchQuery('');
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [86.735, 21.932],
        zoom: 9.3,
        pitch: 25,
        duration: 800,
      });
    }
  };

  // Quick Action: Trigger Advisory
  const handleTriggerAdvisory = (farmer: DistressFarmer) => {
    setActionMessage(`Emergency Distress Advisory SMS & IVR dispatched to ${farmer.name} (${farmer.phone})`);
    setIsInterventionSuccess(true);
    setTimeout(() => {
      setIsInterventionSuccess(false);
      setActionMessage(null);
    }, 4500);
  };

  return (
    <div className={`flex flex-col h-full space-y-4 ${className}`}>
      {/* 1. Header & Live District Status Card (White Blur Transparent) */}
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-4 md:p-6 shadow-xl text-[#1A1A1A]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#CFE362] font-bold shadow-md">
                <MapPin className="w-4 h-4" />
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                {t('distress_map', 'District Distress Map')}
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-700 border border-red-500/25 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>LIVE TELEMETRY</span>
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium text-[#6B6B66]">
              {initialDistrict} District, Odisha • Real-time Spatial Distress Intelligence & High-Risk Triage
            </p>
          </div>

          {/* Quick Refresh & Last Updated */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Live GPS Field Tracker Toggle Button (Integrated from Real Time Tracker) */}
            <button
              onClick={toggleLiveLocation}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition shadow-sm cursor-pointer hover:scale-105 ${
                isTrackingLocation
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30'
                  : 'bg-white/90 hover:bg-white text-blue-800 border-blue-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isTrackingLocation ? 'animate-pulse text-white' : 'text-blue-600'}`} />
              <span>{isTrackingLocation ? 'GPS Tracking Active' : 'Locate My Field Unit'}</span>
            </button>

            {locationStatus && (
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60 hidden sm:inline-block">
                {locationStatus}
              </span>
            )}

            <span className="text-xs font-semibold text-[#6B6B66] bg-white/60 px-3 py-1.5 rounded-full border border-black/5 shadow-inner">
              Updated: {lastUpdated}
            </span>
            <button
              onClick={fetchFarmers}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] border border-black/10 text-xs font-bold shadow-sm transition hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/agriculture-officer-dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#CFE362] hover:bg-[#c2d752] text-[#1A1A1A] border border-black/10 text-xs font-bold shadow-sm transition hover:scale-105"
            >
              <span>Command Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Micro Statistics Bar (KPI Summary) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-black/5">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-black/5 shadow-xs">
            <div className="text-[11px] font-bold text-[#6B6B66] uppercase tracking-wider">
              Farmers Mapped
            </div>
            <div className="text-xl font-extrabold text-[#1A1A1A] mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Across {availableBlocks.length || 26} Blocks</div>
          </div>

          <div className="bg-red-50/70 backdrop-blur-md rounded-2xl p-3 border border-red-200/60 shadow-xs">
            <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              High Distress (70+)
            </div>
            <div className="text-xl font-extrabold text-red-900 mt-0.5">{stats.high}</div>
            <div className="text-[10px] text-red-700 font-bold mt-0.5">Priority Triage Required</div>
          </div>

          <div className="bg-amber-50/70 backdrop-blur-md rounded-2xl p-3 border border-amber-200/60 shadow-xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Moderate Risk (40-69)
            </div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">{stats.moderate}</div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Advisory Dispatched</div>
          </div>

          <div className="bg-emerald-50/70 backdrop-blur-md rounded-2xl p-3 border border-emerald-200/60 shadow-xs">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Low Risk (0-39)
            </div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{stats.low}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Optimal Vegetative</div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-black/5 shadow-xs">
            <div className="text-[11px] font-bold text-[#6B6B66] uppercase tracking-wider">
              Distress Trend
            </div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.increasing}</span>
            </div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Increasing 30-day slope</div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Filter & Search Bar (White Blur Transparent) */}
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-4 shadow-xl text-[#1A1A1A] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2.5">
          {/* A. Location Search with Dropdown Autocomplete */}
          <div className="lg:col-span-2 relative">
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input
                type="text"
                placeholder="📍 Search Location, Block, Village..."
                value={locationSearchQuery}
                onFocus={() => setIsLocationDropdownOpen(true)}
                onChange={(e) => {
                  setLocationSearchQuery(e.target.value);
                  setIsLocationDropdownOpen(true);
                }}
                className="w-full pl-9.5 pr-8 py-2 rounded-2xl bg-white/95 border border-emerald-300/80 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-500 shadow-inner"
              />
              {locationSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationSearchQuery('');
                    setIsLocationDropdownOpen(false);
                    if (locationMarkerRef.current) locationMarkerRef.current.remove();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Universal Location Autocomplete Suggestions Dropdown */}
            {isLocationDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-black/5">
                <div className="p-2.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 flex items-center justify-between rounded-t-2xl">
                  <span>
                    {locationSearchQuery ? `Search Results (${geocodeResults.length})` : 'Popular Locations & Hubs'}
                  </span>
                  {isGeocodeLoading && <span className="text-emerald-600 animate-pulse">Searching...</span>}
                </div>

                {geocodeResults.length === 0 && !isGeocodeLoading && (
                  <div className="p-4 text-center text-xs text-neutral-400 font-medium">
                    No matching location found. Try searching a country (e.g. India, USA), state (e.g. Odisha, Maharashtra), or district.
                  </div>
                )}

                {geocodeResults.map((loc) => {
                  const typeIcon =
                    loc.type === 'Country'
                      ? '🌍'
                      : loc.type === 'State'
                      ? '🏛️'
                      : loc.type === 'District'
                      ? '🏙️'
                      : '📍';

                  const badgeColor =
                    loc.type === 'Country'
                      ? 'bg-blue-100 text-blue-800'
                      : loc.type === 'State'
                      ? 'bg-purple-100 text-purple-800'
                      : loc.type === 'District'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800';

                  return (
                    <button
                      key={loc.id || `${loc.lat}-${loc.lng}`}
                      type="button"
                      onClick={() => handleSelectUniversalLocation(loc)}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-emerald-50 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-base shrink-0 group-hover:scale-125 transition-transform">{typeIcon}</span>
                        <div className="truncate">
                          <div className="font-bold text-[#1A1A1A] truncate">{loc.displayName || loc.name}</div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded font-bold ${badgeColor}`}>{loc.type}</span>
                            {loc.country && <span>• {loc.country}</span>}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0 ml-2">
                        {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. Farmer / Crop / Reason Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search farmer name, crop, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-2xl bg-white/90 border border-black/10 focus:border-[#1A1A1A] focus:outline-none text-xs font-semibold text-[#1A1A1A] placeholder:text-neutral-400 shadow-inner"
            />
          </div>

          {/* C. Block Select */}
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-2.5 py-2 rounded-2xl bg-white/90 border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer shadow-inner"
            >
              <option value="all">Block: All</option>
              {availableBlocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* D. Risk Select */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-2.5 py-2 rounded-2xl bg-white/90 border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer shadow-inner"
            >
              <option value="all">Risk: All</option>
              <option value="high">🔴 High (70+)</option>
              <option value="moderate">🟡 Moderate (40-69)</option>
              <option value="low">🟢 Low (0-39)</option>
            </select>
          </div>

          {/* E. Crop Select */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-2.5 py-2 rounded-2xl bg-white/90 border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer shadow-inner"
            >
              <option value="all">Crop: All</option>
              {availableCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* F. Reset Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleResetFilters();
                setLocationSearchQuery('');
                setIsLocationDropdownOpen(false);
                if (locationMarkerRef.current) locationMarkerRef.current.remove();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] text-xs font-bold border border-black/10 transition cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Universal Quick-Jump Chips Bar (Country, States, Districts, Blocks) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-black/5">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Navigation className="w-3 h-3 text-emerald-600" />
            Quick Jumps:
          </span>

          {/* 1. Country & State Level Jumps */}
          <button
            type="button"
            onClick={() => handleSelectUniversalLocation({ name: 'India', type: 'Country', lat: 20.5937, lng: 78.9629, zoom: 4.8 })}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200 shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🇮🇳</span>
            <span>All India</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectUniversalLocation({ name: 'Odisha', type: 'State', lat: 20.9517, lng: 85.0985, zoom: 7.2 })}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200 shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🏛️</span>
            <span>Odisha State</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectUniversalLocation({ name: 'Maharashtra', type: 'State', lat: 19.7515, lng: 75.7139, zoom: 6.8 })}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200 shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🏛️</span>
            <span>Maharashtra</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectUniversalLocation({ name: 'Punjab', type: 'State', lat: 31.1471, lng: 75.3412, zoom: 7.5 })}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200 shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🏛️</span>
            <span>Punjab</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectUniversalLocation({ name: 'Mayurbhanj', type: 'District', lat: 21.9324, lng: 86.7351, zoom: 9.3 })}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300 shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🗺️</span>
            <span>Mayurbhanj District</span>
          </button>

          {/* 2. Block Level Jumps */}
          {MAYURBHANJ_LOCATIONS.slice(0, 6).map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => handleSelectUniversalLocation(loc)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedBlock.toLowerCase() === loc.block.toLowerCase()
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white/80 hover:bg-white text-neutral-700 border-black/10'
              }`}
            >
              <span>📍</span>
              <span>{loc.block}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Interactive Map & Details Split Container */}
      <div className="relative flex-1 min-h-[580px] w-full rounded-3xl overflow-hidden glass bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl flex flex-col">
        {/* Action toast notification */}
        <AnimatePresence>
          {isInterventionSuccess && actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-emerald-950/90 backdrop-blur-xl text-white px-5 py-2.5 rounded-full border border-emerald-400/40 shadow-2xl flex items-center gap-2.5 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Canvas Container */}
        <div ref={mapContainer} className="relative flex-1 w-full h-[640px] min-h-[580px] rounded-2xl overflow-hidden shadow-inner" />

        {/* Floating Map Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-[99] bg-white/90 backdrop-blur-xl border border-white/80 p-3 rounded-2xl shadow-xl text-[#1A1A1A] flex flex-col gap-1.5 text-xs">
          <div className="font-bold text-[11px] text-[#6B6B66] uppercase tracking-wider border-b border-black/5 pb-1">
            Distress Level Legend
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
            <span>High Risk (70–100)</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span>Moderate (40–69)</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Low Risk (0–39)</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[100] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1A1A1A] border-t-[#CFE362] rounded-full animate-spin" />
            <span className="text-sm font-bold text-[#1A1A1A]">
              Loading Spatial Distress Telemetry...
            </span>
          </div>
        )}

        {/* Error Overlay */}
        {error && !loading && (
          <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h3 className="text-base font-bold text-[#1A1A1A]">Unable to Load Distress Telemetry</h3>
            <p className="text-xs text-[#6B6B66] max-w-sm">{error}</p>
            <button
              onClick={fetchFarmers}
              className="px-4 py-2 rounded-full bg-[#1A1A1A] text-white text-xs font-bold hover:scale-105 transition"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* 5. Selected Farmer Sliding Detail Drawer (Right Panel) */}
        <AnimatePresence>
          {isDrawerOpen && selectedFarmer && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-0 right-0 bottom-0 z-[101] w-full sm:w-96 bg-white/95 backdrop-blur-2xl border-l border-white/80 shadow-2xl p-5 overflow-y-auto text-[#1A1A1A] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                        selectedFarmer.riskLevel === 'HIGH'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : selectedFarmer.riskLevel === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {selectedFarmer.riskLevel} DISTRESS
                    </span>
                    <span className="text-[11px] font-bold text-neutral-400">
                      {selectedFarmer.farmerId}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Farmer Profile Info */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-[#CFE362] font-black text-base flex items-center justify-center shadow-md">
                    {selectedFarmer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#1A1A1A]">{selectedFarmer.name}</h3>
                    <p className="text-xs font-semibold text-neutral-500">
                      {selectedFarmer.village}, {selectedFarmer.block}
                    </p>
                  </div>
                </div>

                {/* Distress Risk Score Gauge */}
                <div className="mt-5 p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#6B6B66]">Distress Score</span>
                    <span
                      className={`text-lg font-black ${
                        selectedFarmer.riskScore >= 70
                          ? 'text-red-600'
                          : selectedFarmer.riskScore >= 40
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedFarmer.riskScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-200 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedFarmer.riskScore >= 70
                          ? 'bg-red-500'
                          : selectedFarmer.riskScore >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedFarmer.riskScore}%` }}
                    />
                  </div>
                  <div className="mt-2.5 text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Primary Cause: {selectedFarmer.primaryReason}</span>
                  </div>
                </div>

                {/* Agronomic Indicators Grid */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs font-semibold">
                  <div className="p-2.5 rounded-xl bg-white border border-black/5">
                    <div className="text-[10px] text-neutral-400 uppercase">Crop & Land</div>
                    <div className="font-bold text-[#1A1A1A] mt-0.5">{selectedFarmer.crop}</div>
                    <div className="text-[10px] text-neutral-500">{selectedFarmer.landArea}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-black/5">
                    <div className="text-[10px] text-neutral-400 uppercase">Soil Moisture</div>
                    <div className="font-bold text-blue-700 mt-0.5">{selectedFarmer.soilMoisture}%</div>
                    <div className="text-[10px] text-neutral-500">Deficit (-32%)</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-black/5">
                    <div className="text-[10px] text-neutral-400 uppercase">Rainfall Deviation</div>
                    <div className="font-bold text-red-700 mt-0.5">-{selectedFarmer.rainfallRisk}%</div>
                    <div className="text-[10px] text-neutral-500">Deficit vs 30d Avg</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-black/5">
                    <div className="text-[10px] text-neutral-400 uppercase">Satellite NDVI</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{selectedFarmer.ndvi}</div>
                    <div className="text-[10px] text-neutral-500">Moderate Canopy</div>
                  </div>
                </div>

                {/* Financial & Insurance Status */}
                <div className="mt-4 p-3 rounded-xl bg-white border border-black/5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Credit / KCC:</span>
                    <span className="font-bold text-[#1A1A1A]">{selectedFarmer.loanStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">PMFBY Insurance:</span>
                    <span className="font-bold text-emerald-700">{selectedFarmer.insuranceStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Last Contacted:</span>
                    <span className="font-semibold text-neutral-700">{selectedFarmer.lastContact}</span>
                  </div>
                </div>

                {/* Contributing Risk Factors List */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Distress Factors
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFarmer.riskFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 border border-black/5 text-neutral-800"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Distance & GPS Navigation Banner (from Real Time Tracker) */}
                {(() => {
                  const officerLat = liveLocation?.latitude || 21.932;
                  const officerLng = liveLocation?.longitude || 86.735;
                  const distanceKm = calculateDistanceKm(
                    officerLat,
                    officerLng,
                    selectedFarmer.latitude,
                    selectedFarmer.longitude
                  );
                  const travelTimeMin = Math.max(3, Math.ceil(distanceKm * 2.2));

                  return (
                    <div className="mt-4 p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-blue-600 animate-spin-slow" />
                          <span>Field Unit Proximity</span>
                        </div>
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                          {distanceKm} km
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-700 font-medium mt-1">
                        Est. Travel Time: <strong>~{travelTimeMin} mins</strong> from your {liveLocation ? 'live GPS position' : 'Baripada field HQ'}
                      </p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFarmer.latitude},${selectedFarmer.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition hover:scale-[1.02]"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Turn-by-Turn GPS Navigation</span>
                      </a>
                    </div>
                  );
                })()}
              </div>

              {/* Action Interventions Footer */}
              <div className="pt-4 border-t border-black/10 mt-6 space-y-2">
                <button
                  onClick={() => handleTriggerAdvisory(selectedFarmer)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trigger Advisory / SMS Alert</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedFarmer.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1A1A1A] text-xs font-bold border border-black/10 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Call Farmer</span>
                  </a>

                  <Link
                    href={`/officer-dashboard/farmers/${selectedFarmer.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition hover:scale-[1.02]"
                  >
                    <span>Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
