import { Residence } from '../types';

// Seed data for Prague Shared Flats
// Data collected from prague-shared-flats.eu residences

export const residences: Residence[] = [
  {
    id: 1,
    name: "Balbínova Residence",
    address: "Balbínova, Prague 2 - Vinohrady",
    district: "Vinohrady",
    description: "Modern shared accommodation in the heart of Vinohrady district. Close to IP Pavlova metro station with excellent transport connections.",
    mainImage: "/images/residences/balbinova/main.jpg",
    photos: [
      "/images/residences/balbinova/main.jpg",
      "/images/residences/balbinova/kitchen.jpg",
      "/images/residences/balbinova/room.jpg"
    ],
    features: [
      "Fully equipped kitchen",
      "High-speed WiFi",
      "Washing machine",
      "Close to metro",
      "Shared living room"
    ],
    transport: {
      metro: "IP Pavlova (Line C)",
      tram: ["6", "11", "13"],
      bus: ["135"]
    },
    flats: [
      {
        id: 101,
        residenceId: 1,
        name: "Room 1",
        room: "Single Room",
        price: 7500,
        deposit: 7500,
        utilities: 1500,
        available: true,
        furnished: true,
        photos: ["/images/flats/balbinova-room1.jpg"],
        amenities: ["Desk", "Bed", "Wardrobe", "Window"]
      }
    ]
  },
    {
    id: 2,
    name: "Řepy Residence",
    address: "Prague 17 - Řepy",
    district: "Řepy",
    description: "Comfortable shared flats in Řepy district with good metro access. Perfect for students looking for affordable accommodation.",
    mainImage: "/images/residences/repy/main.jpg",
    photos: [
      "/images/residences/repy/main.jpg"
    ],
    features: [
      "WiFi included",
      "Kitchen facilities",
      "Near metro",
      "Quiet neighborhood"
    ],
    transport: {
      metro: "Luka (Line B)",
      tram: ["22", "25"],
      bus: ["164", "180"]
    },
    flats: [
      {
        id: 201,
        residenceId: 2,
        name: "Room A",
        room: "Single Room",
        price: 6800,
        deposit: 6800,
        utilities: 1400,
        available: true,
        furnished: true,
        photos: ["/images/flats/repy-room1.jpg"],
        amenities: ["Desk", "Bed", "Closet", "Heating"]
      }
    ]
  },
  {
    id: 3,
    name: "Palmovka Residence",
    address: "Prague 8 - Palmovka",
    district: "Palmovka",
    description: "Modern residence near Palmovka metro station. Excellent transport connections to city center and universities.",
    mainImage: "/images/residences/palmovka/main.jpg",
    photos: [
      "/images/residences/palmovka/main.jpg"
    ],
    features: [
      "Modern facilities",
      "24/7 security",
      "Laundry room",
      "Study room"
    ],
    transport: {
      metro: "Palmovka (Line C, B)",
      tram: ["3", "10", "14"],
      bus: ["136", "177"]
    },
    flats: [
      {
        id: 301,
        residenceId: 3,
        name: "Room 1",
        room: "Single Room",
        price: 7200,
        deposit: 7200,
        utilities: 1600,
        available: true,
        furnished: true,
        photos: ["/images/flats/palmovka-room1.jpg"],
        amenities: ["Desk", "Bed", "Wardrobe", "Window", "WiFi"]
      }
    ]
  },
  {
    id: 4,
    name: "Nové Butovice Residence",
    address: "Prague 13 - Nové Butovice",
    district: "Nové Butovice",
    description: "Affordable accommodation in Nové Butovice area with excellent shopping and transport facilities nearby.",
    mainImage: "/images/residences/butovice/main.jpg",
    photos: [
      "/images/residences/butovice/main.jpg"
    ],
    features: [
      "Shopping center nearby",
      "WiFi",
      "Shared kitchen",
      "Parking available"
    ],
    transport: {
      metro: "Nové Butovice (Line B)",
      tram: ["4", "7", "9"],
      bus: ["123", "225"]
    },
    flats: [
      {
        id: 401,
        residenceId: 4,
        name: "Room 1",
        room: "Double Room",
        price: 6500,
        deposit: 6500,
        utilities: 1300,
        available: true,
        furnished: true,
        photos: ["/images/flats/butovice-room1.jpg"],
        amenities: ["Two Beds", "Desks", "Wardrobe", "Window"]
      }
    ]
  },
  {
    id: 5,
    name: "Hostivař Residence",
    address: "Praha 10 - V Nových Domcích 17, Hostivař",
    district: "Hostivař",
    description: "Quiet residential area in Prague 10 - Hostivař. Great for students who prefer a peaceful environment.",
    mainImage: "/images/residences/hostivar/main.jpg",
    photos: [
      "/images/residences/hostivar/main.jpg"
    ],
    features: [
      "Peaceful area",
      "Green surroundings",
      "WiFi included",
      "Fully equipped kitchen"
    ],
    transport: {
      metro: "Hostivař (Line A)",
      tram: ["7", "22"],
      bus: ["124", "213"]
    },
    flats: [
      {
        id: 501,
        residenceId: 5,
        name: "Room 1",
        room: "Single Room",
        price: 6900,
        deposit: 6900,
        utilities: 1450,
        available: true,
        furnished: true,
        photos: ["/images/flats/hostivar-room1.jpg"],
        amenities: ["Desk", "Bed", "Wardrobe", "Shared bathroom"]
      }
    ]
  }
];

// Helper function to get all flats across all residences
export const getAllFlats = () => {
  return residences.flatMap(residence => residence.flats);
};

// Helper function to get residence by ID
export const getResidenceById = (id: number) => {
  return residences.find(residence => residence.id === id);
};