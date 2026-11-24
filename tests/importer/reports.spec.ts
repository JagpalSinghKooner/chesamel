import { test, expect } from '@playwright/test';
import { importReports } from '../../scripts/import-wordpress/reports';
import { wxr, ids } from './fixture';

// The shape of a live report: intro paragraphs, then the theme's download box
// and the HubSpot form that delivers the PDF.
const content = `<!-- wp:paragraph -->
<p>Dive into our latest white paper, breaking down Agile Marketing.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>We’re here to discuss:</p>
<!-- /wp:paragraph -->

<!-- wp:group {"align":"full","className":"download-report-section"} -->
<div class="wp-block-group alignfull download-report-section"><!-- wp:post-title {"level":4} /-->
<p>/ explore report</p>
<p>Download Full Report</p>
<div class="wp-block-group report-card"><svg xmlns="http://www.w3.org/2000/svg"><path d="M1"/></svg><p>/ read report</p></div>
<!-- wp:html -->
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
<script>
  hbspt.forms.create({
    portalId: "7886724",
    formId: "8b98f465-751c-4bac-a9e2-5fa99ad21572"
  });
</script>
<!-- /wp:html --></div>
<!-- /wp:group -->`;

test('a published report becomes a Report at its original address: its intro is the body, its HubSpot form is kept by ID', () => {
  const { items, media } = importReports(
    wxr([
      { id: 2566, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2024/11/Agile-Marketing.jpg' },
      {
        id: 622,
        type: 'reports',
        title: 'Agile Marketing',
        slug: 'agile-marketing',
        link: 'https://chesamel.com/reports/agile-marketing/',
        date: '2024-11-12 12:27:07',
        content,
        meta: { _thumbnail_id: '2566', service: ids(365), _yoast_wpseo_metadesc: 'Find how agile marketing transforms business success.' },
      },
      { id: 2, type: 'reports', status: 'draft', link: 'https://chesamel.com/reports/unfinished/' },
    ]),
  );
  expect(items).toHaveLength(1);
  const [report] = items;
  expect(report.address).toBe('/reports/agile-marketing/');
  expect(report.file).toBe('src/content/reports/agile-marketing.md');
  expect(report.data).toEqual({
    title: 'Agile Marketing',
    date: '2024-11-12T12:27:07Z',
    image: { src: '/wp-content/uploads/2024/11/Agile-Marketing.jpg', alt: '' },
    pillars: ['marketing-engine'],
    hubspotFormId: '8b98f465-751c-4bac-a9e2-5fa99ad21572',
    description: 'Find how agile marketing transforms business success.',
  });
  expect(report.body).toBe('Dive into our latest white paper, breaking down Agile Marketing.\n\nWe’re here to discuss:\n');
  expect(media).toEqual(['https://chesamel.com/wp-content/uploads/2024/11/Agile-Marketing.jpg']);
});
