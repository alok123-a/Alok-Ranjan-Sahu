import { UserProfile, VulnerablePersona } from '../types';

export interface CategoryClassificationResult {
  persona: VulnerablePersona;
  categoryLabel: string;
  categoryReason: string;
  safeThresholdWbgt: number;
  hydrationGoalMl: number;
  badgeColor: string;
  avatarIcon: string;
}

/**
 * Accurately classifies an individual into the appropriate vulnerable heat category
 * based on their age, physical exertion/occupation, and health indicators.
 */
export function classifyUserCategory(
  age: number,
  occupation: UserProfile['occupation'] = 'desk_job',
  hasCardiovascularCondition: boolean = false
): CategoryClassificationResult {
  // 1. Geriatric High-Risk (Age >= 75)
  if (age >= 75) {
    return {
      persona: 'elderly',
      categoryLabel: 'Geriatric High-Risk (Critical Cardiovascular Vulnerability)',
      categoryReason: `Age ${age}: Severe impairment in cardiovascular reserve and thermoregulation. Sweat gland atrophy and blunted thirst response cause rapid internal thermal accumulation. Strict Alert: Ambient temperatures above 34°C with dry fans cause deadly convective heating. Evaporative cooling mandatory.`,
      safeThresholdWbgt: 28.5,
      hydrationGoalMl: 900,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      avatarIcon: '👴',
    };
  }

  // 2. Senior Citizen / Elderly (Age 60-74, or 50+ with cardiovascular condition)
  if (age >= 60 || (hasCardiovascularCondition && age >= 50)) {
    return {
      persona: 'elderly',
      categoryLabel: 'Senior Citizen (High Cardiovascular Vulnerability)',
      categoryReason: `Age ${age}: Aging cardiovascular system reduces cardiac output and peripheral blood flow required for heat dissipation. Silent dehydration risk from blunted thirst sensation. Strict Alert: Conventional ceiling fans above 35°C act like convection ovens without moisture!`,
      safeThresholdWbgt: 29.0,
      hydrationGoalMl: 800,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      avatarIcon: '👵',
    };
  }

  // 3. Young Child (Age < 12)
  if (age < 12) {
    return {
      persona: 'student',
      categoryLabel: 'Young Child (Extreme Pediatric Heat Vulnerability)',
      categoryReason: `Age ${age}: Developing thermoregulatory system with high body-surface-area-to-mass ratio and low sweat gland efficiency. Core body temperature climbs nearly twice as fast as adults under rooftop tin radiant heat. Immediate cooling and scheduled water intake required.`,
      safeThresholdWbgt: 29.0,
      hydrationGoalMl: 600,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      avatarIcon: '🧒',
    };
  }

  // 4. Teen / School Student (Age 12-17 or student up to 21)
  if (age < 18 || (occupation === 'student' && age < 22)) {
    return {
      persona: 'student',
      categoryLabel: 'Child / Student (Pediatric Heat Vulnerability)',
      categoryReason: `Age ${age}: High surface-area ratio and lower sweating rate compared to adults. Uninsulated tin-roof classrooms quickly trigger cognitive fatigue, dizziness, and rapid dehydration. Mandatory classroom water breaks enforced.`,
      safeThresholdWbgt: 29.5,
      hydrationGoalMl: 650,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      avatarIcon: '🎒',
    };
  }

  // 5. Outdoor Labourer / Heavy Exertion (Adult in field / construction work)
  if (occupation === 'construction_worker' || occupation === 'outdoor_labourer') {
    return {
      persona: 'labourer',
      categoryLabel: 'Outdoor Labourer / Heavy Exertion Worker',
      categoryReason: `Age ${age} (Heavy Exertion): High metabolic heat production (350-450 W/m²) combined with intense solar radiation on construction sites. Acute electrolyte loss. OSHA mandates 45m rest / 15m work rotations above 32°C WBGT.`,
      safeThresholdWbgt: 28.0,
      hydrationGoalMl: 1000,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      avatarIcon: '👷',
    };
  }

  // 6. General Adult (Standard baseline resilience)
  return {
    persona: 'general',
    categoryLabel: 'General Adult (Standard Baseline Resilience)',
    categoryReason: `Age ${age}: Healthy adult physiological thermoregulation. Moderate hydration alerts with active cooling guidance as ambient heat index climbs.`,
    safeThresholdWbgt: 30.5,
    hydrationGoalMl: 500,
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    avatarIcon: '👤',
  };
}

