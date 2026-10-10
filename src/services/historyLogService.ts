import { ExtremeHeatEvent } from '../types';

export const INITIAL_HISTORICAL_EVENTS: ExtremeHeatEvent[] = [
  {
    id: 'EVT-2026-1001',
    timestamp: '2026-10-06 14:45:12',
    zone: 'Unit-8 Shanti Nagar Informal Rooftops',
    roomType: 'tin_roof',
    ambientTemp: 41.2,
    relativeHumidity: 66,
    blackGlobeTemp: 49.5,
    roofSurfaceTemp: 56.4,
    wbgt: 35.8,
    heatIndex: 51.2,
    riskCategory: 'extreme_danger',
    severity: 'Critical',
    personaAtRisk: 'labourer',
    restEnforced: '45m Rest / 15m Work (OSHA Level 4)',
    relaysTriggered: ['Relay 1: Cooler Fan', 'Relay 2: Micro-Misting', 'Relay 4: Worksite Siren'],
    powerSource: 'Solar LiFePO4 Island',
    notes: 'Severe solar radiation through corrugated tin roofing. Ambient sensor spiked +8.2°C above IMD district forecast.',
  },
  {
    id: 'EVT-2026-1002',
    timestamp: '2026-10-06 13:20:05',
    zone: 'NH-16 Flyover Highway Works (Pillar 44)',
    roomType: 'construction_site',
    ambientTemp: 42.5,
    relativeHumidity: 54,
    blackGlobeTemp: 51.0,
    roofSurfaceTemp: 55.2,
    wbgt: 35.1,
    heatIndex: 49.8,
    riskCategory: 'extreme_danger',
    severity: 'Critical',
    personaAtRisk: 'labourer',
    restEnforced: '45m Rest / 15m Work (Stop Heavy Exertion)',
    relaysTriggered: ['Relay 2: Misting Shelter', 'Relay 4: Worksite Siren'],
    powerSource: 'Solar LiFePO4 Island',
    notes: 'Asphalt reflection and direct unshaded solar irradiance. Arduino UNO Q autonomous siren enforced site-wide pause.',
  },
  {
    id: 'EVT-2026-1003',
    timestamp: '2026-10-06 11:55:40',
    zone: 'Capital Primary School (Uninsulated Class 4B)',
    roomType: 'school_classroom',
    ambientTemp: 38.0,
    relativeHumidity: 69,
    blackGlobeTemp: 42.4,
    roofSurfaceTemp: 48.0,
    wbgt: 33.2,
    heatIndex: 47.4,
    riskCategory: 'danger',
    severity: 'Severe',
    personaAtRisk: 'student',
    restEnforced: '30m Rest / 30m Class (Sports Suspended)',
    relaysTriggered: ['Relay 1: Evaporative Cooler', 'Relay 3: Louvers Exhaust'],
    powerSource: 'Solar LiFePO4 Island',
    notes: 'High indoor humidity coupled with tin-shed roof radiant load. Children evacuated to shaded ground courtyard.',
  },
  {
    id: 'EVT-2026-1004',
    timestamp: '2026-10-06 10:15:33',
    zone: 'Baramunda Inter-State Transit Hub',
    roomType: 'tin_roof',
    ambientTemp: 39.8,
    relativeHumidity: 62,
    blackGlobeTemp: 46.8,
    roofSurfaceTemp: 53.0,
    wbgt: 34.0,
    heatIndex: 48.6,
    riskCategory: 'danger',
    severity: 'Severe',
    personaAtRisk: 'general',
    restEnforced: '30m Shade Rest in Misting Terminal',
    relaysTriggered: ['Relay 1: High CFM Fan', 'Relay 2: Misting Sprinkler'],
    powerSource: 'Grid Normal',
    notes: 'Passenger shelter metal canopy exceeded 50°C. Edge controller actuated municipal water misting.',
  },
  {
    id: 'EVT-2026-1005',
    timestamp: '2026-10-05 21:40:18',
    zone: 'Saheed Nagar Senior Residence (Flat 302)',
    roomType: 'elderly_residence',
    ambientTemp: 36.5,
    relativeHumidity: 65,
    blackGlobeTemp: 39.2,
    roofSurfaceTemp: 43.5,
    wbgt: 32.1,
    heatIndex: 45.0,
    riskCategory: 'danger',
    severity: 'Severe',
    personaAtRisk: 'elderly',
    restEnforced: 'Cardiovascular Precautions / Hydration',
    relaysTriggered: ['Relay 1: Evaporative Cooler', 'Relay 3: Louvers Exhaust'],
    powerSource: 'Solar LiFePO4 Island',
    notes: 'Nocturnal concrete thermal mass discharge. Conventional ceiling fan dry air warning fired on local display.',
  },
  {
    id: 'EVT-2026-1006',
    timestamp: '2026-10-05 15:10:50',
    zone: 'Mancheswar Industrial Shed (Bay C)',
    roomType: 'factory_floor',
    ambientTemp: 41.8,
    relativeHumidity: 49,
    blackGlobeTemp: 47.5,
    roofSurfaceTemp: 52.1,
    wbgt: 33.6,
    heatIndex: 46.8,
    riskCategory: 'danger',
    severity: 'Severe',
    personaAtRisk: 'labourer',
    restEnforced: '30m Rest / 30m Work',
    relaysTriggered: ['Relay 1: Cooler Fan', 'Relay 3: Louvers Exhaust'],
    powerSource: 'Grid Normal',
    notes: 'Industrial furnace radiative heat combined with exterior atmospheric heat wave.',
  },
  {
    id: 'EVT-2026-1007',
    timestamp: '2026-10-05 12:30:11',
    zone: 'Unit-8 Shanti Nagar Informal Rooftops',
    roomType: 'tin_roof',
    ambientTemp: 39.5,
    relativeHumidity: 63,
    blackGlobeTemp: 47.0,
    roofSurfaceTemp: 54.2,
    wbgt: 34.4,
    heatIndex: 48.0,
    riskCategory: 'extreme_danger',
    severity: 'Critical',
    personaAtRisk: 'labourer',
    restEnforced: '45m Rest / 15m Work',
    relaysTriggered: ['Relay 1: Cooler Fan', 'Relay 2: Misting Sprinkler'],
    powerSource: 'Solar LiFePO4 Island',
    notes: 'Local grid transformer tripped due to high AC load. UNO Q survived on LiFePO4 battery without loss of telemetry.',
  },
  {
    id: 'EVT-2026-1004-B',
    timestamp: '2026-10-05 09:15:20',
    zone: 'NH-16 Flyover Highway Works',
    roomType: 'construction_site',
    ambientTemp: 37.2,
    relativeHumidity: 58,
    blackGlobeTemp: 43.0,
    roofSurfaceTemp: 46.5,
    wbgt: 31.4,
    heatIndex: 43.2,
    riskCategory: 'extreme_caution',
    severity: 'Elevated',
    personaAtRisk: 'labourer',
    restEnforced: '15m Rest / 45m Work',
    relaysTriggered: ['Relay 1: Cooler Fan'],
    powerSource: 'Grid Normal',
    notes: 'Morning heat escalation detected by TFLite predictive model 2 hours ahead of official peak.',
  },
];

