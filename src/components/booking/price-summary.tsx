import { formatINR } from "@/lib/format";
import type { Extra } from "@/lib/types";

export function PriceSummary({
  roomName,
  roomPrice,
  nights,
  extras,
  roomTotal,
  taxes,
  total,
}: {
  roomName: string;
  roomPrice: number;
  nights: number;
  extras: Extra[];
  roomTotal: number;
  extrasTotal: number;
  taxes: number;
  total: number;
}) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">
          {roomName} · {formatINR(roomPrice)} × {nights} night
          {nights === 1 ? "" : "s"}
        </dt>
        <dd>{formatINR(roomTotal)}</dd>
      </div>
      {extras.map((extra) => (
        <div key={extra.id} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{extra.name}</dt>
          <dd>{formatINR(extra.price)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Taxes & levies (18%)</dt>
        <dd>{formatINR(taxes)}</dd>
      </div>
      <div className="flex justify-between border-t border-border pt-4 text-base">
        <dt>Total</dt>
        <dd>{formatINR(total)}</dd>
      </div>
    </dl>
  );
}
