export type SendResult = {
  delivered: boolean;
  previewUrl?: string;
};

export async function sendMagicLink(
  email: string,
  url: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info(`[email] Magic link for ${email}: ${url}`);
    return {
      delivered: false,
      previewUrl:
        process.env.NODE_ENV === "production" ? undefined : url,
    };
  }

  const from = process.env.EMAIL_FROM ?? "Aurelia <no-reply@aurelia.example>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your Aurelia sign-in link",
      html: [
        "<p>Open the link below to view and manage your folios.</p>",
        `<p><a href="${url}">${url}</a></p>`,
        "<p>The link expires in 15 minutes. If you did not request it, you may ignore this letter.</p>",
      ].join(""),
    }),
  });

  if (!response.ok) {
    console.error("[email] Resend request failed", await response.text());
    return { delivered: false };
  }

  return { delivered: true };
}
