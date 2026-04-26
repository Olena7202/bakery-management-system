# Bakery Management System

## Overview

This project is a simple bakery management system built with React.  
It allows clients to browse products and create orders, and confectioners to manage those orders.

---

## Setup

```bash
npm install
npm run dev
```

# How to Set Up Cake Shop Server

## Вимоги
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (безкоштовно)
- [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup)
- [Node.js](https://nodejs.org/)

## Налаштування бази даних
1. Завантаж та встанови **SQL Server Developer Edition**
   - Вибери тип встановлення **Basic**
   - Під час встановлення вибери **Windows Authentication** (без пароля)
2. Завантаж та встанови **SSMS**
3. Відкрий SSMS → підключись до `localhost` → Windows Authentication → Connect
4. У верхньому меню натисни **File → Open → File** → вибери `sql/01_create_tables.sql`
5. Натисни **F5** щоб виконати
6. Знову **File → Open → File** → вибери `sql/02_seed_data.sql`
7. Натисни **F5** щоб виконати

## Налаштування бекенду
1. Відкрий папку `sweetVenomServer` у Visual Studio
2. Відкрий `appsettings.json` і перевір що connection string виглядає так:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=cake_shop_db;Trusted_Connection=True;TrustServerCertificate=True;"
}
```
3. Натисни **F5** щоб запустити сервер
4. Сервер буде доступний на `http://localhost:5023`

## Налаштування фронтенду
1. Відкрий термінал у папці `sweetVenom/bakery-management-system`
2. Виконай:
```bash
npm install
npm run dev
```
3. Відкрий браузер на `http://localhost:5173`

## Зображення
Всі зображення тортів знаходяться у папці `sweetVenom/bakery-management-system/public/images/`

---

## Project Structure

```text
src/
├─ App.jsx            # routing
├─ main.jsx           # entry point
├─ components/        # reusable UI (Navbar, ProductCard, Modal)
├─ pages/             # Home, Auth, Order, Dashboards
├─ data/              # mock data (products.js)
├─ styles/            # CSS files
```

---

## How It Works

- Routing is handled in `App.jsx` using react-router  
- Pages are located in the `pages/` folder  
- Reusable UI components are in `components/`  
- Product data currently comes from `data/products.js`  
- Forms and dashboards are currently frontend-only  

---

## Roles

**Client**
- creates orders  
- views own orders  

**Confectioner**
- views all orders  
- updates order status  

---

## Git Workflow

```bash
git pull
git checkout -b feature/name
git add .
git commit -m "feat: description"
git push origin feature/name
```

Create a Pull Request after pushing.

Do not push directly to `main`.

---


## Current State

- using mock data (`products.js`)  
- backend is not connected  
- dashboards and forms are partially implemented  

---

## MVP Goals

- authentication (login / register)  
- roles (client / confectioner)  
- database (users, products, orders)  
- order creation  
- dashboards  