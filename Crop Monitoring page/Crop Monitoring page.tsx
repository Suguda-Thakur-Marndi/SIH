"use client";

import React, { useState, useMemo } from "react";
import { RegisteredCrop, Activity, WeatherDay } from "./types";
import { INITIAL_CROPS, translateWeatherAlert } from "./mockData";
import { useWeather } from "./useWeather";
import { useSoil } from "./useSoil";
import { SoilData } from "./soilService";
import { CropHeader } from "./components/CropHeader";
import { CropStateMetrics } from "./components/CropStateMetrics";
import { CropLifecycleTracker } from "./components/CropLifecycleTracker";
import { InteractiveCalendar } from "./components/InteractiveCalendar";
import { SelectedDatePanel } from "./components/SelectedDatePanel";
import { DailyActivitySection } from "./components/DailyActivitySection";
import { HarvestSection } from "./components/HarvestSection";
import { WeatherForecastSection } from "./components/WeatherForecastSection";
import { AddActivityModal } from "./components/AddActivityModal";
import { AiAgronomistDrawer } from "./components/AiAgronomistDrawer";
import { useLanguage } from "@/lib/language-context";

// Today's real date in YYYY-MM-DD (IST)
const todayIST = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);
const todayStr = `${todayIST.getFullYear()}-${String(todayIST.getMonth() + 1).padStart(2, "0")}-${String(todayIST.getDate()).padStart(2, "0")}`;

function enrichCropsWithApiData(
  crops: RegisteredCrop[],
  soilData: SoilData | null,
  weatherForecast: WeatherDay[]
): RegisteredCrop[] {
  if (!soilData && weatherForecast.length === 0) return crops;

  return crops.map((crop) => {
    const next: RegisteredCrop = { ...crop };

    if (soilData) {
      next.soilMoisture = soilData.soilMoistureRoot;
      next.soilMoistureStatus = soilData.soilMoistureStatus;
      next.soilTemp = soilData.soilTempC;
      next.ndviIndex = Math.min(1, Math.max(0, soilData.soilMoistureRoot / 100));
      next.healthScore = Math.min(
        100,
        Math.max(0, 60 + soilData.soilMoistureRoot / 2 + (soilData.soilTempC > 20 && soilData.soilTempC < 35 ? 10 : 0))
      );
      next.healthStatus =
        soilData.soilMoistureStatus === "Optimal" && soilData.soilTempC >= 20 && soilData.soilTempC <= 35
          ? "Excellent"
          : soilData.soilMoistureStatus === "Medium"
          ? "Good"
          : soilData.soilMoistureStatus === "Low"
          ? "Moderate"
          : "Good";
      next.riskScore = Math.min(100, Math.max(0, 100 - soilData.soilMoistureRoot));
      next.riskLevel =
        soilData.soilMoistureRoot < 25 ? "High" : soilData.soilMoistureRoot < 40 ? "Moderate" : "Low";
    }

    if (weatherForecast.length > 0) {
      const today = weatherForecast[0];
      const tomorrow = weatherForecast[1];
      const alerts: string[] = [];

      if (today?.condition === "storm") {
        alerts.push("⛈️ Thunderstorm alert today. Secure equipment and avoid field work.");
      } else if (today?.condition === "rainy" && today.rainChance >= 60) {
        alerts.push(`🌧️ Moderate to heavy rainfall (${today.rainChance}% chance) expected. Postpone foliar nutrient sprays.`);
      }
      if (today && today.humidity >= 85) {
        alerts.push(`💧 Morning relative humidity ${today.humidity}% — favorable for fungal spores. Maintain drainage bunds.`);
      }
      if (tomorrow?.condition === "rainy" && tomorrow.rainChance >= 70) {
        alerts.push(`🌦️ Rain forecast tomorrow (${tomorrow.rainChance}% chance). Plan field tasks accordingly.`);
      } else if (tomorrow?.condition === "sunny") {
        alerts.push("☀️ Clear skies tomorrow. Good window for top-dressing and mechanical operations.");
      }

      next.weatherAlerts = alerts.length > 0 ? alerts : crop.weatherAlerts;
    }

    return next;
  });
}

