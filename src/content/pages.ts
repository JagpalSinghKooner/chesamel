// Reading Pages, Pillars, Services, Team Members and Offices for pages, in the
// order the live site shows them, with each one's address.

import { getCollection, type CollectionEntry } from 'astro:content';

export type Page = CollectionEntry<'pages'>;
export type Pillar = CollectionEntry<'pillars'>;
export type Service = CollectionEntry<'services'>;
export type TeamMember = CollectionEntry<'team'>;
export type Office = CollectionEntry<'offices'>;

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order;

// A Page's file path is its address; a Service's id is "<pillar>/<service>".
export const pageAddress = (page: Page) => `/${page.id}/`;
export const pillarAddress = (pillar: Pillar) => `/services/${pillar.id}/`;
export const serviceAddress = (service: Service) => `/services/${service.id}/`;

export const getPages = () => getCollection('pages');
export const getPillars = async () => (await getCollection('pillars')).sort(byOrder);
export const getServices = async () => (await getCollection('services')).sort(byOrder);
export const getTeamMembers = async () => (await getCollection('team')).sort(byOrder);
export const getOffices = async () => (await getCollection('offices')).sort(byOrder);

// The open roles: every Page under /careers/.
export const getRoles = async () => (await getPages()).filter((p) => p.id.startsWith('careers/')).sort((a, b) => a.data.title.localeCompare(b.data.title));
