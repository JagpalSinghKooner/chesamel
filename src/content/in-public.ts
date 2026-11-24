// Whether an image address points at a file in public/. Schemas use it so a
// missing image fails the build instead of showing as broken on the site.

import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Media lives in public/ at its old WordPress path. Builds and tests run from
// the repo root, so the working directory is the reliable anchor here.
export const inPublic = (src: string) => src.startsWith('/') && existsSync(join(process.cwd(), 'public', decodeURI(src)));
