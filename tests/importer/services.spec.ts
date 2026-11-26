import { test, expect } from '@playwright/test';
import { importServices } from '../../scripts/import-wordpress/services';
import { wxr, type FixtureItem } from './fixture';

// A Pillar page as WordPress stores it, trimmed to the parts that carry copy.
const pillarPage = `<!-- wp:cover -->
<h1 class="wp-block-heading">Marketing Engine</h1>
<p>We help organisations strengthen market presence.</p>
<p>From strategy to campaigns, Chesamel moves marketing forward.</p>
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://chesamel.com/contact/">Let&#8217;s Chat</a></div>
<!-- wp:seoworks/breadcrumbs {"backgroundColor":"neutral-white"} -->
<p><a href="https://chesamel.com/what-we-do/">What We Do</a></p>
<!-- /wp:seoworks/breadcrumbs -->
<p>140+</p>
<p>/ digital experts across 17+ countries</p>
<p>Up to 60%</p>
<p>/ faster delivery</p>
<h2 class="wp-block-heading">How we work</h2>
<ul><li>We help organisations find the right focus.</li><li>Our approach connects research and strategy.</li></ul>
<p>Need clarity fast? Our Marketing Exploratory Assessment uncovers gaps.</p>
<figure class="wp-block-image"><img src="https://chesamel.com/wp-content/uploads/2024/10/image-213.png" alt=""/></figure>
<h2 class="wp-block-heading">The capabilities behind Breakthrough Marketing</h2>
<!-- wp:group {"layout":{"type":"flex"},"linkSettings":{"url":""}} -->
<h5 class="wp-block-heading">Research &amp; Data</h5>
<p>Turn market data into a clear marketing direction.</p>
<!-- wp:group {"layout":{"type":"flex"},"linkSettings":{"url":""}} -->
<h5 class="wp-block-heading">Branding</h5>
<p>Create clearer positioning.</p>
<!-- wp:block {"ref":506} /-->
<h2 class="wp-block-heading">Start with an Exploratory Assessment</h2>
<p>A focused conversation designed to uncover what is holding marketing back.</p>
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://chesamel.com/contact/">Book an assessment</a></div>
<figure class="wp-block-image"><img src="https://chesamel.com/wp-content/uploads/2024/10/pexels.jpg" alt=""/></figure>
<h2 class="wp-block-heading">Explore our Related Case Studies</h2>
<p>See our latest customer stories.</p>
<!-- wp:seoworks/slider {"postType":"case_studies","filterService":[365]} /-->
<h2 class="wp-block-heading">Our delivery models</h2>
<p>Flexible marketing support built around your goals.</p>
<!-- wp:seoworks/slider {"cardNumber":1} -->
<!-- wp:seoworks/card {"title":"Fractional Marketing","content":"Senior marketing expertise without full-time commitment.","imageId":5771,"type":"icon"} /-->
<!-- wp:seoworks/card {"title":"Agency Model","content":"End-to-end campaign delivery.","imageId":5772,"type":"icon"} /-->
<h2 class="wp-block-heading">Elevate your business</h2>
<p>/ click to visit website</p>
<h2 class="wp-block-heading">Insights</h2>
<p>Check out our latest thoughts and opinions.</p>
<h2 class="wp-block-heading">Ready to get started?</h2>
<p>don't wait to drive your business forward.</p>`;

// One of the Pillar's services. Its Related Services link the live site's
// old addresses, which redirect.
const servicePage = `<h1 class="wp-block-heading">Customer Experience &amp; Engagement</h1>
<p>We know how important it is to get into the mind of your customer.</p>
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://chesamel.com/contact/">Get started</a></div>
<!-- wp:seoworks/breadcrumbs {"backgroundColor":"neutral-white"} -->
<p><a href="https://chesamel.com/what-we-do/">What We Do</a></p>
<!-- /wp:seoworks/breadcrumbs -->
<figure class="wp-block-image"><img src="https://chesamel.com/wp-content/uploads/2024/10/image-213.png" alt=""/></figure>
<h2 class="wp-block-heading">Related Services</h2>
<!-- wp:group {"layout":{"type":"flex"},"linkSettings":{"url":"https://chesamel.com/services/marketing-experience/marketing-strategy-planning/"}} -->
<h5 class="wp-block-heading">Marketing Strategy and Planning</h5>
<p>Get to know your customer in-depth.</p>
<!-- wp:group {"layout":{"type":"flex"},"linkSettings":{"url":"https://modernworldwide.co/"}} -->
<h5 class="wp-block-heading">Modern</h5>
<p>A dedicated in-house creative agency.</p>
<h2 class="wp-block-heading">Our process</h2>
<ul><li>Our experts lay out the journey your customer takes.</li></ul>
<p>Quote on your ethos towards delivering solutions within this sector</p>
<h2 class="wp-block-heading">Latest Insights</h2>
<p>Check out our recent thoughts and expert opinions.</p>
<h2 class="wp-block-heading">Want to transform your business?</h2>
<p>the journey starts with just a click.</p>`;

