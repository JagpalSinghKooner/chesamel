// Cookie consent and analytics settings (#12).
//
// HubSpot is the only tracker that needs consent: it loads only after a
// visitor chooses Accept all. Cloudflare Web Analytics uses no cookies and runs
// for everyone; its token comes from the CLOUDFLARE_WEB_ANALYTICS_TOKEN
// environment variable at build time (astro.config.mjs), never from the repo.

// The HubSpot account the live site's forms post to.
export const hubspotAccountId = '7886724';

// How long a choice, Accept or Reject, is remembered before the banner asks again.
export const consentMonths = 12;

// The localStorage key that holds the visitor's choice.
export const consentStorageKey = 'chesamel-cookie-consent';

// The footer link with this address reopens the banner (footerLinks in site.ts).
export const cookieSettingsHref = '#cookie-settings';
