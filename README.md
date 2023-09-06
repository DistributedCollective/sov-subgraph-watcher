# Sovryn Watcher

## Requirements

- [Docker](https://www.docker.com/)
- [Node v18+](https://nodejs.org/) (optional, included in docker image)
- [Yarn](https://yarnpkg.com/) (optional, included in docker image)

## Deployment

```bash
yarn install
yarn build
# deploy migrations or force reset if migration is not possible
yarn prisma migrate deploy || yarn prisma migrate reset --force
yarn start
```

or just build and run Dockerfile.

```bash
docker build . -t sovryn/sovryn-watcher
docker run sovryn/sovryn-watcher
```

Make sure to set required environment variables:

- `DATABASE_URL` - database connection string (ex: postgresql://user:password@host:port/database)
- `SUBGRAPH_URL` - subgraph url to watch (ex: https://subgraph.sovryn.app/subgraphs/name/DistributedCollective/sovryn-subgraph)

```bash
docker run --env DATABASE_URL=postgresql://user:password@host:port/database --env SUBGRAPH_URL=https://subgraph.sovryn.app/subgraphs/name/DistributedCollective/sovryn-subgraph sovryn/sovryn-watcher
```

## Development

```bash
yarn install
yarn docker:dev
```

### Adding new task

1. Create new file in `src/tasks` folder
2. Create a function that satisfies `TaskInterface` interface
3. Make sure task `id` is unique
4. Make sure to export task as `default` function
5. Add task to `src/app.ts` file, into `blockWatcher.registerTasks()` function as array item.

- If task is supposed to make multiple write operations to database, make sure to use transactions so that all operations are either committed or rolled back on task failure.
- Tasks are executed in parallel - do not use shared resources without proper locking mechanism.

## Migrations

`npx prisma db push` - push database changes during development

`npx prisma db pull` - pull changes from database to schema file

`npx prisma db seed` - seed database with data

`npx prisma migrate dev` - create a migration from changes in Prisma schema, apply it to the database, trigger generators.

`npx prisma migrate deploy` - deploy pending migrations (production/staging)

`npx prisma migrate reset` - rollback entire database

`npx prisma migrate status` - check if migrations are up to date
