import type {
  Extra as ExtraRow,
  Hotel as HotelRow,
  Reservation as ReservationRow,
  ReservationExtra,
  Review,
  Room as RoomRow,
} from "@prisma/client";
import { TAX_RATE } from "@/lib/pricing";
import { nightsBetween } from "@/lib/format";
import type {
  Extra,
  GuestReview,
  Hotel,
  Quote,
  Reservation,
  Room,
} from "@/lib/types";

type HotelRecord = HotelRow & {
  rooms: RoomRow[];
  extras: ExtraRow[];
  reviews: Review[];
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function toRoom(
  room: RoomRow,
  available?: boolean
): Room {
  return {
    id: room.key,
    name: room.name,
    description: room.description,
    size: room.size,
    occupancy: room.occupancy,
    beds: room.beds,
    price: room.price,
    images: asStringArray(room.images),
    amenities: asStringArray(room.amenities),
    inventory: room.inventory,
    available,
  };
}

export function toExtra(extra: ExtraRow): Extra {
  return {
    id: extra.key,
    name: extra.name,
    description: extra.description,
    price: extra.price,
  };
}

export function toReview(review: Review): GuestReview {
  return {
    name: review.name,
    origin: review.origin,
    rating: review.rating,
    title: review.title,
    body: review.body,
    date: review.date,
  };
}

export function toHotel(
  hotel: HotelRecord,
  availability?: Record<string, boolean>
): Hotel {
  return {
    slug: hotel.slug,
    name: hotel.name,
    tagline: hotel.tagline,
    location: hotel.location,
    city: hotel.city,
    country: hotel.country,
    region: hotel.region,
    description: hotel.description,
    longDescription: hotel.longDescription,
    rating: hotel.rating,
    reviewCount: hotel.reviewCount,
    priceFrom: hotel.priceFrom,
    images: asStringArray(hotel.images),
    amenities: asStringArray(hotel.amenities),
    experiences: asStringArray(hotel.experiences),
    collection: hotel.collection as Hotel["collection"],
    featured: hotel.featured,
    rooms: hotel.rooms.map((room) =>
      toRoom(room, availability ? availability[room.key] : undefined)
    ),
    extras: hotel.extras.map(toExtra),
    reviews: hotel.reviews.map(toReview),
  };
}

export function toReservation(
  reservation: ReservationRow & {
    hotel: HotelRow;
    room: RoomRow;
    extras: ReservationExtra[];
  }
): Reservation {
  const images = asStringArray(reservation.hotel.images);
  return {
    id: reservation.id,
    hotelSlug: reservation.hotel.slug,
    hotelName: reservation.hotel.name,
    hotelImage: images[0] ?? "",
    location: reservation.hotel.location,
    roomId: reservation.room.key,
    roomName: reservation.room.name,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: {
      adults: reservation.adults,
      children: reservation.children,
    },
    extras: reservation.extras.map((extra) => ({
      id: extra.extraKey,
      name: extra.name,
      description: "",
      price: extra.price,
    })),
    guest: {
      title: reservation.title,
      firstName: reservation.firstName,
      lastName: reservation.lastName,
      email: reservation.email,
      phone: reservation.phone,
      country: reservation.country,
      specialRequests: reservation.specialRequests,
    },
    payment: {
      method: reservation.paymentMethod as Reservation["payment"]["method"],
      last4: reservation.paymentLast4 ?? undefined,
      upiId: reservation.paymentUpi ?? undefined,
      brand: reservation.paymentBrand ?? undefined,
      status: reservation.paymentStatus as Reservation["payment"]["status"],
    },
    nights: reservation.nights,
    roomTotal: reservation.roomTotal,
    extrasTotal: reservation.extrasTotal,
    taxes: reservation.taxes,
    total: reservation.total,
    status: reservation.status as Reservation["status"],
    createdAt: reservation.createdAt.toISOString(),
    cancelledAt: reservation.cancelledAt?.toISOString(),
    refundAmount: reservation.refundAmount ?? undefined,
    cancellationReason: reservation.cancellationReason ?? undefined,
  };
}

export function computeQuote(
  hotel: Hotel,
  room: Room,
  extraIds: string[],
  checkIn: string,
  checkOut: string
): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  const extras = hotel.extras.filter((extra) => extraIds.includes(extra.id));
  const roomTotal = room.price * nights;
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
  const taxes = Math.round((roomTotal + extrasTotal) * TAX_RATE);
  return {
    hotel,
    room,
    nights,
    extras,
    roomTotal,
    extrasTotal,
    taxes,
    total: roomTotal + extrasTotal + taxes,
    available: room.available !== false,
  };
}
