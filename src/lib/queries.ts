import { prisma } from "@/lib/db";
import { reservationCode } from "@/lib/format";
import { computeQuote, toHotel, toReservation } from "@/lib/mappers";
import { calculateRefund } from "@/lib/policies";
import type {
  Destination,
  GuestDetails,
  Hotel,
  PaymentMethod,
  Quote,
  Reservation,
} from "@/lib/types";

const hotelInclude = {
  rooms: { orderBy: { price: "asc" as const } },
  extras: { orderBy: { price: "asc" as const } },
  reviews: true,
};

export async function overlappingCount(
  roomId: string,
  checkIn: string,
  checkOut: string
) {
  return prisma.reservation.count({
    where: {
      roomId,
      status: "confirmed",
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
}

export async function roomAvailabilityMap(
  rooms: { id: string; key: string; inventory: number }[],
  checkIn?: string,
  checkOut?: string
) {
  const map: Record<string, boolean> = {};
  if (!checkIn || !checkOut) {
    for (const room of rooms) map[room.key] = true;
    return map;
  }
  await Promise.all(
    rooms.map(async (room) => {
      const taken = await overlappingCount(room.id, checkIn, checkOut);
      map[room.key] = taken < room.inventory;
    })
  );
  return map;
}

export async function listHotels(filters?: {
  destination?: string;
  collection?: string;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const rows = await prisma.hotel.findMany({
    where: {
      ...(filters?.destination ? { city: filters.destination } : {}),
      ...(filters?.collection && filters.collection !== "All"
        ? { collection: filters.collection }
        : {}),
      ...(filters?.maxPrice ? { priceFrom: { lte: filters.maxPrice } } : {}),
    },
    include: hotelInclude,
    orderBy: [{ featured: "desc" }, { priceFrom: "asc" }],
  });

  const hotels: Hotel[] = [];
  for (const row of rows) {
    const availability = await roomAvailabilityMap(
      row.rooms,
      filters?.checkIn,
      filters?.checkOut
    );
    const hotel = toHotel(row, availability);
    const occupancyOk = filters?.guests
      ? hotel.rooms.some((room) => room.occupancy >= (filters.guests ?? 1))
      : true;
    const dateOk =
      !filters?.checkIn ||
      !filters?.checkOut ||
      hotel.rooms.some((room) => room.available);
    if (occupancyOk && dateOk) hotels.push(hotel);
  }
  return hotels;
}

export async function getHotelBySlug(
  slug: string,
  checkIn?: string,
  checkOut?: string
) {
  const row = await prisma.hotel.findUnique({
    where: { slug },
    include: hotelInclude,
  });
  if (!row) return null;
  const availability = await roomAvailabilityMap(row.rooms, checkIn, checkOut);
  return toHotel(row, availability);
}

export async function listFeaturedHotels() {
  const rows = await prisma.hotel.findMany({
    where: { featured: true },
    include: hotelInclude,
    orderBy: { priceFrom: "asc" },
  });
  return rows.map((row) => toHotel(row));
}

export async function listDestinations(): Promise<Destination[]> {
  const hotels = await prisma.hotel.findMany({
    orderBy: { city: "asc" },
  });
  const map = new Map<string, Destination>();
  for (const hotel of hotels) {
    const images = Array.isArray(hotel.images) ? hotel.images.map(String) : [];
    const current = map.get(hotel.city);
    if (current) {
      current.count += 1;
    } else {
      map.set(hotel.city, {
        region: hotel.region,
        city: hotel.city,
        country: hotel.country,
        image: images[0] ?? "",
        count: 1,
      });
    }
  }
  return Array.from(map.values());
}

export async function listExperiences() {
  return prisma.experience.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function quoteStay(input: {
  hotelSlug: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  extraIds: string[];
}): Promise<Quote | null> {
  const hotel = await getHotelBySlug(
    input.hotelSlug,
    input.checkIn,
    input.checkOut
  );
  if (!hotel) return null;
  const room =
    hotel.rooms.find((item) => item.id === input.roomId) ?? hotel.rooms[0];
  if (!room) return null;
  return computeQuote(
    hotel,
    room,
    input.extraIds,
    input.checkIn,
    input.checkOut
  );
}

export async function createReservation(input: {
  hotelSlug: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  extraIds: string[];
  guests: { adults: number; children: number };
  guest: GuestDetails;
  payment: {
    method: PaymentMethod;
    last4?: string;
    upiId?: string;
    brand?: string;
  };
}) {
  const hotelRow = await prisma.hotel.findUnique({
    where: { slug: input.hotelSlug },
    include: hotelInclude,
  });
  if (!hotelRow) throw new Error("That residence is no longer in the book.");

  const roomRow =
    hotelRow.rooms.find((room) => room.key === input.roomId) ??
    hotelRow.rooms[0];
  if (!roomRow) throw new Error("That chamber could not be held.");

  if (input.guests.adults + input.guests.children > roomRow.occupancy) {
    throw new Error(`This chamber sleeps ${roomRow.occupancy}.`);
  }

  const availability = await roomAvailabilityMap(
    hotelRow.rooms,
    input.checkIn,
    input.checkOut
  );
  const hotel = toHotel(hotelRow, availability);
  const room = hotel.rooms.find((item) => item.id === roomRow.key);
  if (!room) throw new Error("That chamber could not be held.");
  const quote = computeQuote(
    hotel,
    room,
    input.extraIds,
    input.checkIn,
    input.checkOut
  );

  const extras = hotel.extras.filter((extra) =>
    input.extraIds.includes(extra.id)
  );

  const created = await prisma.$transaction(async (tx) => {
    const taken = await tx.reservation.count({
      where: {
        roomId: roomRow.id,
        status: "confirmed",
        checkIn: { lt: input.checkOut },
        checkOut: { gt: input.checkIn },
      },
    });
    if (taken >= roomRow.inventory) {
      throw new Error("Those dates have already been spoken for.");
    }

    let id = reservationCode();
    while (await tx.reservation.findUnique({ where: { id } })) {
      id = reservationCode();
    }

    return tx.reservation.create({
      data: {
        id,
        hotelId: hotelRow.id,
        roomId: roomRow.id,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.guests.adults,
        children: input.guests.children,
        title: input.guest.title,
        firstName: input.guest.firstName,
        lastName: input.guest.lastName,
        email: input.guest.email,
        phone: input.guest.phone,
        country: input.guest.country,
        specialRequests: input.guest.specialRequests,
        paymentMethod: input.payment.method,
        paymentLast4: input.payment.last4,
        paymentUpi: input.payment.upiId,
        paymentBrand: input.payment.brand,
        paymentStatus: "paid",
        nights: quote.nights,
        roomTotal: quote.roomTotal,
        extrasTotal: quote.extrasTotal,
        taxes: quote.taxes,
        total: quote.total,
        status: "confirmed",
        extras: {
          create: extras.map((extra) => ({
            extraKey: extra.id,
            name: extra.name,
            price: extra.price,
          })),
        },
      },
      include: { hotel: true, room: true, extras: true },
    });
  });

  return toReservation(created);
}

export async function getReservationById(id: string) {
  const row = await prisma.reservation.findUnique({
    where: { id },
    include: { hotel: true, room: true, extras: true },
  });
  return row ? toReservation(row) : null;
}

export async function listReservations(ids: string[], email?: string) {
  if (!ids.length && !email) return [];
  const rows = await prisma.reservation.findMany({
    where:
      email && ids.length
        ? { OR: [{ id: { in: ids } }, { email }] }
        : email
          ? { email }
          : { id: { in: ids } },
    include: { hotel: true, room: true, extras: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toReservation);
}

export async function cancelReservationById(id: string, reason: string) {
  const current = await prisma.reservation.findUnique({
    where: { id },
    include: { hotel: true, room: true, extras: true },
  });
  if (!current) throw new Error("Folio not found.");
  if (current.status === "cancelled") {
    return toReservation(current);
  }

  const refund = calculateRefund({
    checkIn: current.checkIn,
    roomTotal: current.roomTotal,
    extrasTotal: current.extrasTotal,
    taxes: current.taxes,
  });

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: reason,
      refundAmount: refund.amount,
      paymentStatus:
        refund.amount >= current.total ? "refunded" : "partially_refunded",
    },
    include: { hotel: true, room: true, extras: true },
  });

  return { reservation: toReservation(updated), refund };
}

export async function hotelsInCity(city: string) {
  return prisma.hotel.findMany({
    where: { city },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
}
