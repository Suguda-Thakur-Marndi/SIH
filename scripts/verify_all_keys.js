const fs = require('fs');
const path = require('path');

const langs = ['en', 'hi', 'or', 'bn', 'te', 'ta', 'mr', 'gu', 'pa', 'kn', 'ml', 'as', 'ur', 'ne'];

const usedKeys = [
  'notes_placeholder', 'prompt_nitrogen', 'prompt_rain', 'prompt_pest', 'ask_crop_placeholder',
  'send_btn', 'irrigation', 'fertilizer', 'inspection', 'rain', 'alert_rainfall_48h', 'alert_humidity_fungal',
  'weather_rainy', 'weather_sunny', 'weather_storm', 'weather_partly_cloudy', 'weather_cloudy',
  'smart_farm_os', 'mayurbhanj_cluster', 'crop_lifecycle', 'dynamic_calendar', 'select_registered_crop',
  'ai_agronomist', 'schedule_task', 'print_calendar', 'variety', 'sown', 'target_harvest', 'crop_stage',
  'days_since_sowing', 'days', 'days_to_harvest', 'days_left', 'active_weather_advisory', 'realtime_alert',
  'last_updated', 'crop_health', 'soil_moisture', 'surface', 'root', 'root_zone', 'waiting_nasa',
  'soil_temp', 'waiting_temp', 'uv_index', 'rainfall', 'day', 'todays_uv', 'pest_risk', 'risk',
  'daily_tasks', 'ambee_field_summary', 'feels_like', 'wind_gust', 'crop_lifecycle_progression',
  'full_physiological_dev', 'completed', 'active', 'upcoming', 'stage', 'current', 'focus', 'water',
  'today', 'all_events', 'event_irrigation', 'event_fertilizer', 'event_inspection', 'event_pest_control',
  'event_stage_change', 'day_sun', 'day_mon', 'day_tue', 'day_wed', 'day_thu', 'day_fri', 'day_sat',
  'rain_forecast', 'sowing_date', 'expected_harvest', 'more', 'click_date_view_tasks',
  'selected_calendar_day', 'add_task', 'humidity', 'weather_loading', 'scheduled_activities',
  'no_tasks_scheduled', 'schedule_custom_task', 'mark_incomplete', 'mark_complete', 'dosage',
  'agronomist_guidance', 'ask_assistant', 'tillering_water_advice', 'today_action_checklist',
  'immediate_field_attention', 'done_btn', 'no_tasks_today', 'upcoming_activities', 'next_interventions',
  'chronological', 'yield_harvest_forecast', 'expected_harvest_title', 'harvest_window', 'days_remaining',
  'projected_yield', 'estimated_gross_value', '7_day_forecast', 'mayurbhanj_district', 'live_weather_service',
  'offline', 'live', 'refresh_weather', 'weather_error_msg', 'try_again', 'field_day', 'rain_warning',
  'schedule_farm_task', 'task_title', 'task_title_placeholder', 'activity_type', 'opt_fertilizer',
  'opt_inspection', 'opt_pest_control', 'opt_weeding', 'opt_harvest', 'priority', 'priority_high',
  'priority_medium', 'priority_low', 'scheduled_date', 'preferred_time', 'dosage_details',
  'dosage_placeholder', 'description_field_notes', 'cancel', 'save_task_calendar',
  'ai_agronomist_specialist', 'realtime_advisory_for', 'alert_thunderstorm', 'alert_rain_tomorrow',
  'alert_clear_skies',
  // Activity titles
  'act_seed_sowing_nursery', 'act_field_bunding_irrigation', 'act_field_inspection_tiller',
  'act_irrigation_check_water_level', 'act_zinc_sulphate_micronutrient', 'act_weed_management_cono_weeder',
  'act_top_dressing_nitrogen_urea', 'act_stem_borer_leaf_folder_trap', 'act_mid_season_irrigation_drainage',
  'act_panicle_initiation_inspection', 'act_foliar_spray_mpp', 'act_combined_harvesting_operation',
  'act_seed_sowing_sulphur', 'act_thinning_first_hoeing', 'act_first_post_sowing_irrigation',
  'act_aphid_surveillance_neem_oil', 'act_seed_bed_prep_sowing', 'act_cri_stage_irrigation',
  // Crop names
  'crop_paddy', 'crop_mustard', 'crop_wheat', 'crop_groundnut',
  'cereal_grain', 'oilseed_cash_crop', 'oilseed_legume'
];

let allValid = true;

for (const lang of langs) {
  const filePath = path.join(process.cwd(), 'lib', 'translations', `${lang}.ts`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const dict = new Set();
  const regex = /["']?([a-zA-Z0-9_]+)["']?\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    dict.add(match[1]);
  }

  const missing = usedKeys.filter(k => !dict.has(k));
  if (missing.length > 0) {
    allValid = false;
    console.log(`❌ ${lang}: ${missing.length} missing keys -> ${missing.join(', ')}`);
  } else {
    console.log(`✅ ${lang}: ALL ${usedKeys.length} Crop Monitoring keys present and translated!`);
  }
}

if (allValid) {
  console.log("\n🎉 PERFECT! 100% of Crop Monitoring keys exist across ALL 14 languages!");
} else {
  process.exit(1);
}
