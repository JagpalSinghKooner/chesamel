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
The Designer's written spec for a change (which Components, which brand tokens, what layout, plus a rough mockup), posted in the ticket notes for the Developer to build from.
_Avoid_: Mockup, design spec, handoff

**Direct Edit**:
A change a Requester makes themselves by logging into the site editor, with no Site Agent involved.
_Avoid_: Manual change, self-serve

**Preview**:
A private, temporary copy of the site showing a proposed change before it goes live.
_Avoid_: Staging, draft site

**Approval**:
The Requester confirming that a Preview is correct, which is what lets the change go live.
_Avoid_: Sign-off, merge

## Team

**Role**:
A Site Agent's job: what it does, what it must never touch, and how it knows it is done. Only the Project Manager can create or change a Role.
_Avoid_: Persona, agent type

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
The Role that checks another Site Agent's work against the Design Brief, brand and ADRs before the Requester sees the Preview.
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
The single, authoritative definition of Chesamel's visual language: brand colours, typography, spacing, and every Component.
_Avoid_: Style guide, theme, UI kit

**Component**:
A reusable, named building block of a page, such as a Pillar card, a hero, or a Case Study slider, defined in the Design System.
_Avoid_: Block, widget, module, section

## Content

**Pillar**:
One of Chesamel's four service areas: Marketing Engine, Digital Transformation, Hybrid Workforce, Investment & Impact Transformation.
_Avoid_: Service line, division

**Insight**:
Any published thought-leadership item: Blog Post, webinar, podcast, or Case Study.
_Avoid_: Article, resource

**Blog Post**:
A dated written Insight. All Blog Posts live in the News section and are filtered by Pillar and Industry.
_Avoid_: Article, post, news item

**News**:
The site section that lists every Blog Post. It is a section name, not a kind of content.
_Avoid_: Blog (as a section name)

**Case Study**:
An Insight that describes completed client work. The current site lists these under "Our Work".
_Avoid_: Project, portfolio item