/**
 * Calculates exact age in years, months, and days from Date of Birth (YYYY-MM-DD)
 */
export function calculateAgeFromDob(dob: string): {
  years: number;
  months: number;
  days: number;
  formatted: string;
} {
  if (!dob) return { years: 30, months: 0, days: 0, formatted: '30 yrs' };
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return { years: 30, months: 0, days: 0, formatted: '30 yrs' };
    }
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const cleanYears = Math.max(0, years);
    const cleanMonths = Math.max(0, months);
    return {
      years: cleanYears,
      months: cleanMonths,
      days: Math.max(0, days),
      formatted: `${cleanYears} yrs ${cleanMonths > 0 ? `${cleanMonths}m` : ''}`.trim(),
    };
  } catch {
    return { years: 30, months: 0, days: 0, formatted: '30 yrs' };
  }
}

const STORAGE_KEY = 'thermaedge_current_user_profile';
const REGISTERED_USERS_KEY = 'thermaedge_registered_users';

export function getStoredUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    // Also save into user list for easy sign-in by mobile number or email
    const users = getRegisteredUsers();
    const cleanPhone = (profile.phone || '').replace(/\D/g, '');
    const existingIndex = users.findIndex((u) => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      if (cleanPhone && uPhone && cleanPhone === uPhone) return true;
      if (profile.email && u.email && profile.email.toLowerCase() === u.email.toLowerCase()) return true;
      return false;
    });

    if (existingIndex >= 0) {
      users[existingIndex] = profile;
    } else {
      users.push(profile);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch {
    // safe fallback
  }
}

export function clearStoredUserProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // safe fallback
  }
}

export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  // Return default pre-seeded users with mobile number, password, and DOB for demo testing during BPUT Hackathon
  return [
    {
      id: 'demo-student',
      name: 'Pooja Mohanty',
      phone: '9876543233',
      dateOfBirth: '2014-11-20',
      password: 'password123',
      email: 'pooja.student@bput.ac.in',
      age: 11,
      persona: 'student',
      categoryLabel: 'Young Child (Extreme Pediatric Heat Vulnerability)',
      categoryReason: 'DOB: 2014-11-20 (Age 11): Immature sweat gland efficiency and high surface-area ratio. Tin-roof classrooms trigger rapid cognitive fatigue and dehydration.',
      occupation: 'student',
      safeThresholdWbgt: 29.0,
      hydrationGoalMl: 650,
      registeredAt: '2026-10-09 08:30:00',
    },
    {
      id: 'demo-elderly',
      name: 'Ramesh Chandra Das',
      phone: '9876543222',
      dateOfBirth: '1958-08-15',
      password: 'password123',
      email: 'ramesh.senior@gmail.com',
      age: 68,
      persona: 'elderly',
      categoryLabel: 'Senior Citizen (High Cardiovascular Vulnerability)',
      categoryReason: 'DOB: 1958-08-15 (Age 68): Blunted thirst perception and reduced cardiac output. Conventional ceiling fans above 35°C act like convection ovens without moisture!',
      occupation: 'retired',
      hasCardiovascularCondition: true,
      safeThresholdWbgt: 29.0,
      hydrationGoalMl: 850,
      registeredAt: '2026-10-09 09:15:00',
    },
    {
      id: 'demo-labourer',
      name: 'Sunil Kumar Nayak',
      phone: '9876543210',
      dateOfBirth: '1992-04-12',
      password: 'password123',
      email: 'sunil.works@nh16odisha.in',
      age: 34,
      persona: 'labourer',
      categoryLabel: 'Outdoor Labourer / Heavy Exertion Worker',
      categoryReason: 'DOB: 1992-04-12 (Age 34): 450 W/m² metabolic heat generation under unshaded solar flux on highway construction site. OSHA mandates 45m rest / 15m work rotation.',
      occupation: 'construction_worker',
      safeThresholdWbgt: 28.0,
      hydrationGoalMl: 1000,
      registeredAt: '2026-10-09 07:45:00',
    },
  ];
}
