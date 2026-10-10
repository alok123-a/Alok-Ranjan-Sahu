export type VulnerablePersona = 'labourer' | 'student' | 'elderly' | 'general';

export type RoomEnvironment = 
  | 'tin_roof' 
  | 'construction_site' 
  | 'school_classroom' 
  | 'elderly_residence' 
  | 'factory_floor';

export interface SensorReadings {
  ambientTemp: number; // Ta in °C (from SHT41/BME688)
  relativeHumidity: number; // RH in %
  blackGlobeTemp: number; // Tg in °C (from DS18B20 in matte black globe)
  windSpeed: number; // v in m/s (from anemometer/hot-wire)
  solarIrradiance: number; // SR in W/m² (from UV/lux sensor)
  roofSurfaceTemp: number; // MLX90640 maximum surface temp
  airQualityVOC: number; // VOC index (BME688)
  co2EquivPpm: number;
}

export interface HeatStressMetrics {
  wbgtOutdoor: number; // Wet Bulb Globe Temp outdoor (°C)
  wbgtIndoor: number; // Wet Bulb Globe Temp indoor (°C)
  heatIndex: number; // NOAA Heat Index (°C)
  humidex: number; // Humidex (°C)
  dewPoint: number; // Dew point (°C)
  naturalWetBulb: number; // Tnw (°C)
  riskCategory: 'normal' | 'caution' | 'extreme_caution' | 'danger' | 'extreme_danger';
  riskLabel: string;
  riskDescription: string;
  maxContinuousWorkMinutes: number;
  restMinutesPerHour: number;
  recommendedWaterPerHourMl: number;
}

export interface ForecastPoint {
  hourOffset: number;
  timestamp: string;
  ambientTemp: number;
  predictedWBGT: number;
  predictedHeatIndex: number;
  anomalyProbability: number;
  confidenceInterval: [number, number];
  isCriticalAlert: boolean;
}

export interface RelayStates {
  evaporativeCooler: boolean;
  mistingSprinkler: boolean;
  ventilationLouvers: boolean;
  restBreakBuzzer: boolean;
  autoControlEnabled: boolean;
}

export interface RestBreakState {
  isActive: boolean;
  currentCycle: 'work' | 'rest';
  timeRemainingSeconds: number;
  totalCycleMinutes: number;
  recommendedRestRatio: string; // e.g. "50% Work / 50% Rest"
  waterIntakeGoalMl: number;
  waterIntakeLoggedMl: number;
  lastAlarmTime: string | null;
}

export interface PowerSystemState {
  batterySoC: number; // % (LiFePO4)
  batteryVoltage: number; // 12.8V - 14.4V
  solarWatts: number; // Current generation W
  loadWatts: number; // Current consumption W
  gridConnected: boolean; // Simulator toggle: Grid Normal vs Grid Failure
  estimatedRuntimeHours: number;
  deepSleepActive: boolean;
  cachedOfflinePackets: number;
}

export interface MunicipalHeatNode {
  id: string;
  name: string;
  zoneType: 'Tin-Roof Settlement' | 'Highway Works' | 'Primary School' | 'Residential High-Rise' | 'Urban Tree Canopy' | 'Bus Terminal';
  coordinates: { x: number; y: number }; // normalized 0-100 canvas coordinates
  ambientTemp: number;
  wbgt: number;
  roofTemp: number;
  riskCategory: 'normal' | 'caution' | 'extreme_caution' | 'danger' | 'extreme_danger';
  coolRoofApplied: boolean;
  recommendedIntervention: 'Cool Roof Paint' | 'Misting Shelter' | 'Tree Plantation' | 'Rest Stop & Water Kiosk' | 'Preserve Canopy';
  priorityScore: number; // 1-100
  householdsAtRisk: number;
}

export interface ExtremeHeatEvent {
  id: string;
  timestamp: string;
  zone: string;
  roomType: RoomEnvironment;
  ambientTemp: number; // Ta in °C
  relativeHumidity: number; // %
  blackGlobeTemp: number; // Tg in °C
  roofSurfaceTemp: number; // Roof surface in °C
  wbgt: number; // WBGT in °C
  heatIndex: number; // Feels-like in °C
  riskCategory: 'extreme_danger' | 'danger' | 'extreme_caution';
  severity: 'Critical' | 'Severe' | 'Elevated';
  personaAtRisk: VulnerablePersona;
  restEnforced: string; // e.g. "45m Rest / 15m Work"
  relaysTriggered: string[];
  powerSource: 'Solar LiFePO4 Island' | 'Grid Normal';
  notes: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string; // Mobile phone number used for direct sign up and login (no real-time OTP needed)
  dateOfBirth?: string; // YYYY-MM-DD
  email?: string;
  password?: string;
  age: number;
  persona: VulnerablePersona;
  categoryLabel: string;
  categoryReason: string;
  occupation: 'construction_worker' | 'outdoor_labourer' | 'student' | 'retired' | 'desk_job' | 'other';
  hasCardiovascularCondition?: boolean;
  safeThresholdWbgt: number;
  hydrationGoalMl: number;
  registeredAt: string;
}
