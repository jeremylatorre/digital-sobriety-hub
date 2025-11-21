# SaaS Transformation Plan: Digital Sobriety Hub

## Objective
Transform the current client-side application into a full SaaS platform featuring:
- **User Accounts**: Secure registration/login with minimal data collection.
- **Persistence**: Cloud storage for multiple assessments.
- **Dashboard**: Centralized view of user's impact and progress.
- **Infrastructure**: Docker Compose environment for easy local dev and deployment.

## Constraints & Values
- **Open Source**: 100% FOSS stack.
- **Maintainability**: Low complexity, easy to upgrade.
- **Scalability**: Capable of growing with the user base.
- **Cost**: No hidden costs, self-hostable.
- **Digital Sobriety**: Efficient resource usage.

---

## Architecture Proposals

I have designed 3 architectures that fit your needs, ranked by alignment with "Digital Sobriety" (resource efficiency) and ease of maintenance.

### Option 1: The "Sobriety" Stack (Recommended)
**Stack**: React (Frontend) + **PocketBase** (Backend)
**Database**: SQLite (Embedded in PocketBase)

PocketBase is an open-source backend in a single Go binary. It includes a real-time database, authentication, and file storage.

*   **Docker Compose**:
    *   `frontend`: Nginx serving the React app (or Node for dev).
    *   `backend`: PocketBase container.
*   **Pros**:
    *   🌱 **Extremely Lightweight**: Uses ~30MB RAM idle. Perfect for digital sobriety.
    *   🚀 **Fast Development**: Auth, DB, and Admin UI are ready out-of-the-box.
    *   📦 **Single Binary**: Deployment is copying one file.
    *   🔒 **Data Ownership**: SQLite file is easy to backup/restore.
*   **Cons**:
    *   **Vertical Scaling**: SQLite is incredibly fast but harder to scale horizontally than Postgres (though sufficient for <100k users).
*   **Why it fits**: It's the most "sober" option. Minimal CPU/RAM usage, zero maintenance overhead.

### Option 2: The "Standard" Stack
**Stack**: React (Frontend) + **Node.js/Express** (Backend) + **PostgreSQL** (Database)

The classic industry standard. Separate API and Database.

*   **Docker Compose**:
    *   `frontend`: React app.
    *   `backend`: Node.js API.
    *   `db`: PostgreSQL.
*   **Pros**:
    *   🏢 **Industry Standard**: Easy to find developers and resources.
    *   📈 **Highly Scalable**: Postgres is the gold standard for scaling.
    *   🔧 **Flexibility**: Full control over API logic.
*   **Cons**:
    *   **Heavier**: Node + Postgres requires more RAM/CPU than PocketBase.
    *   **Boilerplate**: Need to write auth logic, ORM setup (Prisma/Drizzle), migrations manually.
*   **Why it fits**: Best if you plan to hire a team or need complex custom backend logic.

### Option 3: The "Modern Fullstack" Stack
**Stack**: **Next.js** (Fullstack) + **PostgreSQL** (Database)

Migrate the Vite app to Next.js to handle both frontend and backend in one framework.

*   **Docker Compose**:
    *   `app`: Next.js container.
    *   `db`: PostgreSQL.
*   **Pros**:
    *   ⚡ **Performance**: Server-Side Rendering (SSR) for better SEO and initial load.
    *   🦄 **Unified Codebase**: Frontend and Backend share types and logic easily.
*   **Cons**:
    *   **Migration Effort**: Requires moving from Vite to Next.js (significant refactor).
    *   **Complexity**: Next.js caching and server components add cognitive load.
*   **Why it fits**: Best if SEO and initial page load speed are critical priorities.

---

## Detailed Implementation Plan (Based on Option 1)

Assuming we choose **Option 1 (PocketBase)** for its efficiency and speed:

### 1. Docker Environment
Create a `docker-compose.yml` at the root:
```yaml
services:
  backend:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb/pb_data
  
  frontend:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
    depends_on:
      - backend
```

### 2. Authentication (Strictly Necessary Info)
- Enable **Email/Password** auth in PocketBase.
- **Fields**: `email` (required), `password` (required).
- **Optional**: `name` (for dashboard greeting).
- No tracking pixels, no social logins (unless requested) to keep it clean.

### 3. Database Schema
Create two main collections:
1.  **`users`**: (Built-in)
2.  **`assessments`**:
    *   `user`: Relation to `users` (Cascade delete).
    *   `project_name`: Text.
    *   `responses`: JSON (Stores the full assessment state).
    *   `score`: JSON (Stores the calculated score for quick dashboard stats).
    *   `status`: Select (Draft, Completed).

### 4. Dashboard Features
- **Overview**: "You have saved X kg of CO2 equivalent."
- **Project List**: Cards with "Edit", "View Results", "Delete".
- **Progress**: Visual chart of scores over time.

---

## Next Steps
1.  **Select Architecture**: Please confirm if **Option 1 (PocketBase)** works for you, or if you prefer the standard Node/Postgres route.
2.  **Dockerize**: I will set up the `docker-compose.yml`.
3.  **Backend Setup**: I will configure the database schema.
4.  **Frontend Integration**: I will connect the React app to the backend.
