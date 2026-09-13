import { z } from "zod";

export const TITLE_VALUES = ["Ms", "Mrs", "Mr", "Mx", "Dr"] as const;
export const PAYMENT_METHODS = ["card", "upi", "netbanking", "wallet"] as const;

const isoDate = z.iso.date();

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const optionalNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().nonnegative().optional()
);

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(120).optional()
);

export const guestDetailsSchema = z.object({
  title: z.enum(TITLE_VALUES),
  firstName: z.string().trim().min(1, { error: "A given name is required." }).max(80),
  lastName: z.string().trim().min(1, { error: "A family name is required." }).max(80),
  email: z.email({ error: "A valid email is required." }),
  phone: z.string().trim().min(6, { error: "A telephone number is required." }).max(32),
  country: z.string().trim().min(2).max(80),
  specialRequests: z.string().trim().max(2000).default(""),
});

export const guestCountSchema = z.object({
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(20),
});

export const paymentSchema = z
  .object({
    method: z.enum(PAYMENT_METHODS),
    last4: z
      .string()
      .regex(/^\d{4}$/, { error: "The card must end in four digits." })
      .optional(),
    upiId: z.string().trim().min(3).max(120).optional(),
    brand: z.string().trim().max(40).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.method === "card" && !value.last4) {
      ctx.addIssue({
        code: "custom",
        message: "The card must end in four digits.",
        path: ["last4"],
      });
    }
    if (value.method === "upi" && !value.upiId?.includes("@")) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a UPI identity such as name@okhdfc.",
        path: ["upiId"],
      });
    }
  });

const stayFields = {
  hotelSlug: z.string().trim().min(1).max(120),
  roomId: z.string().trim().min(1).max(120),
  checkIn: isoDate,
  checkOut: isoDate,
  extraIds: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
};

function checkStayDates(
  value: { checkIn: string; checkOut: string },
  ctx: z.RefinementCtx
) {
  const checkIn = new Date(`${value.checkIn}T00:00:00Z`);
  const checkOut = new Date(`${value.checkOut}T00:00:00Z`);
  if (checkOut <= checkIn) {
    ctx.addIssue({
      code: "custom",
      message: "Departure must be after arrival.",
      path: ["checkOut"],
    });
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (checkIn < today) {
    ctx.addIssue({
      code: "custom",
      message: "Arrival cannot be in the past.",
      path: ["checkIn"],
    });
  }
}

export const quoteSchema = z.object(stayFields).superRefine(checkStayDates);

export const createReservationSchema = z
  .object({
    ...stayFields,
    guests: guestCountSchema,
    guest: guestDetailsSchema,
    payment: paymentSchema,
  })
  .superRefine(checkStayDates);

export const hotelsQuerySchema = z.object({
  destination: optionalString,
  collection: optionalString,
  maxPrice: optionalNumber,
  checkIn: z.preprocess(emptyToUndefined, isoDate.optional()),
  checkOut: z.preprocess(emptyToUndefined, isoDate.optional()),
  adults: optionalNumber,
  children: optionalNumber,
});

export const conciergeSchema = z.object({
  name: z.string().trim().min(1, { error: "A name is required." }).max(120),
  email: z.email({ error: "A valid email is required." }),
  folio: z
    .preprocess(emptyToUndefined, z.string().trim().max(40).optional())
    .transform((value) => value ?? null),
  letter: z.string().trim().min(1, { error: "A letter is required." }).max(4000),
});

export const circleTierValues = ["Guest", "Circle", "Residence"] as const;

export const circleSchema = z.object({
  name: z.string().trim().min(1, { error: "A name is required." }).max(120),
  email: z.email({ error: "A valid email is required." }),
  tier: z.enum(circleTierValues),
});

export const magicLinkSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
});

export const staffLoginSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: z.string().min(8, { error: "A password is required." }).max(200),
});

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "The request could not be understood.";
}
