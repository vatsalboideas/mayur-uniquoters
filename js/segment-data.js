/**
 * Market segment content — same structure per tab, different sample data.
 * Image paths reuse furnishing assets until segment-specific media is added.
 */

const CATEGORY_IMAGE = 'assets/images/market-segment/furnishing/category-images/image1.png';
const PRODUCT_IMAGES = [
  'assets/images/market-segment/furnishing/products/image1.png',
  'assets/images/market-segment/furnishing/products/image2.png',
  'assets/images/market-segment/furnishing/products/image3.png',
  'assets/images/market-segment/furnishing/products/image4.png',
  'assets/images/market-segment/furnishing/products/image5.png',
];

function slideSet(image = CATEGORY_IMAGE) {
  return [image, image, image, image];
}

function productSet(prefix, descriptions) {
  return PRODUCT_IMAGES.map((image, index) => ({
    name: `${prefix} Product ${index + 1}`,
    image,
    desc: descriptions[index % descriptions.length],
    traits: [`${prefix} Trait A`, `${prefix} Trait B`],
  }));
}

export const SEGMENT_DATA = {
  furnishing: {
    id: 'furnishing',
    title: 'Furnishing',
    categories: [
      { label: 'Residential', images: slideSet() },
      { label: 'Work Place', images: slideSet() },
      { label: 'Restaurants & Retails', images: slideSet() },
      { label: 'Spas', images: slideSet() },
      { label: 'Stadiums & Theatre', images: slideSet() },
      { label: 'Poolside & Outdoors', images: slideSet() },
    ],
    products: productSet('Furnishing', [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Integer posuere erat a ante venenatis dapibus.',
      'Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur.',
    ]),
  },
  automotive: {
    id: 'automotive',
    title: 'Automotive',
    categories: [
      {
        label: 'Passenger Cars',
        images: slideSet(),
        options: [
          { label: 'Sedan', images: slideSet() },
          { label: 'Hatchback', images: slideSet() },
          { label: 'Coupe', images: slideSet() },
          { label: 'Convertible', images: slideSet() },
        ],
      },
      {
        label: 'SUVs & Crossovers',
        images: slideSet(),
        options: [
          { label: 'Compact SUV', images: slideSet() },
          { label: 'Mid-size SUV', images: slideSet() },
          { label: 'Full-size SUV', images: slideSet() },
          { label: 'Crossover', images: slideSet() },
        ],
      },
      {
        label: 'Commercial Vehicles',
        images: slideSet(),
        options: [
          { label: 'Light Commercial', images: slideSet() },
          { label: 'Trucks', images: slideSet() },
          { label: 'Buses', images: slideSet() },
          { label: 'Vans', images: slideSet() },
        ],
      },
      {
        label: 'Two Wheelers',
        images: slideSet(),
        options: [
          { label: 'Motorcycles', images: slideSet() },
          { label: 'Scooters', images: slideSet() },
          { label: 'Electric', images: slideSet() },
        ],
      },
      {
        label: 'Aftermarket',
        images: slideSet(),
        options: [
          { label: 'Seat Covers', images: slideSet() },
          { label: 'Steering Wraps', images: slideSet() },
          { label: 'Interior Kits', images: slideSet() },
        ],
      },
      {
        label: 'Specialty Interiors',
        images: slideSet(),
        options: [
          { label: 'Luxury Trim', images: slideSet() },
          { label: 'Performance', images: slideSet() },
          { label: 'Custom Builds', images: slideSet() },
        ],
      },
    ],
    products: productSet('Automotive', [
      'Automotive sample copy — premium upholstery engineered for durability, comfort, and refined cabin aesthetics across passenger and commercial platforms.',
      'Soft-touch surfaces with abrasion resistance for high-traffic seating, door trims, and steering wraps in modern vehicle interiors.',
      'Lightweight constructions designed for OEM programs, balancing haptic quality with long-term wear and cleanability.',
      'Colour-stable finishes suitable for sun-exposed cabins, with consistent grain and tone across large trim surfaces.',
      'Custom grain and emboss options tailored for brand-specific interior languages and regional market preferences.',
    ]),
  },
  footwear: {
    id: 'footwear',
    title: 'Footwear',
    categories: [
      { label: 'Casual', images: slideSet() },
      { label: 'Formal', images: slideSet() },
      { label: 'Sports', images: slideSet() },
      { label: 'Boots', images: slideSet() },
      { label: 'Sandals', images: slideSet() },
      { label: 'Kids', images: slideSet() },
    ],
    products: productSet('Footwear', [
      'Footwear sample copy — flexible coated materials with consistent thickness for uppers, linings, and accessories across seasonal collections.',
      'Supple hand-feel with reliable stitch tear strength for dress and casual constructions that demand clean lasting.',
      'Breathable builds suited for sports and lifestyle footwear, maintaining shape retention under daily flex cycles.',
      'Water-resistant finishes for boots and outdoor styles without sacrificing soft drape or colour depth.',
      'Trend-ready textures and metallics for fashion capsules, available in coordinated colour stories.',
    ]),
  },
  'leather-goods': {
    id: 'leather-goods',
    title: 'Leather Goods',
    categories: [
      { label: 'Bags & Luggage', images: slideSet() },
      { label: 'Wallets', images: slideSet() },
      { label: 'Belts', images: slideSet() },
      { label: 'Small Accessories', images: slideSet() },
      { label: 'Travel Gear', images: slideSet() },
      { label: 'Lifestyle', images: slideSet() },
    ],
    products: productSet('Leather Goods', [
      'Leather goods sample copy — refined surfaces for bags, wallets, and accessories with rich colour depth and a premium tactile finish.',
      'Structured yet workable material for luggage panels and straps, supporting clean edges and precise hardware seating.',
      'Soft folds for small goods and linings, with abrasion resistance for zippers, pockets, and everyday carry wear.',
      'Deep aniline-inspired looks for lifestyle collections, balanced with practical care and stain resistance.',
      'Coordinated grains across accessory families so belts, wallets, and bags share a unified brand expression.',
    ]),
  },
};
