import { SensorReadings, HeatStressMetrics, VulnerablePersona } from '../types';

/**
 * Calculates Wet Bulb Temperature using Stull's empirical formula (accuracy ±0.3°C)
 */
export function calculateWetBulbTemperature(T: number, RH: number): number {
  const Tw =
    T * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;
  return Number(Tw.toFixed(1));
}

/**
 * Computes Natural Wet Bulb Temperature (Tnw) accounting for air velocity and direct solar radiation
 */
export function calculateNaturalWetBulb(
  Ta: number,
  RH: number,
  windSpeed: number,
  solarIrradiance: number
): number {
  const Tw_psychrometric = calculateWetBulbTemperature(Ta, RH);
  // Solar convective and radiative correction
  // Under wind, evaporation enhances cooling; under intense sun, solar absorption adds heat
  const windFactor = Math.max(0.1, windSpeed);
  const solarElevation = 0.0012 * solarIrradiance / Math.sqrt(windFactor);
  const Tnw = Tw_psychrometric + Math.min(2.5, solarElevation);
  return Number(Tnw.toFixed(1));
}

/**
 * Calculates NOAA / Rothfusz Heat Index (°C)
 */
export function calculateHeatIndex(Ta_C: number, RH: number): number {
  // Convert Celsius to Fahrenheit
  const T_F = (Ta_C * 9) / 5 + 32;

  // Simple formula if low heat
  if (T_F < 80) {
    const simpleHI = 0.5 * (T_F + 61.0 + (T_F - 68.0) * 1.2 + RH * 0.094);
    return Number((((simpleHI - 32) * 5) / 9).toFixed(1));
  }

  // Rothfusz regression
  let HI =
    -42.379 +
    2.04901523 * T_F +
    10.14333127 * RH -
    0.22475541 * T_F * RH -
    0.00683783 * T_F * T_F -
    0.05481717 * RH * RH +
    0.00122874 * T_F * T_F * RH +
    0.00085282 * T_F * RH * RH -
    0.00000199 * T_F * T_F * RH * RH;

  // Adjustments
  if (RH < 13 && T_F >= 80 && T_F <= 112) {
    const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T_F - 95)) / 17);
    HI -= adj;
  } else if (RH > 85 && T_F >= 80 && T_F <= 87) {
    const adj = ((RH - 85) / 10) * ((87 - T_F) / 5);
    HI += adj;
  }

  // Convert back to Celsius
  const HI_C = ((HI - 32) * 5) / 9;
  return Number(HI_C.toFixed(1));
}

/**
 * Computes Dew Point (°C) via Magnus-Tetens formula
 */
export function calculateDewPoint(Ta: number, RH: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * Ta) / (b + Ta) + Math.log(RH / 100);
  const dp = (b * alpha) / (a - alpha);
  return Number(dp.toFixed(1));
}

/**
 * Calculates Canadian Humidex (°C)
 */
export function calculateHumidex(Ta: number, RH: number): number {
  const dp = calculateDewPoint(Ta, RH);
  const e = 6.11 * Math.exp(5417.753 * (1 / 273.16 - 1 / (273.15 + dp)));
  const h = Ta + (5 / 9) * (e - 10);
  return Number(h.toFixed(1));
}

/**
 * Computes Wet Bulb Globe Temperature (WBGT)
 * Standard ISO 7243:
 * Outdoor: 0.7 * Tnw + 0.2 * Tg + 0.1 * Ta
 * Indoor / No Sun: 0.7 * Tnw + 0.3 * Tg
 */
export function computeWBGT(
  Ta: number,
  RH: number,
  Tg: number,
  windSpeed: number,
  solarIrradiance: number
): { outdoor: number; indoor: number; Tnw: number } {
  const Tnw = calculateNaturalWetBulb(Ta, RH, windSpeed, solarIrradiance);
  const outdoor = 0.7 * Tnw + 0.2 * Tg + 0.1 * Ta;
  const indoor = 0.7 * Tnw + 0.3 * Tg;
  return {
    outdoor: Number(outdoor.toFixed(1)),
    indoor: Number(indoor.toFixed(1)),
    Tnw,
  };
}

/**
 * Evaluates comprehensive heat stress and calculates rest-work ratio and water targets
 */
