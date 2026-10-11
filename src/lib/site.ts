export const SITE_AUTHOR = "Tushar Varshney";

export const COPYRIGHT_CLAIM = "This website was made by Tushar Varshney.";

export const STORE_NAME = "Aurelia House";

export const STORE_EMAIL = "concierge@aurelia.example";

export const STORE_PHONE = "+91 22 4000 1814";

export const STORE_ADDRESS = "Aurelia House, Lodhi Estate, New Delhi 110003, India";

export function copyrightLine(year = new Date().getFullYear()) {
  return `© ${year} ${SITE_AUTHOR}. All rights reserved.`;
}
