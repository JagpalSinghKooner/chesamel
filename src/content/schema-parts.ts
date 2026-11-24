// Field definitions the content schemas share.

import { z } from 'astro/zod';
import { inPublic } from './in-public';

// Required text: not empty once trimmed.
export const text = z.string().trim().min(1);

export const date = z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'Not a valid date');

// An image in public/; a missing file fails the build.
export const image = z.object({
  src: z.string().refine(inPublic, 'Image not found in public/'),
  alt: z.string(),
});
