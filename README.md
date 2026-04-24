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