// Team Members and the open roles (WordPress `careers`).
//
// Team Members have no pages of their own (the live /team-members/* pages are
// empty shells outside the sitemap); the Our Team, Who We Are and Network
// pages show them. Each open role is a standard Page at /careers/<slug>/.

import { asWxr, decodeEntities, type WxrSource, type WxrItem } from './wxr.ts';
import { localiseUrls, toMarkdown } from './html.ts';
import { teamSlugs, type TeamSlug } from '../../src/data/taxonomy.ts';
import type { PageFile, TeamMemberFile } from '../../src/content/page-schemas.ts';

const published = (type: string) => (i: WxrItem) => i.type === type && i.status === 'publish';
const slugOf = (link: string) => new URL(link).pathname.split('/').filter(Boolean).at(-1)!;
// File names come from the name: one live address is WordPress's "__trashed-6".
const slugify = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const meta = (i: WxrItem, key: string) => decodeEntities(i.meta[key] ?? '').trim();

export interface ImportedMember {
  file: string;
  data: TeamMemberFile;
  body: string;
}

export function importTeamMembers(source: WxrSource) {
  const wxr = asWxr(source);
  const members: ImportedMember[] = [];
  const withoutPhoto: string[] = [];
  for (const item of wxr.items.filter(published('team_members'))) {
    const name = decodeEntities(item.title);
    const photo = wxr.byId.get(item.meta._thumbnail_id ?? '')?.attachmentUrl;
    // A card without a photo would show a gap; the live site shows none either.
    if (!photo) {
      withoutPhoto.push(name);
      continue;
    }
    const teams = item.categories.filter((c) => c.domain === 'teams' && (teamSlugs as readonly string[]).includes(c.slug)).map((c) => c.slug as TeamSlug);
    const linkedin = meta(item, 'team_member_linkedin').replace(/^(?=[a-z.]*linkedin\.com)/, 'https://');
    const email = meta(item, 'team_member_email');
    members.push({
      file: `src/content/team/${slugify(name)}.md`,
      data: {
        name,
        role: meta(item, 'team_member_role'),
        teams,
        order: item.menuOrder,
        photo: { src: localiseUrls(photo), alt: name },
        ...(linkedin && { linkedin }),
        ...(email && { email }),
      },
      body: toMarkdown(item.content),
    });
  }
  return { members, withoutPhoto, media: members.map((m) => `https://chesamel.com${m.data.photo.src}`) };
}

export interface ImportedRole {
  address: string;
  file: string;
  data: PageFile;
  body: string;
}

export function importCareers(source: WxrSource): ImportedRole[] {
  const wxr = asWxr(source);
  return wxr.items.filter(published('careers')).map((item) => {
    const title = decodeEntities(item.title);
    const description = meta(item, '_yoast_wpseo_metadesc');
    const apply = meta(item, 'career_link');
    return {
      address: `/careers/${slugOf(item.link)}/`,
      file: `src/content/pages/careers/${slugOf(item.link)}.md`,
      data: {
        title,
        ...(description && { description }),
        hero: {
          title,
          details: ['career_office_based', 'career_employment_type', 'career_location'].map((k) => meta(item, k)).filter(Boolean),
          ...(apply && { links: [{ label: 'Apply for this role', href: apply }] }),
        },
      },
      body: toMarkdown(item.content),
    };
  });
}
