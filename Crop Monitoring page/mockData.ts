import { RegisteredCrop, WeatherDay, ActivityType, ActivityBadgeStyle } from "./types";

export const INITIAL_CROPS: RegisteredCrop[] = [
  {
    id: "crop-paddy-01",
    name: "Paddy (Kharif Rice)",
    variety: "MTU-1010 (Basmati/Swarna)",
    cropType: "Cereal Grain",
    icon: "🌾",
    landArea: "2.5 Acres",
    location: "Plot No. 4, Baripada Block",
    district: "Mayurbhanj",
    state: "Odisha",
    sowingDate: "2026-08-15",
    expectedHarvestDate: "2026-12-13",
    harvestWindow: "13 Dec – 18 Dec 2026",
    expectedYield: "48 Quintals / Acre (120 Qtl Total)",
    estimatedRevenue: "₹2,76,000 (@ MSP ₹2,300/Qtl)",
    currentStage: "Vegetative",
    currentStageDays: 38,
    totalCycleDays: 120,
    healthScore: 82,
    healthStatus: "Good",
    ndviIndex: 0.72,
    soilMoisture: 42,
    soilMoistureStatus: "Medium",
    soilTemp: 26.5,
    soilPh: 6.4,
    riskScore: 24,
    riskLevel: "Low",
    stages: [
      {
        id: "stg-1",
        name: "Sowing & Nursery",
        icon: "🌱",
        startDate: "2026-08-15",
        endDate: "2026-08-21",
        daysDuration: 7,
        status: "completed",
        description: "Seed treatment with carbendazim and broadcast nursery seeding with standing shallow water.",
        nutrientFocus: "Basal DAP (15kg/acre) & Zinc",
        waterRequirement: "Shallow standing (2-3 cm)",
        criticalCare: "Bird protection & uniform seed spreading"
      },
      {
        id: "stg-2",
        name: "Germination & Seedling",
        icon: "🌿",
        startDate: "2026-08-22",
        endDate: "2026-09-05",
        daysDuration: 15,
        status: "completed",
        description: "Transplanting 21-day seedlings into puddled fields with 20x15cm spacing.",
        nutrientFocus: "First Urea split & biofertilizer",
        waterRequirement: "Continuous thin layer of water",
        criticalCare: "Stem borer check & gap filling within 7 days"
      },
      {
        id: "stg-3",
        name: "Vegetative (Tillering)",
        icon: "🌾",
        startDate: "2026-09-06",
        endDate: "2026-10-15",
        daysDuration: 40,
        status: "current",
        description: "Active tillering and root expansion. Maximum canopy coverage and biomass synthesis.",
        nutrientFocus: "Top dressing Urea (45kg/acre) & MOP",
        waterRequirement: "Intermittent saturation (3-5 cm)",
        criticalCare: "Leaf folder & bacterial leaf blight scouting"
      },
      {
        id: "stg-4",
        name: "Flowering & Panicle",
        icon: "🌼",
        startDate: "2026-10-16",
        endDate: "2026-11-10",
        daysDuration: 26,
        status: "upcoming",
        description: "Panicle initiation, boot stage, and 50% flowering. Sensitive to drought stress.",
        nutrientFocus: "Potassium foliar spray & Boron",
        waterRequirement: "Constant 5 cm water depth",
        criticalCare: "Strict avoidance of moisture stress; Gundhi bug monitoring"
      },
      {
        id: "stg-5",
        name: "Grain Filling & Maturity",
        icon: "🌾",
        startDate: "2026-11-11",
        endDate: "2026-12-05",
        daysDuration: 25,
        status: "upcoming",
        description: "Milking to dough stage. Grains turn golden amber as chlorophyll degrades.",
        nutrientFocus: "No soil chemical application",
        waterRequirement: "Drain field water 10 days before harvest",
        criticalCare: "Prevent lodging; rodent control"
      },
      {
        id: "stg-6",
        name: "Harvesting & Threshing",
        icon: "🚜",
        startDate: "2026-12-06",
        endDate: "2026-12-18",
        daysDuration: 13,
        status: "upcoming",
        description: "Combine harvesting when grain moisture reaches 18-20%, followed by sun drying to 12-14%.",
        nutrientFocus: "Post-harvest stubble decomposition",
        waterRequirement: "Completely dry field",
        criticalCare: "Safe bagging in hermetic sacks"
      }
    ],
    weatherAlerts: [
      "Moderate rainfall (15-20mm) expected within 48 hours. Postpone foliar nutrient sprays.",
      "Morning relative humidity >85% favorable for fungal spores. Maintain drainage bunds."
    ],
    activities: [
      {
        id: "act-1",
        cropId: "crop-paddy-01",
        date: "2026-08-15",
        time: "07:00 AM",
        title: "Seed Sowing & Nursery Setup",
        type: "stage_change",
        description: "Treated seeds broadcast in nursery beds with fungicide barrier.",
        status: "completed",
        priority: "high",
        dosage: "25kg seeds / acre",
        completedAt: "2026-08-15 08:30 AM"
      },
      {
        id: "act-2",
        cropId: "crop-paddy-01",
        date: "2026-08-22",
        time: "06:30 AM",
        title: "Field Bunding & First Irrigation",
        type: "irrigation",
        description: "Main field flooding and bund compaction to retain water.",
        status: "completed",
        priority: "medium",
        completedAt: "2026-08-22 10:00 AM"
      },
      {
        id: "act-3",
        cropId: "crop-paddy-01",
        date: "2026-08-25",
        time: "08:00 AM",
        title: "Field Inspection & Tiller Count",
        type: "inspection",
        description: "Sample count of tillers per hill across diagonal transects. Check for dead hearts.",
        status: "completed",
        priority: "medium",
        completedAt: "2026-08-25 09:15 AM"
      },
      {
        id: "act-4",
        cropId: "crop-paddy-01",
        date: "2026-08-25",
        time: "04:30 PM",
        title: "Irrigation Check & Water Level Monitoring",
        type: "irrigation",
        description: "Measure water level depth against gauge peg; maintain 3cm standing water.",
        status: "completed",
        priority: "high",
        completedAt: "2026-08-25 05:00 PM"
      },
      {
        id: "act-5",
        cropId: "crop-paddy-01",
        date: "2026-08-26",
        time: "07:30 AM",
        title: "Zinc Sulphate Micronutrient Application",
        type: "fertilizer",
        description: "Apply 25kg/ha Zinc Sulphate heptahydrate to prevent Khaira deficiency.",
        status: "pending",
        priority: "high",
        dosage: "10 kg/acre with vermicompost"
      },
      {
        id: "act-6",
        cropId: "crop-paddy-01",
        date: "2026-08-27",
        time: "06:00 AM",
        title: "Weed Management (Cono-weeder Operation)",
        type: "weeding",
        description: "Pass mechanical cono-weeder between paddy rows for weed burial and soil aeration.",
        status: "pending",
        priority: "medium"
      },
      {
        id: "act-7",
        cropId: "crop-paddy-01",
        date: "2026-08-30",
        time: "07:00 AM",
        title: "Top Dressing Nitrogen (Urea 2nd Split)",
        type: "fertilizer",
        description: "Broadcast neem-coated urea after draining excess standing water.",
        status: "pending",
        priority: "high",
        dosage: "30 kg / acre"
      },
      {
        id: "act-8",
        cropId: "crop-paddy-01",
        date: "2026-09-05",
        time: "08:00 AM",
        title: "Stem Borer & Leaf Folder Pheromone Trap Setup",
        type: "pest_control",
        description: "Install 5 yellow pheromone lure traps per acre for early pest surveillance.",
        status: "pending",
        priority: "medium",
        dosage: "5 traps / acre"
      },
      {
        id: "act-9",
        cropId: "crop-paddy-01",
        date: "2026-09-15",
        time: "07:00 AM",
        title: "Mid-Season Irrigation & Drainage Cycle",
        type: "irrigation",
        description: "Alternate wetting and moderate drying (AWD) cycle to stimulate deeper roots.",
        status: "pending",
        priority: "medium"
      },
      {
        id: "act-10",
        cropId: "crop-paddy-01",
        date: "2026-10-16",
        time: "06:30 AM",
        title: "Panicle Initiation Stage Inspection",
        type: "stage_change",
        description: "Transition check to Flowering phase. Check boot leaf expansion.",
        status: "pending",
        priority: "high"
      },
      {
        id: "act-11",
        cropId: "crop-paddy-01",
        date: "2026-10-25",
        time: "08:00 AM",
        title: "0:52:34 Foliar Spray (Mono Potassium Phosphate)",
        type: "fertilizer",
        description: "Boost grain weight and panicle length with soluble P & K.",
        status: "pending",
        priority: "medium",
        dosage: "1.5 kg in 150L water / acre"
      },
      {
        id: "act-12",
        cropId: "crop-paddy-01",
        date: "2026-12-13",
        time: "08:00 AM",
        title: "Combined Harvesting Operation",
        type: "harvest",
        description: "Mechanical harvest when 85% panicles are golden straw colored.",
        status: "pending",
        priority: "high"
      }
    ]
  },
  {
    id: "crop-mustard-02",
    name: "Mustard (Rabi Season)",
    variety: "Pusa Mustard-30 (Zero Erucic)",
    cropType: "Oilseed",
    icon: "🌻",
    landArea: "1.8 Acres",
    location: "Plot No. 12, Rairangpur",
    district: "Mayurbhanj",
    state: "Odisha",
    sowingDate: "2026-10-05",
    expectedHarvestDate: "2027-02-10",
    harvestWindow: "10 Feb – 16 Feb 2027",
    expectedYield: "18 Quintals / Acre (32.4 Qtl Total)",
    estimatedRevenue: "₹1,84,680 (@ MSP ₹5,700/Qtl)",
    currentStage: "Vegetative",
    currentStageDays: 22,
    totalCycleDays: 110,
    healthScore: 89,
    healthStatus: "Excellent",
    ndviIndex: 0.78,
    soilMoisture: 38,
    soilMoistureStatus: "Optimal",
    soilTemp: 22.0,
    soilPh: 6.8,
    riskScore: 18,
    riskLevel: "Low",
    stages: [
      {
        id: "mst-1",
        name: "Sowing & Emergence",
        icon: "🌱",
        startDate: "2026-10-05",
        endDate: "2026-10-12",
        daysDuration: 8,
        status: "completed",
        description: "Line sowing with seed drill at 30x10 cm spacing.",
        nutrientFocus: "Sulphur 20kg/acre + Basal NPK",
        waterRequirement: "Pre-sowing irrigation only",
        criticalCare: "Termite treatment with chlorpyrifos"
      },
      {
        id: "mst-2",
        name: "Rosette / Vegetative",
        icon: "🌿",
        startDate: "2026-10-13",
        endDate: "2026-11-15",
        daysDuration: 34,
        status: "current",
        description: "Leaves spread flat in rosette formation followed by stem elongation.",
        nutrientFocus: "Top dress Urea 30kg/acre",
        waterRequirement: "First irrigation at 30 DAS",
        criticalCare: "Thinning to single seedling per spot"
      },
      {
        id: "mst-3",
        name: "Flowering & Siliqua Formation",
        icon: "🌼",
        startDate: "2026-11-16",
        endDate: "2026-12-25",
        daysDuration: 40,
        status: "upcoming",
        description: "Bright yellow blooms and formation of pod capsules (siliqua).",
        nutrientFocus: "Boron 0.2% spray",
        waterRequirement: "Second irrigation at flowering",
        criticalCare: "Aphid / Mustard sawfly scouting"
      },
      {
        id: "mst-4",
        name: "Pod Filling & Ripening",
        icon: "🌾",
        startDate: "2026-12-26",
        endDate: "2027-01-28",
        daysDuration: 34,
        status: "upcoming",
        description: "Seeds mature inside pods and oil content peaks.",
        nutrientFocus: "No chemicals",
        waterRequirement: "Stop irrigation",
        criticalCare: "Avoid pod shattering"
      },
      {
        id: "mst-5",
        name: "Harvesting & Drying",
        icon: "🚜",
        startDate: "2027-01-29",
        endDate: "2027-02-10",
        daysDuration: 13,
        status: "upcoming",
        description: "Early morning cutting when 75% pods turn yellowish-brown.",
        nutrientFocus: "Post-harvest seed grading",
        waterRequirement: "Dry",
        criticalCare: "Harvest before sunrise to minimize pod shatter"
      }
    ],
    weatherAlerts: [
      "Dry sunny weather expected for next 7 days. Ideal for second weeding and thinning."
    ],
    activities: [
      {
        id: "mst-act-1",
        cropId: "crop-mustard-02",
        date: "2026-10-05",
        time: "07:00 AM",
        title: "Seed Sowing & Sulphur Application",
        type: "stage_change",
        description: "Sowing with seed drill along with Bentonite Sulphur.",
        status: "completed",
        priority: "high"
      },
      {
        id: "mst-act-2",
        cropId: "crop-mustard-02",
        date: "2026-10-20",
        time: "08:00 AM",
        title: "Thinning and First Hoeing",
        type: "weeding",
        description: "Maintain 10cm plant to plant spacing by removing weak seedlings.",
        status: "completed",
        priority: "medium"
      },
      {
        id: "mst-act-3",
        cropId: "crop-mustard-02",
        date: "2026-11-05",
        time: "07:00 AM",
        title: "First Post-Sowing Irrigation",
        type: "irrigation",
        description: "Light flood irrigation at 30 days after sowing.",
        status: "pending",
        priority: "high"
      },
      {
        id: "mst-act-4",
        cropId: "crop-mustard-02",
        date: "2026-11-20",
        time: "07:30 AM",
        title: "Aphid Surveillance & Neem Oil Spray",
        type: "pest_control",
        description: "Prophylactic botanical spray before full flowering bloom.",
        status: "pending",
        priority: "medium",
        dosage: "5ml neem oil (10,000 ppm) / Liter water"
      }
    ]
  },
  {
    id: "crop-wheat-03",
    name: "Wheat (Rabi Grain)",
    variety: "HD-2967 (Sharbati High Protein)",
    cropType: "Cereal Grain",
    icon: "🌾",
    landArea: "3.0 Acres",
    location: "Plot No. 8, Betnoti",
    district: "Mayurbhanj",
    state: "Odisha",
    sowingDate: "2026-11-10",
    expectedHarvestDate: "2027-03-25",
    harvestWindow: "25 Mar – 30 Mar 2027",
    expectedYield: "42 Quintals / Acre (126 Qtl Total)",
    estimatedRevenue: "₹3,02,400 (@ MSP ₹2,400/Qtl)",
    currentStage: "Germination & CRI",
    currentStageDays: 14,
    totalCycleDays: 135,
    healthScore: 76,
    healthStatus: "Good",
    ndviIndex: 0.65,
    soilMoisture: 48,
    soilMoistureStatus: "Optimal",
    soilTemp: 21.5,
    soilPh: 6.9,
    riskScore: 32,
    riskLevel: "Moderate",
    stages: [
      {
        id: "wht-1",
        name: "Sowing & CRI Stage",
        icon: "🌱",
        startDate: "2026-11-10",
        endDate: "2026-12-05",
        daysDuration: 26,
        status: "current",
        description: "Crown Root Initiation (CRI) at 21-25 days. Most critical irrigation window.",
        nutrientFocus: "Basal DAP 50kg + Zinc Sulphate",
        waterRequirement: "First irrigation at 21 DAS (Mandatory)",
        criticalCare: "Uniform depth of sowing (5cm)"
      },
      {
        id: "wht-2",
        name: "Tillering & Jointing",
        icon: "🌿",
        startDate: "2026-12-06",
        endDate: "2027-01-15",
        daysDuration: 41,
        status: "upcoming",
        description: "Stem internode elongation and primary tiller multiplication.",
        nutrientFocus: "First top dress Urea 40kg/acre",
        waterRequirement: "Second irrigation at late tillering (40-45 DAS)",
        criticalCare: "Broadleaf weed control (2,4-D)"
      },
      {
        id: "wht-3",
        name: "Heading & Flowering",
        icon: "🌼",
        startDate: "2027-01-16",
        endDate: "2027-02-20",
        daysDuration: 36,
        status: "upcoming",
        description: "Ear head emergence and anthesis pollination.",
        nutrientFocus: "Potassium nitrate 1% foliar spray",
        waterRequirement: "Third irrigation at boot / flowering",
        criticalCare: "Yellow rust and brown rust leaf check"
      },
      {
        id: "wht-4",
        name: "Dough & Ripening",
        icon: "🌾",
        startDate: "2027-02-21",
        endDate: "2027-03-25",
        daysDuration: 33,
        status: "upcoming",
        description: "Grain hardening. Leaves dry down from base to flag leaf.",
        nutrientFocus: "No inputs",
        waterRequirement: "Final light irrigation at early dough stage",
        criticalCare: "Prevent lodging under late March high wind"
      }
    ],
    weatherAlerts: [
      "Moderate morning fog expected. Ensure field drains remain unblocked."
    ],
    activities: [
      {
        id: "wht-act-1",
        cropId: "crop-wheat-03",
        date: "2026-11-10",
        time: "07:00 AM",
        title: "Seed Bed Preparation & Sowing",
        type: "stage_change",
        description: "Rotavator tilling followed by seed-cum-fertilizer drill sowing.",
        status: "completed",
        priority: "high"
      },
      {
        id: "wht-act-2",
        cropId: "crop-wheat-03",
        date: "2026-12-01",
        time: "06:30 AM",
        title: "CRI Stage 1st Irrigation (Critical)",
        type: "irrigation",
        description: "Essential crown root irrigation to enable secondary tiller formation.",
        status: "pending",
        priority: "high"
      }
    ]
  }
];

