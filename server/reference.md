# CodeShift Backend API Reference

This document outlines the REST APIs, Mongoose models, security parameters, and directory structure of the **CodeShift** platform backend.

---

## Folder Architecture

```
server/
├── config/
│   ├── constant.js         # Supported languages, sizes, and limits
│   └── database.js         # MongoDB connection config
├── controllers/            # Controller layers containing logic
├── middlewares/            # Auth, validation, errors, and files limit guards
├── models/                 # Mongoose schemas for collections
├── routes/                 # Express routers routing endpoints
├── services/               # Centralized AI services and safety validators
└── utils/                  # Unified ApiError, ApiResponse wrappers
```

---

## API Endpoints List

### 1. Authentication (`/api/auth`)
* `POST /signup`: Register a new user profile.
  - Body: `{ name, email, password }`
* `POST /login`: Standard password sign in.
  - Body: `{ email, password }`
* `POST /logout`: Sign out user and remove active session.
* `POST /refresh`: Cookie-based access token refresh.
* `POST /google`: Google account OAuth sign-in.
  - Body: `{ googleToken, email, name, avatar }`

### 2. Projects (`/api/projects`)
* `POST /`: Create project worksheet.
  - Body: `{ name, description, sourceCode, outputCode, sourceLang, targetLang, folderId }`
* `GET /`: List projects. (Optional query: `?search=term` and `?folderId=id`)
* `GET /:projectId`: Retrieve specific project details.
* `PATCH /:projectId`: Update project name, description, code, folder location.
* `DELETE /:projectId`: Soft-delete a project worksheet.

### 3. Folders (`/api/folders`)
* `POST /`: Create a workspace folder.
  - Body: `{ name, parentFolderId }`
* `GET /`: List workspace folders.
* `PATCH /:folderId`: Rename folder name.
  - Body: `{ name }`
* `DELETE /:folderId`: Recursively soft-delete a folder and all nested child items.

### 4. Favorites (`/api/favorites`)
* `POST /`: Star project.
  - Body: `{ projectId }`
* `DELETE /:projectId`: Unstar project.
* `GET /`: List starred projects.

### 5. History (`/api/history`)
* `GET /`: Retrieve audit/history tracking records for active user or IP address.

### 6. Sharing (`/api/sharing`)
* `POST /`: Create public link.
  - Body: `{ projectId }`
* `GET /:shareToken`: View public shared code worksheet (Anonymous).
* `POST /fork`: Duplicate shared project into your workspace.
  - Body: `{ projectId }`

### 7. AI Operations (`/api/ai`)
* `POST /convert`: Convert programming language code.
  - Body: `{ code, sourceLang, targetLang }`
* `POST /optimize`: Performance and standards refactoring.
  - Body: `{ code, language }`
* `POST /debug`: Audit and error inspection report.
  - Body: `{ code, language }`
* `POST /explain`: Line-by-line concept explanation block.
  - Body: `{ code, language }`

---

## Security Filters & Rules
* **Dangerous pattern signature scanning**: Validates input code against system calls, file manipulators, code-injection strings.
* **Jailbreak and Prompt Injection scanning**: Screens instruction inputs.
* **Rate Limits**: IP-based and JWT User ID-based rate limit of 100 requests per hour.
