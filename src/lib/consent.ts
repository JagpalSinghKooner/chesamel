// The cookie banner's memory, kept free of the DOM so it can be tested on its own.
import { consentMonths, hubspotAccountId } from '../data/consent';

export type ConsentChoice = 'accepted' | 'rejected';

interface StoredChoice {
  choice: ConsentChoice;
  // When the choice was made, in milliseconds since 1970.
  at: number;
}

export function serialiseChoice(choice: ConsentChoice, now: Date): string {
  return JSON.stringify({ choice, at: now.getTime() } satisfies StoredChoice);
}

// The visitor's choice, or undefined when there is none, it is unreadable, or
// it is older than consentMonths (the banner then asks again).
export function readChoice(stored: string | null, now: Date): ConsentChoice | undefined {
  if (!stored) return undefined;
  let parsed: Partial<StoredChoice>;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return undefined;
  }
  if (parsed?.choice !== 'accepted' && parsed?.choice !== 'rejected') return undefined;
  if (typeof parsed.at !== 'number' || parsed.at > now.getTime()) return undefined;
  const expires = new Date(parsed.at);
  expires.setMonth(expires.getMonth() + consentMonths);
  return now < expires ? parsed.choice : undefined;
}

// HubSpot's tracking code, as its embed snippet loads it.
export const hubspotScriptSrc = `https://js.hs-scripts.com/${hubspotAccountId}.js`;

// The Cloudflare Web Analytics beacon's attributes, or undefined when no token
// is set (local builds and tests), so no beacon is rendered.
export function cloudflareBeacon(token: string | undefined): { src: string; 'data-cf-beacon': string } | undefined {
  const trimmed = token?.trim();
  if (!trimmed) return undefined;
  return { src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': JSON.stringify({ token: trimmed }) };
}