/**
 * Converts array of ExtremeHeatEvent into RFC-4180 compliant CSV string
 */
export function exportEventsToCSV(events: ExtremeHeatEvent[]): string {
  const headers = [
    'Event ID',
    'Timestamp (ISO)',
    'Zone / Location',
    'Room Envelope Archetype',
    'Ambient Temp (Ta °C)',
    'Relative Humidity (%)',
    'Black Globe Temp (Tg °C)',
    'Roof Surface Temp (°C)',
    'WBGT Index (°C)',
    'Heat Index Feels Like (°C)',
    'Risk Category',
    'Severity Level',
    'Vulnerable Persona',
    'Rest-Break Protocol Enforced',
    'Autonomous Hardware Relays Triggered',
    'Power Resilience Source',
    'Research Field Notes',
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = events.map((e) => [
    escapeCSV(e.id),
    escapeCSV(e.timestamp),
    escapeCSV(e.zone),
    escapeCSV(e.roomType),
    e.ambientTemp,
    e.relativeHumidity,
    e.blackGlobeTemp,
    e.roofSurfaceTemp,
    e.wbgt,
    e.heatIndex,
    escapeCSV(e.riskCategory),
    escapeCSV(e.severity),
    escapeCSV(e.personaAtRisk),
    escapeCSV(e.restEnforced),
    escapeCSV(e.relaysTriggered.join('; ')),
    escapeCSV(e.powerSource),
    escapeCSV(e.notes),
  ]);

  return [headers.map(escapeCSV).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Triggers browser download of generated CSV
 */
export function triggerCSVDownload(csvContent: string, filename: string = 'thermaedge_bput_extreme_heat_log_2026.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
