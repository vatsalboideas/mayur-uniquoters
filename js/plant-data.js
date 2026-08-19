/**
 * Plants content — listing intro plus unique copy and images per facility.
 */

export const PLANTS_INTRO = {
  title: 'Manufacturing Excellence, Built Across Three Facilities',
  paragraphs: [
    'Our manufacturing facilities are purpose-built to support the development and production of high-performance material solutions. Each plant is designed to meet the exacting standards of customers across industries and geographies.',
    'Together, they combine advanced manufacturing capabilities with dedicated research, quality assurance and operational excellence — enabling consistent quality, scalable production and innovation with global reach.',
  ],
};

export const PLANT_DATA = {
  jaitpura: {
    id: 'jaitpura',
    name: 'Jaitpura Plant',
    location: 'Jaipur, Rajasthan',
    featured: true,
    thumb: 'assets/images/plants/jaitpura-thumb.webp',
    main: 'assets/images/plants/jaitpura-main.webp',
    objectPosition: 'center 80%',
    paragraphs: [
      "Established in 1994, the Jaitpura facility marks the beginning of Mayur Uniquoters' manufacturing journey.",
      'Equipped with four Italian coating lines and dedicated in-house R&D and Quality Assurance laboratories, the plant continues to play a vital role in delivering consistent quality and driving product innovation.',
    ],
  },
  dhodhsar: {
    id: 'dhodhsar',
    name: 'Dhodhsar Plant',
    location: 'Jaipur, Rajasthan',
    featured: false,
    thumb: 'assets/images/plants/dhodhsar-thumb.webp',
    main: 'assets/images/plants/dhodhsar-main.webp',
    objectPosition: 'center 70%',
    paragraphs: [
      "Established in 2012, the Dhodsar facility strengthens Mayur's vertically integrated manufacturing capabilities.",
      'Designed to support textile production, coating, inspection and product development under one roof, the plant combines operational efficiency with dedicated research and quality assurance to ensure consistent product performance.',
    ],
  },
  morena: {
    id: 'morena',
    name: 'Morena Plant',
    location: 'Morena, Madhya Pradesh',
    featured: false,
    thumb: 'assets/images/plants/morena-thumb.webp',
    main: 'assets/images/plants/morena-main.webp',
    objectPosition: 'center 75%',
    paragraphs: [
      "Commissioned in 2018, the Morena facility represents Mayur's expansion into PU artificial leather manufacturing.",
      'Built with future-ready infrastructure, the plant combines scalable production capabilities with a continued focus on innovation, quality and manufacturing efficiency.',
    ],
  },
};

export const PLANT_ORDER = ['jaitpura', 'dhodhsar', 'morena'];
