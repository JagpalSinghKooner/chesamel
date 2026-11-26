// JSON-LD for search engines and AI assistants (#54): one function per
// schema.org node a page's @graph can hold. Each returns a plain object; the
// Seo Component joins them into the page's single @graph. The Organization
// and WebSite carry fixed @ids, so every other node points at them instead of
// repeating them.

import type { CollectionEntry } from 'astro:content';
import { socialLinks } from '../data/site';
import { siteName, logo, podcastSeries } from '../data/seo';
import type { Trail } from '../components/trails';

export type Node = Record<string, unknown>;
type Office = CollectionEntry<'offices'>;
type TeamMember = CollectionEntry<'team'>;
type Image = { src: string; alt: string };

// A site address as a full URL on https://chesamel.com (astro.config.mjs).
export const absolute = (path: string) => new URL(path, import.meta.env.SITE).href;

const organizationId = { '@id': `${absolute('/')}#organization` };
const websiteId = { '@id': `${absolute('/')}#website` };
const webPageId = (url: string) => ({ '@id': `${url}#webpage` });
const breadcrumbId = (url: string) => ({ '@id': `${url}#breadcrumb` });

const postalAddress = (office: Office): Node => ({
  '@type': 'PostalAddress',
  name: office.data.name,
  streetAddress: office.data.address.join(', '),
  addressLocality: office.data.city,
  addressCountry: office.data.country,
  ...(office.data.phone && { telephone: office.data.phone }),
});

export const organization = (offices: Office[]): Node => ({
  '@type': 'Organization',
  ...organizationId,
  name: siteName,
  url: absolute('/'),
  logo: { '@type': 'ImageObject', url: absolute(logo.src), width: logo.width, height: logo.height },
  sameAs: socialLinks.map((link) => link.href),
  address: offices.map(postalAddress),
});

export const website = (): Node => ({
  '@type': 'WebSite',
  ...websiteId,
  name: siteName,
  url: absolute('/'),
  inLanguage: 'en',
  publisher: organizationId,
});

export const webPage = (page: { url: string; title: string; description: string; image?: Image; hasBreadcrumb: boolean }): Node => ({
  '@type': 'WebPage',
  ...webPageId(page.url),
  url: page.url,
  name: page.title,
  description: page.description,
  isPartOf: websiteId,
  inLanguage: 'en',
  ...(page.image && { primaryImageOfPage: absolute(page.image.src) }),
  ...(page.hasBreadcrumb && { breadcrumb: breadcrumbId(page.url) }),
});

// The trail the page's Breadcrumb Component shows. A step without a link is
// the page itself.
export const breadcrumbList = (trail: Trail, url: string): Node => ({
  '@type': 'BreadcrumbList',
  ...breadcrumbId(url),
  itemListElement: trail.map((step, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: step.label,
    item: step.href ? absolute(step.href) : url,
  })),
});

interface Story {
  url: string;
  headline: string;
  description: string;
  date: Date;
  image?: Image;
}

// A Blog Post (BlogPosting), or a Case Study or Report (Article). The content
// holds one date, so it is both the published and the modified date. No
// author until bylines are settled (#7).
export const article = (type: 'BlogPosting' | 'Article', story: Story): Node => ({
  '@type': type,
  headline: story.headline,
  description: story.description,
  url: story.url,
  mainEntityOfPage: webPageId(story.url),
  ...(story.image && { image: absolute(story.image.src) }),
  datePublished: story.date.toISOString(),
  dateModified: story.date.toISOString(),
  inLanguage: 'en',
  publisher: organizationId,
});

export const podcastEpisode = (episode: Story & { listen: string[] }): Node => ({
  '@type': 'PodcastEpisode',
  name: episode.headline,
  description: episode.description,
  url: episode.url,
  datePublished: episode.date.toISOString(),
  ...(episode.image && { image: absolute(episode.image.src) }),
  sameAs: episode.listen,
  partOfSeries: { '@type': 'PodcastSeries', name: podcastSeries.name, url: absolute(podcastSeries.href) },
  publisher: organizationId,
});

// A Webinar's recording on YouTube.
export const videoObject = (video: Story & { youtubeId: string }): Node => ({
  '@type': 'VideoObject',
  name: video.headline,
  description: video.description,
  uploadDate: video.date.toISOString(),
  thumbnailUrl: video.image ? absolute(video.image.src) : `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
  embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
  publisher: organizationId,
});

export const service = (offering: { url: string; name: string; description: string }): Node => ({
  '@type': 'Service',
  name: offering.name,
  description: offering.description,
  url: offering.url,
  provider: organizationId,
});

export const person = (member: TeamMember): Node => ({
  '@type': 'Person',
  name: member.data.name,
  jobTitle: member.data.role,
  image: absolute(member.data.photo.src),
  worksFor: organizationId,
  ...(member.data.linkedin && { sameAs: [member.data.linkedin] }),
});

// An open role's facts come from its hero details, such as "Hybrid",
// "Full-Time", "London, UK": a way of working, a contract type and a place.
const EMPLOYMENT_TYPES: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  internship: 'INTERN',
};
const WAYS_OF_WORKING = ['remote', 'hybrid', 'on-site', 'onsite', 'office'];

interface Role {
  url: string;
  title: string;
  // The full advert, as HTML.
  description: string;
  posted: Date;
  details: string[];
}

export function jobPosting(role: Role, offices: Office[]): Node {
  const facts = role.details.map((detail) => detail.toLowerCase());
  const employmentType = facts.map((fact) => EMPLOYMENT_TYPES[fact]).filter(Boolean);
  const place = role.details.find((_, i) => !EMPLOYMENT_TYPES[facts[i]] && !WAYS_OF_WORKING.includes(facts[i]));
  const office = place && offices.find((o) => place.toLowerCase().includes(o.data.city.toLowerCase()));
  // A remote role names where applicants may live ("UK/EMEA") instead of an office.
  const where = facts.includes('remote')
    ? {
        jobLocationType: 'TELECOMMUTE',
        applicantLocationRequirements: (place ?? '').split('/').filter(Boolean).map((name) => ({ '@type': 'AdministrativeArea', name: name.trim() })),
      }
    : { jobLocation: { '@type': 'Place', address: office ? postalAddress(office) : { '@type': 'PostalAddress', addressLocality: place } } };
  return {
    '@type': 'JobPosting',
    title: role.title,
    description: role.description,
    url: role.url,
    datePosted: role.posted.toISOString(),
    // Every role is Chesamel's own (`employer: Chesamel Group`).
    hiringOrganization: organizationId,
    ...(employmentType.length > 0 && { employmentType }),
    ...where,
  };
}

// The page's @graph: the site-wide nodes, the page itself, then the nodes
// particular to it.
export const graph = (nodes: Node[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
