# AI Research Workspace — internal C2 reference

This is an author-only assembly proving Bootstrap → C1 product brief → C2 architecture, schema, auth, workspace and persistent research task. It is not the student starter and has no C3–C9 features.

Requires Node >=20.19 and an isolated PostgreSQL database. Set `DATABASE_URL`, then run `npm ci`, `npm run db:migrate`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run start -- -p 3117`. In another terminal run `npm run test:db` to verify the HTTP vertical slice. Do not point this spike at the course platform database.
