// TypeScript types for Prague Shared Flats booking platform

export interface Flat {
  id: number;
  residenceId: number;
  name: string;
  room: string;
  price: number; // Monthly rent in CZK
  deposit: number; // Security deposit in CZK
  utilities: number; // Utilities cost in CZK
  available: boolean;
  availableFrom?: string;
  floor?: number;
  furnished: boolean;
  photos: string[];
  amenities: string[];
  description?: string;
}

export interface Residence {
  id: number;
  name: string;
  address: string;
  district: string;
  description: string;
  mainImage: string;
  photos: string[];
  flats: Flat[];
  features: string[];
  transport: {
    metro?: string;
    tram?: string[];
    bus?: string[];
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  flatId: number;
  userId: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

export interface SearchFilters {
  district?: string;
  priceMin?: number;
  priceMax?: number;
  availableFrom?: string;
  furnished?: boolean;
}