/**
 * Market segment content — same structure per tab, different sample data.
 */

const ASSETS = {
  furnishing: {
    hero: 'assets/images/market-segment/furnishing/carousel/image1.png',
    category: 'assets/images/market-segment/furnishing/category-images/image1.png',
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
    category: 'assets/images/market-segment/leather-goods/category-images/image1.webp',
  },
};

const PRODUCT_IMAGES = [
  'assets/images/market-segment/furnishing/products/image1.png',
  'assets/images/market-segment/furnishing/products/image2.png',
  'assets/images/market-segment/furnishing/products/image3.png',
  'assets/images/market-segment/furnishing/products/image4.png',
  'assets/images/market-segment/furnishing/products/image5.png',
];

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

function productSet(prefix, description) {
  return PRODUCT_IMAGES.map((image, index) => ({
    name: `${prefix} Product ${index + 1}`,
    image,
    desc: description,
    traits: [`${prefix} Trait A`, `${prefix} Trait B`],
  }));
}

export const SEGMENT_DATA = {
  furnishing: {
    id: 'furnishing',
    title: 'Furnishing',
    hero: ASSETS.furnishing.hero,
    intro:
      "Designed for spaces that demand both style and performance, Mayur's furnishing solutions combine comfort, durability and design versatility. From contemporary homes to high-traffic commercial environments, our materials are engineered to deliver lasting aesthetics and everyday reliability.",
    productsIntro:
      'Explore a wide range of furnishing materials available in multiple textures, finishes and colours, developed to meet diverse aesthetic and performance requirements.',
    categories: [
      { label: 'Residential', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Work Place', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Restaurants & Retails', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Spas', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Stadiums & Theatre', images: slideSet(ASSETS.furnishing.category) },
      { label: 'Poolside & Outdoors', images: slideSet(ASSETS.furnishing.category) },
    ],
    products: productSet(
      'Furnishing',
      'A premium furnishing material designed to deliver durability, comfort and refined aesthetics across a variety of interior applications.'
    ),
  },
  automotive: {
    id: 'automotive',
    title: 'Automotive',
    hero: ASSETS.automotive.hero,
    intro:
      'From passenger vehicles to commercial transport, Mayur develops advanced material solutions that meet the performance, quality and design expectations of the automotive industry. Our synthetic leather is used across seating and interior applications, offering durability, functionality and premium finishes that enhance every journey.',
    productsIntro:
      'Explore automotive upholstery solutions developed to deliver superior comfort, durability and design flexibility across a wide range of vehicle interiors.',
    categories: [
      industry('Cars', ASSETS.automotive.category, ['Sedan', 'Hatchback', 'Coupe', 'Convertible']),
      industry('3 Wheelers', ASSETS.automotive.category, ['Passenger', 'Cargo', 'Electric']),
      industry('2 Wheelers', ASSETS.automotive.category, ['Motorcycles', 'Scooters', 'Electric']),
      industry('Commercial Vehicles', ASSETS.automotive.category, [
        'Light Commercial',
        'Trucks',
        'Buses',
        'Vans',
      ]),
      industry('Train', ASSETS.automotive.category, ['Coaches', 'Metro', 'Sleepers']),
      industry('Marine', ASSETS.automotive.category, ['Boats', 'Yachts', 'Commercial']),
      industry('Tractors', ASSETS.automotive.category, ['Agricultural', 'Utility']),
    ],
    products: productSet(
      'Automotive',
      'Designed for automotive interiors where durability, comfort and consistent performance are essential.'
    ),
  },
  footwear: {
    id: 'footwear',
    title: 'Footwear',
    hero: ASSETS.footwear.hero,
    intro:
      "Designed to meet the demands of modern footwear, Mayur's synthetic leather solutions bring together style, durability and performance. Engineered for versatility, our materials support a wide range of applications while delivering consistent quality and lasting comfort.",
    productsIntro:
      'Explore footwear materials designed to combine aesthetics, durability and reliable performance across a wide range of footwear applications.',
    categories: [
      industry('Casual Footwear', ASSETS.footwear.category),
      industry('Formal Footwear', ASSETS.footwear.category),
      industry('Sports Footwear', ASSETS.footwear.category),
      industry('Safety Footwear', ASSETS.footwear.category),
      industry('Fashion Footwear', ASSETS.footwear.category),
      industry('Sandals & Slippers', ASSETS.footwear.category),
    ],
    products: productSet(
      'Footwear',
      'A premium footwear material developed to deliver durability, comfort and design flexibility.'
    ),
  },
  'leather-goods': {
    id: 'leather-goods',
    title: 'Leather Goods',
    hero: ASSETS['leather-goods'].hero,
    intro:
      "Crafted for products where quality meets craftsmanship, Mayur's synthetic leather solutions offer refined aesthetics, durability and design versatility. Our materials are developed to help brands create products that are built to last and designed to impress.",
    productsIntro:
      'A premium synthetic leather solution designed for lifestyle and fashion accessories that require both durability and refined aesthetics.',
    categories: [
      industry('Handbags', ASSETS['leather-goods'].category),
      industry('Wallets', ASSETS['leather-goods'].category),
      industry('Belts', ASSETS['leather-goods'].category),
      industry('Luggage', ASSETS['leather-goods'].category),
      industry('Small Accessories', ASSETS['leather-goods'].category),
      industry('Fashion Accessories', ASSETS['leather-goods'].category),
    ],
    products: productSet(
      'Leather Goods',
      'A premium synthetic leather solution designed for lifestyle and fashion accessories that require both durability and refined aesthetics.'
    ),
  },
};
