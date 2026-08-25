/**
 * Global Presence map markers.
 * x / y are percentages of the map image (origin top-left).
 */

export const PRESENCE_TYPES = {
  client: { label: 'Our Clients', color: '#84000C' },
  office: { label: 'Office / Warehouse', color: '#3B6FD8' },
  hub: { label: 'Office / Warehouse & Clients', color: '#C42A7A' },
};

export const PRESENCE_LOCATIONS = [
  /* Hubs — 3 */
  { id: 'mexico', name: 'Mexico', type: 'hub', x: 19.8, y: 47.2 },
  { id: 'south-africa', name: 'South Africa', type: 'hub', x: 54.6, y: 74.8 },
  { id: 'southeast-asia', name: 'Southeast Asia', type: 'hub', x: 80.4, y: 54.5 },

  /* Offices / warehouses — 8 */
  { id: 'usa-east', name: 'United States', type: 'office', x: 25.4, y: 39.2 },
  { id: 'united-kingdom', name: 'United Kingdom', type: 'office', x: 47.8, y: 29.6 },
  { id: 'germany', name: 'Germany', type: 'office', x: 51.4, y: 31.2 },
  { id: 'spain', name: 'Spain', type: 'office', x: 46.6, y: 37.8 },
  { id: 'uae', name: 'United Arab Emirates', type: 'office', x: 63.2, y: 45.8 },
  { id: 'india', name: 'India', type: 'office', x: 70.8, y: 46.8 },
  { id: 'china', name: 'China', type: 'office', x: 78.6, y: 36.8 },
  { id: 'brazil', name: 'Brazil', type: 'office', x: 31.6, y: 62.4 },

  /* Client locations */
  { id: 'canada', name: 'Canada', type: 'client', x: 22.4, y: 28.4 },
  { id: 'usa-west', name: 'United States — West', type: 'client', x: 16.8, y: 37.6 },
  { id: 'usa-midwest', name: 'United States — Midwest', type: 'client', x: 22.2, y: 36.4 },
  { id: 'argentina', name: 'Argentina', type: 'client', x: 29.4, y: 78.6 },
  { id: 'chile', name: 'Chile', type: 'client', x: 26.8, y: 74.2 },
  { id: 'france', name: 'France', type: 'client', x: 49.2, y: 34.2 },
  { id: 'italy', name: 'Italy', type: 'client', x: 52.2, y: 37.4 },
  { id: 'poland', name: 'Poland', type: 'client', x: 53.6, y: 30.4 },
  { id: 'turkey', name: 'Turkey', type: 'client', x: 57.8, y: 37.2 },
  { id: 'egypt', name: 'Egypt', type: 'client', x: 56.8, y: 43.8 },
  { id: 'morocco', name: 'Morocco', type: 'client', x: 46.2, y: 42.6 },
  { id: 'nigeria', name: 'Nigeria', type: 'client', x: 49.6, y: 52.8 },
  { id: 'kenya', name: 'Kenya', type: 'client', x: 59.2, y: 55.6 },
  { id: 'saudi-arabia', name: 'Saudi Arabia', type: 'client', x: 60.8, y: 44.6 },
  { id: 'bangladesh', name: 'Bangladesh', type: 'client', x: 73.6, y: 45.2 },
  { id: 'japan', name: 'Japan', type: 'client', x: 86.2, y: 36.4 },
  { id: 'south-korea', name: 'South Korea', type: 'client', x: 83.4, y: 37.2 },
  { id: 'australia', name: 'Australia', type: 'client', x: 85.6, y: 70.2 },
  { id: 'new-zealand', name: 'New Zealand', type: 'client', x: 92.4, y: 78.6 },
  { id: 'russia', name: 'Russia', type: 'client', x: 66.8, y: 24.8 },
];