export function evaluateHeatStress(
  readings: SensorReadings,
  persona: VulnerablePersona
): HeatStressMetrics {
  const { ambientTemp, relativeHumidity, blackGlobeTemp, windSpeed, solarIrradiance } = readings;
  const { outdoor, indoor, Tnw } = computeWBGT(
    ambientTemp,
    relativeHumidity,
    blackGlobeTemp,
    windSpeed,
    solarIrradiance
  );
  const heatIndex = calculateHeatIndex(ambientTemp, relativeHumidity);
  const humidex = calculateHumidex(ambientTemp, relativeHumidity);
  const dewPoint = calculateDewPoint(ambientTemp, relativeHumidity);

  // Primary index for decision is WBGT
  const effectiveWBGT = outdoor;

  // Persona-specific threshold offsets:
  // - Labourers: heavy physical workload makes lower WBGT (28°C) already hazardous
  // - Elderly: cardiovascular vulnerability triggers high risk at 29°C
  // - Children: dehydration & heat exhaustion triggers at 29.5°C
  let thresholdShift = 0;
  if (persona === 'labourer') thresholdShift = -2.5;
  else if (persona === 'elderly') thresholdShift = -2.0;
  else if (persona === 'student') thresholdShift = -1.5;

  const adjustedWBGT = effectiveWBGT - thresholdShift;

  let riskCategory: HeatStressMetrics['riskCategory'] = 'normal';
  let riskLabel = 'Normal Conditions';
  let riskDescription = 'Low physiological thermal strain. Standard hydration advised.';
  let maxContinuousWorkMinutes = 60;
  let restMinutesPerHour = 0;
  let recommendedWaterPerHourMl = 350;

  if (adjustedWBGT >= 35.0) {
    riskCategory = 'extreme_danger';
    riskLabel = 'Extreme Danger / Heatstroke Hazard';
    riskDescription =
      'Immediate threat of heatstroke. Heavy metabolic activity must STOP immediately. Autonomous misting and high CFM active cooling engaged.';
    maxContinuousWorkMinutes = 15;
    restMinutesPerHour = 45;
    recommendedWaterPerHourMl = 1000;
  } else if (adjustedWBGT >= 32.0) {
    riskCategory = 'danger';
    riskLabel = 'Severe Heat Hazard';
    riskDescription =
      'Severe thermal stress. Mandatory work-rest cycle: 25% Work / 75% Rest. Active evaporative cooling & shaded resting enforced.';
    maxContinuousWorkMinutes = 20;
    restMinutesPerHour = 40;
    recommendedWaterPerHourMl = 850;
  } else if (adjustedWBGT >= 30.0) {
    riskCategory = 'extreme_caution';
    riskLabel = 'High Caution / Elevated Heat Strain';
    riskDescription =
      'Thermal fatigue likely with prolonged exposure. Enforce 50% Work / 50% Rest in shade. Fans + misting recommended.';
    maxContinuousWorkMinutes = 30;
    restMinutesPerHour = 30;
    recommendedWaterPerHourMl = 700;
  } else if (adjustedWBGT >= 28.0) {
    riskCategory = 'caution';
    riskLabel = 'Caution / Moderate Risk';
    riskDescription =
      'Fatigue possible with heavy exertion. Take 15 min rest break every 45 mins. Provide frequent cool drinking water.';
    maxContinuousWorkMinutes = 45;
    restMinutesPerHour = 15;
    recommendedWaterPerHourMl = 500;
  }

  // Tailored advice overrides based on specific vulnerabilities
  if (persona === 'elderly' && ambientTemp >= 35.0) {
    riskDescription +=
      ' CRITICAL MEDICAL NOTE: Avoid running conventional dry ceiling fans alone above 35°C without humidity mitigation—it acts like a convection oven and dehydrates elderly bodies faster. Use misting or evaporative relief.';
  } else if (persona === 'student') {
    riskDescription +=
      ' School Advisory: Move children to shaded ground-floor rooms. Tin-roof classrooms experience severe radiant heat load. Suspend outdoor sports.';
  } else if (persona === 'labourer') {
    riskDescription +=
      ' Worksite Protocol: Sounding mandatory rest-break edge siren. Direct workers to shaded misting kiosk.';
  }

  return {
    wbgtOutdoor: outdoor,
    wbgtIndoor: indoor,
    heatIndex,
    humidex,
    dewPoint,
    naturalWetBulb: Tnw,
    riskCategory,
    riskLabel,
    riskDescription,
    maxContinuousWorkMinutes,
    restMinutesPerHour,
    recommendedWaterPerHourMl,
  };
}
