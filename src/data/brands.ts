// The Chesamel Group brands, shown as "Our Group Brands" on Who We Are, What
// We Do and Our Network, and as "Elevate your business" on Pillar pages.
// Copy as on the live Our Network page.
export interface Brand {
  name: string;
  summary: string;
  href: string;
  image: string;
  logo: string;
}

export const brands: Brand[] = [
  {
    name: 'Modern',
    summary: 'A dedicated in-house creative studio that playfully challenges tradition.',
    href: 'https://www.moderncreative.studio/',
    image: '/wp-content/uploads/2025/06/Untitled-design-3.png',
    logo: '/wp-content/uploads/2025/06/Modern-brand-black-1-scaled.png',
  },
  {
    name: 'The Sybarite',
    summary: 'A luxury experience, lifestyle and media company, providing high-end experiences and inspiring content.',
    href: 'https://thesybarite.co/',
    image: '/wp-content/uploads/2024/12/Untitled-design-2024-12-11T145910.741.png',
    logo: '/wp-content/uploads/2024/10/the-sybarite.svg',
  },
  {
    name: 'Discover Work',
    summary: 'A values-driven recruitment platform that connects candidates and employers through shared purpose and cultural fit.',
    href: 'https://discoverwork.io/',
    image: '/wp-content/uploads/2025/07/DW.png',
    logo: '/wp-content/uploads/2025/07/Landing-Page-Headers-1.png',
  },
];
