# Vehicle Watchlist Platform

A full-stack **Next.js + NestJS + Nx** application for searching Israeli vehicle data, managing a personal watchlist, and analyzing saved vehicles — fully Dockerized, CI/CD ready, and compatible with GitHubBox.

---

## Project Structure (Nx Monorepo)

This repository uses **Nx** to manage both the frontend and backend in a single monorepo.

```
.
├── apps/
│   ├── client/        # Next.js frontend
│   └── server/        # NestJS backend
│
├── libs/              # Shared libraries (e.g., Zod schemas)
│
├── docker/
│   ├── client/        # Dockerfile for client
│   └── server/        # Dockerfile for server
│
├── docker-compose.yml # Review environment
├── nx.json
├── package.json
└── README.md
```

### **Docker Compose (Review Environment)**

Reviewer can run the entire project using:

```sh
docker-compose up -d
```

Compose will:

* Pull images from GHCR
* Create an internal MongoDB container
* Run both client + server

---

---

## Local Development (Nx)

Install dependencies:

```sh
bun install
```

Run backend:

```sh
nx serve vehicle-watchlist-api
```

Run frontend:

```sh
nx serve vehicle-watchlist-ui
```

Run both in parallel:

```sh
nx run-many --target=serve --all
```

---

## GitHubBox Compatibility (No Docker Support)

Since CodeSandbox does **not** support Docker, the backend automatically switches to an **in-memory MongoDB** when `MONGO_URI` is missing.

Behavior:

* When `MONGO_URI` exists → use real MongoDB
* When missing → start `mongodb-memory-server`

---

## Environment Variables

Create `.env` and copy from `.env.exemple`

```bash
cp .env.exemple .env
```

## Overview

**Vehicle Watchlist** allows users to:

* Search for vehicles using [Israel’s open data API](https://data.gov.il/he)
* View detailed vehicle information
* Save vehicles to a personal watchlist
* View analytics about their saved vehicles
* Log in using email/password or OAuth
* Use the app responsively across devices

---

## Tech Stack

### **Frontend**

* **[Next.js](https://nextjs.org/)**
* **[React](https://react.dev/)**
* **[Tailwind CSS](https://tailwindcss.com/)**
* **[ShadCN UI](https://ui.shadcn.com/)**
* **Recharts (via ShadCN Charts)**

### **Backend**

* **[NestJS](https://nestjs.com/)**
* **[MongoDB](https://www.mongodb.com/)**
* **[Zod](https://zod.dev/)** (shared validation)
* **MongoDB Aggregation Pipelines**

### **Monorepo**

* **[Nx Workspace](https://nx.dev/)**

### **DevOps**

* **Docker**
* **Docker Compose**
* **GitHub Actions**
* **GitHub Container Registry (GHCR)**
* **Package Manager - bun**

---

## Features

### **1. Authentication**

* Register with name, email, password
* Login with JWT tokens
* OAuth integration (Google/GitHub)
* Zod validation shared between client/server

---

### **2. Vehicle Search (Government API Integration)**

Search by:

* License plate
* Year
* Color
* And more…

Includes:

* Validation of Israeli plate format
* Result table with click-to-open popup

---

### **3. Watchlist**

* Save/unsave vehicles
* Stored in MongoDB
* “My Watchlist” page
* Delete saved items

---

### **4. Analytics (Bonus)**

Visual charts built using Recharts + ShadCN:

* Distribution of saved vehicles by manufacturer
* Powered by MongoDB Aggregation Pipeline

---

### **5. Mobile Responsive (Bonus)**

* Mobile-friendly layout
* Collapsible navigation
* Data table fallback to cards on small screens

---

## DevOps: Docker, CI/CD & Compose

### **Docker**

* Multi-stage builds for client + server
* Dockerfiles located in `docker/client` and `docker/server`

### **GitHub Actions CI/CD**

On push to `main`:

1. Lint + type-check
2. Build Docker images
3. Push to GHCR
4. Tag images with repo name + commit SHA
