/**
 * Market segment content — same structure per tab, different sample data.
 */

const ASSETS = {
  furnishing: {
    hero: 'assets/images/market-segment/furnishing/carousel/image1.webp',
    category: 'assets/images/market-segment/furnishing/category-images/image1.webp',
  },
  automotive: {
    hero: 'assets/images/market-segment/automotive/hero.webp',
    category: 'assets/images/market-segment/automotive/category-images/image1.webp',
  },
  footwear: {
    hero: 'assets/images/market-segment/footwear/hero.webp',
    category: 'assets/images/market-segment/footwear/category-images/image1.webp',
  },
  'leather-goods': {
    hero: 'assets/images/market-segment/leather-goods/hero.webp',
    category: 'assets/images/market-segment/leather-goods/category-images/image1-new.webp',
  },
};

function slideSet(image) {
  return [image, image, image, image];
}

function industry(label, image, optionLabels = []) {
  return {
    label,
    images: slideSet(image),
    options: optionLabels.map((option) => ({ label: option, images: slideSet(image) })),
  };
}

export const SEGMENT_DATA = {
  furnishing: {
    id: 'furnishing',
    title: 'Furnishing',
    hero: ASSETS.furnishing.hero,
    intro:
      'Material solutions designed for indoor and outdoor spaces, bringing together comfort, performance and design versatility across residential, commercial and recreational environments.',
    categories: [
      { label: 'Residential', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Work Place', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Restaurants & Retails', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Spas', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Stadiums & Theatre', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Poolside & Outdoors', images: slideSet(ASSETS.furnishing.category) },
    ],
  },
  automotive: {
    id: 'automotive',
    title: 'Automotive',
    hero: ASSETS.automotive.hero,
    intro:
      'Engineered material solutions for automotive interiors and accessories, serving both OEM and aftermarket requirements across a wide range of mobility applications.',
    categories: [
      { label: 'Cars', images: slideSet(ASSETS.automotive.category) },
      { label: '3 Wheelers', images: slideSet(ASSETS.automotive.category) },
      { label: '2 Wheelers', images: slideSet(ASSETS.automotive.category) },
      { label: 'Commercial Vehicles', images: slideSet(ASSETS.automotive.category) },
      { label: 'Trains', images: slideSet(ASSETS.automotive.category) },
      { label: 'Marine', images: slideSet(ASSETS.automotive.category) },
      { label: 'Tractors', images: slideSet(ASSETS.automotive.category) },
    ],
  },
  footwear: {
    id: 'footwear',
    title: 'Footwear',
    hero: ASSETS.footwear.hero,
    intro:
      'Versatile PVC and PU material solutions developed for different parts of footwear, balancing everyday performance with the flexibility to respond to changing design and market requirements.',
    categories: [
      industry('Upper', ASSETS.footwear.category),
      { label: 'Lining', images: slideSet(ASSETS.footwear.category) },
      { label: 'Insole', images: slideSet(ASSETS.footwear.category) },
    ],
  },
  'leather-goods': {
    id: 'leather-goods',
    title: 'Leather Goods',
    hero: ASSETS['leather-goods'].hero,
    intro:
      'Material solutions created for fashion, lifestyle and speciality applications, offering the flexibility in finish, colour and surface design needed to respond to evolving product and market trends.',
    categories: [
      { label: 'Bags', images: slideSet(ASSETS['leather-goods'].category) },
      { label: 'Apparel', images: slideSet(ASSETS['leather-goods'].category) },
      { label: 'Fashion Accessories', images: slideSet(ASSETS['leather-goods'].category) },
      { label: 'Sports', images: slideSet(ASSETS['leather-goods'].category) },
      { label: 'Medical Equipment', images: slideSet(ASSETS['leather-goods'].category) },
    ],
  },
};
