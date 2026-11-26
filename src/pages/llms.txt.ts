// llms.txt (https://llmstxt.org), built with the site (#54): what Chesamel
// is, then its key pages by section, each a link with its meta description
// as the summary. AI assistants read it to find their way round the site.
import type { APIRoute } from 'astro';
import { getPages, getPillars, getServices, getRoles, pageAddress, pillarAddress, serviceAddress, type Page } from '../content/pages';
import { getCaseStudies, getIndustries, caseStudyAddress, industryAddress } from '../content/case-studies';
import { getNewest, addressOf } from '../content/insight-items';
import { siteName } from '../data/seo';
import { entryMeta, pageMeta } from '../lib/seo';
import { absolute } from '../lib/structured-data';

interface Link {
  name: string;
  href: string;
  summary: string;
}

const line = (link: Link) => `- [${link.name}](${absolute(link.href)}): ${link.summary}`;
const section = (heading: string, links: Link[]) => [`## ${heading}`, '', ...links.map(line)].join('\n');

// A content item, named by its own title.
const item = (entry: Parameters<typeof entryMeta>[0], href: string): Link => ({ name: entry.data.title, href, summary: entryMeta(entry).description });

// A page without a content file, such as a listing.
const listing = (name: string, href: Parameters<typeof pageMeta>[0]): Link => ({ name, href, summary: pageMeta(href).description });

// Who We Are's opening paragraph says what Chesamel is.
function aboutChesamel(page: Page | undefined): string {
  const intro = page?.data.sections.find((s) => s.type === 'intro');
  return (intro?.type === 'intro' && intro.paragraphs[0]) || pageMeta('/').description;
}

export const GET: APIRoute = async () => {
  const pages = await getPages();
  const page = (id: string) => {
    const found = pages.find((p) => p.id === id);
    if (!found) throw new Error(`llms.txt lists src/content/pages/${id}.md, which doesn't exist`);
    return item(found, pageAddress(found));
  };
  const [pillars, services, industries, caseStudies, roles] = await Promise.all([getPillars(), getServices(), getIndustries(), getCaseStudies(), getRoles()]);
  const insights = (await Promise.all([getNewest('reports'), getNewest('webinars'), getNewest('podcasts')])).flat();

  const body = [
    `# ${siteName}`,
    `> ${aboutChesamel(pages.find((p) => p.id === 'who-we-are'))}`,
    section('Services', [
      page('what-we-do'),
      ...pillars.flatMap((pillar) => [
        item(pillar, pillarAddress(pillar)),
        ...services.filter((s) => s.data.pillar === pillar.id).map((s) => item(s, serviceAddress(s))),
      ]),
      listing('Industries', '/industries/'),
      ...industries.map((industry) => item(industry, industryAddress(industry))),
    ]),
    section('Insights', [
      listing('Insights', '/insights/'),
      listing('News', '/insights/blog/'),
      listing('Reports', '/insights/reports/'),
      listing('Webinars', '/insights/webinars/'),
      listing('Podcast', '/insights/podcasts/'),
      ...insights.map((entry) => item(entry, addressOf(entry))),
    ]),
    section('Case Studies', [listing('Our Work', '/insights/our-work/'), ...caseStudies.map((c) => item(c, caseStudyAddress(c)))]),
    section('Company', [
      page('who-we-are'),
      page('who-we-are/our-team'),
      page('who-we-are/network'),
      page('culture'),
      page('careers'),
      ...roles.map((role) => item(role, pageAddress(role))),
      page('contact'),
    ]),
  ].join('\n\n');

  return new Response(`${body}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
