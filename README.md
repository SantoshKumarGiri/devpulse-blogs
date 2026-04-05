# DevPulse — Java Spring Boot + Angular 17 Blog Platform

## PROJECT STRUCTURE
```
devpulse/
├── docker-compose.yml
├── .env.example
├── backend/                    ← Spring Boot (Java 17)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/devpulse/
│       ├── DevPulseApplication.java
│       ├── controller/AuthController.java
│       ├── controller/ArticleController.java
│       ├── model/Article.java
│       ├── repository/ArticleRepository.java
│       ├── service/ArticleService.java
│       ├── security/JwtUtil.java
│       ├── security/JwtAuthFilter.java
│       ├── security/SecurityConfig.java
│       └── dto/ (ArticleDto, AuthDto, CommentDto)
└── frontend/                   ← Angular 17
    ├── Dockerfile + nginx.conf
    ├── angular.json + tsconfig.json
    └── src/app/
        ├── services/ (api, auth, toast)
        ├── guards/auth.guard.ts
        ├── components/ (navbar, toast)
        └── pages/ (home, feed, article, editor, profile)
```

---

## PREREQUISITES
- Java JDK 17+  →  https://adoptium.net
- Maven 3.9+    →  https://maven.apache.org
- Node.js 20+   →  https://nodejs.org
- Angular CLI   →  npm install -g @angular/cli@17
- Docker Desktop→  https://docker.com

---

## RUN LOCALLY WITH DOCKER (one command)

1. Copy env file:
   cp .env.example .env
   Edit .env and set JWT_SECRET and ADMIN_PASSWORD

2. Start everything:
   docker-compose up --build

3. Open browser:
   http://localhost:4200

That's it! MongoDB + Spring Boot + Angular all start together.

---

## RUN WITHOUT DOCKER

### Backend
   cd backend
   export MONGODB_URI=mongodb://localhost:27017/devpulse
   export JWT_SECRET=devpulse_local_secret
   export ADMIN_PASSWORD=devpulse123
   export CORS_ORIGINS=http://localhost:4200
   mvn spring-boot:run

### Frontend
   cd frontend
   npm install
   ng serve

---

## DEPLOY TO PRODUCTION

### 1. MongoDB Atlas (free)
   - Create free M0 cluster at cloud.mongodb.com
   - Copy connection string

### 2. Backend → Railway
   - Push backend/ to GitHub repo
   - Connect repo in Railway
   - Add env vars: MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, CORS_ORIGINS, PORT=8080
   - Railway auto-deploys from Dockerfile
   - Copy your Railway URL (e.g. https://devpulse-backend.up.railway.app)

### 3. Frontend → GitHub Pages
   - Update frontend/src/environments/environment.prod.ts with your Railway URL
   - npm install
   - ng build --configuration production --base-href "https://YOUR_USERNAME.github.io/devpulse-blog/"
   - npx angular-cli-ghpages --dir=dist/devpulse-frontend/browser

---

## API REFERENCE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Get JWT token |
| GET | /api/articles | No | All published articles |
| GET | /api/articles/:id | No | Single article |
| GET | /api/articles/search?q= | No | Search |
| POST | /api/articles | YES | Create article |
| PUT | /api/articles/:id | YES | Update article |
| DELETE | /api/articles/:id | YES | Delete article |
| GET | /api/articles/drafts | YES | Get drafts |
| PATCH | /api/articles/:id/like | YES | Toggle like |
| PATCH | /api/articles/:id/bookmark | YES | Toggle bookmark |
| POST | /api/articles/:id/comments | YES | Add comment |

---

## TECH STACK

Backend  : Java 17, Spring Boot 3.2, Spring Security, JWT, Spring Data MongoDB
Frontend : TypeScript, Angular 17, Angular Router, HttpClient, Standalone Components
Database : MongoDB
DevOps   : Docker, Docker Compose, Railway, GitHub Pages, Nginx
Cost     : $0/month

