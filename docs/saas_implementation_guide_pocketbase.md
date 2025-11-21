# SaaS Implementation Guide: The "Sobriety" Stack (PocketBase)

This document details the step-by-step process to transform the Digital Sobriety Hub into a SaaS platform using **PocketBase**.

## 1. Infrastructure Setup (Docker)

We will use Docker Compose to orchestrate the frontend and backend.

### 1.1. `Dockerfile` (Frontend)
Create a `Dockerfile` in the project root for the React application.

```dockerfile
# Development Stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

### 1.2. `docker-compose.yml`
Create a `docker-compose.yml` in the project root.

```yaml
services:
  # Backend: PocketBase
  backend:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: digital-sobriety-backend
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb/pb_data
    restart: unless-stopped
    command: --http=0.0.0.0:8090

  # Frontend: React (Vite)
  frontend:
    build: .
    container_name: digital-sobriety-frontend
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./index.html:/app/index.html
      - ./vite.config.ts:/app/vite.config.ts
    environment:
      - VITE_POCKETBASE_URL=http://127.0.0.1:8090
    depends_on:
      - backend
```

---

## 2. Backend Configuration (PocketBase)

PocketBase provides a UI to manage the database schema.

### 2.1. Initial Setup
1.  Run `docker-compose up -d`.
2.  Open `http://127.0.0.1:8090/_/` to access the Admin UI.
3.  Create your admin account (first time setup).

### 2.2. Collection Schema
We need to create one primary collection: `assessments`.

#### Collection: `assessments`
*   **Name**: `assessments`
*   **API Rules** (Security):
    *   **List/View**: `user = @request.auth.id` (Users see only their own)
    *   **Create**: `@request.auth.id != ""` (Only logged-in users)
    *   **Update/Delete**: `user = @request.auth.id`
*   **Fields**:
    1.  `user`: **Relation** (Single) -> `users` collection. (Required, Cascade Delete)
    2.  `project_name`: **Text**. (Required)
    3.  `project_description`: **Text**.
    4.  `responses`: **JSON**. (Stores the array of criteria responses)
    5.  `score`: **JSON**. (Stores the calculated score object)
    6.  `status`: **Select** (Options: `draft`, `completed`).
    7.  `referential_id`: **Text**. (e.g., "rgesn-2024")

---

## 3. Frontend Integration

### 3.1. Install SDK
```bash
npm install pocketbase
```

### 3.2. Client Singleton (`src/lib/pocketbase.ts`)
```typescript
import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
```

### 3.3. Auth Context (`src/contexts/AuthContext.tsx`)
Create a context to manage the user session.
*   **State**: `user` (AuthModel | null), `loading` (boolean).
*   **Methods**: `login(email, password)`, `register(email, password)`, `logout()`.
*   **Logic**: Listen to `pb.authStore.onChange` to update state automatically.

### 3.4. Protected Routes
Create a `ProtectedRoute` component that checks if `user` exists.
*   If yes: Render children.
*   If no: Redirect to `/login`.

---

## 4. Dashboard Implementation

Create a new page `src/pages/Dashboard.tsx`.

### 4.1. Layout
*   **Header**: "Welcome, {user.name}".
*   **Stats Cards**:
    *   "Assessments Completed"
    *   "Average Compliance Score"
*   **Assessments List**:
    *   Table/Grid of user's assessments.
    *   Columns: Project Name, Date, Score, Status, Actions (Edit, Delete).

### 4.2. Data Fetching
Use the SDK to fetch data:
```typescript
const records = await pb.collection('assessments').getFullList({
    sort: '-updated',
});
```

---

## 5. Migration Strategy

1.  **Dev Phase**: Run Docker Compose locally. Develop Auth and Dashboard.
2.  **Data Migration**: Create a script to read `localStorage` and push existing anonymous assessments to the user's account upon first login ("Sync" feature).
3.  **Deployment**: Deploy the `docker-compose.yml` to a VPS (e.g., Hetzner, DigitalOcean) behind a reverse proxy (Caddy/Nginx) with SSL.
