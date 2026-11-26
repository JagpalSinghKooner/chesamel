// Field definitions the content schemas share.

import { z } from 'astro/zod';
import { inPublic } from './in-public';

// Required text: not empty once trimmed.
export const text = z.string().trim().min(1);

export const date = z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'Not a valid date');

// The <title> and meta description live renders, copied by `npm run seo:live`
// (#54). Without them the page's own title and text stand in (src/lib/seo.ts).
export const seo = {
  seoTitle: text.optional(),
  seoDescription: text.optional(),
};

// An image in public/; a missing file fails the build.
export const image = z.object({
  src: z.string().refine(inPublic, 'Image not found in public/'),
  alt: z.string(),
});