const items: FixtureItem[] = [
  {
    id: 365,
    type: 'services',
    title: 'Marketing Engine',
    link: 'https://chesamel.com/services/marketing-engine/',
    content: pillarPage,
    meta: { service_color: '#FF4A7D', _yoast_wpseo_metadesc: 'Chesamel’s 360° marketing engine solutions.' },
  },
  {
    id: 366,
    type: 'services',
    title: 'Customer Experience &amp; Engagement',
    link: 'https://chesamel.com/services/marketing-engine/customer-experience-engagement/',
    content: servicePage,
    meta: { service_color: '#FF4A7D' },
  },
  { id: 5771, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2026/04/fractional.svg' },
  { id: 5772, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2026/04/agency.svg' },
  // The Arabic copy of a Pillar is #14's, not this importer's.
  { id: 4032, type: 'services', title: 'التحول الرقمي', link: 'https://chesamel.com/ar/services/digital-evolution/', content: pillarPage },
];

const run = () => importServices(wxr(items));

test('a Pillar becomes a file at its address, with its hero', () => {
  const pillar = run().pillars.find((p) => p.address === '/services/marketing-engine/')!;
  expect(pillar.file).toBe('src/content/pillars/marketing-engine.md');
  expect(pillar.data).toMatchObject({
    title: 'Marketing Engine',
    hero: {
      title: 'Marketing Engine',
      paragraphs: ['We help organisations strengthen market presence.', 'From strategy to campaigns, Chesamel moves marketing forward.'],
      links: [{ label: 'Let’s Chat', href: '/contact/' }],
    },
  });
});

test('a Pillar page is read into Sections in the live order', () => {
  const { sections } = run().pillars.find((p) => p.address === '/services/marketing-engine/')!.data;
  expect(sections).toEqual([
    { type: 'stats', items: [{ value: '140+', label: '/ digital experts across 17+ countries' }, { value: 'Up to 60%', label: '/ faster delivery' }] },
    { type: 'points', heading: 'How we work', items: ['We help organisations find the right focus.', 'Our approach connects research and strategy.'], note: 'Need clarity fast? Our Marketing Exploratory Assessment uncovers gaps.' },
    {
      type: 'cards',
      heading: 'The capabilities behind Breakthrough Marketing',
      image: { src: '/wp-content/uploads/2024/10/image-213.png', alt: '' },
      tone: 'off-white',
      items: [
        { heading: 'Research & Data', text: 'Turn market data into a clear marketing direction.' },
        { heading: 'Branding', text: 'Create clearer positioning.' },
      ],
    },
    { type: 'logos' },
    {
      type: 'intro',
      heading: 'Start with an Exploratory Assessment',
      paragraphs: ['A focused conversation designed to uncover what is holding marketing back.'],
      image: { src: '/wp-content/uploads/2024/10/pexels.jpg', alt: '' },
      links: [{ label: 'Book an assessment', href: '/contact/' }],
    },
    { type: 'caseStudies', heading: 'Explore our Related Case Studies', text: 'See our latest customer stories.', pillar: 'marketing-engine' },
    {
      type: 'deliveryModels',
      heading: 'Our delivery models',
      text: 'Flexible marketing support built around your goals.',
      items: [
        { heading: 'Fractional Marketing', text: 'Senior marketing expertise without full-time commitment.', image: { src: '/wp-content/uploads/2026/04/fractional.svg', alt: '' } },
        { heading: 'Agency Model', text: 'End-to-end campaign delivery.', image: { src: '/wp-content/uploads/2026/04/agency.svg', alt: '' } },
      ],
    },
    { type: 'brands', heading: 'Elevate your business' },
    { type: 'insights', heading: 'Insights', text: 'Check out our latest thoughts and opinions.', pillar: 'marketing-engine' },
    { type: 'cta', heading: 'Ready to get started?', text: "don't wait to drive your business forward." },
  ]);
});

test('a Service is filed under its Pillar; its links skip the live redirects; placeholder copy is dropped', () => {
  const { services, pillars } = run();
  expect(pillars.map((p) => p.address)).toEqual(['/services/marketing-engine/']);
  const [service] = services;
  expect(service.address).toBe('/services/marketing-engine/customer-experience-engagement/');
  expect(service.file).toBe('src/content/services/marketing-engine/customer-experience-engagement.md');
  expect(service.data).toMatchObject({ title: 'Customer Experience & Engagement', pillar: 'marketing-engine', order: 1 });
  expect(service.data.sections).toEqual([
    {
      type: 'cards',
      heading: 'Related Services',
      image: { src: '/wp-content/uploads/2024/10/image-213.png', alt: '' },
      tone: 'off-white',
      items: [
        { heading: 'Marketing Strategy and Planning', text: 'Get to know your customer in-depth.', href: '/services/marketing-engine/marketing-strategy-planning/' },
        { heading: 'Modern', text: 'A dedicated in-house creative agency.', href: 'https://modernworldwide.co/' },
      ],
    },
    { type: 'points', heading: 'Our process', items: ['Our experts lay out the journey your customer takes.'] },
    { type: 'insights', heading: 'Latest Insights', text: 'Check out our recent thoughts and expert opinions.', pillar: 'marketing-engine' },
    { type: 'cta', heading: 'Want to transform your business?', text: 'the journey starts with just a click.' },
  ]);
});

test('a heading the importer does not know is reported, not guessed', () => {
  const odd = { ...items[0], content: pillarPage.replace('Elevate your business', 'Something new') };
  const result = importServices(wxr([odd]));
  expect(result.unreadable.filter((u) => u.address === '/services/marketing-engine/')).toEqual([{ address: '/services/marketing-engine/', reason: 'unknown section "Something new"' }]);
});

test('the last section is the call to action only when its heading reads like one', () => {
  const odd = { ...items[0], content: pillarPage.replace('Ready to get started?', 'Our awards') };
  const result = importServices(wxr([odd]));
  expect(result.unreadable.filter((u) => u.address === '/services/marketing-engine/')).toEqual([{ address: '/services/marketing-engine/', reason: 'unknown section "Our awards"' }]);
});
