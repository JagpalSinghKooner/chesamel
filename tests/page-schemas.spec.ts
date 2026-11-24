// The Page, Pillar, Service, Team Member and Office schemas stop broken content
// reaching the site: the build fails on any file they reject.
import { test, expect } from '@playwright/test';
import { pageSchema, pillarSchema, serviceSchema, teamMemberSchema, officeSchema } from '../src/content/page-schemas';

const image = { src: '/images/hero.webp', alt: '' };

const page = {
  title: 'Who We Are',
  hero: { title: 'Who We Are', subtitle: 'Daring. Different. Disruptive' },
  sections: [
    { type: 'intro', heading: 'We don’t follow trends, we create them.', paragraphs: ['Chesamel is more than a consultancy.'] },
    { type: 'stats', items: [{ value: '150+', label: '/ People' }] },
    { type: 'cards', heading: 'Our Approach', items: [{ heading: 'Planning', text: 'Gearing up for growth.' }] },
    { type: 'brands', heading: 'Our Group Brands' },
    { type: 'team', members: ['john-cofie'] },
    { type: 'cta', heading: 'Want to transform your business?', text: 'The journey starts with just a click.' },
  ],
};

const problems = (schema: { safeParse: (d: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[] }[] } } }, data: unknown) => {
  const result = schema.safeParse(data);
  return result.success ? [] : result.error!.issues.map((i) => i.path.join('.'));
};

test('a Page made of known sections is accepted', () => {
  expect(problems(pageSchema, page)).toEqual([]);
  expect(problems(pageSchema, { title: 'Acceptable Use Policy', hero: { title: 'Acceptable Use Policy' } })).toEqual([]);
});

test('a Page needs a title and a hero title; an unknown section type is rejected', () => {
  expect(problems(pageSchema, { ...page, title: ' ' })).toEqual(['title']);
  expect(problems(pageSchema, { ...page, hero: {} })).toEqual(['hero.title']);
  expect(problems(pageSchema, { ...page, sections: [{ type: 'carousel', heading: 'Spin' }] })).toEqual(['sections.0.type']);
});

test('section fields are checked: a stats section needs items, card images must exist in the repo', () => {
  expect(problems(pageSchema, { ...page, sections: [{ type: 'stats', items: [] }] })).toEqual(['sections.0.items']);
  const badImage = { type: 'cards', heading: 'Why Us', items: [{ heading: 'Knowledge', text: 'We lead.', image: { src: '/nope.svg', alt: '' } }] };
  expect(problems(pageSchema, { ...page, sections: [badImage] })).toEqual(['sections.0.items.0.image.src']);
});

const pillar = {
  title: 'Marketing Engine',
  colour: '#FF4A7D',
  order: 1,
  hero: { title: 'Marketing Engine', paragraphs: ['We help organisations strengthen market presence.'] },
  sections: [{ type: 'cta', heading: 'Ready to get started?', text: "don't wait to drive your business forward." }],
};

test('a Pillar needs a title, a colour and its place in the order', () => {
  expect(problems(pillarSchema, pillar)).toEqual([]);
  expect(problems(pillarSchema, { ...pillar, colour: 'pink' })).toEqual(['colour']);
  const { order, ...rest } = pillar;
  expect(problems(pillarSchema, rest)).toEqual(['order']);
});

test('a Service belongs to a known Pillar', () => {
  const service = { title: 'Customer Experience & Engagement', pillar: 'marketing-engine', order: 1, hero: { title: 'Customer Experience & Engagement' }, sections: [] };
  expect(problems(serviceSchema, service)).toEqual([]);
  expect(problems(serviceSchema, { ...service, pillar: 'retail' })).toEqual(['pillar']);
});

test('a Team Member needs a name, role and photo; links are optional', () => {
  const member = { name: 'John Cofie', role: 'Founder and CEO', teams: ['founders'], order: 1, photo: image };
  expect(problems(teamMemberSchema, member)).toEqual([]);
  expect(problems(teamMemberSchema, { ...member, linkedin: 'https://www.linkedin.com/in/johncofie/', email: 'johncofie@chesamel.com' })).toEqual([]);
  expect(problems(teamMemberSchema, { ...member, linkedin: 'not a link' })).toEqual(['linkedin']);
  expect(problems(teamMemberSchema, { ...member, name: '', role: '' }).sort()).toEqual(['name', 'role']);
});

test('an Office needs a name, country and address; the phone is optional', () => {
  const office = { name: 'Our London Office', country: 'UK', city: 'London', address: ['Office 403, 29 Lincoln’s Inn Fields', 'Holborn, London, WC2A 3EG, UK'], order: 1 };
  expect(problems(officeSchema, office)).toEqual([]);
  expect(problems(officeSchema, { ...office, phone: '+44 203 371 8331' })).toEqual([]);
  expect(problems(officeSchema, { ...office, address: [] })).toEqual(['address']);
});
