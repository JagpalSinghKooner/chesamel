// Site-wide links and facts used by the header, footer and homepage.
// Taken from the live chesamel.com, minus its known defects: country links
// that go nowhere and the admin "Edit Profile" link.

export interface Link {
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  links: Link[];
}

export const mainNav: NavSection[] = [
  {
    label: 'Who we are',
    links: [
      { label: 'Who We Are', href: '/who-we-are/' },
      { label: 'Our Teams', href: '/who-we-are/our-team/' },
      { label: 'Our Network', href: '/who-we-are/network/' },
    ],
  },
  {
    label: 'What we do',
    links: [
      { label: 'What We Do', href: '/what-we-do/' },
      { label: 'Digital Transformation', href: '/services/digital-transformation/' },
      { label: 'Investments & Impact Transformation', href: '/services/investment-impact-transformation/' },
      { label: 'Hybrid Workforce', href: '/services/hybrid-workforce/' },
      { label: 'Marketing Engine', href: '/services/marketing-engine/' },
    ],
  },
  {
    label: 'Insights',
    links: [
      { label: 'All our Insights', href: '/insights/' },
      { label: 'View Industries', href: '/industries/' },
      { label: 'News', href: '/insights/blog/' },
      { label: 'Webinars', href: '/insights/webinars/' },
      { label: 'Podcast', href: '/insights/podcasts/' },
      { label: 'Our Work', href: '/insights/our-work/' },
    ],
  },
  {
    label: 'Culture & Careers',
    links: [
      { label: 'Our Values', href: '/culture/' },
      { label: 'Careers', href: '/careers/' },
    ],
  },
];

export const contactLink: Link = { label: 'Let’s Talk', href: '/contact/' };

// The only country with its own page. The live site's other country links
// pointed at "#" or at addresses that return 404.
export const qatarLink: Link = { label: 'Qatar', href: '/ar/who-we-are/' };

export const officeCities = ['London', 'Doha', 'Riyadh', 'San Francisco', 'Stockholm', 'Lisbon', 'Sandton'];

export const footerLinks: Link[] = [
  { label: 'Our Network', href: '/who-we-are/network/' },
  { label: 'Our Work', href: '/insights/our-work/' },
  { label: 'Blog', href: '/insights/blog/' },
  { label: 'Contact', href: '/contact/' },
];

export const legalLinks: Link[] = [
  { label: 'Acceptable Use Policy', href: '/acceptable-use-policy/' },
  { label: 'Privacy & Cookies Policy', href: '/wp-content/uploads/2024/12/chesamel-website-private-policy.pdf' },
  { label: 'Terms and Conditions', href: '/wp-content/uploads/2024/12/chesamel-website-terms-conditions.pdf' },
  { label: 'SMEs', href: '/insights/our-work/' },
  { label: 'Employer Branding and Staffing', href: '/who-we-are/our-team/' },
  { label: 'Modern Slavery Act', href: '/modern-slavery-statement/' },
];

export const socialLinks = [
  { label: 'Chesamel on YouTube', href: 'https://www.youtube.com/@ChesamelGroup', icon: '/images/social/youtube.svg' },
  { label: 'Chesamel on Instagram', href: 'https://www.instagram.com/chesamel/', icon: '/images/social/instagram.svg' },
  { label: 'Chesamel on LinkedIn', href: 'https://www.linkedin.com/company/chesamel-communications-llp', icon: '/images/social/linkedin.svg' },
];

export const accreditations = [
  { label: 'APSCo United Kingdom member', href: 'https://www.apscouk.org/', image: '/images/accreditations/apsco.png', width: 128, height: 44 },
  { label: 'Made in Britain member', href: 'https://www.madeinbritain.org/members/chesamel-group-limited', image: '/images/accreditations/made-in-britain.png', width: 154, height: 37 },
  { label: 'BSI ISO certified', href: 'https://www.iso.org/home.html', image: '/images/accreditations/bsi.png', width: 85, height: 52 },
  { label: 'HubSpot certified partner', href: 'https://www.hubspot.com/', image: '/images/accreditations/hubspot.png', width: 114, height: 52 },
];
