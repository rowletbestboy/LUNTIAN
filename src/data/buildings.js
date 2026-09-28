export const buildings = [
  { name: "Canuctan Hall", category: "Events and community", coordinates: [11.66163, 125.44444] },
  { name: "College of Agriculture and Fishery", category: "College", coordinates: [11.66153, 125.44358] },
  { name: "College of Science Building", category: "College", coordinates: [11.66153, 125.44287] },
  { name: "CCS IT Laboratory", category: "Research and instruction", coordinates: [11.65862, 125.44304] },
  { name: "College of Criminal Justice Education", category: "College", coordinates: [11.65915, 125.44402] },
  { name: "College of Engineering", category: "College", coordinates: [11.65920, 125.44223] },
  { name: "ESSU Infirmary", category: "Health services", coordinates: [11.65921, 125.44346] },
  { name: "ESSU Chapel", category: "Faith and community", coordinates: [11.65900, 125.44313] },
  { name: "ESSU Athletic Grounds", category: "Sports and recreation", coordinates: [11.66056, 125.44139] },
  { name: "Administration Building", category: "Administration", coordinates: [11.66023, 125.44200] },
  { name: "ESSU Faculty Lounge", category: "Faculty services", coordinates: [11.66045, 125.44261] },
  { name: "College of Education", category: "College", coordinates: [11.65949, 125.44346] },
  { name: "College of Hospitality Management", category: "College", coordinates: [11.65929, 125.44428] },
  { name: "Graduate School", category: "Graduate education", coordinates: [11.65964, 125.44470] },
  { name: "ESSU Library", category: "Student services", coordinates: [11.66084, 125.44435] },
  { name: "College of Law", category: "College", coordinates: [11.66043, 125.44483] },
  { name: "DOST Pagasa Borongan", category: "Weather services", coordinates: [11.66094, 125.44344] },
];

export const ELECTRICITY_EMISSIONS_KG_PER_KWH = 0.7;

export function getBuildingConsumptionKwh(building) {
  return Number.isFinite(building?.kwh) ? building.kwh : null;
}

export function getBuildingEmissionsKg(building) {
  const consumption = getBuildingConsumptionKwh(building);
  return consumption === null ? null : consumption * ELECTRICITY_EMISSIONS_KG_PER_KWH;
}

export const roomsByBuilding = {
  "Canuctan Hall": [{ name: "Main Hall", smartSockets: 8 }, { name: "Conference Room", smartSockets: 4 }],
  "College of Agriculture and Fishery": [{ name: "Room 101", smartSockets: 6 }, { name: "Room 102", smartSockets: 5 }, { name: "Laboratory 1", smartSockets: 8 }],
  "College of Science Building": [{ name: "Room 101", smartSockets: 5 }, { name: "Laboratory 1", smartSockets: 10 }, { name: "Laboratory 2", smartSockets: 8 }],
  "CCS IT Laboratory": [{ name: "Computer Laboratory 1", smartSockets: 18 }, { name: "Computer Laboratory 2", smartSockets: 16 }, { name: "Room 203", smartSockets: 6 }],
  "College of Criminal Justice Education": [{ name: "Room 101", smartSockets: 5 }, { name: "Room 201", smartSockets: 5 }],
  "College of Engineering": [
    { name: "Room 201", smartSockets: 8 },
    { name: "Room 202", smartSockets: 8 },
    { name: "Room 203", smartSockets: 10 },
    { name: "Room 204", smartSockets: 12 },
    { name: "Room 205", smartSockets: 8 },
  ],
  "ESSU Infirmary": [{ name: "Room 101", smartSockets: 4 }, { name: "Treatment Room", smartSockets: 6 }],
  "ESSU Chapel": [{ name: "Main Chapel", smartSockets: 4 }, { name: "Office", smartSockets: 2 }],
  "ESSU Athletic Grounds": [{ name: "Gymnasium", smartSockets: 12 }, { name: "Equipment Room", smartSockets: 4 }],
  "Administration Building": [{ name: "Records Office", smartSockets: 8 }, { name: "Finance Office", smartSockets: 8 }, { name: "Conference Room", smartSockets: 6 }],
  "ESSU Faculty Lounge": [{ name: "Lounge", smartSockets: 6 }, { name: "Meeting Room", smartSockets: 4 }],
  "College of Education": [{ name: "Room 101", smartSockets: 6 }, { name: "Room 201", smartSockets: 6 }],
  "College of Hospitality Management": [{ name: "Room 101", smartSockets: 6 }, { name: "Training Kitchen", smartSockets: 10 }],
  "Graduate School": [{ name: "Room 101", smartSockets: 5 }, { name: "Seminar Room", smartSockets: 6 }],
  "ESSU Library": [{ name: "Reading Hall", smartSockets: 10 }, { name: "Reference Room", smartSockets: 6 }],
  "College of Law": [{ name: "Room 101", smartSockets: 5 }, { name: "Moot Court", smartSockets: 8 }],
  "DOST Pagasa Borongan": [{ name: "Forecasting Office", smartSockets: 4 }, { name: "Instrument Room", smartSockets: 4 }],
};
