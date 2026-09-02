"use client";

import React, { useState } from "react";
import { Activity, ActivityPriority, ActivityType } from "../types";
import { useLanguage } from "@/lib/language-context";

interface AddActivityModalProps {
  cropId: string;
  defaultDate: string;
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: Activity) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  cropId,
  defaultDate,
  isOpen,
  onClose,
  onAddActivity
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityType>("inspection");
  const [date, setDate] = useState(defaultDate || "2026-08-25");
  const [time, setTime] = useState("08:00 AM");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<ActivityPriority>("medium");
  const [dosage, setDosage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      cropId,
      date,
      time: time || "08:00 AM",
      title: title.trim(),
      type,
      description: desc.trim() || "Farmer scheduled task.",
      status: "pending",
      priority,
      dosage: dosage.trim() || undefined
    };

    onAddActivity(newAct);
    setTitle("");
    setDesc("");
    setDosage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <span>📋</span> {t('schedule_farm_task', 'Schedule Farm Task / Intervention')}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('task_title', 'Task Title')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('task_title_placeholder', 'e.g. Zinc Sulphate Micronutrient Application')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('activity_type', 'Activity Type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="irrigation">{t('event_irrigation', '💧 Irrigation')}</option>
                <option value="fertilizer">{t('opt_fertilizer', '🧪 Fertilizer / Nutrient')}</option>
                <option value="inspection">{t('opt_inspection', '🔍 Field Inspection')}</option>
                <option value="pest_control">{t('opt_pest_control', '🛡️ Pest / Fungicide')}</option>
                <option value="weeding">{t('opt_weeding', '🌾 Weed Control')}</option>
                <option value="harvest">{t('opt_harvest', '🚜 Harvest Operation')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('priority', 'Priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActivityPriority)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="high">{t('priority_high', 'High Priority')}</option>
                <option value="medium">{t('priority_medium', 'Medium Priority')}</option>
                <option value="low">{t('priority_low', 'Low Priority')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('scheduled_date', 'Scheduled Date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('preferred_time', 'Preferred Time')}
              </label>
              <input
                type="text"
                placeholder="07:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('dosage_details', 'Dosage / Product Details (Optional)')}
            </label>
            <input
              type="text"
              placeholder={t('dosage_placeholder', 'e.g. 10 kg / acre with vermicompost')}
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {t('description_field_notes', 'Description / Field Notes')}
            </label>
            <textarea
              rows={3}
              placeholder={t('notes_placeholder', 'Add specific instructions for farm labor or scouting remarks...')}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30"
            >
              {t('save_task_calendar', 'Save Task to Calendar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
