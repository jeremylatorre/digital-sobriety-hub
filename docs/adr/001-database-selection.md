# ADR 001: Database Strategy Selection

## Status
Proposed

## Context
The project initially selected **PocketBase** as a lightweight, all-in-one backend solution (Auth + DB + API) to facilitate rapid development of the Digital Sobriety Hub. 

However, we have encountered persistent friction with the local Docker development environment on Windows:
- **Persistence Issues**: `pb_data` volume mounting has been unreliable, leading to data loss between restarts.
- **Authentication Errors**: Programmatic initialization scripts frequently fail with 400/404 errors due to "missing collection context" or invalid credentials, even after fresh setups.
- **Developer Experience**: The "magic" of PocketBase is currently working against us, requiring significant time to debug infrastructure rather than building features.

The user has requested to challenge this choice and evaluate more stabilized, "ready-to-use" alternatives.

## Decision Drivers
1.  **Stability**: The solution must be robust and reliable for local development and eventual production.
2.  **Ease of Integration**: Must integrate easily with the existing React (Vite) frontend.
3.  **Features**: Needs to provide Authentication and a Database (Relational or Document) out of the box.
4.  **Maintenance**: Should require minimal ongoing DevOps overhead.
5.  **Portability**: Docker support is preferred for consistent environments.

## Options Considered

### 1. Supabase (PostgreSQL + Auth + Auto-API)
*   **Description**: An open-source Firebase alternative built on top of PostgreSQL.
*   **Pros**:
    *   **Rock-solid Database**: Uses standard PostgreSQL under the hood.
    *   **Excellent SDK**: `supabase-js` is mature and very similar to what we have.
    *   **Great Local Dev**: `supabase start` CLI provides a full local environment (though heavy).
    *   **Relational**: Better for structured data like our Assessments/Referentials than NoSQL.
    *   **Cost & Scaling**:
        *   **Free Tier**: Generous for dev/MVP (500MB DB, 50k MAU, 5GB bandwidth).
        *   **Pro Tier ($25/mo)**: 8GB DB, 100GB storage, 100k MAU. Good for growth.
        *   **Scale**: Pay-as-you-go for additional storage ($0.125/GB) and transfer.
        *   **Escape Hatch**: Since it's open source, we can **self-host** via Docker on our own VPS (e.g., Hetzner/AWS) if Cloud costs get too high, paying only for raw infrastructure ($5-10/mo).
*   **Cons**:
    *   **Heavier**: Running the full Supabase stack locally via Docker requires multiple containers (Studio, Kong, Auth, Rest, Realtime, Storage, Meta, DB).
    *   **Migration**: We would need to rewrite our schema to SQL (or use their UI).

### 2. Firebase (Google Cloud)
*   **Description**: The standard for Backend-as-a-Service.
*   **Pros**:
    *   **Extremely Stable**: Managed by Google, zero maintenance.
    *   **Speed**: Fastest to "just work".
    *   **Auth**: Best-in-class authentication handling.
*   **Cons**:
    *   **Vendor Lock-in**: Hard to migrate away from Firestore/Realtime DB.
    *   **NoSQL Only**: Firestore queries can be limiting for complex relational data (e.g., complex reporting on assessments).
    *   **Local Dev**: The Firebase Emulator Suite is good but requires Java and specific setup.

### 3. Custom Node.js Backend + PostgreSQL (with Prisma/Drizzle)
*   **Description**: A traditional 3-tier architecture. We build a small Express/Fastify server.
*   **Pros**:
    *   **Total Control**: No "black box" behavior. We own the auth logic and API routes.
    *   **Standard**: Every developer knows this stack.
    *   **Stable**: Postgres in Docker is bulletproof.
*   **Cons**:
    *   **More Work**: We have to build the API endpoints, handle JWTs, and write the glue code ourselves.
    *   **Slower Velocity**: Takes longer to get to "feature complete" than a BaaS.

### 4. PocketBase (Current)
*   **Pros**: Single binary, very fast *when it works*.
*   **Cons**: Current Docker/Windows volume issues are blocking progress.

## Recommendation

**Option 1: Supabase** is the strongest contender if we want to keep the "BaaS" speed but gain stability. It gives us a real Postgres database (solving the data integrity/schema worries) but handles the API/Auth layer for us.

**Option 3: Custom Node+Postgres** is the "safest" bet if we want to eliminate all "magic". It will take 1-2 days to scaffold the backend, but we will never have a "missing collection context" error again because we will write the code that handles it.

## Proposed Plan (if switching)
1.  **Spin up a standard Postgres container** in Docker Compose (replacing PocketBase).
2.  **Scaffold a small backend** (e.g., Hono or Fastify) or use **Supabase** (Cloud or Local).
3.  **Migrate Schema**: Define our `Assessment` and `User` tables in SQL/Prisma.
4.  **Update Frontend**: Swap the `pocketbase` SDK for the new client.

## Rating Matrix

| Feature | PocketBase | Supabase | Firebase | Custom Node+PG |
| :--- | :--- | :--- | :--- | :--- |
| **Stability** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Setup Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Data Integrity** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Local Dev** | ⭐⭐⭐ (Win issues) | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Relational Power**| ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
