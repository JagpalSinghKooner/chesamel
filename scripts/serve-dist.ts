// Serves the built site the way Cloudflare Pages does, so local tests see the
// same answers as a Preview: _redirects, /x to /x/, and 404.html for unknown
// addresses. `astro preview` does none of these.
// Run: node scripts/serve-dist.ts [port]

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Redirect {
  from: string;
  to: string;
  status: number;
}

export type Answer = { status: number; location: string } | { status: number; file: string };

export function parseRedirects(text: string): Redirect[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status = '302'] = line.split(/\s+/);
      // Cloudflare also supports * and :placeholder rules; this server doesn't,
      // so such a rule would pass on a Preview but fail locally.
      if (/[*:]/.test(from)) throw new Error(`Only exact addresses are supported in _redirects: ${line}`);
      return { from: decodeURI(from), to, status: Number(status) };
    });
}

export function route(
  pathname: string,
  site: { redirects: Redirect[]; exists: (file: string) => boolean },
  search = '',
): Answer {
  const path = decodeURI(pathname);
  const redirect = site.redirects.find((r) => r.from === path);
  if (redirect) return { status: redirect.status, location: redirect.to };
  const file = path.slice(1);
  if (path.endsWith('/') && site.exists(`${file}index.html`)) return { status: 200, file: `${file}index.html` };
  if (path.endsWith('.html') && site.exists(file)) {
    return { status: 308, location: path.replace(/\/index\.html$/, '/').replace(/\.html$/, '') };
  }
  if (!path.endsWith('/') && site.exists(file)) return { status: 200, file };
  if (!path.endsWith('/') && site.exists(`${file}.html`)) return { status: 200, file: `${file}.html` };
  if (!path.endsWith('/') && site.exists(`${file}/index.html`)) return { status: 308, location: `${pathname}/${search}` };
  return { status: 404, file: '404.html' };
}

const TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  xml: 'application/xml',
  txt: 'text/plain; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
};

function serve(dir: string, port: number) {
  const redirectsFile = join(dir, '_redirects');
  const site = {
    redirects: existsSync(redirectsFile) ? parseRedirects(readFileSync(redirectsFile, 'utf8')) : [],
    exists: (file: string) => {
      const full = join(dir, file);
      return full.startsWith(dir + sep) && existsSync(full) && statSync(full).isFile();
    },
  };
  createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let answer: Answer;
    try {
      answer = route(url.pathname, site, url.search);
    } catch {
      // A malformed percent-encoding can't name any file.
      answer = { status: 400, file: '404.html' };
    }
    if ('location' in answer) {
      res.writeHead(answer.status, { location: answer.location }).end();
      return;
    }
    const type = TYPES[extname(answer.file).slice(1).toLowerCase()] ?? 'application/octet-stream';
    res.writeHead(answer.status, { 'content-type': type }).end(readFileSync(join(dir, answer.file)));
  }).listen(port, () => console.log(`Serving ${dir} like Cloudflare Pages on http://localhost:${port}`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve(fileURLToPath(new URL('../dist', import.meta.url)), Number(process.argv[2] ?? 4321));
}
