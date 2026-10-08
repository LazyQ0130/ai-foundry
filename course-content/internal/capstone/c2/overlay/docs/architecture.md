# Architecture — C2 reference

## System context

```text
Browser → Next.js UI / Route Handlers / Auth / Research module → PostgreSQL
```

This is one deployable modular monolith. Private object storage, an AI provider, bounded agent runtime and external MCP are future connections, **not implemented in C2**.

## Requirement → engineering need

| C1 product requirement | Engineering need now or later |
| --- | --- |
| Private personal research | Server session and ownership scope (now) |
| A task survives refresh | PostgreSQL persistence (now) |
| One task may have multiple research attempts | Separate Task and future Run lifecycles (Run later) |
| Grounded report from private files | Private storage, retrieval and citation (later) |
| Explicit approval before saving a note | Server approval boundary (later) |

## Current domain

```text
User
 └── one Personal Workspace
      └── many ResearchTasks
           └── future ResearchRuns

Workspace also scopes future KnowledgeDocuments and KnowledgeNotes.
```

User is the account; Workspace is the product ownership scope; ResearchTask is a persistent research question, not a model invocation. V1 has one Workspace per User and no team, membership or RBAC. The unique `Workspace.ownerId` makes at most one Workspace per User a database constraint; registration creates the Workspace in the same transaction as User and Session so every newly registered User has one.

## First vertical slice

```text
Browser form → POST /api/research/tasks → currentSession →
Workspace selected by session.userId → strict title/query input →
Prisma ResearchTask.create → PostgreSQL
```

`GET /api/research/tasks` filters by that same server-derived Workspace ID. A new request after refresh reads persisted data. Browser-supplied `userId`, `workspaceId` and `ownerId` are not accepted as task input.

## Future domain map

C3: KnowledgeDocument and private storage/retrieval. C4: grounded Report and Citation. C5: ResearchRun and bounded runtime. C6: external research/MCP. C7: approved KnowledgeNote. C8/C9: product evaluation and delivery. None of these are implemented here.
