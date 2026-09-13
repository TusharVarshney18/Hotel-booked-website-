export type CollectionKind =
  | "Palace"
  | "Villa"
  | "Chalet"
  | "Ryokan"
  | "Estate"
  | "Atelier";

export type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  size: string;
  occupancy: number;
  beds: string;
  price: number;
  images: string[];
  amenities: string[];
  inventory?: number;
  available?: boolean;
};

export type GuestReview = {
  name: string;
  origin: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export type Hotel = {
  slug: string;
  name: string;
  tagline: string;
  location: string;
  city: string;
  country: string;
  region: string;
  description: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  images: string[];
  amenities: string[];
  experiences: string[];
  collection: CollectionKind;
  featured: boolean;
  rooms: Room[];
  extras: Extra[];
  reviews: GuestReview[];
};

export type Destination = {
  region: string;
  city: string;
  country: string;
  image: string;
  count: number;
};

export type Quote = {
  hotel: Hotel;
  room: Room;
  nights: number;
  extras: Extra[];
  roomTotal: number;
  extrasTotal: number;
  taxes: number;
  total: number;
  available: boolean;
};

export type GuestCount = {
  adults: number;
  children: number;
};

export type GuestDetails = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
};

export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

export type PaymentInfo = {
  method: PaymentMethod;
  last4?: string;
  upiId?: string;
  brand?: string;
  status: "pending" | "paid" | "refunded" | "partially_refunded";
};

export type ReservationStatus = "confirmed" | "cancelled" | "completed";

export type Reservation = {
  id: string;
  hotelSlug: string;
  hotelName: string;
  hotelImage: string;
  location: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: GuestCount;
  extras: Extra[];
  guest: GuestDetails;
  payment: PaymentInfo;
  nights: number;
  roomTotal: number;
  extrasTotal: number;
  taxes: number;
  total: number;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt?: string;
  refundAmount?: number;
  cancellationReason?: string;
};

export type BookingDraft = {
  hotelSlug: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: GuestCount;
  extraIds: string[];
};
