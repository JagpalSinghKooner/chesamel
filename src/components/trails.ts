// Breadcrumb trails. A page builds its trail once and hands it both to the
// Component that shows it and to Seo, whose BreadcrumbList repeats it for
// search engines (#54).

export type Trail = { label: string; href?: string }[];

export const home = { label: 'Home', href: '/' };
export const insights = { label: 'Insights', href: '/insights/' };

// Home / Insights / …, the trail above every listing and Insight.
export const insightsTrail = (...steps: Trail): Trail => [home, insights, ...steps];
