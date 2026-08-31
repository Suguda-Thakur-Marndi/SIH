'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'or'
  | 'bn'
  | 'te'
  | 'ta'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'kn'
  | 'ml'
  | 'as'
  | 'ur'
  | 'ne'
  | 'sa'
  | 'mai'
  | 'sd'
  | 'ks'
  | 'kok'
  | 'mni'
  | 'brx'
  | 'doi'
  | 'sat';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी / سنڌي', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', flag: '🇮🇳' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', flag: '🇮🇳' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर\'', flag: '🇮🇳' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' },
];

export const UI_DICTIONARY: Partial<Record<LanguageCode, Record<string, string>>> & { en: Record<string, string> } = {
  en: {
    // Nav & Common
    home: 'Home',
    dashboard: 'Dashboard',
    monitoring: 'Crop Monitoring',
    crop_details: 'Crop Details',
    risk_analysis: 'Risk Analysis',
    recommendations: 'Recommended Actions',
    market_prices: 'Market Prices',
    notifications: 'Notifications',
    schemes: 'Govt Schemes',
    financial_support: 'Financial Support',
    insurance: 'Crop Insurance',
    equipment: 'Equipment Rental',
    farmer_profile: 'Farmer Profile',
    officer_portal: 'Officer Portal',
    bank_portal: 'Bank Portal',
    govt_portal: 'Govt Portal',
    search: 'Search',
    alerts: 'Alerts',
    language: 'Language',
    select_language: 'Select Language',
    welcome: 'Welcome',
    live_status: 'Live Status',
    view_details: 'View Details',
    apply_now: 'Apply Now',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    loading: 'Loading...',

    // Authentication
    sign_in: 'Sign in',
    welcome_back: 'Welcome back to Smart Crop',
    continue_with_google: 'Continue with Google',
    mobile_number: 'Mobile number',
    email_address: 'Email address',
    password: 'Password',
    forgot_password: 'Forgot?',
    signing_in: 'Signing in...',
    create_account: 'Create account',
    dont_have_account: "Don't have an account?",
    test_accounts: 'Test accounts:',
    role_farmer: 'Farmer',
    role_officer: 'Officer',
    role_bank: 'Bank Partner',
    select_role: 'Select your role',
    register_farmer: 'Register as Farmer',
    full_name: 'Full Name',
    aadhaar_number: 'Aadhaar Number',
    district: 'District',
    state: 'State',
    land_size: 'Land Size (Acres)',
    primary_crop: 'Primary Crop',

    // Farmer Dashboard Hero & Cards
    hero_title_1: 'Protect your crop',
    hero_title_2: 'before risk becomes loss',
    hero_subtitle: 'AI-powered crop monitoring, distress prediction, and personalized farming guidance.',
    view_farm_health: 'View Farm Health',
    explore_advisory: 'Explore Advisory',
    share_live_location: 'Share Live Location',
    stop_sharing_location: 'Stop Sharing Location',
    farm_health_score: 'Farm Health',
    index_score: 'Index score',
    ndvi_status: 'NDVI Index',
    vs_30_day_avg: 'vs 30-day avg',
    requires_attention: 'Requires attention',
    advisory_action: 'Delay irrigation',
    rain_expected: 'Rain expected today',
    rainfall_deficit: 'Rainfall 35% below normal',
    profile: 'Profile',
    scroll_to_explore: 'Scroll to explore',
    land_size_label: 'LAND SIZE',
    crop_label: 'CROP',
    season_label: 'SEASON',
    sowing_date_label: 'SOWING DATE',
    active_field_locations: 'Active Field Locations',
    crop_health: 'Crop Health',
    ndvi_trend: 'NDVI Trend',
    soil_moisture: 'Soil Moisture',
    low_moisture: 'Low (22%)',
    overcast_no_rain: 'Overcast, no rain',
    expected_next_5_days: 'Expected for next 5 days',
    crop_stage: 'Crop Stage',
    flowering: 'Flowering',
    distress_intelligence: 'Distress Risk Intelligence',
    high_risk: 'HIGH RISK',
    risk_level: 'Risk Level',
    risk_climbing: 'Risk climbing over 30 days',
    contributing_factors: 'Contributing Factors',
    rainfall_deficit_factor: 'Rainfall −35%',
    market_deficit_factor: 'Market price −22%',
    loan_due_factor: 'Loan due in 8 days',
    view_insurance_options: 'View Insurance Options',
    switch_irrigation: 'Switch irrigation',
    update_schedule_soil: 'Update schedule based on soil',
    apply_insurance: 'Apply insurance',
    high_risk_crossed: 'High risk threshold crossed',
    alternative_crops: 'Alternative crops',
    explore_resilient_options: 'Explore climate-resilient options',
    risk_trend: 'Quarterly Risk Trend',

    // Officer Dashboard
    distress_command: 'Agricultural Distress Command Center',
    mayurbhanj_district: 'Mayurbhanj District, Odisha',
    assigned_farmers: 'Assigned Farmers',
    high_risk_cases: 'High Risk Triage',
    field_interventions: 'Field Interventions',
    trigger_action: 'Trigger Advisory / Action',
    inspection_report: 'Farmer Inspection Report',
    high_risk_farmers: 'High Risk Farmers',
    medium_risk_farmers: 'Medium Risk Farmers',
    low_risk_farmers: 'Low Risk Farmers',
    total_farmers_monitored: 'Total Farmers Monitored',
    priority_farmers: 'Priority Farmers',
    farmer: 'Farmer',
    crop: 'Crop',
    risk_score: 'Risk Score',
    location: 'Location',
    risk_reason: 'Risk Reason',
    loan_status: 'Loan Status',
    action: 'Action',
    distress_map: 'Distress Map',
    command_center: 'Command Center',
    analytics: 'Analytics',
    farmer_database: 'Farmer Database',
    intervention_history: 'Intervention History',
    settings: 'Settings',
    government_schemes: 'Government Schemes',
    live_distress_alerts: 'Live Distress Alerts',
    quick_intervention: 'Quick Intervention',
    risk_distribution: 'District Risk Distribution',
    top_risk_factors: 'Top Risk Factors',
    dismiss: 'Dismiss',
    intervene: 'Intervene',
    farmer_details: 'Farmer Details',
    land_holding: 'Land Holding',
    soil_type: 'Soil Type',
    water_source: 'Water Source',
    credit_status: 'Credit Status',
    distress_indicators: 'Distress Indicators',
    take_action: 'Take Action',
    live_map_label: 'Mayurbhanj District • Live',

    // Bank Dashboard
    bank_partner_portal: 'Bank Partner Portal',
    bank_dashboard: 'Bank Dashboard',
    total_facilities: 'Total Facilities',
    published: 'Published',
    draft: 'Draft',
    under_review: 'Under Review',
    approved: 'Approved',
    unpublished: 'Unpublished',
    expired: 'Expired',
    suspended: 'Suspended',
    quick_actions: 'Quick Actions',
    add_facility: '+ Add Facility',
    manage_facilities: 'Manage Facilities',
    edit_bank_profile: 'Edit Bank Profile',
    preview_farmer_view: 'Preview Farmer View',
    recent_facilities: 'Recent Facilities',
    no_facilities_yet: 'No facilities yet — click "+ Add Facility" to create your first listing.',
    verified_bank: '✓ VERIFIED BANK',
    under_review_badge: '⏳ UNDER REVIEW',
    submitted_badge: 'SUBMITTED FOR REVIEW',
    draft_badge: 'DRAFT PROFILE',
    could_not_load_dashboard: 'Could not load dashboard',
    facilities_mgmt: 'Financial Facilities Management',
    published_facilities: 'Published Loan Products',
    under_review_apps: 'Applications Under Review',
    total_disbursed: 'Total Credit Disbursed',

    // Govt Dashboard
    govt_admin_hub: 'Government Administration & Custom Hiring Hub',
    chc_machinery: 'Custom Hiring Centers (CHC) Machinery',
    subsidies_disbursed: 'Direct Subsidies Disbursed',
    registered_farmers: 'Registered Farmers',
  },

  hi: {
    // Nav & Common
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    monitoring: 'फसल निगरानी',
    crop_details: 'फसल विवरण',
    risk_analysis: 'जोखिम विश्लेषण',
    recommendations: 'सुझाए गए उपाय',
    market_prices: 'मंडी भाव',
    notifications: 'सूचनाएं',
    schemes: 'सरकारी योजनाएं',
    financial_support: 'वित्तीय सहायता',
    insurance: 'फसल बीमा',
    equipment: 'कृषि उपकरण किराया',
    farmer_profile: 'किसान प्रोफाइल',
    officer_portal: 'अधिकारी पोर्टल',
    bank_portal: 'बैंक पोर्टल',
    govt_portal: 'सरकारी पोर्टल',
    search: 'खोजें',
    alerts: 'अलर्ट',
    language: 'भाषा',
    select_language: 'भाषा चुनें',
    welcome: 'स्वागत है',
    live_status: 'लाइव स्थिति',
    view_details: 'विवरण देखें',
    apply_now: 'अभी आवेदन करें',
    back: 'वापस',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',

    // Authentication
    sign_in: 'साइन इन करें',
    welcome_back: 'स्मार्ट क्रॉप में आपका स्वागत है',
    continue_with_google: 'गूगल के साथ जारी रखें',
    mobile_number: 'मोबाइल नंबर',
    email_address: 'ईमेल पता',
    password: 'पासवर्ड',
    forgot_password: 'भूल गए?',
    signing_in: 'साइन इन हो रहा है...',
    create_account: 'खाता बनाएं',
    dont_have_account: 'खाता नहीं है?',
    test_accounts: 'परीक्षण खाते:',
    role_farmer: 'किसान',
    role_officer: 'अधिकारी',
    role_bank: 'बैंक पार्टनर',
    select_role: 'अपनी भूमिका चुनें',
    register_farmer: 'किसान के रूप में पंजीकरण करें',
    full_name: 'पूरा नाम',
    aadhaar_number: 'आधार संख्या',
    district: 'जिला',
    state: 'राज्य',
    land_size: 'भूमि का आकार (एकड़)',
    primary_crop: 'मुख्य फसल',

    // Farmer Dashboard Hero & Cards
    hero_title_1: 'अपनी फसल को सुरक्षित करें',
    hero_title_2: 'नुकसान होने से पहले',
    hero_subtitle: 'एआई-संचालित फसल निगरानी, संकट भविष्यवाणी और सटीक कृषि मार्गदर्शन।',
    view_farm_health: 'खेत का स्वास्थ्य देखें',
    explore_advisory: 'कृषि सलाह देखें',
    share_live_location: 'लाइव लोकेशन साझा करें',
    stop_sharing_location: 'लोकेशन साझा करना बंद करें',
    farm_health_score: 'खेत का स्वास्थ्य',
    index_score: 'सूचकांक स्कोर',
    ndvi_status: 'एनडीवीआई सूचकांक',
    vs_30_day_avg: '30-दिवसीय औसत की तुलना में',
    requires_attention: 'ध्यान देने की आवश्यकता है',
    advisory_action: 'सिंचाई में देरी करें',
    rain_expected: 'आज बारिश की संभावना',
    rainfall_deficit: 'बारिश सामान्य से 35% कम',
    profile: 'प्रोफाइल',
    scroll_to_explore: 'देखने के लिए नीचे स्क्रॉल करें',
    land_size_label: 'भूमि का आकार',
    crop_label: 'फसल',
    season_label: 'मौसम / सीजन',
    sowing_date_label: 'बुवाई की तारीख',
    active_field_locations: 'सक्रिय खेत स्थान',
    crop_health: 'फसल स्वास्थ्य',
    ndvi_trend: 'एनडीवीआई रुझान',
    soil_moisture: 'मिट्टी की नमी',
    low_moisture: 'कम (22%)',
    overcast_no_rain: 'बादल छाए रहेंगे, बारिश नहीं',
    expected_next_5_days: 'अगले 5 दिनों के लिए अपेक्षित',
    crop_stage: 'फसल की अवस्था',
    flowering: 'फूल आने की अवस्था',
    distress_intelligence: 'संकट जोखिम इंटेलिजेंस',
    high_risk: 'उच्च जोखिम',
    risk_level: 'जोखिम स्तर',
    risk_climbing: '30 दिनों में बढ़ता जोखिम',
    contributing_factors: 'प्रमुख योगदान कारक',
    rainfall_deficit_factor: 'वर्षा की कमी −35%',
    market_deficit_factor: 'बाजार भाव में गिरावट −22%',
    loan_due_factor: '8 दिनों में ऋण देय',
    view_insurance_options: 'फसल बीमा विकल्प देखें',
    switch_irrigation: 'सिंचाई अनुसूची बदलें',
    update_schedule_soil: 'मिट्टी के अनुसार सिंचाई करें',
    apply_insurance: 'बीमा के लिए आवेदन करें',
    high_risk_crossed: 'उच्च जोखिम सीमा पार हुई',
    alternative_crops: 'वैकल्पिक फसलें',
    explore_resilient_options: 'जलवायु-सहनशील विकल्प देखें',
    risk_trend: 'त्रैमासिक जोखिम रुझान',

    // Officer Dashboard
    distress_command: 'कृषि संकट निवारण कमांड सेंटर',
    mayurbhanj_district: 'मयूरभंज जिला, ओडिशा',
    assigned_farmers: 'पंजीकृत किसान',
    high_risk_cases: 'उच्च जोखिम किसान',
    field_interventions: 'क्षेत्रीय हस्तक्षेप',
    trigger_action: 'सलाह/कार्रवाई जारी करें',
    inspection_report: 'किसान निरीक्षण रिपोर्ट',
    high_risk_farmers: 'उच्च जोखिम किसान',
    medium_risk_farmers: 'मध्यम जोखिम किसान',
    low_risk_farmers: 'कम जोखिम किसान',
    total_farmers_monitored: 'कुल मॉनिटर किए गए किसान',
    priority_farmers: 'प्राथमिकता वाले किसान',
    farmer: 'किसान',
    crop: 'फसल',
    risk_score: 'जोखिम स्कोर',
    location: 'स्थान',
    risk_reason: 'जोखिम का कारण',
    loan_status: 'ऋण की स्थिति',
    action: 'कार्रवाई',
    distress_map: 'संकट मानचित्र',
    command_center: 'कमांड सेंटर',
    analytics: 'विश्लेषण',
    farmer_database: 'किसान डेटाबेस',
    intervention_history: 'हस्तक्षेप इतिहास',
    settings: 'सेटिंग्स',
    government_schemes: 'सरकारी योजनाएं',
    live_distress_alerts: 'लाइव संकट अलर्ट',
    quick_intervention: 'त्वरित हस्तक्षेप',
    risk_distribution: 'जिला जोखिम वितरण',
    top_risk_factors: 'प्रमुख जोखिम कारक',
    dismiss: 'खारिज करें',
    intervene: 'हस्तक्षेप करें',
    farmer_details: 'किसान का विवरण',
    land_holding: 'जमीन जोत',
    soil_type: 'मिट्टी का प्रकार',
    water_source: 'जल स्रोत',
    credit_status: 'क्रेडिट स्थिति',
    distress_indicators: 'संकट संकेतक',
    take_action: 'कार्रवाई करें',
    live_map_label: 'मयूरभंज जिला • लाइव',

    // Bank Dashboard
    bank_partner_portal: 'बैंक पार्टनर पोर्टल',
    bank_dashboard: 'बैंक डैशबोर्ड',
    total_facilities: 'कुल ऋण सुविधाएं',
    published: 'सक्रिय / प्रकाशित',
    draft: 'प्रारूप (ड्राफ्ट)',
    under_review: 'समीक्षाधीन',
    approved: 'स्वीकृत',
    unpublished: 'अप्रकाशित',
    expired: 'समाप्त',
    suspended: 'निलंबित',
    quick_actions: 'त्वरित क्रियाएं',
    add_facility: '+ ऋण सुविधा जोड़ें',
    manage_facilities: 'ऋण सुविधाएं प्रबंधित करें',
    edit_bank_profile: 'बैंक प्रोफाइल संपादित करें',
    preview_farmer_view: 'किसान दृश्य पूर्वावलोकन',
    recent_facilities: 'हाल की ऋण सुविधाएं',
    no_facilities_yet: 'कोई सुविधा नहीं — पहली सूची बनाने के लिए "+ ऋण सुविधा जोड़ें" पर क्लिक करें।',
    verified_bank: '✓ सत्यापित बैंक',
    under_review_badge: '⏳ समीक्षाधीन',
    submitted_badge: 'समीक्षा के लिए प्रस्तुत',
    draft_badge: 'ड्राफ्ट प्रोफाइल',
    could_not_load_dashboard: 'डैशबोर्ड लोड नहीं हो सका',
    facilities_mgmt: 'वित्तीय सुविधा प्रबंधन',
    published_facilities: 'सक्रिय ऋण योजनाएं',
    under_review_apps: 'समीक्षाधीन आवेदन',
    total_disbursed: 'कुल वितरित ऋण',
  },

  or: {
    // Nav & Common
    home: 'ମୂଳପୃଷ୍ଠା',
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    monitoring: 'ଫସଲ ନିରୀକ୍ଷଣ',
    crop_details: 'ଫସଲ ବିବରଣୀ',
    risk_analysis: 'ବିପଦ ବିଶ୍ଳେଷଣ',
    recommendations: 'ପରାମର୍ଶ ପଦକ୍ଷେପ',
    market_prices: 'ମଣ୍ଡି ଦର',
    notifications: 'ବିଜ୍ଞପ୍ତି',
    schemes: 'ସରକାରୀ ଯୋଜନା',
    financial_support: 'ଆର୍ଥିକ ସହାୟତା',
    insurance: 'ଫସଲ ବୀମା',
    equipment: 'କୃଷି ଯନ୍ତ୍ରପାତି ଭଡା',
    farmer_profile: 'ଚାଷୀ ପ୍ରୋଫାଇଲ୍',
    officer_portal: 'କୃଷି ଅଧିକାରୀ ପୋର୍ଟାଲ',
    bank_portal: 'ବ୍ୟାଙ୍କ ପୋର୍ଟାଲ',
    govt_portal: 'ସରକାରୀ ପୋର୍ଟାଲ',
    search: 'ସନ୍ଧାନ କରନ୍ତୁ',
    alerts: 'ଚେତାବନୀ',
    language: 'ଭାଷା',
    select_language: 'ଭାଷା ଚୟନ କରନ୍ତୁ',
    welcome: 'ସ୍ୱାଗତ',
    live_status: 'ସଦ୍ୟତନ ସ୍ଥିତି',
    view_details: 'ବିସ୍ତୃତ ଦେଖନ୍ତୁ',
    apply_now: 'ଆବେଦନ କରନ୍ତୁ',
    back: 'ଫେରନ୍ତୁ',
    submit: 'ଦାଖଲ କରନ୍ତୁ',
    cancel: 'ବାତିଲ କରନ୍ତୁ',
    loading: 'ଲୋଡ୍ ହେଉଛି...',

    // Authentication
    sign_in: 'ସାଇନ୍ ଇନ୍ କରନ୍ତୁ',
    welcome_back: 'ସ୍ମାର୍ଟ କ୍ରପ୍‌କୁ ସ୍ୱାଗତ',
    continue_with_google: 'ଗୁଗୁଲ୍ ସହିତ ଆଗକୁ ବଢ଼ନ୍ତୁ',
    mobile_number: 'ମୋବାଇଲ୍ ନମ୍ବର',
    email_address: 'ଇମେଲ୍ ଠିକଣା',
    password: 'ପାସୱାର୍ଡ',
    forgot_password: 'ଭୁଲିଗଲେ କି?',
    signing_in: 'ସାଇନ୍ ଇନ୍ ହେଉଛି...',
    create_account: 'ନୂଆ ଖାତା ଖୋଲନ୍ତୁ',
    dont_have_account: 'ଖାତା ନାହିଁ କି?',
    test_accounts: 'ଟେଷ୍ଟ ଆକାଉଣ୍ଟ:',
    role_farmer: 'ଚାଷୀ',
    role_officer: 'କୃଷି ଅଧିକାରୀ',
    role_bank: 'ବ୍ୟାଙ୍କ ପାର୍ଟନର',
    select_role: 'ଆପଣଙ୍କ ଭୂମିକା ଚୟନ କରନ୍ତୁ',
    register_farmer: 'ଚାଷୀ ଭାବରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ',
    full_name: 'ପୂରା ନାମ',
    aadhaar_number: 'ଆଧାର ସଂଖ୍ୟା',
    district: 'ଜିଲ୍ଲା',
    state: 'ରାଜ୍ୟ',
    land_size: 'ଜମି ପରିମାଣ (ଏକର)',
    primary_crop: 'ମୁଖ୍ୟ ଫସଲ',

    // Farmer Dashboard Hero & Cards
    hero_title_1: 'ଆପଣଙ୍କ ଫସଲକୁ ସୁରକ୍ଷିତ ରଖନ୍ତୁ',
    hero_title_2: 'କ୍ଷତି ହେବା ପୂର୍ବରୁ',
    hero_subtitle: 'ଏଆଇ-ଆଧାରିତ ଫସଲ ନିରୀକ୍ଷଣ, ସଙ୍କଟ ପୂର୍ବାନୁମାନ ଏବଂ ବ୍ୟକ୍ତିଗତ କୃଷି ପରାମର୍ଶ।',
    view_farm_health: 'ଫାର୍ମ ସ୍ୱାସ୍ଥ୍ୟ ଦେଖନ୍ତୁ',
    explore_advisory: 'କୃଷି ପରାମର୍ଶ ଦେଖନ୍ତୁ',
    share_live_location: 'ପ୍ରତ୍ୟକ୍ଷ ଅବସ୍ଥିତି ସେୟାର କରନ୍ତୁ',
    stop_sharing_location: 'ଅବସ୍ଥିତି ସେୟାର ବନ୍ଦ କରନ୍ତୁ',
    farm_health_score: 'ଫାର୍ମ ସ୍ୱାସ୍ଥ୍ୟ',
    index_score: 'ସୂଚକାଙ୍କ ସ୍କୋର',
    ndvi_status: 'ଏନଡିଭିଆଇ ସୂଚକ',
    vs_30_day_avg: '୩୦ ଦିନର ହାରାହାରି ତୁଳନାରେ',
    requires_attention: 'ଧ୍ୟାନ ଦେବା ଆବଶ୍ୟକ',
    advisory_action: 'ଜଳସେଚନ ବିଳମ୍ବ କରନ୍ତୁ',
    rain_expected: 'ଆଜି ବର୍ଷା ହେବାର ସମ୍ଭାବନା',
    rainfall_deficit: 'ବର୍ଷା ସାଧାରଣ ତୁଳନାରେ ୩୫% କମ୍',
    profile: 'ପ୍ରୋଫାଇଲ୍',
    scroll_to_explore: 'ଦେଖିବା ପାଇଁ ତଳକୁ ସ୍କ୍ରୋଲ୍ କରନ୍ତୁ',
    land_size_label: 'ଜମି ପରିମାଣ',
    crop_label: 'ଫସଲ',
    season_label: 'ଋତୁ',
    sowing_date_label: 'ବୁଣିବା ତାରିଖ',
    active_field_locations: 'ସକ୍ରିୟ କ୍ଷେତ୍ର ଅବସ୍ଥିତି',
    crop_health: 'ଫସଲ ସ୍ୱାସ୍ଥ୍ୟ',
    ndvi_trend: 'ଏନଡିଭିଆଇ ଧାରା',
    soil_moisture: 'ମାଟିର ଆର୍ଦ୍ରତା',
    low_moisture: 'କମ୍ (୨୨%)',
    overcast_no_rain: 'ମେଘୁଆ, ବର୍ଷା ନାହିଁ',
    expected_next_5_days: 'ଆଗାମୀ ୫ ଦିନ ପାଇଁ ଆଶଙ୍କା',
    crop_stage: 'ଫସଲର ପର୍ଯ୍ୟାୟ',
    flowering: 'ଫୁଲ ଫୁଟିବା',
    distress_intelligence: 'ସଙ୍କଟ ବିପଦ ଇଣ୍ଟେଲିଜେନ୍ସ',
    high_risk: 'ଉଚ୍ଚ ବିପଦ',
    risk_level: 'ବିପଦ ସ୍ତର',
    risk_climbing: '୩୦ ଦିନରେ ବୃଦ୍ଧି ପାଉଥିବା ବିପଦ',
    contributing_factors: 'ପ୍ରମୁଖ ବିପଦ କାରଣ',
    rainfall_deficit_factor: 'ବର୍ଷା ଅଭାବ −୩୫%',
    market_deficit_factor: 'ମଣ୍ଡି ଦର ହ୍ରାସ −୨୨%',
    loan_due_factor: '୮ ଦିନରେ ଋଣ ପରିଶୋଧ',
    view_insurance_options: 'ଫସଲ ବୀମା ବିକଳ୍ପ ଦେଖନ୍ତୁ',
    switch_irrigation: 'ଜଳସେଚନ ସମୟସୂଚୀ ପରିବର୍ତ୍ତନ',
    update_schedule_soil: 'ମାଟି ଅନୁଯାୟୀ ଜଳସେଚନ କରନ୍ତୁ',
    apply_insurance: 'ବୀମା ଆବେଦନ କରନ୍ତୁ',
    high_risk_crossed: 'ଅତ୍ୟଧିକ ବିପଦ ସୀମା ପାର',
    alternative_crops: 'ବିକଳ୍ପ ଫସଲ',
    explore_resilient_options: 'ଜଳବାୟୁ-ସହନଶୀଳ ବିକଳ୍ପ ଦେଖନ୍ତୁ',
    risk_trend: 'ତ୍ରୈମାସିକ ବିପଦ ଧାରା',

    // Officer Dashboard
    distress_command: 'କୃଷି ସଙ୍କଟ ପରିଚାଳନା କମାଣ୍ଡ ସେଣ୍ଟର',
    mayurbhanj_district: 'ମୟୂରଭଞ୍ଜ ଜିଲ୍ଲା, ଓଡ଼ିଶା',
    assigned_farmers: 'ନିୟୋଜିତ ଚାଷୀ',
    high_risk_cases: 'ଅତ୍ୟଧିକ ବିପଦଗ୍ରସ୍ତ ଚାଷୀ',
    field_interventions: 'କ୍ଷେତ୍ରସ୍ତରୀୟ ହସ୍ତକ୍ଷେପ',
    trigger_action: 'ପରାମର୍ଶ / କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଜାରି କରନ୍ତୁ',
    inspection_report: 'ଚାଷୀ ପରିଦର୍ଶନ ରିପୋର୍ଟ',
    high_risk_farmers: 'ଅତ୍ୟଧିକ ବିପଦଗ୍ରସ୍ତ ଚାଷୀ',
    medium_risk_farmers: 'ମଧ୍ୟମ ବିପଦଗ୍ରସ୍ତ ଚାଷୀ',
    low_risk_farmers: 'ସ୍ୱଳ୍ପ ବିପଦ ଚାଷୀ',
    total_farmers_monitored: 'ମୋଟ ନିରୀକ୍ଷିତ ଚାଷୀ',
    priority_farmers: 'ପ୍ରାଥମିକତା ଚାଷୀ',
    farmer: 'ଚାଷୀ',
    crop: 'ଫସଲ',
    risk_score: 'ବିପଦ ସ୍କୋର',
    location: 'ସ୍ଥାନ',
    risk_reason: 'ବିପଦର କାରଣ',
    loan_status: 'ଋଣ ସ୍ଥିତି',
    action: 'ପଦକ୍ଷେପ',
    distress_map: 'ସଙ୍କଟ ମାନଚିତ୍ର',
    command_center: 'କମାଣ୍ଡ ସେଣ୍ଟର',
    analytics: 'ବିଶ୍ଳେଷଣ',
    farmer_database: 'ଚାଷୀ ଡାଟାବେସ୍',
    intervention_history: 'ହସ୍ତକ୍ଷେପ ଇତିହାସ',
    settings: 'ସେଟିଙ୍ଗ୍ସ',
    government_schemes: 'ସରକାରୀ ଯୋଜନା',
    live_distress_alerts: 'ପ୍ରତ୍ୟକ୍ଷ ସଙ୍କଟ ଚେତାବନୀ',
    quick_intervention: 'ତ୍ୱରିତ ହସ୍ତକ୍ଷେପ',
    risk_distribution: 'ଜିଲ୍ଲା ବିପଦ ବଣ୍ଟନ',
    top_risk_factors: 'ପ୍ରମୁଖ ବିପଦ କାରଣ',
    dismiss: 'ଅଣଦେଖା କରନ୍ତୁ',
    intervene: 'ହସ୍ତକ୍ଷେପ କରନ୍ତୁ',
    farmer_details: 'ଚାଷୀଙ୍କ ବିବରଣୀ',
    land_holding: 'ଜମି ପରିମାଣ',
    soil_type: 'ମାଟିର ପ୍ରକାର',
    water_source: 'ଜଳ ଉତ୍ସ',
    credit_status: 'ଋଣ ସ୍ଥିତି',
    distress_indicators: 'ସଙ୍କଟ ସୂଚକ',
    take_action: 'ପଦକ୍ଷେପ ନିଅନ୍ତୁ',
    live_map_label: 'ମୟୂରଭଞ୍ଜ ଜିଲ୍ଲା • ଲାଇଭ୍',

    // Bank Dashboard
    bank_partner_portal: 'ବ୍ୟାଙ୍କ ପାର୍ଟନର ପୋର୍ଟାଲ',
    bank_dashboard: 'ବ୍ୟାଙ୍କ ଡ୍ୟାସବୋର୍ଡ',
    total_facilities: 'ମୋଟ ଋଣ ସୁବିଧା',
    published: 'ପ୍ରକାଶିତ',
    draft: 'ଡ୍ରାଫ୍ଟ',
    under_review: 'ସମୀକ୍ଷାଧୀନ',
    approved: 'ଅନୁମୋଦିତ',
    unpublished: 'ଅପ୍ରକାଶିତ',
    expired: 'ସମାପ୍ତ',
    suspended: 'ସ୍ଥଗିତ',
    quick_actions: 'ତ୍ୱରିତ ପଦକ୍ଷେପ',
    add_facility: '+ ଋଣ ସୁବିଧା ଯୋଡନ୍ତୁ',
    manage_facilities: 'ଋଣ ସୁବିଧା ପରିଚାଳନା କରନ୍ତୁ',
    edit_bank_profile: 'ବ୍ୟାଙ୍କ ପ୍ରୋଫାଇଲ୍ ସଂଶୋଧନ କରନ୍ତୁ',
    preview_farmer_view: 'ଚାଷୀ ଦୃଶ୍ୟ ପୂର୍ବାବଲୋକନ',
    recent_facilities: 'ସାମ୍ପ୍ରତିକ ଋଣ ସୁବିଧା',
    no_facilities_yet: 'କୌଣସି ସୁବିଧା ନାହିଁ — ପ୍ରଥମ ତାଲିକା ତିଆରି କରିବାକୁ "+ ଋଣ ସୁବିଧା ଯୋଡନ୍ତୁ" କ୍ଲିକ୍ କରନ୍ତୁ।',
    verified_bank: '✓ ପ୍ରମାଣିତ ବ୍ୟାଙ୍କ',
    under_review_badge: '⏳ ସମୀକ୍ଷାଧୀନ',
    submitted_badge: 'ସମୀକ୍ଷା ପାଇଁ ଦାଖଲ',
    draft_badge: 'ଡ୍ରାଫ୍ଟ ପ୍ରୋଫାଇଲ୍',
    could_not_load_dashboard: 'ଡ୍ୟାସବୋର୍ଡ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ',
    facilities_mgmt: 'ଋଣ ସୁବିଧା ପରିଚାଳନା',
    published_facilities: 'ପ୍ରକାଶିତ ଋଣ ଯୋଜନା',
    under_review_apps: 'ସମୀକ୍ଷାଧୀନ ଆବେଦନ',
    total_disbursed: 'ସର୍ବମୋଟ ପ୍ରଦତ୍ତ ଋଣ',

    // Govt Dashboard
    govt_admin_hub: 'ସରକାରୀ ପ୍ରଶାସନ ଓ କଷ୍ଟମ ହାୟରିଂ ହବ୍',
    chc_machinery: 'କଷ୍ଟମ ହାୟରିଂ କେନ୍ଦ୍ର ଯନ୍ତ୍ରପାତି',
    subsidies_disbursed: 'ପ୍ରତ୍ୟକ୍ଷ ସବସିଡି ପ୍ରଦାନ',
    registered_farmers: 'ପଞ୍ଜୀକୃତ ଚାଷୀ',
  },

  bn: {
    home: 'হোম',
    dashboard: 'ড্যাশবোর্ড',
    monitoring: 'ফসল পর্যবেক্ষণ',
    crop_details: 'ফসলের বিবরণ',
    risk_analysis: 'ঝুঁকি বিশ্লেষণ',
    recommendations: 'পরামর্শমূলক পদক্ষেপ',
    market_prices: 'মণ্ডির দর',
    notifications: 'বিজ্ঞপ্তি',
    schemes: 'সরকারি প্রকল্প',
    financial_support: 'আর্থিক সহায়তা',
    insurance: 'ফসল বীমা',
    equipment: 'যন্ত্রপাতি ভাড়া',
    farmer_profile: 'কৃষক প্রোফাইল',
    officer_portal: 'অফিসার পোর্টাল',
    bank_portal: 'ব্যাংক পোর্টাল',
    govt_portal: 'সরকারি পোর্টাল',
    search: 'অনুসন্ধান',
    alerts: 'সতর্কতা',
    language: 'ভাষা',
    select_language: 'ভাষা নির্বাচন করুন',
    welcome: 'স্বাগতম',
    live_status: 'লাইভ স্থিতি',
    view_details: 'বিস্তারিত দেখুন',
    apply_now: 'আবেদন করুন',
    back: 'পেছনে',
    submit: 'জমা দিন',
    cancel: 'বাতিল',
    loading: 'লোড হচ্ছে...',
    farm_intelligence: 'এআই কৃষি বুদ্ধিমত্তা ও নিখুঁত পরামর্শ',
    weather_forecast: 'আবহাওয়া পূর্বাভাস',
    temperature: 'তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    soil_moisture: 'মাটির আর্দ্রতা',
    crop_health: 'ফসলের স্বাস্থ্য',
    growth_stage: 'বৃদ্ধির পর্যায়',
    days_sown: 'বপনের দিন',
    risk_level: 'সার্বিক ঝুঁকি',
    optimal: 'অনুকূল',
    moderate: 'মাঝারি ঝুঁকি',
    high_risk: 'উচ্চ ঝুঁকি',
    pest_warning: 'কীটপতঙ্গ ও রোগ সতর্কতা',
    water_stress: 'জলের ঘাটতি সতর্কতা',
    alternate_crops: 'বিকল্প জলবায়ু সহনশীল ফসল',
    explore_crops: 'ফসল দেখুন',
    live_mandi_rates: 'লাইভ মণ্ডির বাজার দর',
    highest_price: 'সর্বোচ্চ দর',
    distress_command: 'কৃষি সংকট কমান্ড সেন্টার',
    mayurbhanj_district: 'ময়ূরভঞ্জ জেলা',
    assigned_farmers: 'নিবন্ধিত কৃষক',
    high_risk_cases: 'উচ্চ ঝুঁকির কৃষক',
    field_interventions: 'মাঠ পর্যায়ের পদক্ষেপ',
    trigger_action: 'পদক্ষেপ জারি করুন',
    inspection_report: 'কৃষক পরিদর্শন রিপোর্ট',
    bank_dashboard: 'ব্যাংক ক্রেডিট ড্যাশবোর্ড',
    facilities_mgmt: 'ঋণ সুবিধা ব্যবস্থাপনা',
    add_facility: 'নতুন ঋণ পণ্য যোগ করুন',
    published_facilities: 'প্রকাশিত ঋণ পণ্য',
    under_review_apps: 'পর্যালোচনাধীন আবেদন',
    total_disbursed: 'মোট বিতরণকৃত ঋণ',
    govt_admin_hub: 'সরকারি প্রশাসন হাব',
    chc_machinery: 'যন্ত্রপাতি কেন্দ্র',
    subsidies_disbursed: 'ভর্তুকি বিতরণ',
    registered_farmers: 'নিবন্ধিত কৃষক',
  },

  te: {
    home: 'హోమ్',
    dashboard: 'డ్యాష్‌బోర్డ్',
    monitoring: 'పంట పర్యవేక్షణ',
    crop_details: 'పంట వివరాలు',
    risk_analysis: 'ప్రమాద విశ్లేషణ',
    recommendations: 'సిఫార్సు చేసిన చర్యలు',
    market_prices: 'మార్కెట్ ధరలు',
    notifications: 'నోటిఫికేషన్లు',
    schemes: 'ప్రభుత్వ పథకాలు',
    financial_support: 'ఆర్థిక సహాయం',
    insurance: 'పంట బీమా',
    equipment: 'వ్యవసాయ పరికరాల అద్దె',
    farmer_profile: 'రైతు ప్రొఫైల్',
    officer_portal: 'అధికారి పోర్టల్',
    bank_portal: 'బ్యాంక్ పోర్టల్',
    govt_portal: 'ప్రభుత్వ పోర్టల్',
    search: 'వెతకండి',
    alerts: 'హెచ్చరికలు',
    language: 'భాష',
    select_language: 'భాషను ఎంచుకోండి',
    welcome: 'స్వాగతం',
    live_status: 'ప్రత్యక్ష స్థితి',
    view_details: 'వివరాలు చూడండి',
    apply_now: 'దరఖాస్తు చేసుకోండి',
    back: 'వెనుకకు',
    submit: 'సమర్పించండి',
    cancel: 'రద్దు చేయండి',
    loading: 'లోడ్ అవుతోంది...',
    farm_intelligence: 'ఏఐ వ్యవసాయ మేధస్సు & ఖచ్చితమైన సలహా',
    weather_forecast: 'వాతావరణ సూచన',
    temperature: 'ఉష్ణోగ్రత',
    humidity: 'తేమ',
    soil_moisture: 'నేల తేమ',
    crop_health: 'పంట ఆరోగ్యం',
    growth_stage: 'వృద్ధి దశ',
    days_sown: 'విత్తిన రోజులు',
    risk_level: 'మొత్తం ప్రమాద స్థాయి',
    optimal: 'అనుకూలమైనది',
    moderate: 'మధ్యస్థ ప్రమాదం',
    high_risk: 'అధిక ప్రమాదం',
    pest_warning: 'పురుగుల & తెగుళ్ల హెచ్చరిక',
    water_stress: 'నీటి కొరత హెచ్చరిక',
    alternate_crops: 'ప్రత్యామ్నాయ వాతావరణ-తట్టుకునే పంటలు',
    explore_crops: 'పంటలను అన్వేషించండి',
    live_mandi_rates: 'లైవ్ మార్కెట్ ధరలు',
    highest_price: 'గరిష్ట ధర',
    distress_command: 'వ్యవసాయ సంక్షోభ కమాండ్ సెంటర్',
    mayurbhanj_district: 'మయూర్‌భంజ్ జిల్లా',
    assigned_farmers: 'కేటాయించిన రైతులు',
    high_risk_cases: 'అధిక ప్రమాద కేసులు',
    field_interventions: 'క్షేత్ర జోక్యాలు',
    trigger_action: 'చర్యను ప్రారంభించండి',
    inspection_report: 'రైతు తనిఖీ నివేదిక',
    bank_dashboard: 'బ్యాంక్ క్రెడిట్ డ్యాష్‌బోర్డ్',
    facilities_mgmt: 'రుణ సౌకర్యాల నిర్వహణ',
    add_facility: 'రుణ ఉత్పత్తిని జోడించండి',
    published_facilities: 'ప్రచురించిన రుణాలు',
    under_review_apps: 'సమీక్షలో ఉన్న దరఖాస్తులు',
    total_disbursed: 'మొత్తం పంపిణీ చేసిన రుణం',
    govt_admin_hub: 'ప్రభుత్వ పరిపాలనా కేంద్రం',
    chc_machinery: 'యంత్ర పరికరాలు',
    subsidies_disbursed: 'రాయితీ పంపిణీ',
    registered_farmers: 'నమోదైన రైతులు',
  },

  ta: {
    home: 'முகப்பு',
    dashboard: 'டாஷ்போர்டு',
    monitoring: 'பயிர் கண்காணிப்பு',
    crop_details: 'பயிர் விவரங்கள்',
    risk_analysis: 'இடர் பகுப்பாய்வு',
    recommendations: 'பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்',
    market_prices: 'சந்தை விலைகள்',
    notifications: 'அறிவிப்புகள்',
    schemes: 'அரசு திட்டங்கள்',
    financial_support: 'நிதி உதவி',
    insurance: 'பயிர் காப்பீடு',
    equipment: 'விவசாய உபகரண வாடகை',
    farmer_profile: 'விவசாயி சுயவிவரம்',
    officer_portal: 'அதிகாரி போர்டல்',
    bank_portal: 'வங்கி போர்டல்',
    govt_portal: 'அரசு போர்டல்',
    search: 'தேடு',
    alerts: 'எச்சரிக்கைகள்',
    language: 'மொழி',
    select_language: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    welcome: 'வரவேற்பு',
    live_status: 'நேரலை நிலை',
    view_details: 'விவரங்களைப் பார்க்கவும்',
    apply_now: 'விண்ணப்பிக்கவும்',
    back: 'பின்செல்க',
    submit: 'சமர்ப்பிக்கவும்',
    cancel: 'ரத்து செய்',
    loading: 'ஏற்றுகிறது...',
    farm_intelligence: 'AI பண்ணை நுண்ணறிவு மற்றும் துல்லியமான ஆலோசனை',
    weather_forecast: 'வானிலை முன்னறிவிப்பு',
    temperature: 'வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    soil_moisture: 'மண் ஈரப்பதம்',
    crop_health: 'பயிர் ஆரோக்கியம்',
    growth_stage: 'வளர்ச்சி நிலை',
    days_sown: 'விதைக்கப்பட்ட நாட்கள்',
    risk_level: 'ஒட்டுமொத்த இடர் நிலை',
    optimal: 'சிறந்தது',
    moderate: 'மிதமான இடர்',
    high_risk: 'அதிக இடர்',
    pest_warning: 'பூச்சி மற்றும் நோய் எச்சரிக்கை',
    water_stress: 'நீர்ப் பற்றாக்குறை எச்சரிக்கை',
    alternate_crops: 'மாற்று காலநிலை பயிர்கள்',
    explore_crops: 'பயிர்களை ஆராயுங்கள்',
    live_mandi_rates: 'நேரடி மண்டி சந்தை விலைகள்',
    highest_price: 'அதிகபட்ச விலை',
    distress_command: 'வேளாண் துயர்தணிப்பு கட்டுப்பாட்டு மையம்',
    mayurbhanj_district: 'மயூர்பஞ்ச் மாவட்டம்',
    assigned_farmers: 'ஒதுக்கப்பட்ட விவசாயிகள்',
    high_risk_cases: 'அதிக இடர் விவசாயிகள்',
    field_interventions: 'கள நடவடிக்கைகள்',
    trigger_action: 'நடவடிக்கை தொடங்குக',
    inspection_report: 'விவசாயி ஆய்வு அறிக்கை',
    bank_dashboard: 'வங்கி கடன் டாஷ்போர்டு',
    facilities_mgmt: 'கடன் வசதிகள் மேலாண்மை',
    add_facility: 'புதிய கடன் திட்டம் சேர்க்க',
    published_facilities: 'வெளியிடப்பட்ட கடன்கள்',
    under_review_apps: 'மதிப்பாய்வில் உள்ள விண்ணப்பங்கள்',
    total_disbursed: 'வழங்கப்பட்ட மொத்த கடன்',
    govt_admin_hub: 'அரசு நிர்வாக மையம்',
    chc_machinery: 'வாடகை மைய இயந்திரங்கள்',
    subsidies_disbursed: 'மானியம் வழங்கப்பட்டது',
    registered_farmers: 'பதிவுசெய்த விவசாயிகள்',
  },

  mr: {
    home: 'मुख्यपृष्ठ',
    dashboard: 'डॅशबोर्ड',
    monitoring: 'पीक देखरेख',
    crop_details: 'पीक तपशील',
    risk_analysis: 'जोखीम विश्लेषण',
    recommendations: 'शिफारस केलेल्या कृती',
    market_prices: 'बाजार भाव',
    notifications: 'सूचना',
    schemes: 'सरकारी योजना',
    financial_support: 'आर्थिक सहाय्य',
    insurance: 'पीक विमा',
    equipment: 'कृषी अवजारे भाडेतत्त्वावर',
    farmer_profile: 'शेतकरी प्रोफाइल',
    officer_portal: 'अधिकारी पोर्टल',
    bank_portal: 'बँक पोर्टल',
    govt_portal: 'सरकारी पोर्टल',
    search: 'शोधा',
    alerts: 'इशारे',
    language: 'भाषा',
    select_language: 'भाषा निवडा',
    welcome: 'स्वागत आहे',
    live_status: 'थेट स्थिती',
    view_details: 'तपशील पहा',
    apply_now: 'अर्ज करा',
    back: 'मागे',
    submit: 'सादर करा',
    cancel: 'रद्द करा',
    loading: 'लोड होत आहे...',
    farm_intelligence: 'एआय कृषी बुद्धिमत्ता आणि अचूक सल्ला',
    weather_forecast: 'हवामान अंदाज',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    soil_moisture: 'मातीतील ओलावा',
    crop_health: 'पिकाचे आरोग्य',
    growth_stage: 'वाढीचा टप्पा',
    days_sown: 'पेरणीचे दिवस',
    risk_level: 'एकूण जोखीम पातळी',
    optimal: 'उत्तम',
    moderate: 'मध्यम जोखीम',
    high_risk: 'उच्च जोखीम',
    pest_warning: 'कीड व रोग सल्ला',
    water_stress: 'पाणी टंचाई इशारा',
    alternate_crops: 'पर्यायी हवामान-अनुकूल पिके',
    explore_crops: 'पिके शोधा',
    live_mandi_rates: 'थेट बाजार भाव',
    highest_price: 'कमाल दर',
    distress_command: 'कृषी संकट नियंत्रण केंद्र',
    mayurbhanj_district: 'मयूरभंज जिल्हा',
    assigned_farmers: 'नोंदणीकृत शेतकरी',
    high_risk_cases: 'उच्च जोखीम शेतकरी',
    field_interventions: 'क्षेत्रीय उपाययोजना',
    trigger_action: 'कृती सुरू करा',
    inspection_report: 'शेतकरी तपासणी अहवाल',
    bank_dashboard: 'बँक क्रेडिट डॅशबोर्ड',
    facilities_mgmt: 'कर्ज सुविधा व्यवस्थापन',
    add_facility: 'नवीन कर्ज उत्पादन जोडा',
    published_facilities: 'प्रकाशित कर्ज योजना',
    under_review_apps: 'तपासणी अंतर्गत अर्ज',
    total_disbursed: 'एकूण वितरित कर्ज',
    govt_admin_hub: 'सरकारी प्रशासन केंद्र',
    chc_machinery: 'कस्टम हायरिंग यंत्रसामग्री',
    subsidies_disbursed: 'वितरित अनुदान',
    registered_farmers: 'नोंदणीकृत शेतकरी',
  },

  gu: {
    home: 'મુખ્ય પૃષ્ઠ',
    dashboard: 'ડેશબોર્ડ',
    monitoring: 'પાક નિરીક્ષણ',
    crop_details: 'પાકની વિગતો',
    risk_analysis: 'જોખમ વિશ્લેષણ',
    recommendations: 'ભલામણ કરેલ પગલાં',
    market_prices: 'બજાર ભાવ',
    notifications: 'સૂચનાઓ',
    schemes: 'સરકારી યોજનાઓ',
    financial_support: 'નાણાકીય સહાય',
    insurance: 'પાક વીમો',
    equipment: 'સાધનો ભાડે',
    farmer_profile: 'ખેડૂત પ્રોફાઇલ',
    officer_portal: 'અધિકારી પોર્ટલ',
    bank_portal: 'બેંક પોર્ટલ',
    govt_portal: 'સરકારી પોર્ટલ',
    search: 'શોધો',
    alerts: 'ચેતવણીઓ',
    language: 'ભાષા',
    select_language: 'ભાષા પસંદ કરો',
    welcome: 'સ્વાગત છે',
    live_status: 'લાઇવ સ્થિતિ',
    view_details: 'વિગતો જુઓ',
    apply_now: 'અરજી કરો',
    back: 'પાછા',
    submit: 'સબમિટ કરો',
    cancel: 'રદ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    farm_intelligence: 'AI કૃષિ બુદ્ધિ અને સચોટ સલાહ',
    weather_forecast: 'હવામાન આગાહી',
    temperature: 'તાપમાન',
    humidity: 'ભેજ',
    soil_moisture: 'જમીનનો ભેજ',
    crop_health: 'પાકનું સ્વાસ્થ્ય',
    growth_stage: 'વિકાસનો તબક્કો',
    days_sown: 'વાવણીના દિવસો',
    risk_level: 'એકંદર જોખમ સ્તર',
    optimal: 'શ્રેષ્ઠ',
    moderate: 'મધ્યમ જોખમ',
    high_risk: 'ઉચ્ચ જોખમ',
    pest_warning: 'જીવાત અને રોગ ચેતવણી',
    water_stress: 'પાણીની તંગી ચેતવણી',
    alternate_crops: 'વૈકલ્પિક પાકો',
    explore_crops: 'પાક જુઓ',
    live_mandi_rates: 'લાઇવ મંડી બજાર ભાવ',
    highest_price: 'મહત્તમ ભાવ',
    distress_command: 'કૃષિ કટોકટી કમાન્ડ સેન્ટર',
    mayurbhanj_district: 'મયૂરભંજ જિલ્લો',
    assigned_farmers: 'સોંપાયેલા ખેડૂતો',
    high_risk_cases: 'ઉચ્ચ જોખમ ખેડૂતો',
    field_interventions: 'ક્ષેત્રીય હસ્તક્ષેપ',
    trigger_action: 'પગલાં શરૂ કરો',
    inspection_report: 'ખેડૂત નિરીક્ષણ અહેવાલ',
    bank_dashboard: 'બેંક ક્રેડિટ ડેશબોર્ડ',
    facilities_mgmt: 'ધિરાણ સુવિધા વ્યવસ્થાપન',
    add_facility: 'નવી લોન પ્રોડક્ટ ઉમેરો',
    published_facilities: 'પ્રકાશિત લોન',
    under_review_apps: 'સમીક્ષા હેઠળની અરજીઓ',
    total_disbursed: 'કુલ વિતરણ કરેલ લોન',
    govt_admin_hub: 'સરકારી વહીવટી હબ',
    chc_machinery: 'મશીનરી કેન્દ્રો',
    subsidies_disbursed: 'સબસિડી વિતરણ',
    registered_farmers: 'નોંધાયેલા ખેડૂતો',
  },

  pa: {
    home: 'ਮੁੱਖ ਪੰਨਾ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    monitoring: 'ਫ਼ਸਲ ਨਿਗਰਾਨੀ',
    crop_details: 'ਫ਼ਸਲ ਵੇਰਵਾ',
    risk_analysis: 'ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਣ',
    recommendations: 'ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਕਾਰਵਾਈਆਂ',
    market_prices: 'ਮੰਡੀ ਭਾਅ',
    notifications: 'ਸੂਚਨਾਵਾਂ',
    schemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
    financial_support: 'ਵਿੱਤੀ ਸਹਾਇਤਾ',
    insurance: 'ਫ਼ਸਲ ਬੀਮਾ',
    equipment: 'ਮਸ਼ੀਨਰੀ ਕਿਰਾਇਆ',
    farmer_profile: 'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ',
    officer_portal: 'ਅਧਿਕਾਰੀ ਪੋਰਟਲ',
    bank_portal: 'ਬੈਂਕ ਪੋਰਟਲ',
    govt_portal: 'ਸਰਕਾਰੀ ਪੋਰਟਲ',
    search: 'ਖੋਜੋ',
    alerts: 'ਚੇਤਾਵਨੀਆਂ',
    language: 'ਭਾਸ਼ਾ',
    select_language: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    live_status: 'ਲਾਈਵ ਸਥਿਤੀ',
    view_details: 'ਵੇਰਵੇ ਦੇਖੋ',
    apply_now: 'ਅਪਲਾਈ ਕਰੋ',
    back: 'ਪਿੱਛੇ',
    submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    farm_intelligence: 'AI ਖੇਤੀਬਾੜੀ ਬੁੱਧੀ ਅਤੇ ਸਲਾਹ',
    weather_forecast: 'ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ',
    temperature: 'ਤਾਪਮਾਨ',
    humidity: 'ਨਮੀ',
    soil_moisture: 'ਮਿੱਟੀ ਦੀ ਨਮੀ',
    crop_health: 'ਫ਼ਸਲ ਦੀ ਸਿਹਤ',
    growth_stage: 'ਵਿਕਾਸ ਪੜਾਅ',
    days_sown: 'ਬਿਜਾਈ ਦੇ ਦਿਨ',
    risk_level: 'ਕੁੱਲ ਜੋਖਮ ਪੱਧਰ',
    optimal: 'ਵਧੀਆ',
    moderate: 'ਦਰਮਿਆਨਾ ਜੋਖਮ',
    high_risk: 'ਉੱਚ ਜੋਖਮ',
    pest_warning: 'ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀ ਚੇਤਾਵਨੀ',
    water_stress: 'ਪਾਣੀ ਦੀ ਘਾਟ ਚੇਤਾਵਨੀ',
    alternate_crops: 'ਬਦਲਵੀਆਂ ਫ਼ਸਲਾਂ',
    explore_crops: 'ਫ਼ਸਲਾਂ ਦੇਖੋ',
    live_mandi_rates: 'ਲਾਈਵ ਮੰਡੀ ਭਾਅ',
    highest_price: 'ਵੱਧ ਤੋਂ ਵੱਧ ਕੀਮਤ',
    distress_command: 'ਖੇਤੀ ਸੰਕਟ ਕਮਾਂਡ ਸੈਂਟਰ',
    mayurbhanj_district: 'ਮਯੂਰਭੰਜ ਜ਼ਿਲ੍ਹਾ',
    assigned_farmers: 'ਦਰਜ ਕਿਸਾਨ',
    high_risk_cases: 'ਉੱਚ ਜੋਖਮ ਕਿਸਾਨ',
    field_interventions: 'ਖੇਤਰੀ ਕਾਰਵਾਈਆਂ',
    trigger_action: 'ਕਾਰਵਾਈ ਸ਼ੁਰੂ ਕਰੋ',
    inspection_report: 'ਕਿਸਾਨ ਨਿਰੀਖਣ ਰਿਪੋਰਟ',
    bank_dashboard: 'ਬੈਂਕ ਕ੍ਰੈਡਿਟ ਡੈਸ਼ਬੋਰਡ',
    facilities_mgmt: 'ਕਰਜ਼ਾ ਸਹੂਲਤ ਪ੍ਰਬੰਧਨ',
    add_facility: 'ਨਵਾਂ ਕਰਜ਼ਾ ਸ਼ਾਮਲ ਕਰੋ',
    published_facilities: 'ਜਾਰੀ ਕੀਤੇ ਕਰਜ਼ੇ',
    under_review_apps: 'ਸਮੀਖਿਆ ਅਧੀਨ ਅਰਜ਼ੀਆਂ',
    total_disbursed: 'ਕੁੱਲ ਵੰਡਿਆ ਕਰਜ਼ਾ',
    govt_admin_hub: 'ਸਰਕਾਰੀ ਪ੍ਰਸ਼ਾਸਨ ਹੱਬ',
    chc_machinery: 'ਕਸਟਮ ਹਾਇਰਿੰਗ ਮਸ਼ੀਨਰੀ',
    subsidies_disbursed: 'ਸਬਸਿਡੀ ਵੰਡ',
    registered_farmers: 'ਦਰਜ ਕਿਸਾਨ',
  },

  kn: {
    home: 'ಮುಖಪುಟ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    monitoring: 'ಬೆಳೆ ಮೇಲ್ವಿಚಾರಣೆ',
    crop_details: 'ಬೆಳೆ ವಿವರಗಳು',
    risk_analysis: 'ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ',
    recommendations: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು',
    market_prices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    financial_support: 'ಹಣಕಾಸು ನೆರವು',
    insurance: 'ಬೆಳೆ ವಿಮೆ',
    equipment: 'ಕೃಷಿ ಉಪಕರಣ ಬಾಡಿಗೆ',
    farmer_profile: 'ರೈತರ ಪ್ರೊಫೈಲ್',
    officer_portal: 'ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್',
    bank_portal: 'ಬ್ಯಾಂಕ್ ಪೋರ್ಟಲ್',
    govt_portal: 'ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್',
    search: 'ಹುಡುಕಿ',
    alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    language: 'ಭಾಷೆ',
    select_language: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    welcome: 'ಸ್ವಾಗತ',
    live_status: 'ಲೈವ್ ಸ್ಥಿತಿ',
    view_details: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    apply_now: 'ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    back: 'ಹಿಂದೆ',
    submit: 'ಸಲ್ಲಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    farm_intelligence: 'AI ಕೃಷಿ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ನಿಖರ ಸಲಹೆ',
    weather_forecast: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    temperature: 'ತಾಪಮಾನ',
    humidity: 'ಆರ್ದ್ರತೆ',
    soil_moisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ',
    crop_health: 'ಬೆಳೆ ಆರೋಗ್ಯ',
    growth_stage: 'ಬೆಳವಣಿಗೆಯ ಹಂತ',
    days_sown: 'ಬಿತ್ತನೆ ಮಾಡಿದ ದಿನಗಳು',
    risk_level: 'ಒಟ್ಟಾರೆ ಅಪಾಯ ಮಟ್ಟ',
    optimal: 'ಉತ್ತಮ',
    moderate: 'ಮಧ್ಯಮ ಅಪಾಯ',
    high_risk: 'ಹೆಚ್ಚಿನ ಅಪಾಯ',
    pest_warning: 'ಕೀಟ ಮತ್ತು ರೋಗ ಎಚ್ಚರಿಕೆ',
    water_stress: 'ನೀರಿನ ಕೊರತೆ ಎಚ್ಚರಿಕೆ',
    alternate_crops: 'ಪರ್ಯಾಯ ಬೆಳೆಗಳು',
    explore_crops: 'ಬೆಳೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    live_mandi_rates: 'ಲೈವ್ ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    highest_price: 'ಗರಿಷ್ಠ ಬೆಲೆ',
    distress_command: 'ಕೃಷಿ ಬಿಕ್ಕಟ್ಟು ನಿಯಂತ್ರಣ ಕೇಂದ್ರ',
    mayurbhanj_district: 'ಮಯೂರ್‌ಭಂಜ್ ಜಿಲ್ಲೆ',
    assigned_farmers: 'ನಿಯೋಜಿತ ರೈತರು',
    high_risk_cases: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ರೈತರು',
    field_interventions: 'ಕ್ಷೇತ್ರ ಮಧ್ಯಸ್ಥಿಕೆಗಳು',
    trigger_action: 'ಕ್ರಮ ಕೈಗೊಳ್ಳಿ',
    inspection_report: 'ರೈತರ ಪರಿಶೀಲನಾ ವರದಿ',
    bank_dashboard: 'ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    facilities_mgmt: 'ಸಾಲ ಸೌಲಭ್ಯಗಳ ನಿರ್ವಹಣೆ',
    add_facility: 'ಹೊಸ ಸಾಲ ಯೋಜನೆ ಸೇರಿಸಿ',
    published_facilities: 'ಪ್ರಕಟಿತ ಸಾಲಗಳು',
    under_review_apps: 'ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಅರ್ಜಿಗಳು',
    total_disbursed: 'ಒಟ್ಟು ವಿತರಿಸಿದ ಸಾಲ',
    govt_admin_hub: 'ಸರ್ಕಾರಿ ಆಡಳಿತ ಕೇಂದ್ರ',
    chc_machinery: 'ಯಂತ್ರೋಪಕರಣ ಕೇಂದ್ರ',
    subsidies_disbursed: 'ಸಬ್ಸಿಡಿ ವಿತರಣೆ',
    registered_farmers: 'ನೋಂದಾಯಿತ ರೈತರು',
  },

  ml: {
    home: 'ഹോം',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    monitoring: 'വിള നിരീക്ഷണം',
    crop_details: 'വിള വിവരങ്ങൾ',
    risk_analysis: 'അപകടസാധ്യത വിശകലനം',
    recommendations: 'ശുപാർശ ചെയ്ത നടപടികൾ',
    market_prices: 'വിപണി വിലകൾ',
    notifications: 'അറിയിപ്പുകൾ',
    schemes: 'സർക്കാർ പദ്ധതികൾ',
    financial_support: 'സാമ്പത്തിക സഹായം',
    insurance: 'വിള ഇൻഷുറൻസ്',
    equipment: 'കാർഷിക ഉപകരണ വാടക',
    farmer_profile: 'കർഷക പ്രൊഫൈൽ',
    officer_portal: 'ഓഫീസർ പോർട്ടൽ',
    bank_portal: 'ബാങ്ക് പോർട്ടൽ',
    govt_portal: 'സർക്കാർ പോർട്ടൽ',
    search: 'തിരയുക',
    alerts: 'മുന്നറിയിപ്പുകൾ',
    language: 'ഭാഷ',
    select_language: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    welcome: 'സ്വാഗതം',
    live_status: 'തത്സമയ അവസ്ഥ',
    view_details: 'വിശദാംശങ്ങൾ കാണുക',
    apply_now: 'അപേക്ഷിക്കുക',
    back: 'തിരികെ',
    submit: 'സമർപ്പിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    loading: 'ലോഡ് ചെയ്യുന്നു...',
    farm_intelligence: 'AI കാർഷിക നിർദ്ദേശങ്ങൾ',
    weather_forecast: 'കാലാവസ്ഥാ പ്രവചനം',
    temperature: 'താപനില',
    humidity: 'ഈർപ്പം',
    soil_moisture: 'മണ്ണിലെ ഈർപ്പം',
    crop_health: 'വിള ആരോഗ്യം',
    growth_stage: 'വളർച്ചാ ഘട്ടം',
    days_sown: 'വിത്ത് വിതച്ച ദിവസങ്ങൾ',
    risk_level: 'മൊത്തത്തിലുള്ള അപകടസാധ്യത',
    optimal: 'അനുയോജ്യം',
    moderate: 'മിതമായ അപകടസാധ്യത',
    high_risk: 'ഉയർന്ന അപകടസാധ്യത',
    pest_warning: 'കീടരോഗ മുന്നറിയിപ്പ്',
    water_stress: 'ജലക്ഷാമ മുന്നറിയിപ്പ്',
    alternate_crops: 'ബദൽ വിളകൾ',
    explore_crops: 'വിളകൾ കാണുക',
    live_mandi_rates: 'തത്സമയ വിപണി നിരക്കുകൾ',
    highest_price: 'ഏറ്റവും ഉയർന്ന വില',
    distress_command: 'കാർഷിക നിയന്ത്രണ കേന്ദ്രം',
    mayurbhanj_district: 'മയൂർഭഞ്ച് ജില്ല',
    assigned_farmers: 'രജിസ്റ്റർ ചെയ്ത കർഷകർ',
    high_risk_cases: 'ഉയർന്ന അപകടസാധ്യതയുള്ള കർഷകർ',
    field_interventions: 'ഫീൽഡ് നടപടികൾ',
    trigger_action: 'നടപടി ആരംഭിക്കുക',
    inspection_report: 'കർഷക പരിശോധനാ റിപ്പോർട്ട്',
    bank_dashboard: 'ബാങ്ക് ക്രെഡിറ്റ് ഡാഷ്‌ബോർഡ്',
    facilities_mgmt: 'വായ്പ സൗകര്യങ്ങളുടെ മാനേജ്‌മെന്റ്',
    add_facility: 'പുതിയ വായ്പാ പദ്ധതി ചേർക്കുക',
    published_facilities: 'പ്രസിദ്ധീകരിച്ച വായ്പകൾ',
    under_review_apps: 'പരിശോധനയിലുള്ള അപേക്ഷകൾ',
    total_disbursed: 'വിതരണം ചെയ്ത മൊത്തം വായ്പ',
    govt_admin_hub: 'സർക്കാർ ഭരണ കേന്ദ്രം',
    chc_machinery: 'മെഷിനറി കേന്ദ്രങ്ങൾ',
    subsidies_disbursed: 'സബ്‌സിഡി വിതരണം',
    registered_farmers: 'രജിസ്റ്റർ ചെയ്ത കർഷകർ',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string) => Promise<string>;
  currentLanguageOption: LanguageOption;
  isAutoDetected: boolean;
  detectedLocation: string | null;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  translateDynamic: async (text) => text,
  currentLanguageOption: SUPPORTED_LANGUAGES[0],
  isAutoDetected: false,
  detectedLocation: null,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Dynamic in-memory translation cache
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  // Helper function to sync Google Translate
  const syncGoogleTranslate = useCallback((lang: LanguageCode) => {
    if (typeof window === 'undefined') return;
    const domain = window.location.hostname;
    const hostParts = domain.split('.');
    const topDomain = hostParts.length > 1 ? '.' + hostParts.slice(-2).join('.') : domain;

    const clearCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      if (topDomain !== domain) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${topDomain};`;
      }
    };

    clearCookie('googtrans');

    if (lang === 'en') {
      document.cookie = `googtrans=/auto/en; path=/;`;
      document.cookie = `googtrans=/auto/en; path=/; domain=${domain};`;
      document.cookie = `googtrans=/en/en; path=/;`;
      document.cookie = `googtrans=/en/en; path=/; domain=${domain};`;
    } else {
      document.cookie = `googtrans=/auto/${lang}; path=/;`;
      document.cookie = `googtrans=/auto/${lang}; path=/; domain=${domain};`;
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain};`;
    }

    // Trigger google translate dropdown if mounted with retry
    let attempts = 0;
    const maxAttempts = 20;

    const tryTrigger = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryTrigger, 150);
      }
    };

    tryTrigger();
  }, []);

  // 1. Initialize language from localStorage or Browser/Geolocation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLang = localStorage.getItem('smartcrop_language') as LanguageCode | null;
    if (savedLang && SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      syncGoogleTranslate(savedLang);
      return;
    }

    // Auto-detect based on Indian Geolocation or browser
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            let detectedLang: LanguageCode = 'en';
            let locName = 'India';

            if (latitude >= 17.5 && latitude <= 23.0 && longitude >= 81.0 && longitude <= 88.0) {
              detectedLang = 'or'; // Odisha -> Odia
              locName = 'Odisha';
            } else if (latitude >= 21.5 && latitude <= 27.5 && longitude >= 85.8 && longitude <= 89.9) {
              detectedLang = 'bn'; // West Bengal -> Bengali
              locName = 'West Bengal';
            } else if (latitude >= 29.5 && latitude <= 32.5 && longitude >= 73.8 && longitude <= 76.9) {
              detectedLang = 'pa'; // Punjab -> Punjabi
              locName = 'Punjab';
            } else if (latitude >= 15.6 && latitude <= 22.0 && longitude >= 72.6 && longitude <= 80.9) {
              detectedLang = 'mr'; // Maharashtra -> Marathi
              locName = 'Maharashtra';
            } else if (latitude >= 20.1 && latitude <= 24.7 && longitude >= 68.1 && longitude <= 74.5) {
              detectedLang = 'gu'; // Gujarat -> Gujarati
              locName = 'Gujarat';
            } else if (latitude >= 8.0 && latitude <= 13.5 && longitude >= 76.2 && longitude <= 80.3) {
              detectedLang = 'ta'; // Tamil Nadu -> Tamil
              locName = 'Tamil Nadu';
            } else if (latitude >= 12.6 && latitude <= 19.9 && longitude >= 76.7 && longitude <= 84.8) {
              detectedLang = 'te'; // Andhra / Telangana -> Telugu
              locName = 'Andhra Pradesh / Telangana';
            } else if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74.0 && longitude <= 78.6) {
              detectedLang = 'kn'; // Karnataka -> Kannada
              locName = 'Karnataka';
            } else if (latitude >= 8.3 && latitude <= 12.8 && longitude >= 74.8 && longitude <= 77.4) {
              detectedLang = 'ml'; // Kerala -> Malayalam
              locName = 'Kerala';
            } else if (latitude >= 21.0 && latitude <= 30.5 && longitude >= 74.0 && longitude <= 88.0) {
              detectedLang = 'hi'; // Northern / Central Belt -> Hindi
              locName = 'North / Central India';
            } else {
              detectedLang = 'hi'; // Default for India
              locName = 'India';
            }

            setLanguageState(detectedLang);
            setIsAutoDetected(true);
            setDetectedLocation(locName);
            localStorage.setItem('smartcrop_language', detectedLang);
            syncGoogleTranslate(detectedLang);
          } catch {
            setLanguageState('en');
          }
        },
        () => {
          const browserLang = navigator.language.split('-')[0];
          if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
            setLanguageState(browserLang as LanguageCode);
            syncGoogleTranslate(browserLang as LanguageCode);
          } else {
            setLanguageState('en');
            syncGoogleTranslate('en');
          }
        },
        { timeout: 4000 }
      );
    } else {
      setLanguageState('en');
      syncGoogleTranslate('en');
    }
  }, [syncGoogleTranslate]);

  // 2. Listen to route transitions and re-sync translation on newly mounted pages
  useEffect(() => {
    if (typeof window !== 'undefined' && language) {
      const timer = setTimeout(() => {
        syncGoogleTranslate(language);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, language, syncGoogleTranslate]);

  // 3. Set language handler
  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setIsAutoDetected(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartcrop_language', lang);
      document.documentElement.lang = lang;
      syncGoogleTranslate(lang);
    }
  };

  // 4. Fast translation dictionary lookup
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = UI_DICTIONARY[language] || UI_DICTIONARY.en;
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      const enDict = UI_DICTIONARY.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  // 5. Dynamic AI/Cloud translation helper
  const translateDynamic = useCallback(
    async (text: string): Promise<string> => {
      if (!text || language === 'en') return text;
      const cacheKey = `${language}:${text}`;
      if (translationCache[cacheKey]) return translationCache[cacheKey];

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage: language }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.translatedText) {
            setTranslationCache((prev) => ({ ...prev, [cacheKey]: data.translatedText }));
            return data.translatedText;
          }
        }
      } catch (err) {
        console.warn('Translation failed, fallback to original text', err);
      }
      return text;
    },
    [language, translationCache]
  );

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateDynamic,
        currentLanguageOption,
        isAutoDetected,
        detectedLocation,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

