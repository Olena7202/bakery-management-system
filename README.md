# Bakery Management System

A full-stack bakery management web application built with React + ASP.NET Core 9 + Azure SQL.

**Live Demo:** [bakery-management-system-woad.vercel.app](https://bakery-management-system-woad.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | ASP.NET Core 9, Entity Framework Core 9 |
| Database | Azure SQL (Microsoft SQL Server) |
| Auth | JWT Tokens, BCrypt |
| Hosting | Vercel (frontend), Railway (backend) |
| CI/CD | GitHub Actions |

---

## Features

- Browse cake catalog with categories, filters, and customization options
- User authentication (register / login) with JWT
- Role-based access: **Client** and **Confectioner**
- Clients can create orders, save favorite cakes, and track order status
- Confectioners can manage the cake catalog and update order statuses
- Image upload for cakes
- Fully deployed and connected to a live database

---

## Roles

**Client**
- Browse and filter cakes by category
- Save favorite cakes
- Customize cakes (choose biscuit and cream)
- Create and track orders

**Confectioner**
- Add, edit, and delete cakes
- Upload cake images
- View and manage all orders
- Update order statuses

---

## Local Development Setup

### Requirements
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [SQL Server Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup)

### Database Setup
1. Install **SQL Server Developer Edition** (Basic installation, Windows Authentication)
2. Install and open **SSMS** → connect to `localhost` → Windows Authentication
3. Open and run `sql/01_create_tables.sql`
4. Open and run `sql/02_seed_data.sql`

### Backend Setup
1. Open `sweetVenomServer/sweetVenomServer` in Visual Studio
2. Verify `appsettings.json` connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=cake_shop_db;Trusted_Connection=True;TrustServerCertificate=True;"
}
```
3. Press **F5** to run — server starts at `http://localhost:5023`

### Frontend Setup
```bash
npm install
npm run dev
```
App runs at `http://localhost:5173`

Create a `.env.local` file in the root:
```
VITE_API_URL=http://localhost:5023
```

---

## Project Structure

```
bakery-management-system/
├── src/
│   ├── api/              # Axios config and API service functions
│   ├── components/       # Reusable UI (Navbar, ProductCard, Modal)
│   ├── pages/            # Home, Auth, Menu, Orders, Dashboards
│   └── App.jsx           # Routing
├── sweetVenomServer/     # ASP.NET Core backend
│   ├── Controllers/      # API endpoints
│   ├── Models/           # Entity models
│   ├── Data/             # DbContext
│   └── appsettings.json  # Configuration
├── sweetVenomServer.Tests/ # xUnit test project
│   └── 43 unit tests across 8 controllers
├── .github/workflows/    # GitHub Actions CI/CD
└── public/images/        # Cake images
```

---

## CI/CD

GitHub Actions runs automatically on every push and pull request to `main` and `dev`:

- Restore & build .NET backend
- Run 43 unit tests (xUnit + EF Core InMemory)
- Build React frontend (Vite)

---

## Git Workflow

```bash
git pull
git checkout -b feature/name
git add .
git commit -m "feat: description"
git push origin feature/name
```

Create a Pull Request after pushing. Do not push directly to `main`.

---

## Environment Variables

### Frontend (Vercel)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Railway backend URL |

### Backend (Railway)
| Variable | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `Jwt__Key` | JWT signing key |
| `Jwt__Issuer` | JWT issuer |
| `Jwt__Audience` | JWT audience |