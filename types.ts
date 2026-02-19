
export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  type: string;
  power: string;
  availability: 'Available' | 'In Use' | 'Offline';
  rating: number;
  distance?: string;
  coordinates?: { lat: number; lng: number };
  url?: string;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  text: string;
  stations: ChargingStation[];
  sources: { title: string; url: string }[];
}
