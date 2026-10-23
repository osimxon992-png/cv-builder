# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students, recent graduates, beginners and job seekers, mostly in Uzbekistan, writing a CV quickly and for free on a phone or laptop without signing up. Experienced professionals are a secondary audience.

## Product Purpose

CV Builder lets anyone fill in a guided form, pick a template, and download a clean, professional PDF CV. Success is a finished, downloaded PDF the user is proud to send.

## Positioning

- Trilingual by design: the interface language (Uzbek, Russian, English) and the CV's own language are chosen independently, so a Russian-speaking user can write an English CV.
- Free core with premium templates: three free and three premium designs; everything except premium templates is free.

## Operating Context

- Eight-step guided editor (personal details, summary, experience, education, skills, projects, languages, certifications and more) with a live PDF preview.
- Dashboard of saved CVs: duplicate, rename, delete, JSON export/import backup.
- Templates gallery with PDF preview; pricing page with a development-only checkout.

## Capabilities and Constraints

- React + Vite, React Router, LocalStorage only; no backend, no accounts.
- PDFs rendered with @react-pdf/renderer using self-hosted Noto fonts (Latin + Cyrillic).
- No AI anywhere: no AI-generated content, suggestions, or chat.
- Real payment is not implemented; premium unlock is a development checkout.

## Evidence on Hand

- Six real PDF templates (src/pdf/templates.jsx) and a sample CV (src/templates/sampleCv.js).
- No testimonials, user counts, customers or reviews exist; do not invent them.

## Product Principles

- A finished PDF beats a pretty form: every step moves the user toward download.
- Language is never a barrier: every screen works fully in uz, ru and en.
- The user's data stays theirs, in their browser.
- Free must feel complete; premium is a better look, not a paywall on basics.

## Accessibility & Inclusion

Must work well on low-end phones and slow connections; Cyrillic and Uzbek Latin (o‘, g‘) must render correctly everywhere.
