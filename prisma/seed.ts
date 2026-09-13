import { PrismaClient } from "@prisma/client";
import { addDays, format } from "date-fns";
import { hotels } from "../src/lib/hotels";
import { experiences, testimonials } from "../src/lib/content";

const prisma = new PrismaClient();

function iso(daysFromNow: number) {
  return format(addDays(new Date(), daysFromNow), "yyyy-MM-dd");
}

async function main() {
  await prisma.reservationExtra.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.extra.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.conciergeMessage.deleteMany();
  await prisma.circleEnquiry.deleteMany();

  for (const [index, experience] of experiences.entries()) {
    await prisma.experience.create({
      data: { ...experience, sortOrder: index },
    });
  }

  for (const [index, item] of testimonials.entries()) {
    await prisma.testimonial.create({
      data: { ...item, sortOrder: index },
    });
  }

  let demoHotelId = "";
  let demoRoomId = "";
  let demoExtra = { key: "transfer", name: "Private airport transfer", price: 18000 };

  for (const hotel of hotels) {
    const created = await prisma.hotel.create({
      data: {
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
        images: hotel.images,
        amenities: hotel.amenities,
        experiences: hotel.experiences,
        collection: hotel.collection,
        featured: hotel.featured,
        rooms: {
          create: hotel.rooms.map((room) => ({
            key: room.id,
            name: room.name,
            description: room.description,
            size: room.size,
            occupancy: room.occupancy,
            beds: room.beds,
            price: room.price,
            inventory: 1,
            images: room.images,
            amenities: room.amenities,
          })),
        },
        extras: {
          create: hotel.extras.map((extra) => ({
            key: extra.id,
            name: extra.name,
            description: extra.description,
            price: extra.price,
          })),
        },
        reviews: {
          create: hotel.reviews.map((review) => ({
            name: review.name,
            origin: review.origin,
            rating: review.rating,
            title: review.title,
            body: review.body,
            date: review.date,
          })),
        },
      },
      include: { rooms: true, extras: true },
    });

    if (hotel.slug === "jal-mahal") {
      demoHotelId = created.id;
      const maharani =
        created.rooms.find((room) => room.key === "maharani") ?? created.rooms[1];
      demoRoomId = maharani.id;
      const extra = created.extras[0];
      if (extra) {
        demoExtra = { key: extra.key, name: extra.name, price: extra.price };
      }
    }
  }

  if (demoHotelId && demoRoomId) {
    const nights = 4;
    const room = await prisma.room.findUnique({ where: { id: demoRoomId } });
    const roomTotal = (room?.price ?? 245000) * nights;
    const extrasTotal = demoExtra.price;
    const taxes = Math.round((roomTotal + extrasTotal) * 0.18);
    await prisma.reservation.create({
      data: {
        id: "AUR-184720",
        hotelId: demoHotelId,
        roomId: demoRoomId,
        checkIn: iso(21),
        checkOut: iso(25),
        adults: 2,
        children: 0,
        title: "Ms",
        firstName: "Ananya",
        lastName: "Rao",
        email: "ananya.rao@aurelia.example",
        phone: "+91 98100 00000",
        country: "India",
        specialRequests: "Lake-facing chamber, if the house allows.",
        paymentMethod: "card",
        paymentLast4: "4242",
        paymentBrand: "Visa",
        paymentStatus: "paid",
        nights,
        roomTotal,
        extrasTotal,
        taxes,
        total: roomTotal + extrasTotal + taxes,
        status: "confirmed",
        extras: {
          create: [
            {
              extraKey: demoExtra.key,
              name: demoExtra.name,
              price: demoExtra.price,
            },
          ],
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
