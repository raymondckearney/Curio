## Product Manual

The product manual lives at `pages/manual.js` and is served at `/manual` on the site (noindex, no links from anywhere). **After every code change, update this file to reflect the new or modified functionality.** Keep it accurate as the single source of truth for how the platform works.

## MindPrint™ Framework

All AI generation for this project is governed by `/lib/mindprint-source-of-truth.md`.
Before building or modifying any AI-powered tool, read this file. It defines the
language rules, profile truth tables, prohibited framings, and consistency checks
that must be honored in every generation call.

The career guidance tool system prompt lives at `/career_guidance_system_prompt.md`.
The AI & Delegation Guide's task classifier (premium) system prompt lives at
`/ai_delegation_task_classifier_system_prompt.md`.
