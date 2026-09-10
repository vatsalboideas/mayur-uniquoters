/**
 * Global Presence map markers.
 * x / y are percentages of the map image (origin top-left).
 * Positions traced from the Global Presence map artwork.
 */

export const PRESENCE_TYPES = {
  client: { label: 'Our Clients', color: '#84000C' },
  office: { label: 'Office / Warehouse', color: '#3B6FD8' },
  hub: { label: 'Office / Warehouse & Clients', color: '#C42A7A' },
};

export const PRESENCE_LOCATIONS = [
  /* Hubs — 3 */
  { id: 'mexico', name: 'Mexico', type: 'hub', x: 17.3, y: 53.7 },
  { id: 'south-africa', name: 'South Africa', type: 'hub', x: 54.5, y: 83.5 },
  { id: 'southeast-asia', name: 'Southeast Asia', type: 'hub', x: 81.0, y: 68.4 },

  /* Offices / warehouses — 8 */
  { id: 'usa-east', name: 'United States', type: 'office', x: 19.4, y: 49.9 },
  { id: 'united-kingdom', name: 'United Kingdom', type: 'office', x: 44.3, y: 32.6 },
  { id: 'germany', name: 'Germany', type: 'office', x: 50.0, y: 38.9 },
  { id: 'spain', name: 'Spain', type: 'office', x: 44.2, y: 44.4 },
  { id: 'uae', name: 'United Arab Emirates', type: 'office', x: 60.8, y: 54.3 },
  { id: 'india', name: 'India', type: 'office', x: 69.1, y: 55.2 },
  { id: 'china', name: 'China', type: 'office', x: 71.7, y: 46.2 },
  { id: 'brazil', name: 'Brazil', type: 'office', x: 26.4, y: 58.7 },

  /* Client locations */
  { id: 'canada', name: 'Canada', type: 'client', x: 22.4, y: 38.9 },
  { id: 'usa-west', name: 'United States — West', type: 'client', x: 14.5, y: 43.5 },
  { id: 'usa-midwest', name: 'United States — Midwest', type: 'client', x: 19.9, y: 43.6 },
  { id: 'argentina', name: 'Argentina', type: 'client', x: 21.3, y: 48.2 },
  { id: 'chile', name: 'Chile', type: 'client', x: 18.8, y: 51.9 },
  { id: 'france', name: 'France', type: 'client', x: 46.3, y: 33.6 },
  { id: 'italy', name: 'Italy', type: 'client', x: 49.5, y: 33.9 },
  { id: 'poland', name: 'Poland', type: 'client', x: 52.6, y: 32.0 },
  { id: 'turkey', name: 'Turkey', type: 'client', x: 57.1, y: 38.5 },
  { id: 'egypt', name: 'Egypt', type: 'client', x: 56.8, y: 49.9 },
  { id: 'morocco', name: 'Morocco', type: 'client', x: 46.2, y: 46.2 },
  { id: 'nigeria', name: 'Nigeria', type: 'client', x: 54.5, y: 76.3 },
  { id: 'kenya', name: 'Kenya', type: 'client', x: 55.7, y: 67.7 },
  { id: 'saudi-arabia', name: 'Saudi Arabia', type: 'client', x: 61.0, y: 47.2 },
  { id: 'bangladesh', name: 'Bangladesh', type: 'client', x: 72.2, y: 50.3 },
  { id: 'japan', name: 'Japan', type: 'client', x: 78.2, y: 46.2 },
  { id: 'south-korea', name: 'South Korea', type: 'client', x: 74.0, y: 52.8 },
  { id: 'australia', name: 'Australia', type: 'client', x: 87.0, y: 80.6 },
  { id: 'new-zealand', name: 'New Zealand', type: 'client', x: 94.5, y: 88.2 },
  { id: 'russia', name: 'Russia', type: 'client', x: 74.0, y: 27.0 },
];
