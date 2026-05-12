// ─── VideStore · Shared Category & Subcategory Data ──────────────────────────
// Single source of truth — import this in:
//   • Navbar.jsx          (desktop mega-menu + mobile drawer)
//   • ShopPage.jsx        (filter pills)
//   • AdminProductForm.jsx (category → subcategory cascading dropdown)
//   • productController.js (subCategory query filter)
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = ['Men', 'Women', 'Streetwear', 'Accessories'];

// ── Full subcategory map ──────────────────────────────────────────────────────
export const SUB_CATEGORIES = {
  Men: [
    // Tops
    { name: 'T-Shirts',              group: 'Tops'      },
    { name: 'Casual Shirts',         group: 'Tops'      },
    { name: 'Formal Shirts',         group: 'Tops'      },
    { name: 'Hoodies & Sweatshirts', group: 'Tops'      },
    { name: 'Jackets & Coats',       group: 'Tops'      },
    { name: 'Blazers',               group: 'Tops'      },
    { name: 'Sweaters',              group: 'Tops'      },
    // Bottoms
    { name: 'Jeans',                 group: 'Bottoms'   },
    { name: 'Trousers',              group: 'Bottoms'   },
    { name: 'Track Pants',           group: 'Bottoms'   },
    { name: 'Joggers',               group: 'Bottoms'   },
    { name: 'Shorts',                group: 'Bottoms'   },
    { name: 'Cargo Pants',           group: 'Bottoms'   },
    // Ethnic
    { name: 'Kurtas',                group: 'Ethnic'    },
    { name: 'Kurta Sets',            group: 'Ethnic'    },
    { name: 'Sherwanis',             group: 'Ethnic'    },
    { name: 'Ethnic Jackets',        group: 'Ethnic'    },
    { name: 'Dhoti',                 group: 'Ethnic'    },
    // Accessories
    { name: 'Watches',               group: 'Accessories' },
    { name: 'Belts',                 group: 'Accessories' },
    { name: 'Wallets',               group: 'Accessories' },
    { name: 'Sunglasses',            group: 'Accessories' },
    { name: 'Caps & Hats',           group: 'Accessories' },
    { name: 'Bags & Backpacks',      group: 'Accessories' },
  ],

  Women: [
    // Tops
    { name: 'Tops',                  group: 'Tops'      },
    { name: 'T-Shirts',              group: 'Tops'      },
    { name: 'Shirts',                group: 'Tops'      },
    { name: 'Kurtis',                group: 'Tops'      },
    { name: 'Tunics',                group: 'Tops'      },
    // Dresses
    { name: 'Casual Dresses',        group: 'Dresses'   },
    { name: 'Party Dresses',         group: 'Dresses'   },
    { name: 'Maxi Dresses',          group: 'Dresses'   },
    { name: 'Bodycon Dresses',       group: 'Dresses'   },
    { name: 'Mini Dresses',          group: 'Dresses'   },
    // Bottoms
    { name: 'Jeans',                 group: 'Bottoms'   },
    { name: 'Leggings',              group: 'Bottoms'   },
    { name: 'Palazzos',              group: 'Bottoms'   },
    { name: 'Skirts',                group: 'Bottoms'   },
    { name: 'Shorts',                group: 'Bottoms'   },
    // Ethnic
    { name: 'Sarees',                group: 'Ethnic'    },
    { name: 'Salwar Suits',          group: 'Ethnic'    },
    { name: 'Lehenga Choli',         group: 'Ethnic'    },
    { name: 'Dupattas',              group: 'Ethnic'    },
    // Footwear
    { name: 'Heels',                 group: 'Footwear'  },
    { name: 'Sandals',               group: 'Footwear'  },
    { name: 'Flats',                 group: 'Footwear'  },
    { name: 'Sneakers',              group: 'Footwear'  },
    { name: 'Boots',                 group: 'Footwear'  },
  ],

  Streetwear: [
    { name: 'Hoodies',               group: 'Tops'      },
    { name: 'Graphic Tees',          group: 'Tops'      },
    { name: 'Oversized Tees',        group: 'Tops'      },
    { name: 'Bomber Jackets',        group: 'Tops'      },
    { name: 'Joggers',               group: 'Bottoms'   },
    { name: 'Cargo Pants',           group: 'Bottoms'   },
    { name: 'Shorts',                group: 'Bottoms'   },
    { name: 'Caps',                  group: 'Accessories' },
    { name: 'Sneakers',              group: 'Footwear'  },
    { name: 'Bags',                  group: 'Accessories' },
  ],

  Accessories: [
    { name: 'Watches',               group: 'Accessories' },
    { name: 'Bags',                  group: 'Accessories' },
    { name: 'Belts',                 group: 'Accessories' },
    { name: 'Sunglasses',            group: 'Accessories' },
    { name: 'Jewellery',             group: 'Accessories' },
    { name: 'Scarves',               group: 'Accessories' },
    { name: 'Wallets',               group: 'Accessories' },
    { name: 'Hats',                  group: 'Accessories' },
  ],
};

