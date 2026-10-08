# AI Research Workspace — internal C2 reference

This is an author-only teaching reference assembled from Bootstrap → C1 product definition → C2 decision, architecture, schema, auth, workspace and persistent research task. Students should continue their own C1 project. This reference has no C3–C9 features.

Requires Node >=20.19 and an isolated PostgreSQL database. Set `TEST_DATABASE_URL` to that database and set `DATABASE_URL` to the same value for this test process. Run `npm ci`, `npm run db:migrate`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run start -- -p 3117`. In another terminal run `npm run test:db` to verify the HTTP vertical slice. Never point this reference at the course platform database.
