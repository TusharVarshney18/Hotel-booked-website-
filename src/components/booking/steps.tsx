import { cn } from "@/lib/utils";

const steps = ["Stay", "Payment", "Confirmed"];

export function BookingSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-4 text-[11px] uppercase tracking-[0.24em]">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-4">
          <span
            className={cn(
              index <= current ? "text-gold" : "text-muted-foreground"
            )}
          >
            0{index + 1} {step}
          </span>
          {index < steps.length - 1 ? (
            <span className="hidden h-px w-10 bg-border sm:block" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