// ── Flat name list — useful for dropdowns & filter pills ─────────────────────
export const getSubCategoryNames = (category) =>
  (SUB_CATEGORIES[category] || []).map(s => s.name);

// ── Grouped list — useful for desktop mega-menu sections ─────────────────────
export const getGroupedSubCategories = (category) => {
  const subs = SUB_CATEGORIES[category] || [];
  return subs.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item.name);
    return acc;
  }, {});
};

// ── All flat subcategory names (for backend validation) ───────────────────────
export const ALL_SUB_CATEGORY_NAMES = [
  ...new Set(
    Object.values(SUB_CATEGORIES)
      .flat()
      .map(s => s.name)
  ),
];

// ── Category meta (colours + Unsplash image URLs) ────────────────────────────
// Images: free Unsplash photos, no API key needed at these dimensions
export const CATEGORY_META = {
  Men: {
    color:    '#C9A84C',
    tag:      'New Season',
    count:    '240+ styles',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80',
    // Man in stylish outfit
  },
  Women: {
    color:    '#d4827a',
    tag:      'Trending',
    count:    '380+ styles',
    imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80',
    // Woman in fashion outfit
  },
  Streetwear: {
    color:    '#8899dd',
    tag:      'New Drop',
    count:    '160+ styles',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80',
    // Streetwear / sneakers
  },
  Accessories: {
    color:    '#7ab870',
    tag:      'Curated',
    count:    '120+ picks',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
    // Watch / accessories flat lay
  },
};

