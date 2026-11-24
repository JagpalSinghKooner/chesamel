# Arabic pages saved from the live site

The live chesamel.com had three pages written in Arabic. Their text is not in the WordPress export, so it was saved here before cutover (#10). Every other `/ar/` page on the live site showed the English text, and now redirects to its English twin.

| Live address | Saved as | Redirects to until phase 2 |
| --- | --- | --- |
| `/ar/who-we-are/` | `who-we-are.html` | `/who-we-are/` |
| `/ar/services/digital-evolution/` | `services-digital-evolution.html` | `/services/digital-transformation/` |
| `/ar/المملكة-العربية-السعودية/` (Saudi Arabia) | `saudi-arabia.html` | `/contact/` |

Each file is the page body without the site header, footer, scripts or styling. Images still point at chesamel.com.

To bring a page back in phase 2: build it as Arabic content, then remove its line from `public/_redirects` and its entry from `urls/decisions.json`.
