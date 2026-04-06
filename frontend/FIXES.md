# DevPulse Bug Fixes — What to Replace Where

## Bugs Fixed

### Bug 1 — ## replacing emoji and special characters
**Root cause:** The old `renderMarkdown()` in `article.component.ts` used
`.replace(/[#*`>]/g,'')` inside the `excerpt()` helper which stripped all `#` characters,
AND the HTML-escaping step double-encoded things like `&` → `&&amp;`.
The heading regex also incorrectly matched `#` appearing mid-sentence.

**Fix:** Complete rewrite of `renderMarkdown()` using a placeholder system:
- Code blocks are extracted first (before any other processing) so backticks inside code are never touched
- HTML escaping only happens on plain text nodes, not already-processed HTML
- Heading regex is `^## (.+)$` with `m` flag — only matches `##` at the START of a line
- Emoji, unicode, and special characters pass through the `escapeHtml()` method untouched
  because `escapeHtml()` only replaces `& < > "` — nothing else

### Bug 2 — No photo upload on articles
**Root cause:** The editor only had an emoji picker. No file input, no upload endpoint.

**Fix:**
- Editor now has a hidden `<input type="file" accept="image/*">` triggered by "📁 Upload" button
- `onImageFileSelected()` shows instant local preview via FileReader, then calls backend
- Backend has a new `POST /api/images/upload` endpoint (ImageController.java)
- Default strategy: base64 data URL (works immediately, no accounts needed)
- Optional upgrade: set CLOUDINARY_URL env var for Cloudinary (free 25GB storage)
- Article model now has `coverImageUrl` field
- Article view shows `<img>` when coverImageUrl is set, falls back to emoji otherwise

### Bonus fix — Tab key in editor
- Tab now inserts 2 spaces instead of jumping out of the textarea

---

## Files to Replace

### BACKEND — drop these into your existing backend folder:

| This fix file                                          | Replace in your project                                                          |
|--------------------------------------------------------|----------------------------------------------------------------------------------|
| `backend/src/.../model/Article.java`                   | `backend/src/main/java/com/devpulse/model/Article.java`                          |
| `backend/src/.../controller/ImageController.java`      | NEW FILE → `backend/src/main/java/com/devpulse/controller/ImageController.java`  |
| `backend/src/.../security/SecurityConfig.java`         | `backend/src/main/java/com/devpulse/security/SecurityConfig.java`                |
| `backend/src/main/resources/application.properties`   | `backend/src/main/resources/application.properties`                              |

### FRONTEND — drop these into your existing frontend/src/app folder:

| This fix file                                          | Replace in your project                                                          |
|--------------------------------------------------------|----------------------------------------------------------------------------------|
| `frontend/src/app/pages/article/article.component.ts`  | `frontend/src/app/pages/article/article.component.ts`                            |
| `frontend/src/app/pages/editor/editor.component.ts`    | `frontend/src/app/pages/editor/editor.component.ts`                              |
| `frontend/src/app/services/api.service.ts`             | `frontend/src/app/services/api.service.ts`                                       |

---

## After replacing — rebuild

### Local (Docker Compose)
```bash
docker-compose down
docker-compose up --build
```

### Local (without Docker)
```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend
cd frontend
ng serve
```

---

## Image Upload — Two Options

### Option A (Default — works right now, zero setup)
Base64 encoding. Images are stored directly in MongoDB as data URLs.
- Pros: works immediately
- Cons: large articles if you have big images; fine for a blog

### Option B (Recommended for production — free)
Cloudinary free tier: 25GB storage, fast CDN delivery.

1. Sign up at https://cloudinary.com (free)
2. Go to Dashboard → copy your "API Environment variable"
   It looks like: `cloudinary://123456789012345:abc...xyz@yourcloudname`
3. Add to your `.env` file:
   ```
   CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
   ```
4. Add to `backend/pom.xml` inside `<dependencies>`:
   ```xml
   <dependency>
     <groupId>com.cloudinary</groupId>
     <artifactId>cloudinary-http44</artifactId>
     <version>1.38.0</version>
   </dependency>
   ```
5. In `ImageController.java`, uncomment the Cloudinary code block (marked with comments)
6. Rebuild and redeploy

---

## Testing the fixes

1. Open your blog
2. Click Write
3. Try pasting: `Hello 🚀 this has **bold** and *italic* and emoji 🐳☸️🔥`
4. Click Publish
5. Check the article — emoji and formatting should render correctly
6. Go back to editor, click "📁 Upload" to test image upload
