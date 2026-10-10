import { RoomEnvironment, SensorReadings, ForecastPoint } from '../types';

interface RoomThermalProfile {
  name: string;
  tauHours: number; // Thermal time constant (hours)
  uValue: number; // Overall heat transfer coefficient W/m²K
  roofCoupling: number; // Radiant coupling factor (0 to 1)
  ventilationFactor: number;
}

const THERMAL_PROFILES: Record<RoomEnvironment, RoomThermalProfile> = {
  tin_roof: {
    name: 'Tin-Roof Rooftop Room / Slum Dwelling',
    tauHours: 0.8, // Low thermal mass: heats up almost instantaneously
    uValue: 5.8,
    roofCoupling: 0.88,
    ventilationFactor: 0.35,
  },
  construction_site: {
    name: 'Outdoor Highway Works / Scaffold Site',
    tauHours: 0.3,
    uValue: 7.2,
    roofCoupling: 0.95,
    ventilationFactor: 0.9,
  },
  school_classroom: {
    name: 'Government School Classroom (Uninsulated)',
    tauHours: 1.8,
    uValue: 3.4,
    roofCoupling: 0.65,
    ventilationFactor: 0.45,
  },
  elderly_residence: {
    name: 'Concrete Slab Elderly Residence',
    tauHours: 4.5, // High thermal mass: traps daytime heat late into the night
    uValue: 2.1,
    roofCoupling: 0.4,
    ventilationFactor: 0.3,
  },
  factory_floor: {
    name: 'Industrial Metal Shed & Machinery Floor',
    tauHours: 1.2,
    uValue: 4.8,
    roofCoupling: 0.75,
    ventilationFactor: 0.5,
  },
};

/**
 * Simulates TensorFlow Lite Quantized TCN/LSTM inference on Arduino UNO Q (Dragonwing QRB2210)
 * Generates a 6-hour thermal forecast for the specific space based on learned thermal inertia.
 */
export function predictIndoorThermalTrajectory(
  currentReadings: SensorReadings,
  roomType: RoomEnvironment
): ForecastPoint[] {
  const profile = THERMAL_PROFILES[roomType] || THERMAL_PROFILES.tin_roof;
  const { ambientTemp, relativeHumidity, roofSurfaceTemp, blackGlobeTemp } = currentReadings;

  const points: ForecastPoint[] = [];
  const now = new Date();

  // Baseline solar curve progression over next 6 hours (assuming midday peak curve)
  // Current hour of day
  const currentHour = now.getHours();

  for (let i = 1; i <= 6; i++) {
    const forecastHour = (currentHour + i) % 24;
    const dateObj = new Date(now.getTime() + i * 3600 * 1000);
    const timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Solar intensity modifier: peaks around 13:00 - 15:00
    let solarPeakDelta = 0;
    if (forecastHour >= 11 && forecastHour <= 16) {
      solarPeakDelta = Math.sin(((forecastHour - 11) / 5) * Math.PI) * 4.2;
    } else if (forecastHour > 16 && forecastHour <= 20) {
      solarPeakDelta = 2.0 - (forecastHour - 16) * 0.5; // slow evening decline
    } else {
      solarPeakDelta = -1.5; // overnight cooling
    }

    // Thermal inertia calculation: Room temp lags outside temp by tauHours
    // Tin roof follows outside quickly, concrete lags by 4+ hours!
    const lagFactor = Math.min(1.0, i / profile.tauHours);
    const roofRadiantInfluence = (roofSurfaceTemp - ambientTemp) * profile.roofCoupling * 0.45;

    // Predicted ambient & indoor space temp
    const tempDelta = solarPeakDelta * lagFactor + roofRadiantInfluence * (1 / (1 + i * 0.25));
    const predictedTemp = Number((ambientTemp + tempDelta).toFixed(1));

    // Humidity typically drops as temperature increases
    const predictedRH = Math.max(
      25,
      Math.min(95, Number((relativeHumidity - tempDelta * 1.4).toFixed(1)))
    );

    // Approximate predicted WBGT
    // Stull wet bulb approximation
    const Tw =
      predictedTemp * Math.atan(0.151977 * Math.pow(predictedRH + 8.313659, 0.5)) +
      Math.atan(predictedTemp + predictedRH) -
      Math.atan(predictedRH - 1.676331) -
      4.686035;
    const predictedTg = predictedTemp + (blackGlobeTemp - ambientTemp) * (0.8 + 0.05 * i);
    const predictedWBGT = Number((0.7 * Tw + 0.3 * predictedTg).toFixed(1));

    // Predicted Heat Index (simplified Rothfusz)
    const T_F = (predictedTemp * 9) / 5 + 32;
    const HI_F =
      -42.379 +
      2.049 * T_F +
      10.14 * predictedRH -
      0.224 * T_F * predictedRH -
      0.0068 * T_F * T_F -
      0.054 * predictedRH * predictedRH +
      0.0012 * T_F * T_F * predictedRH;
    const predictedHeatIndex = Number((((HI_F - 32) * 5) / 9).toFixed(1));

    // Anomaly detection probability (checks if predicted rise is steeper than normal)
    const rateOfRise = (predictedTemp - ambientTemp) / i;
    const anomalyProb = Math.min(1.0, Math.max(0.05, (rateOfRise - 0.8) * 0.6));
    const isCritical = predictedWBGT >= 32.0;

    // Quantized TFLite confidence margin (±0.8°C to ±1.4°C based on forecast horizon)
    const margin = Number((0.6 + i * 0.15).toFixed(1));

    points.push({
      hourOffset: i,
      timestamp: timeLabel,
      ambientTemp: predictedTemp,
      predictedWBGT,
      predictedHeatIndex,
      anomalyProbability: Number(anomalyProb.toFixed(2)),
      confidenceInterval: [
        Number((predictedTemp - margin).toFixed(1)),
        Number((predictedTemp + margin).toFixed(1)),
      ],
      isCriticalAlert: isCritical,
    });
  }

  return points;
}
