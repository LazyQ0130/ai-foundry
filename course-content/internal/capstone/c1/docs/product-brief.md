# AI Research Workspace — internal C1 product brief example

## Problem
People collecting private documents and public research lose the link between claims and sources while moving between search, notes and a report.

## Target User
One knowledge worker who reads several documents and produces a short evidence-backed research report.

## Current Workflow
Find files → open many documents → copy excerpts → search externally → write report → reconstruct source links.

## Jobs To Be Done
When I have a research question and my own material, I want to gather relevant evidence and produce a report whose claims I can trace to sources, so that I can review and reuse the result with confidence.

## MVP
Private account and personal workspace; PDF/MD/TXT knowledge; persistent research tasks and runs; internal and external evidence; citation-backed report with source preview; human approval before saving a note; run timeline; eval and deployment.

## Non-goals
Teams/RBAC, OCR, browser agents, arbitrary crawlers, payments, mobile app, complex queue, high-risk autonomous writes, multi-agent orchestration, multi-model routing and marketplace.

## User Flow
Register/login → personal Workspace → add knowledge → create ResearchTask → run research → review evidence and cited report → approve/edit/reject note proposal → inspect Run timeline and saved note. Failed parsing/search must show a recoverable state.

## Success Criteria
A user can resume a task after refresh; every displayed report citation maps to a preserved source snapshot; private data stays inside its workspace; no unapproved note is written; failed operations produce an understandable state.

## Open Questions
Which public research source is most useful to the target user? Which PDF failures need a self-service retry? Resolve during C3/C6 spikes.
