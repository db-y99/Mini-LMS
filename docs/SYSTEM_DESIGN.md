# Y99 LMS - SYSTEM DESIGN DOCUMENT
## Enterprise-Grade Loan Management System (Monolith Architecture)

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Architecture Design](#2-architecture-design)
3. [Database Design](#3-database-design)
4. [Core Components](#4-core-components)
5. [API Design](#5-api-design)
6. [Security & Access Control](#6-security--access-control)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Monitoring & Observability](#8-monitoring--observability)

---

## 1. SYSTEM OVERVIEW

### 1.1. System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         Y99 LMS System                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │         │
│  │   (React)    │  │   (Future)   │  │   (React)    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                 │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │   API Gateway   │                           │
│                   │   (Express.js)  │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                 │
│    ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼────┐           │
│    │ Workflow │    │   Business  │    │  Report  │           │
│    │  Engine  │    │   Services  │    │  Engine  │           │
│    └────┬─────┘    └──────┬──────┘    └─────┬───