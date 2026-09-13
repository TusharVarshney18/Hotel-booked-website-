import Link from "next/link";
import { Container, Eyebrow } from "@/components/site/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 font-display text-5xl">That page is not in the book</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The residence may have been withdrawn, or the address mistyped.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory"
      >
        Return to the house
      </Link>
    </Container>
  );
}
