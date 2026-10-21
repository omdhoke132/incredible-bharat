# Local SQL demo setup

This guide creates a local PostgreSQL database that can be inspected in DBeaver while you show the code in VS Code.

> Important: the schema and seed exporter are the first migration stage. The current website still reads the JavaScript state modules through `src/services/cultureService.js`; it is not yet switched to query PostgreSQL at runtime. Do not claim that the live website is SQL-backed until that integration is completed and tested.

## 1. Install PostgreSQL on Linux Mint

Open a terminal:

```bash
sudo apt update
sudo apt install postgresql postgresql-client
sudo systemctl enable --now postgresql
```

This uses the PostgreSQL packages provided by the Ubuntu base used by Linux Mint.

## 2. Create local roles and a database

The migration defines policies and grants for the Supabase roles `anon`, `authenticated`, and `service_role`. A fresh, ordinary PostgreSQL installation does not create those roles automatically, so create local equivalents first.

Run:

```bash
sudo -u postgres psql
```

At the `postgres=#` prompt, run each statement (choose your own local password):

```sql
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE USER bharat_dev WITH PASSWORD 'replace_with_a_local_password';
CREATE DATABASE incredible_bharat OWNER bharat_dev;
\q
```

If one of these roles already exists on your machine, skip its `CREATE ROLE` statement. These are development-only local credentials; do not reuse the password for a hosted service or commit it to the repository.

## 3. Install DBeaver Community

DBeaver is a desktop database client that lets you browse tables and rows and run SQL queries.

Use the official download page and choose the Linux Debian package, or follow its official Debian installation instructions:

- https://dbeaver.io/download/
- https://dbeaver.com/docs/dbeaver/Installation/

## 4. Get this branch in VS Code

For a new local copy:

```bash
git clone --branch feature/supabase-postgres-migration https://github.com/omdhoke132/incredible-bharat.git
cd incredible-bharat
npm ci
```

If you already have a local clone, fetch the branch and switch to it:

```bash
git fetch origin
git switch --track origin/feature/supabase-postgres-migration
```

## 5. Create the tables and import the existing data

From the repository folder, run:

```bash
psql -h localhost -U bharat_dev -d incredible_bharat -W -v ON_ERROR_STOP=1 -f supabase/migrations/20261021090000_initial_cultural_atlas.sql
npm run db:export-seed
psql -h localhost -U bharat_dev -d incredible_bharat -W -v ON_ERROR_STOP=1 -f supabase/seed.generated.sql
```

Enter the local password when prompted. The seed exporter reads the currently active files under `src/data/states/` and produces `supabase/seed.generated.sql`. It preserves the original record payload in `raw_data`, imports state-level reference links, and imports record-level links only when those links are present in the source record.

The exporter marks records `needs_review` unless the source data explicitly supplies a recognised verification status. A state-level reference is not treated as an item-level citation.

If you intentionally re-run this exporter, the inserts update records by their stable record keys. Review your database backups before making destructive changes; this guide does not truncate existing tables.

## 6. Connect DBeaver

Create a new PostgreSQL connection with:

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `incredible_bharat`
- **Username:** `bharat_dev`
- **Password:** the local password set above

In the database navigator, open **Databases → incredible_bharat → Schemas → public → Tables**. You should see `states`, `source_references`, `state_source_links`, `cultural_records`, and `cultural_record_source_links`.

Open a SQL Editor and demonstrate:

```sql
SELECT COUNT(*) AS state_count
FROM public.states;

SELECT category_key, COUNT(*) AS record_count
FROM public.cultural_records
GROUP BY category_key
ORDER BY record_count DESC;

SELECT name, state_id, category_key, verification_status
FROM public.cultural_records
ORDER BY state_id, category_key, name
LIMIT 25;

SELECT s.name AS state, r.title, r.url
FROM public.state_source_links link
JOIN public.states s ON s.id = link.state_id
JOIN public.source_references r ON r.id = link.source_id
ORDER BY s.name, r.title
LIMIT 25;
```

## 7. Presenting it

Open VS Code and DBeaver side by side. In VS Code show the migration file and exporter script. In DBeaver show the live tables and run the sample queries. Keep the website open in a browser for the user-facing experience.

Before describing the website as database-backed, finish and test the follow-up step of changing the backend/frontend data service to read from PostgreSQL instead of the in-memory JavaScript modules.