export default function CropMonitoringPage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [crops, setCrops] = useState<RegisteredCrop[]>(INITIAL_CROPS);
  const [selectedCropId, setSelectedCropId] = useState<string>(INITIAL_CROPS[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(todayIST);
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiPromptPrefill, setAiPromptPrefill] = useState<string>("");

  // ── Live weather data from OpenWeatherMap ──────────────────────────────
  const {
    forecast: weatherForecast,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeather();

  // ── Live soil + Ambee data ─────────────────────────────────────────────
  const {
    soilData,
    loading: soilLoading,
    error: soilError,
    refresh: refreshSoil,
  } = useSoil();
  void soilError;
  void refreshSoil;

  const enrichedCrops = useMemo(
    () => enrichCropsWithApiData(crops, soilData, weatherForecast),
    [crops, soilData, weatherForecast]
  );

  // ── Currently active crop ──────────────────────────────────────────────
  const currentCrop = useMemo(() => {
    return enrichedCrops.find((c) => c.id === selectedCropId) || enrichedCrops[0];
  }, [enrichedCrops, selectedCropId]);

  // ── Toggle Activity Completion ─────────────────────────────────────────
  const handleToggleActivity = (activityId: string) => {
    setCrops((prevCrops) =>
      prevCrops.map((crop) => {
        if (crop.id !== currentCrop.id) return crop;
        const updatedActivities = crop.activities.map((act) => {
          if (act.id !== activityId) return act;
          const isNowCompleted = act.status !== "completed";
          return {
            ...act,
            status: isNowCompleted ? ("completed" as const) : ("pending" as const),
            completedAt: isNowCompleted
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        });
        return { ...crop, activities: updatedActivities };
      })
    );
  };

  // ── Add Custom Activity from Modal ─────────────────────────────────────
  const handleAddActivity = (newAct: Activity) => {
    setCrops((prev) =>
      prev.map((c) =>
        c.id === currentCrop.id ? { ...c, activities: [...c.activities, newAct] } : c
      )
    );
  };

  // ── Switch Selected Crop ───────────────────────────────────────────────
  const handleSelectCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    const newCrop = crops.find((c) => c.id === cropId);
    if (newCrop && newCrop.stages.length > 0) {
      setSelectedDate(newCrop.stages[0].startDate || todayStr);
    }
  };

  // ── Open AI with prompt ────────────────────────────────────────────────
  const handleOpenAiWithPrompt = (prompt: string) => {
    setAiPromptPrefill(prompt);
    setIsAiDrawerOpen(true);
  };

  const { t } = useLanguage();

  // ── Derive live weather alerts for the banner ──────────────────────────
  const liveWeatherAlerts = useMemo((): string[] => {
    if (!weatherForecast.length) {
      return currentCrop.weatherAlerts.map((alt) => translateWeatherAlert(alt, t));
    }
    const alerts: string[] = [];
    const today = weatherForecast[0];
    if (today) {
      if (today.condition === "storm") {
        alerts.push(t("alert_thunderstorm", "⛈️ Thunderstorm alert today. Secure equipment and avoid field work."));
      } else if (today.condition === "rainy" && today.rainChance >= 60) {
        alerts.push(
          t("alert_heavy_rain", `🌧️ Moderate to heavy rainfall (${today.rainChance}% chance) expected. Postpone foliar nutrient sprays.`, { chance: today.rainChance })
        );
      }
      if (today.humidity >= 85) {
        alerts.push(
          t("alert_humidity_fungal", `💧 Morning relative humidity ${today.humidity}% — favorable for fungal spores. Maintain drainage bunds.`, { humidity: today.humidity })
        );
      }
    }
    const tomorrow = weatherForecast[1];
    if (tomorrow) {
      if (tomorrow.condition === "rainy" && tomorrow.rainChance >= 70) {
        alerts.push(
          t("alert_rain_tomorrow", `🌦️ Rain forecast tomorrow (${tomorrow.rainChance}% chance). Plan field tasks accordingly.`, { chance: tomorrow.rainChance })
        );
      } else if (tomorrow.condition === "sunny") {
        alerts.push(t("alert_clear_skies", "☀️ Clear skies tomorrow. Good window for top-dressing and mechanical operations."));
      }
    }
    return alerts.length > 0 ? alerts : currentCrop.weatherAlerts.map((alt) => translateWeatherAlert(alt, t));
  }, [weatherForecast, currentCrop.weatherAlerts, t]);

  return (
    /*
     * Root wrapper — fixed full-screen background image:
     *   • Mobile  (<768px): bg-phone.png  (portrait crop field)
     *   • Desktop (≥768px): bg-laptop.png (landscape farmer spraying)
     * A semi-transparent white tint sits on top so cards stay readable,
     * while all UI surfaces use frosted-glass styling.
     */
    <div
      className="relative min-h-screen font-sans pb-16 selection:bg-emerald-500 selection:text-white"
      style={{ color: "#1a2e1a" }}
    >
      {/* ── Fixed background layer ── */}
      <div
        className="fixed inset-0 -z-20 block md:hidden bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: "url('/bg-phone.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-20 hidden md:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-laptop.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "rgba(240,248,235,0.78)" }}
        aria-hidden="true"
      />

      {/* ── Sticky top header ── */}
      <CropHeader
        crops={crops}
        selectedCropId={selectedCropId}
        onSelectCrop={handleSelectCrop}
        liveWeatherAlerts={liveWeatherAlerts}
        onOpenAiDrawer={() => {
          setAiPromptPrefill("");
          setIsAiDrawerOpen(true);
        }}
        onOpenAddModal={() => setIsAddActivityModalOpen(true)}
      />

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <CropStateMetrics
          currentCrop={currentCrop}
          soilData={soilData}
          soilLoading={soilLoading}
        />
        <CropLifecycleTracker
          currentCrop={currentCrop}
          onSelectDate={(date) => setSelectedDate(date)}
        />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <InteractiveCalendar
              currentCrop={currentCrop}
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
              currentMonthDate={currentMonthDate}
              onChangeMonth={(newDate) => setCurrentMonthDate(newDate)}
              filterType={filterType}
              onFilterChange={(newFilter) => setFilterType(newFilter)}
              weatherForecast={weatherForecast}
            />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <SelectedDatePanel
              currentCrop={currentCrop}
              selectedDate={selectedDate}
              weatherForecast={weatherForecast}
              onToggleActivity={handleToggleActivity}
              onOpenAddModalForDate={(date) => {
                setSelectedDate(date);
                setIsAddActivityModalOpen(true);
              }}
              onOpenAiWithPrompt={handleOpenAiWithPrompt}
            />
          </div>
        </section>

        <DailyActivitySection
          currentCrop={currentCrop}
          onToggleActivity={handleToggleActivity}
          onSelectDate={(date) => setSelectedDate(date)}
        />

        <HarvestSection currentCrop={currentCrop} />

        <WeatherForecastSection
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          weatherForecast={weatherForecast}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          onRefresh={refreshWeather}
        />
      </main>

      <AddActivityModal
        cropId={currentCrop.id}
        defaultDate={selectedDate}
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onAddActivity={handleAddActivity}
      />

      <AiAgronomistDrawer
        currentCrop={currentCrop}
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        prefilledPrompt={aiPromptPrefill}
      />
    </div>
  );
}
