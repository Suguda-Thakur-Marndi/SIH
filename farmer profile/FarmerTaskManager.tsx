// File: c:/local_disc_D/SIH_2/SIH/farmer profile/FarmerTaskManager.tsx
"use client";

import React, { useState } from "react";
import { Activity, RegisteredCrop } from "@/Crop Monitoring page/types";
import { INITIAL_CROPS } from "@/Crop Monitoring page/mockData";
import { InteractiveCalendar } from "@/Crop Monitoring page/components/InteractiveCalendar";
import { SelectedDatePanel } from "@/Crop Monitoring page/components/SelectedDatePanel";
import { AddActivityModal } from "@/Crop Monitoring page/components/AddActivityModal";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/lib/language-context";

export default function FarmerTaskManager() {
  const { t } = useLanguage();
  const [crop, setCrop] = useState<RegisteredCrop>(() => ({
    ...INITIAL_CROPS[0],
    activities: [] as Activity[],
  }));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(today);
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState<boolean>(false);

  const handleToggleActivity = (activityId: string) => {
    setCrop(prev => {
      const updatedActivities = prev.activities.map(act => {
        if (act.id !== activityId) return act;
        const completed = act.status !== "completed";
        return {
          ...act,
          status: (completed ? "completed" : "pending") as Activity["status"],
          completedAt: completed ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        };
      });
      return { ...prev, activities: updatedActivities };
    });
  };

  const handleAddActivity = (newAct: Activity) => {
    setCrop(prev => ({ ...prev, activities: [...prev.activities, newAct] }));
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-md space-y-4">
      <h2 className="font-bold text-xl mb-4 text-slate-900">{t('task_manager', 'Task Calendar & Management')}</h2>
      <div className="h-[500px]">
        <InteractiveCalendar
          currentCrop={crop}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          currentMonthDate={currentMonthDate}
          onChangeMonth={setCurrentMonthDate}
          filterType={filterType}
          onFilterChange={setFilterType}
          weatherForecast={[]}
        />
      </div>
      <SelectedDatePanel
        currentCrop={crop}
        selectedDate={selectedDate}
        weatherForecast={[]}
        onToggleActivity={handleToggleActivity}
        onOpenAddModalForDate={date => {
          setSelectedDate(date);
          setIsAddActivityModalOpen(true);
        }}
        onOpenAiWithPrompt={() => {}}
      />
      <AddActivityModal
        cropId={crop.id}
        defaultDate={selectedDate}
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onAddActivity={act => {
          const activityWithId = { ...act, id: uuidv4() };
          handleAddActivity(activityWithId);
        }}
      />
    </div>
  );
}
