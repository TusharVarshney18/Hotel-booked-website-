import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import { Container, Eyebrow } from "@/components/site/container";
import { LoginClient } from "@/components/site/login-client";

export const metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/reservations");

  return (
    <div className="pt-24 pb-20">
      <Container className="max-w-xl">
        <Eyebrow>The ledger</Eyebrow>
        <h1 className="mt-3 font-display text-5xl">Sign in</h1>
        <p className="mt-3 text-muted-foreground">
          Enter the email on your folio and we will send a single-use link to
          gather every reservation, on any device.
        </p>
        <LoginClient />
      </Container>
    </div>
  );
}
