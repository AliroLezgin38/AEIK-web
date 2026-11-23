# AEİK — Elm və İnnovasiya Proqramı

**Azərbaycan Elm və İnnovasiya Könüllüləri (AEİK)** təşkilatının rəsmi veb saytı və idarə heyəti üçün şəxsi kabinet.

Layihə iki hissədən ibarətdir:

| Hissə | Texnologiya | İşə salma |
|---|---|---|
| **Frontend** — landing, login, register, kabinet | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS | `npm run dev` → `http://localhost:3000` |
| **Web API** — autentifikasiya və məlumatlar | Node.js + Express 5 + MongoDB (native driver) | `npm run server` → `http://localhost:4000/api/v1` |

Vercel-də hər ikisi **tək layihə** kimi yayımlanır: Next.js səhifələri + `api/v1/*` serverless funksiyası.

---

## Səhifələr

| Yol | Təsvir |
|---|---|
| `/` | Əsas landing səhifəsi (proqram, istiqamətlər, statistika, əlaqə) |
| `/login` | Email və şifrə ilə giriş |
| `/kabinet` | İdarə heyəti kabineti (10 modul) |
| `/kabinet/users` | İstifadəçi və rol idarəetməsi (owner/admin) |

### Kabinet modulları

Hesabatlar, davamiyyət, layihələr, təqvim, post planı, əməkdaşlıq, nəticələr, iclaslar, tapşırıqlar və qeydlər — hər modul üçün məlumat `items` kolleksiyasında `sec` sahəsi ilə saxlanılır.

### Rollar

- **owner / admin** — məlumat əlavə etmək, redaktə etmək, silmək, istifadəçiləri idarə etmək. Yeni hesablar **yalnız** bu rollar tərəfindən `/kabinet/users` səhifəsindən yaradılır; açıq qeydiyyat (self-register) bağlıdır.
- **member** — kabinet məlumatlarını oxumaq.

---

## Layihə strukturu

```
.
├── api/v1/                # Vercel serverless körpüsü (Express app-i ixrac edir)
├── server/                # Ayrıca Web API
│   ├── app.js             # Express app (CORS, JSON, xəta emalı)
│   ├── index.js           # Lokal server
│   ├── config.js          # Env, CORS, baza adı
│   ├── db.js              # MongoDB bağlantısı (keş + indekslər + seed)
│   ├── auth.js            # JWT (Bearer) + bcrypt + rol middleware-ləri
│   ├── collections.js     # CRUD resurs sxemləri
│   ├── data/seed.js       # Boş baza üçün ilkin məlumatlar
│   └── routes/            # auth, users, crud, data, public
├── src/
│   ├── app/               # Next.js səhifələri (App Router)
│   ├── components/        # Navbar, Footer, kabinet komponentləri
│   ├── data/program.ts    # Landing-in statik məzmunu
│   └── lib/               # Köməkçi funksiyalar
└── public/                # Şəkillər və şriftlər
```

`server/README.md` — API-nin ətraflı sənədləşməsi (bütün endpoint-lər, yeni modul əlavə etmə qaydası).

---

## Lokal işə salma

```bash
# 1. Asılılıqlar
npm install

# 2. Mühit dəyişənləri (.env.example faylını .env kimi kopyalayın)
cp .env.example .env
```

`.env` faylında ən azı bunlar olmalıdır:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/aeik_database?retryWrites=true&w=majority
JWT_SECRET=uzun_tesadufi_acar
```

Sonra iki prosesi ayrı-ayrı terminallarda başladın:

```bash
npm run dev          # Next.js  → http://localhost:3000
npm run server       # Web API  → http://localhost:4000/api/v1
# və ya canlı yenilənmə ilə:
npm run server:dev
```

API-nin işlədiyini yoxlamaq:

```bash
curl http://localhost:4000/api/v1/health
```

---

## Mühit dəyişənləri

| Dəyişən | Tələb | Təsvir |
|---|---|---|
| `MONGODB_URI` | bəli | MongoDB Atlas bağlantı sətri |
| `MONGODB_DB` | yox | Baza adı (URI-də göstərilməyibsə) |
| `JWT_SECRET` | bəli | Token imzalama açarı (uzun və təsadüfi) |
| `CORS_ORIGINS` | yox | İcazəli origin-lər, vergüllə. Default: `https://aeik.vercel.app`, `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | yox | Saytın tam ünvanı (canonical/OpenGraph üçün) |
| `PORT` | yox | Lokal API portu (default `4000`) |

> `.env` faylı `.gitignore`-dadır — real açarlar heç vaxt repoya düşməməlidir.

---

## API xülasəsi

Baza yol: `/api/v1` (lokal serverdə `/v1` da işləyir). Autentifikasiya: `Authorization: Bearer <token>`, token 30 gün etibarlıdır.

| Metod | Yol | İcazə |
|---|---|---|
| GET | `/health` | açıq |
| POST | `/auth/register` | owner/admin |
| POST | `/auth/login` | açıq |
| GET | `/auth/me` | token |
| GET/POST | `/users`, PATCH/DELETE `/users/:id` | owner/admin |
| GET | `/data` | token |
| POST | `/sync` | owner/admin |
| GET | `/public/projects`, `/public/members` | açıq |
| CRUD | `/members`, `/projects`, `/events`, `/attendance`, `/links`, `/items` | oxu: token, yazma: owner/admin |

Hər CRUD resursunda `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `PUT /:id`, `DELETE /:id` mövcuddur. Siyahılarda `?limit=`, `?skip=` və sahə filtri (məs. `/items?sec=posts`) dəstəklənir.

**Yeni modul əlavə etmək:** `server/collections.js` faylına bir giriş yazın — CRUD route-ları avtomatik yaranır:

```js
budgets: {
  collection: 'budgets',
  idPrefix: 'b',
  idField: 'id',
  fields: ['id', 'title', 'amount', 'ts'],
  sort: { ts: -1 },
}
```

---

## Yoxlama

```bash
npm run build        # production build
npx tsc --noEmit     # tip yoxlaması
```

> `npm run lint` bu repoda ESLint konfiqurasiyası olmadığı üçün ilk dəfə interaktiv quraşdırma tələb edir.

---

## Vercel-də yayımlama

1. Repo-nu GitHub-a push edin (`main` branch-i production branch-idir).
2. Vercel-də layihəni repo-ya bağlayın — framework avtomatik `Next.js` seçilir.
3. **Environment Variables** bölməsinə `MONGODB_URI` və `JWT_SECRET` əlavə edin (production üçün).
4. Deploy edin. `api/v1/*` avtomatik serverless funksiya kimi tanınır, əlavə konfiqurasiya lazım deyil.

Deploy-dan sonra yoxlayın:

```
GET https://aeik.vercel.app/api/v1/health
```

Canlı ünvan: **https://aeik.vercel.app**

---

## Qeydlər

- Landing məzmunu hazırda `src/data/program.ts` faylında statik saxlanılır; API-yə keçid mərhələli şəkildə planlaşdırılır.
- `src/app/api/*` altındaki köhnə Next.js API route-ları hələ mövcuddur; əsas backend `server/` qovluğundakı Express API-dir.
- Şrift (Manrope) `public/fonts/` qovluğunda self-host edilib.