export const WEATHER_FORECAST: WeatherDay[] = [
  {
    date: "2026-08-25",
    dayName: "Today",
    condition: "partly_cloudy",
    tempHigh: 31,
    tempLow: 24,
    rainChance: 25,
    humidity: 78,
    windSpeed: 12,
    alert: "Ideal morning window for field inspection and soil testing."
  },
  {
    date: "2026-08-26",
    dayName: "Wednesday",
    condition: "rainy",
    tempHigh: 28,
    tempLow: 23,
    rainChance: 75,
    humidity: 89,
    windSpeed: 18,
    alert: "🌧️ Rain Expected (18mm). Delay fertilizer top-dressing to prevent leaching."
  },
  {
    date: "2026-08-27",
    dayName: "Thursday",
    condition: "rainy",
    tempHigh: 27,
    tempLow: 22,
    rainChance: 65,
    humidity: 92,
    windSpeed: 15
  },
  {
    date: "2026-08-28",
    dayName: "Friday",
    condition: "cloudy",
    tempHigh: 30,
    tempLow: 24,
    rainChance: 35,
    humidity: 80,
    windSpeed: 10
  },
  {
    date: "2026-08-29",
    dayName: "Saturday",
    condition: "sunny",
    tempHigh: 33,
    tempLow: 25,
    rainChance: 10,
    humidity: 68,
    windSpeed: 8
  },
  {
    date: "2026-08-30",
    dayName: "Sunday",
    condition: "sunny",
    tempHigh: 34,
    tempLow: 25,
    rainChance: 15,
    humidity: 65,
    windSpeed: 9,
    alert: "☀️ Clear sunny day. Optimal timing for urea top-dressing & cono-weeder."
  },
  {
    date: "2026-08-31",
    dayName: "Monday",
    condition: "partly_cloudy",
    tempHigh: 32,
    tempLow: 24,
    rainChance: 20,
    humidity: 72,
    windSpeed: 11
  }
];