// ── Subcategory image map — used in desktop mega-menu cards ──────────────────
// Each entry: { url, alt }
export const SUB_CATEGORY_IMAGES = {
  // Men — Tops
  'T-Shirts':              { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80', alt: 'T-Shirts' },
  'Casual Shirts':         { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80', alt: 'Casual Shirts' },
  'Formal Shirts':         { url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=300&q=80', alt: 'Formal Shirts' },
  'Hoodies & Sweatshirts': { url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&q=80', alt: 'Hoodies' },
  'Jackets & Coats':       { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', alt: 'Jackets' },
  'Blazers':               { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80', alt: 'Blazers' },
  'Sweaters':              { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80', alt: 'Sweaters' },
  // Men — Bottoms
  'Jeans':                 { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80', alt: 'Jeans' },
  'Trousers':              { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&q=80', alt: 'Trousers' },
  'Track Pants':           { url: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=300&q=80', alt: 'Track Pants' },
  'Joggers':               { url: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=300&q=80', alt: 'Joggers' },
  'Shorts':                { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=300&q=80', alt: 'Shorts' },
  'Cargo Pants':           { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&q=80', alt: 'Cargo Pants' },
  // Men — Ethnic
  'Kurtas':                { url: 'https://images.unsplash.com/photo-1610189352649-c45a2b8a3c56?w=300&q=80', alt: 'Kurtas' },
  'Kurta Sets':            { url: 'https://images.unsplash.com/photo-1610189352649-c45a2b8a3c56?w=300&q=80', alt: 'Kurta Sets' },
  'Sherwanis':             { url: 'https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=300&q=80', alt: 'Sherwanis' },
  'Ethnic Jackets':        { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&q=80', alt: 'Ethnic Jackets' },
  'Dhoti':                 { url: 'https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=300&q=80', alt: 'Dhoti' },
  // Men — Accessories
  'Watches':               { url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300&q=80', alt: 'Watches' },
  'Belts':                 { url: 'https://images.unsplash.com/photo-1553704571-c32d20e6978a?w=300&q=80', alt: 'Belts' },
  'Wallets':               { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&q=80', alt: 'Wallets' },
  'Sunglasses':            { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80', alt: 'Sunglasses' },
  'Caps & Hats':           { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&q=80', alt: 'Caps & Hats' },
  'Bags & Backpacks':      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80', alt: 'Bags & Backpacks' },
  // Women — Tops
  'Tops':                  { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80', alt: 'Tops' },
  'Shirts':                { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80', alt: 'Shirts' },
  'Kurtis':                { url: 'https://images.unsplash.com/photo-1610189352649-c45a2b8a3c56?w=300&q=80', alt: 'Kurtis' },
  'Tunics':                { url: 'https://images.unsplash.com/photo-1583744946564-b52d01a7f418?w=300&q=80', alt: 'Tunics' },
  // Women — Dresses
  'Casual Dresses':        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&q=80', alt: 'Casual Dresses' },
  'Party Dresses':         { url: 'https://images.unsplash.com/photo-1566479179817-0b3de2a06262?w=300&q=80', alt: 'Party Dresses' },
  'Maxi Dresses':          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80', alt: 'Maxi Dresses' },
  'Bodycon Dresses':       { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&q=80', alt: 'Bodycon Dresses' },
  'Mini Dresses':          { url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&q=80', alt: 'Mini Dresses' },
  // Women — Bottoms
  'Leggings':              { url: 'https://images.unsplash.com/photo-1584467735871-8e85354e7e61?w=300&q=80', alt: 'Leggings' },
  'Palazzos':              { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b2f?w=300&q=80', alt: 'Palazzos' },
  'Skirts':                { url: 'https://images.unsplash.com/photo-1583496661160-fb5218b2e3b0?w=300&q=80', alt: 'Skirts' },
  // Women — Ethnic
  'Sarees':                { url: 'https://images.unsplash.com/photo-1610189352649-c45a2b8a3c56?w=300&q=80', alt: 'Sarees' },
  'Salwar Suits':          { url: 'https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=300&q=80', alt: 'Salwar Suits' },
  'Lehenga Choli':         { url: 'https://images.unsplash.com/photo-1610189352649-c45a2b8a3c56?w=300&q=80', alt: 'Lehenga Choli' },
  'Dupattas':              { url: 'https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=300&q=80', alt: 'Dupattas' },
  // Women — Footwear
  'Heels':                 { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80', alt: 'Heels' },
  'Sandals':               { url: 'https://images.unsplash.com/photo-1561861422-a549073e547a?w=300&q=80', alt: 'Sandals' },
  'Flats':                 { url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&q=80', alt: 'Flats' },
  'Sneakers':              { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', alt: 'Sneakers' },
  'Boots':                 { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=300&q=80', alt: 'Boots' },
  // Streetwear
  'Hoodies':               { url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&q=80', alt: 'Hoodies' },
  'Graphic Tees':          { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80', alt: 'Graphic Tees' },
  'Oversized Tees':        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80', alt: 'Oversized Tees' },
  'Bomber Jackets':        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', alt: 'Bomber Jackets' },
  'Caps':                  { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&q=80', alt: 'Caps' },
  'Bags':                  { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80', alt: 'Bags' },
  // Accessories
  'Jewellery':             { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80', alt: 'Jewellery' },
  'Scarves':               { url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&q=80', alt: 'Scarves' },
  'Hats':                  { url: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=300&q=80', alt: 'Hats' },
};