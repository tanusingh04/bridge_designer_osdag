export interface CityData {
  city: string;
  state: string;
  district: string;
  windSpeed: number;
  seismicZone: string;
  seismicFactor: number;
  maxTemp: number;
  minTemp: number;
}

export const CITY_DATA: CityData[] = [
  { city: "Mumbai", state: "Maharashtra", district: "Mumbai", windSpeed: 44, seismicZone: "III", seismicFactor: 0.16, maxTemp: 45, minTemp: 14 },
  { city: "Delhi", state: "Delhi", district: "New Delhi", windSpeed: 47, seismicZone: "IV", seismicFactor: 0.24, maxTemp: 47, minTemp: 2 },
  { city: "Chennai", state: "Tamil Nadu", district: "Chennai", windSpeed: 50, seismicZone: "III", seismicFactor: 0.16, maxTemp: 45, minTemp: 18 },
  { city: "Bangalore", state: "Karnataka", district: "Bangalore Urban", windSpeed: 33, seismicZone: "II", seismicFactor: 0.10, maxTemp: 40, minTemp: 12 },
  { city: "Kolkata", state: "West Bengal", district: "Kolkata", windSpeed: 50, seismicZone: "III", seismicFactor: 0.16, maxTemp: 43, minTemp: 8 },
];

export const STATES = [...new Set(CITY_DATA.map(c => c.state))];

export const getDistrictsByState = (state: string) =>
  CITY_DATA.filter(c => c.state === state).map(c => c.district);

export const getCityDataByDistrict = (district: string) =>
  CITY_DATA.find(c => c.district === district);

export const STEEL_GRADES = ["E250", "E350", "E450"];
export const CONCRETE_GRADES = ["M25", "M30", "M35", "M40", "M45", "M50", "M55", "M60"];
