import { test, expect } from '@playwright/test';
import { importTeamMembers, importCareers } from '../../scripts/import-wordpress/people-and-roles';
import { wxr, type FixtureItem } from './fixture';

const john = {
  id: 2433,
  type: 'team_members',
  title: 'John Cofie',
  slug: 'john-cofie',
  link: 'https://chesamel.com/team-members/john-cofie/',
  menuOrder: 1,
  content: '<!-- wp:paragraph -->\n<p>John founded Chesamel in <strong>2008</strong>.</p>\n<!-- /wp:paragraph -->\n<p></p>',
  categories: [{ domain: 'teams', slug: 'founders', name: 'Founders' }],
  meta: {
    _thumbnail_id: '5030',
    team_member_role: ' Founder and CEO',
    team_member_linkedin: 'https://www.linkedin.com/in/johncofie/',
    team_member_email: 'johncofie@chesamel.com',
  },
};

const items: FixtureItem[] = [
  john,
  { id: 5030, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2024/11/John-Cofie.png' },
  // No photo, LinkedIn or email; filed under two teams.
  {
    id: 5120,
    type: 'team_members',
    title: 'Dan Fox',
    slug: 'dan-fox',
    link: 'https://chesamel.com/team-members/dan-fox/',
    menuOrder: 7,
    content: '',
    categories: [
      { domain: 'teams', slug: 'growth', name: 'Growth' },
      { domain: 'teams', slug: 'gcc', name: 'GCC' },
    ],
    meta: { team_member_role: 'Growth Director', team_member_linkedin: '', team_member_email: '' },
  },
  { id: 6000, type: 'team_members', status: 'draft', title: 'Not Yet', meta: { team_member_role: 'Draft' } },
  {
    id: 6092,
    type: 'careers',
    title: 'Account Director',
    slug: 'account-director',
    link: 'https://chesamel.com/careers/account-director/',
    content: '<p>We are looking for an Account Director.</p>\n<h2 class="wp-block-heading">About Chesamel</h2>\n<ul><li>Build trusted relationships.</li></ul>',
    meta: {
      career_office_based: 'Hybrid',
      career_employment_type: 'Full-Time',
      career_location: 'London, UK',
      career_link: 'https://www.linkedin.com/jobs/view/4475431909/',
      _yoast_wpseo_metadesc: 'Join Chesamel as an Account Director.',
    },
  },
];

test('a Team Member becomes a file with role, teams, order, photo and links; the bio is the body', () => {
  const { members } = importTeamMembers(wxr(items));
  const member = members.find((m) => m.file === 'src/content/team/john-cofie.md')!;
  expect(member.data).toEqual({
    name: 'John Cofie',
    role: 'Founder and CEO',
    teams: ['founders'],
    order: 1,
    photo: { src: '/wp-content/uploads/2024/11/John-Cofie.png', alt: 'John Cofie' },
    linkedin: 'https://www.linkedin.com/in/johncofie/',
    email: 'johncofie@chesamel.com',
  });
  expect(member.body).toBe('John founded Chesamel in **2008**.\n');
});

test('only published Team Members are imported; one without a photo is reported, not imported', () => {
  const { members, withoutPhoto } = importTeamMembers(wxr(items));
  expect(members.map((m) => m.data.name)).toEqual(['John Cofie']);
  expect(withoutPhoto).toEqual(['Dan Fox']);
});

test('a careers item becomes a Page at its address, with its facts and the apply link in the hero', () => {
  const [role] = importCareers(wxr(items));
  expect(role.address).toBe('/careers/account-director/');
  expect(role.file).toBe('src/content/pages/careers/account-director.md');
  expect(role.data).toEqual({
    title: 'Account Director',
    description: 'Join Chesamel as an Account Director.',
    hero: {
      title: 'Account Director',
      details: ['Hybrid', 'Full-Time', 'London, UK'],
      links: [{ label: 'Apply for this role', href: 'https://www.linkedin.com/jobs/view/4475431909/' }],
    },
  });
  expect(role.body).toBe('We are looking for an Account Director.\n\n## About Chesamel\n\n- Build trusted relationships.\n');
});

test('a LinkedIn address without https:// gets it', () => {
  const kate = { ...john, meta: { ...john.meta, team_member_linkedin: 'linkedin.com/in/kate-kolchina-22356b74' } };
  const { members } = importTeamMembers(wxr([kate, items[1]]));
  expect(members[0].data.linkedin).toBe('https://linkedin.com/in/kate-kolchina-22356b74');
});
