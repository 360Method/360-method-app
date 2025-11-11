// Service Area Configuration and Utilities

export const SERVICE_AREAS = {
  clark_county_wa: {
    active: true,
    operator: "Handy Pioneers",
    operatorId: "handy-pioneers",
    region: "Clark County, Washington",
    cities: [
      "Vancouver", "Camas", "Battle Ground", "Ridgefield", 
      "La Center", "Brush Prairie", "Washougal", "Yacolt"
    ],
    zipCodes: [
      "98604", "98606", "98607", "98629", "98642",
      "98660", "98661", "98662", "98663", "98664",
      "98665", "98666", "98671", "98674", "98675",
      "98682", "98683", "98684", "98685", "98686"
    ],
    services: {
      homeCare: {
        available: true,
        pricing: {
          essential: { monthly: 124, annual: 1490 },
          premium: { monthly: 183, annual: 2190 },
          elite: { monthly: 233, annual: 2790 }
        }
      },
      propertyCare: {
        available: true,
        pricing: {
          essential: { perDoorMonthly: 124, perDoorAnnual: 1490 },
          premium: { perDoorMonthly: 183, perDoorAnnual: 2190 },
          elite: { perDoorMonthly: 233, perDoorAnnual: 2790 }
        },
        volumeDiscounts: [
          { min: 5, max: 9, discount: 0.10, label: "10% off" },
          { min: 10, max: 19, discount: 0.15, label: "15% off" },
          { min: 20, max: 999, discount: 0.20, label: "20% off" }
        ],
        commonAreaFees: {
          duplex: { monthly: 25, annual: 300 },
          fourplex: { monthly: 33, annual: 400 },
          small_multi: { monthly: 42, annual: 500 },
          large_multi: { monthly: 50, annual: 600 }
        }
      }
    },
    operatorContact: {
      phone: "(360) 555-9999",
      email: "support@handypioneers.com",
      website: "handypioneers.com"
    }
  },
  
  portland_metro_or: {
    active: false,
    launchDate: "TBD",
    operator: null,
    region: "Portland Metro, Oregon",
    cities: ["Portland", "Beaverton", "Hillsboro", "Gresham", "Lake Oswego"],
    zipCodes: [
      "97201", "97202", "97203", "97204", "97205", "97206", "97209",
      "97210", "97211", "97212", "97213", "97214", "97215", "97216",
      "97217", "97218", "97219", "97220", "97221", "97222", "97223",
      "97224", "97225", "97227", "97229", "97230", "97231", "97232",
      "97233", "97236", "97238", "97239", "97266", "97267", "97268"
    ],
    waitlistActive: true,
    services: {
      homeCare: { comingSoon: true },
      propertyCare: { comingSoon: true }
    }
  },
  
  seattle_metro_wa: {
    active: false,
    launchDate: "Q2 2025",
    operator: null,
    region: "Seattle Metro, Washington",
    cities: ["Seattle", "Bellevue", "Redmond", "Kirkland", "Renton"],
    zipCodes: [
      "98101", "98102", "98103", "98104", "98105", "98106", "98107",
      "98108", "98109", "98110", "98112", "98115", "98116", "98117",
      "98118", "98119", "98121", "98122", "98125", "98126", "98133",
      "98134", "98136", "98144", "98146", "98148", "98154", "98164",
      "98174", "98177", "98178", "98195", "98199"
    ],
    waitlistActive: true,
    services: {
      homeCare: { comingSoon: true },
      propertyCare: { comingSoon: true }
    }
  }
};

export function checkServiceAvailability(zipCode) {
  if (!zipCode || zipCode.length !== 5) {
    return {
      available: false,
      error: "Invalid ZIP code",
      message: "Please enter a 5-digit ZIP code"
    };
  }

  // Check if ZIP is in any service area
  for (const [areaId, area] of Object.entries(SERVICE_AREAS)) {
    if (area.zipCodes.includes(zipCode)) {
      if (area.active) {
        return {
          available: true,
          areaId,
          area: area.region,
          operator: area.operator,
          operatorId: area.operatorId,
          services: area.services,
          contact: area.operatorContact,
          cities: area.cities
        };
      } else {
        return {
          available: false,
          comingSoon: true,
          areaId,
          area: area.region,
          waitlistActive: area.waitlistActive,
          launchDate: area.launchDate,
          cities: area.cities
        };
      }
    }
  }

  // ZIP not in any defined service area
  return {
    available: false,
    comingSoon: false,
    area: "your area",
    message: "Professional services not yet available in your area. Use Command Center software nationwide!",
    softwareAvailable: true
  };
}

export function calculateProPricing(properties) {
  const BASE_PRICE = 8; // $8/month for up to 3 properties
  const PER_DOOR_PRICE = 2; // $2/month per door beyond first 3
  
  const totalDoors = properties.reduce((sum, p) => sum + (p.door_count || 1), 0);
  const includedDoors = 3;
  const additionalDoors = Math.max(0, totalDoors - includedDoors);
  
  const monthlyPrice = BASE_PRICE + (additionalDoors * PER_DOOR_PRICE);
  const annualPrice = monthlyPrice * 12;
  
  return {
    monthlyPrice,
    annualPrice,
    totalDoors,
    includedDoors,
    additionalDoors,
    breakdown: {
      base: BASE_PRICE,
      additionalCost: additionalDoors * PER_DOOR_PRICE
    }
  };
}

export function calculatePropertyCarePricing(doors, tier = 'premium') {
  const area = SERVICE_AREAS.clark_county_wa;
  const pricing = area.services.propertyCare.pricing[tier];
  
  let baseMonthly = pricing.perDoorMonthly * doors;
  let discount = 0;
  let discountLabel = '';
  
  // Apply volume discounts
  for (const bracket of area.services.propertyCare.volumeDiscounts) {
    if (doors >= bracket.min && doors <= bracket.max) {
      discount = bracket.discount;
      discountLabel = bracket.label;
      break;
    }
  }
  
  const discountAmount = baseMonthly * discount;
  const monthlyPrice = baseMonthly - discountAmount;
  const annualPrice = monthlyPrice * 12;
  
  return {
    monthlyPrice: Math.round(monthlyPrice),
    annualPrice: Math.round(annualPrice),
    baseMonthly,
    discount,
    discountLabel,
    discountAmount: Math.round(discountAmount),
    perDoorPrice: pricing.perDoorMonthly,
    doors
  };
}