# AEİK Web API (Node.js + Express + MongoDB)

`server/` qovluğu Next.js tətbiqindən ayrı işləyən backend-dir. Vercel-də hər ikisi **tək deployment** kimi yayımlanır: Next.js səhifələri + `/api/v1/*` serverless funksiyası.

## Struktur

```
server/
  app.js            Express app (CORS, JSON, xəta emalı)
  index.js          Lokal server (node server/index.js)
  config.js         Env, CORS, baza adı
  db.js             MongoDB bağlantısı (keş + indekslər + seed)
  auth.js           JWT (Bearer) + bcrypt + rol middleware-ləri
  collections.js    Kolleksiya sxemləri — yeni modul üçün bir sətir
  data/seed.js      Boş baza üçün ilkin məlumatlar
  routes/           auth, users, crud, data, public
api/v1/             Vercel serverless körpüsü (app-i ixrac edir)
```

## Lokal işə salma

```bash
npm install
npm run server       # http://localhost:4000/api/v1
npm run server:dev   # node --watch ilə
```

Frontend ayrıca işləyir: `npm run dev` (http://localhost:3000).

## Env dəyişənləri

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/aeik_database?retryWrites=true&w=majority
MONGODB_DB=aeik_database   # istəyə bağlı (URI-də baza adı yoxdursa)
JWT_SECRET=uzun_təsadüfi_açar
CORS_ORIGINS=https://aeik.vercel.app   # vergüllə bir neçə origin, və ya *
```

Vercel-də eyni adlarla **Environment Variables** bölməsinə əlavə edin.

## Endpoint-lər

Baza: `/api/v1` (lokal serverdə `/v1` da işləyir).

| Metod | Yol | İcazə |
|---|---|---|
| GET | `/health` | açıq |
| POST | `/auth/register` | owner/admin (açıq qeydiyyat bağlıdır) |
| POST | `/auth/login` | açıq |
| GET | `/auth/me` | token |
| GET/POST | `/users`, PATCH/DELETE `/users/:id` | admin/owner |
| GET | `/data` | token |
| POST | `/sync` | admin/owner |
| GET | `/public/projects`, `/public/members` | açıq |
| CRUD | `/members`, `/projects`, `/events`, `/attendance`, `/links`, `/items` | oxu: token, yazma: admin/owner |

Hər CRUD resursunda: `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `PUT /:id` (upsert), `DELETE /:id`.
Siyahılarda `?limit=`, `?skip=` və sahə filtri (məs. `/items?sec=posts`) dəstəklənir.

Auth: `Authorization: Bearer <token>` başlığı. Token 30 gün etibarlıdır və mövcud Next.js tokenləri ilə eyni `JWT_SECRET`-i paylaşır.

## Yeni modul əlavə etmək

`server/collections.js` faylına bir giriş yazın:

```js
budgets: {
  collection: 'budgets',
  idPrefix: 'b',
  idField: 'id',
  fields: ['id', 'title', 'amount', 'ts'],
  sort: { ts: -1 },
}
```

Nəticə: `GET/POST /api/v1/budgets` və s. avtomatik hazır olur. Xüsusi məntiq lazımdırsa `server/routes/` altında ayrıca route faylı yazıb `routes/index.js`-də mount edin.

## Vercel deploy

Repo-nu Vercel-ə bağlayın — `api/v1/*` avtomatik funksiya kimi tanınır, əlavə konfiqurasiya lazım deyil. Deploy-dan sonra yoxlayın:

```
GET https://<domain>/api/v1/health
```
