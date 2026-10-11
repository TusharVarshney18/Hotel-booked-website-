import Link from "next/link";
import { Container, Eyebrow } from "@/components/site/container";

const links = [
  { href: "/legal", label: "Overview" },
  { href: "/legal/terms", label: "Terms of sale" },
  { href: "/legal/refunds", label: "Refunds" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/contact", label: "Contact" },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24 pb-20">
      <Container>
        <Eyebrow>The shop</Eyebrow>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/55 underline-offset-4 hover:text-gold hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 max-w-3xl">{children}</div>
      </Container>
    </div>
  );
}
