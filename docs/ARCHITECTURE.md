# Architecture

## Overview

This project follows a **Feature-Based Architecture** designed to maximize scalability, maintainability, and separation of concerns.

The application is organized around business domains rather than technical layers. Each feature owns its UI, business logic, and data access while relying on shared infrastructure provided by the application.

The architecture is intentionally independent of any specific persistence technology. Features must not know whether data comes from SQL databases, APIs, local files, cache layers, or any future implementation.

---

# Project Structure

```txt
src/
├── app/
├── navigation/
├── infrastructure/
├── features/
├── common/
└── core/
```

---

# Folder Responsibilities

## app/

Application bootstrap and configuration.

Responsibilities:

* Application entry point
* Global providers
* Environment configuration
* Dependency initialization
* Application startup

Example:

```txt
app/
├── App.tsx
├── providers/
└── config/
```

---

## navigation/

Application routing.

Responsibilities:

* Root navigator
* Stack navigators
* Tab navigators
* Route definitions
* Deep linking configuration

Navigation should only be responsible for moving users through the application.

Business logic does not belong here.

---

## infrastructure/

Technical implementations used by the application.

Responsibilities:

* Persistence implementations
* Database configuration
* Migrations
* Storage adapters
* Network clients
* Synchronization mechanisms

Example:

```txt
infrastructure/
├── persistence/
├── network/
├── storage/
└── sync/
```

This layer contains implementation details that may change over time without affecting feature code.

---

## features/

Business domains.

Each feature contains everything required to implement a specific area of the application.

Example:

```txt
features/
└── feature-name/
    ├── screens/
    ├── components/
    ├── hooks/
    ├── repository/
    ├── types/
    └── index.ts
```

A developer should be able to understand a feature without navigating the rest of the codebase.

---

## common/

Reusable code shared across multiple features.

Examples:

* Shared UI components
* Generic hooks
* Utility functions
* Constants
* Shared types

Example:

```txt
common/
├── components/
├── hooks/
├── utils/
├── constants/
└── types/
```

### Rules

Allowed:

```txt
Feature → Common
```

Forbidden:

```txt
Common → Feature
```

Code inside `common` must remain business-agnostic.

---

## core/

Cross-cutting technical concerns.

Examples:

* Error handling
* Logging
* Analytics
* Monitoring
* Shared abstractions

Example:

```txt
core/
├── errors/
├── logger/
├── analytics/
└── monitoring/
```

Business rules do not belong in this layer.

---

# Data Flow

The application follows a single direction of responsibility:

```txt
UI
 ↓
Hooks
 ↓
Repository
 ↓
Data Source
```

Data sources may be implemented using:

* SQL databases
* Local storage
* REST APIs
* GraphQL
* Cache layers
* Filesystem
* Future persistence technologies

Features should never depend on a specific implementation.

---

# Layer Responsibilities

## UI

Location:

```txt
features/*/screens
features/*/components
```

Responsibilities:

* Rendering
* User interactions
* Navigation events
* Displaying application state

UI should not contain data access logic.

---

## Hooks

Location:

```txt
features/*/hooks
```

Responsibilities:

* State management
* Business flow orchestration
* Interaction with repositories
* Exposing data to the UI

Hooks should remain focused and composable.

Examples:

```txt
useFeature()
useFeatureDetails()
useCreateFeature()
```

---

## Repositories

Location:

```txt
features/*/repository
```

Responsibilities:

* Data access abstraction
* Persistence orchestration
* Data mapping
* Hiding infrastructure details

Repositories define how data is retrieved and stored without exposing implementation details to the rest of the feature.

Repositories are the only layer allowed to interact with data sources.

---

## Data Sources

Location:

```txt
infrastructure/
```

Responsibilities:

* Persistence implementation
* Query execution
* Storage operations
* External system communication

Features must never directly access data sources.

---

# Dependency Rules

## Allowed

```txt
Screen → Hook
Hook → Repository
Repository → Data Source

Feature → Common
Feature → Core
Repository → Infrastructure
```

## Forbidden

```txt
Screen → Repository
Screen → Data Source

Hook → Data Source

Common → Feature
Core → Feature

Feature A → Feature B
```

Dependencies should always point downward.

---

# Feature Structure

Each feature should follow a consistent structure.

```txt
features/
└── feature-name/
    ├── screens/
    ├── components/
    ├── hooks/
    ├── repository/
    ├── types/
    └── index.ts
```

## screens/

Screen-level components.

Responsibilities:

* Compose UI
* Connect navigation
* Consume hooks

---

## components/

Feature-specific UI components.

Responsibilities:

* Present feature-related UI
* Remain reusable within the feature

---

## hooks/

Feature orchestration.

Responsibilities:

* State management
* Repository coordination
* Business workflows

---

## repository/

Feature data access layer.

Responsibilities:

* Retrieve data
* Persist data
* Abstract infrastructure details

---

## types/

Feature-specific contracts.

Responsibilities:

* Domain models
* DTOs
* Interfaces
* Request and response types

---

# Feature Communication

Direct dependencies between features should be avoided.

Instead, communication should happen through shared contracts.

Example:

```txt
Feature A
     ↓
 Shared Contract
     ↓
Feature B
```

Shared contracts belong in:

```txt
common/types
```

or

```txt
core/
```

depending on the context.

---

# State Management

State should live as close as possible to where it is used.

Priority order:

1. Component state
2. Feature hook state
3. Global application state

Global state should only exist when multiple features need access to the same information.

---

# Persistence Independence

Features must never depend on a specific persistence technology.

Business logic should not know whether data comes from:

* SQL databases
* REST APIs
* GraphQL
* Local files
* Cache layers
* Future persistence mechanisms

Persistence technologies may change without requiring modifications to feature code.

Repositories are responsible for protecting features from infrastructure changes.

---

# Error Handling

Errors should be handled at the lowest meaningful level.

```txt
Data Source
     ↓
Repository
     ↓
Hook
     ↓
UI
```

Responsibilities:

* Data Source → technical errors
* Repository → error translation
* Hook → business decisions
* UI → user feedback

---

# Architectural Principles

* Features are the primary unit of organization.
* Business domains remain isolated.
* Dependencies always point downward.
* Shared code belongs in `common`.
* Technical infrastructure belongs in `core` and `infrastructure`.
* Repositories are the boundary between business logic and persistence.
* Features must remain persistence-agnostic.
* Prefer composition over inheritance.
* Prefer explicit dependencies over implicit coupling.
* Optimize for maintainability over convenience.

---

# Guiding Principle

> Code should be organized by responsibility and business domain, not by implementation details.

A feature should remain unchanged if the underlying persistence technology changes.
