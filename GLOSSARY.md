# Chesamel Website

The public website of Chesamel Group, a business transformation consultancy. Chesamel owns the site outright. It is maintained by AI agents that act on requests from non-technical staff.

## People

**Requester**:
A non-technical Chesamel staff member who asks for a change to the site, such as a designer or someone on the content team.
_Avoid_: User, client, editor

**Content Editor**:
A Requester allowed to make Direct Edits to content only (text, images, Insights), never to design or layout.
_Avoid_: Author, writer

**Project Manager**:
The in-house person who runs the Site Agent team: hires Roles, approves Lessons, and has full control of the site, including design, layout and settings.
_Avoid_: Developer (that is a Role), admin, webmaster

**Agency**:
The outside website/SEO agency whose proprietary theme the current site depends on.
_Avoid_: Vendor, developer

## Work

**Change Request**:
A single ask from a Requester to change the site, for example "publish this document as a Blog Post" or "change the hero colour". It always carries the Requester's name and their original words.
_Avoid_: Ticket, task, job

**Site Agent**:
An AI agent that carries out Change Requests on the site. Every Site Agent holds exactly one Role and is treated like an employee.
_Avoid_: Bot, AI, assistant

**Design Brief**:
The Designer's written spec for a change (which Components, which Theme roles, what layout, plus a rough mockup), posted in the ticket notes for the Developer to build from.
_Avoid_: Mockup, design spec, handoff

**Direct Edit**:
A change a Requester makes themselves by logging into the site editor, with no Site Agent involved.
_Avoid_: Manual change, self-serve

**Preview**:
A private, temporary copy of the site showing a proposed change before it goes live.
_Avoid_: Staging, draft site

**Approval**:
The Requester explicitly confirming that a Preview is correct, which is what lets the change go live. A reaction or a casual "looks good" is not Approval.
_Avoid_: Sign-off, merge

## Team

**Role**:
A Site Agent's job: what it does, what it must never touch, and how it knows it is done. Only the Project Manager can create or change a Role.
_Avoid_: Persona, agent type

**Coordinator**:
The Role that takes in Change Requests, asks Requesters clarifying questions, splits each request into tickets for the other Roles, tracks them, confirms the finished whole matches the Requester's original words, and collects their Approval.
_Avoid_: Manager, dispatcher, triager

**Content Writer**:
The Role that turns a Requester's material into Insights and page copy.

**Designer**:
The Role that decides how a change should look and writes the Design Brief. It does not write site code.

**Developer**:
The Role that builds a change into the site from the ticket and its Design Brief.
_Avoid_: Builder, engineer

**SEO Specialist**:
The Role that owns URLs, redirects and search metadata.

**Reviewer**:
The Role that checks the quality of each ticket's work against the Design Brief, brand and ADRs. Whether the whole Change Request matches what was asked is the Coordinator's check, not the Reviewer's.
_Avoid_: QA, tester

## Brain

**Company Knowledge**:
What every Site Agent knows regardless of Role: this glossary, the ADRs and the brand guidelines.

**Diary**:
A Site Agent's own record of what happened on each piece of work and the Feedback it received. Written freely, never treated as truth on its own.
_Avoid_: Log, memory

**Feedback**:
Any signal that a Site Agent's work fell short: a rejected Preview, a Reviewer sending work back, a Project Manager comment, or a Direct Edit made soon after the agent's change.
_Avoid_: Error, complaint

**Consolidation**:
The periodic step that reads Diaries, merges repeats, drops contradictions, and proposes Lessons.
_Avoid_: Training, reflection

**Lesson**:
A piece of experience that has passed Consolidation and been approved by the Project Manager. Lessons, unlike Diary entries, are what a Site Agent acts on.
_Avoid_: Memory, rule, learning

## Design

**Design System**:
The single, authoritative definition of Chesamel's visual language: colours and fonts (as Theme roles), typography, spacing, and every Component.
_Avoid_: Style guide, theme, UI kit

**Component**:
A reusable, named building block of a page, such as a Pillar card, a hero, or a Case Study slider, defined in the Design System.
_Avoid_: Block, widget, module, section

**Theme role**:
A named purpose a colour or font serves on the site, such as the call to action, headings or the footer, set once in `src/styles/theme.css` and used by every Component instead of a colour (ADR-0006).
_Avoid_: Token, colour (for the role itself), Role (that is a Site Agent's job)

**Palette**:
One complete set of values for the Theme roles: `live` (copied from chesamel.com) or `brand` (from the brand guidelines). One line in `src/data/theme.ts` picks which the whole site uses.
_Avoid_: Theme, colour scheme

**Section**:
One entry in the ordered list a Page, Pillar or Service is built from, such as stats, cards or a call to action. Each kind of Section is drawn by one Component, so a Content Editor can add, remove or reorder Sections without touching the design.
_Avoid_: Block, module, row

## Content

**Pillar**:
One of Chesamel's four service areas: Marketing Engine, Digital Transformation, Hybrid Workforce, Investment & Impact Transformation.
_Avoid_: Service line, division
_Note_: A Blog Post's Pillar labels may also name two further service areas from the current site, AI & Machine Learning and BI & Data Analytics. They are filed with the Pillars: the News Pillar filter lists all six, and both have a page under /services/ built like a Pillar's, as the current site does. Elsewhere, Pillar means only the four.

**Service**:
One of a Pillar's offerings, with its own page under the Pillar's address, such as Customer Experience & Engagement under Marketing Engine.
_Avoid_: Sub-service, capability, product

**Page**:
A standalone page of the site that is not an Insight, a Pillar or a Service, such as Who We Are, Culture, Contact or one open role under Careers.
_Avoid_: Landing page, static page

**Team Member**:
A Chesamel person shown on Our Team, with their role, teams and photo. Team Members have no page of their own.
_Avoid_: Staff, employee, profile

**Office**:
One of Chesamel's office locations, with its address and, where it has one, its phone number. The Office list shows them all.
_Avoid_: Location, branch, hub

**Insight**:
Any published thought-leadership item: Blog Post, Webinar, Podcast, Report, or Case Study.
_Avoid_: Article, resource

**Blog Post**:
A dated written Insight. All Blog Posts live in the News section and are filtered by Pillar and Industry.
_Avoid_: Article, post, news item

**Podcast**:
An Insight that is one episode of Chesamel Unplugged, Chesamel's podcast series, with its guest and links to listen on each platform. The audio lives on those platforms, not on the site.
_Avoid_: Episode (on its own), show

**Webinar**:
An Insight that is a recorded panel, interview or talk, shown as a video.
_Avoid_: Video, event

**Report**:
An Insight that is a downloadable white paper. Its page introduces it; the full report is sent to readers who ask for it.
_Avoid_: White paper, download, gated content

**News**:
The site section that lists every Blog Post. It is a section name, not a kind of content.
_Avoid_: Blog (as a section name)

**Case Study**:
An Insight that describes completed client work. The current site lists these under "Our Work".
_Avoid_: Project, portfolio item