export function formatDateString(
  dateStr: string,
  t?: (key: string, fallback?: string) => string
): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const monthKeys = [
      "month_jan_short", "month_feb_short", "month_mar_short", "month_apr_short",
      "month_may_short", "month_jun_short", "month_jul_short", "month_aug_short",
      "month_sep_short", "month_oct_short", "month_nov_short", "month_dec_short"
    ];
    const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = t ? t(monthKeys[m - 1], defaultMonths[m - 1]) : defaultMonths[m - 1];
    return `${monthName} ${d}, ${y}`;
  } catch {
    return dateStr;
  }
}

export function getDaysDifference(targetDateStr: string): number {
  try {
    const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const d2 = new Date(targetDateStr);
    const diffTime = d2.getTime() - todayIST.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function getActivityTypeBadge(
  type: ActivityType,
  t?: (key: string, fallback?: string) => string
): ActivityBadgeStyle {
  const tr = t || ((_k: string, fb?: string) => fb || _k);
  switch (type) {
    case "irrigation":
      return {
        label: tr("irrigation", "Irrigation"),
        bg: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        dot: "bg-blue-500",
        icon: "💧"
      };
    case "fertilizer":
      return {
        label: tr("fertilizer", "Nutrient / Fertilizer"),
        bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-500",
        icon: "🧪"
      };
    case "inspection":
      return {
        label: tr("inspection", "Field Scouting"),
        bg: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        dot: "bg-purple-500",
        icon: "🔍"
      };
    case "pest_control":
      return {
        label: tr("pest_control", "Pest Management"),
        bg: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        dot: "bg-rose-500",
        icon: "🛡️"
      };
    case "weeding":
      return {
        label: tr("opt_weeding", "Weed Control"),
        bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        dot: "bg-amber-500",
        icon: "🌾"
      };
    case "harvest":
      return {
        label: tr("opt_harvest", "Harvest Operation"),
        bg: "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
        dot: "bg-yellow-500",
        icon: "🚜"
      };
    case "stage_change":
      return {
        label: tr("event_stage_change", "Stage Transition"),
        bg: "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
        dot: "bg-teal-500",
        icon: "🌱"
      };
    default:
      return {
        label: tr("tasks", "Task"),
        bg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        dot: "bg-zinc-500",
        icon: "📋"
      };
  }
}

export function getActivityTitle(
  act: { title: string; titleKey?: string },
  t: (key: string, fallback?: string) => string
): string {
  if (act.titleKey) return t(act.titleKey, act.title);
  const keyMap: Record<string, string> = {
    "Seed Sowing & Nursery Setup": "act_seed_sowing_nursery",
    "Field Bunding & First Irrigation": "act_field_bunding_irrigation",
    "Field Inspection & Tiller Count": "act_field_inspection_tiller",
    "Irrigation Check & Water Level Monitoring": "act_irrigation_check_water_level",
    "Zinc Sulphate Micronutrient Application": "act_zinc_sulphate_micronutrient",
    "Weed Management (Cono-weeder Operation)": "act_weed_management_cono_weeder",
    "Top Dressing Nitrogen (Urea 2nd Split)": "act_top_dressing_nitrogen_urea",
    "Stem Borer & Leaf Folder Pheromone Trap Setup": "act_stem_borer_leaf_folder_trap",
    "Mid-Season Irrigation & Drainage Cycle": "act_mid_season_irrigation_drainage",
    "Panicle Initiation Stage Inspection": "act_panicle_initiation_inspection",
    "0:52:34 Foliar Spray (Mono Potassium Phosphate)": "act_foliar_spray_mpp",
    "Combined Harvesting Operation": "act_combined_harvesting_operation",
    "Seed Sowing & Sulphur Application": "act_seed_sowing_sulphur",
    "Thinning and First Hoeing": "act_thinning_first_hoeing",
    "First Post-Sowing Irrigation": "act_first_post_sowing_irrigation",
    "Aphid Surveillance & Neem Oil Spray": "act_aphid_surveillance_neem_oil",
    "Seed Bed Preparation & Sowing": "act_seed_bed_prep_sowing",
    "CRI Stage 1st Irrigation (Critical)": "act_cri_stage_irrigation"
  };
  const key = keyMap[act.title];
  return key ? t(key, act.title) : act.title;
}

export function getCropName(
  crop: { name: string },
  t: (key: string, fallback?: string) => string
): string {
  if (crop.name.includes("Paddy")) return t("crop_paddy", crop.name);
  if (crop.name.includes("Mustard")) return t("crop_mustard", crop.name);
  if (crop.name.includes("Wheat")) return t("crop_wheat", crop.name);
  if (crop.name.includes("Groundnut")) return t("crop_groundnut", crop.name);
  return crop.name;
}

export function getCropType(
  type: string,
  t: (key: string, fallback?: string) => string
): string {
  if (type === "Cereal Grain") return t("cereal_grain", type);
  if (type === "Oilseed Cash Crop") return t("oilseed_cash_crop", type);
  if (type === "Oilseed Legume") return t("oilseed_legume", type);
  return type;
}

export function getStageName(
  name: string,
  t: (key: string, fallback?: string) => string
): string {
  const normKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return t(normKey, name);
}

export function getWeatherDayName(
  dayName: string,
  t: (key: string, fallback?: string) => string
): string {
  if (!dayName) return "";
  const lower = dayName.toLowerCase();
  if (lower === "today") return t("today", "Today");
  if (lower === "tomorrow") return t("tomorrow", "Tomorrow");
  return t(`day_${lower}`, t(lower, dayName));
}

export function translateWeatherAlert(
  alert: string | undefined,
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string,
  weather?: Partial<WeatherDay>
): string {
  if (!alert) return "";

  // 1. Thunderstorm alerts
  if (alert.includes("Thunderstorm") || alert.includes("⛈️")) {
    return t("alert_thunderstorm", alert);
  }

  // 2. Heavy rain / fertilizer leaching alerts
  if (alert.includes("Heavy rain likely") || (alert.includes("Delay fertilizer") && alert.includes("leaching"))) {
    const chanceMatch = alert.match(/(\d+)%\s*chance/i);
    const chance = chanceMatch ? chanceMatch[1] : weather?.rainChance ? String(weather.rainChance) : "100";
    return t(
      "alert_heavy_rain_leaching",
      `🌧️ Heavy rain likely (${chance}% chance). Delay fertilizer top-dressing to prevent leaching.`,
      { chance }
    );
  }

  // 3. Moderate to heavy rainfall alerts
  if (alert.includes("Moderate to heavy rainfall") || alert.includes("Moderate rainfall")) {
    const chanceMatch = alert.match(/(\d+)%\s*chance/i);
    const chance = chanceMatch ? chanceMatch[1] : weather?.rainChance ? String(weather.rainChance) : "75";
    return t(
      "alert_heavy_rain",
      `🌧️ Moderate to heavy rainfall (${chance}% chance) expected. Postpone foliar nutrient sprays.`,
      { chance }
    );
  }

  // 4. Rain expected / postpone foliar sprays
  if (alert.includes("Rain expected") || alert.includes("Postpone foliar")) {
    const chanceMatch = alert.match(/(\d+)%\s*chance/i);
    const chance = chanceMatch ? chanceMatch[1] : weather?.rainChance ? String(weather.rainChance) : "60";
    return t(
      "alert_rain_expected",
      `🌦️ Rain expected (${chance}% chance). Postpone foliar sprays.`,
      { chance }
    );
  }

  // 5. Rain forecast tomorrow
  if (alert.includes("Rain forecast tomorrow")) {
    const chanceMatch = alert.match(/(\d+)%\s*chance/i);
    const chance = chanceMatch ? chanceMatch[1] : weather?.rainChance ? String(weather.rainChance) : "70";
    return t(
      "alert_rain_tomorrow",
      `🌦️ Rain forecast tomorrow (${chance}% chance). Plan field tasks accordingly.`,
      { chance }
    );
  }

  // 6. Sunny day & urea top-dressing
  if (alert.includes("urea top-dressing") || (alert.includes("Clear sunny day") && alert.includes("cono-weeder"))) {
    return t("alert_sunny_urea", "☀️ Clear sunny day. Optimal timing for urea top-dressing & cono-weeder.");
  }

  // 7. Sunny good field window
  if (alert.includes("Good field window") || (alert.includes("manual weeding") && alert.includes("scouting"))) {
    return t("alert_sunny_good_window", "☀️ Good field window. Ideal for inspection, scouting & manual weeding.");
  }

  // 8. Clear skies tomorrow
  if (alert.includes("Clear skies tomorrow")) {
    return t("alert_clear_skies", "☀️ Clear skies tomorrow. Good window for top-dressing and mechanical operations.");
  }

  // 9. Partly cloudy / field inspection window
  if (alert.includes("Partly cloudy") || alert.includes("Ideal morning window for field inspection")) {
    return t("alert_partly_cloudy_window", "⛅ Partly cloudy. Good morning window for field inspection and soil testing.");
  }

  // 10. Humidity & fungal spores
  if (alert.includes("relative humidity") || alert.includes("fungal spores")) {
    const humMatch = alert.match(/(\d+)%/);
    const humidity = humMatch ? humMatch[1] : weather?.humidity ? String(weather.humidity) : "85";
    return t(
      "alert_humidity_fungal",
      `💧 Morning relative humidity ${humidity}% — favorable for fungal spores. Maintain drainage bunds.`,
      { humidity }
    );
  }

  return alert;
}

