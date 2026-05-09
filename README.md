# 🐾 PawFit: An Interactive 3D Virtual Fitting and E-Commerce Platform for Dog Apparel

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r150+-black)

---

## 📖 Overview

**PawFit** is a web-based e-commerce platform that integrates breed-specific 3D avatar generation, interactive garment visualization, and a measurement-based size recommendation algorithm for online dog apparel purchasing.

The system addresses a critical gap in online pet apparel retail — the absence of interactive fit evaluation tools for dog clothing. While virtual fitting room technologies have been extensively developed for human apparel, no equivalent system exists for dog apparel, despite the extreme morphological diversity across dog breeds that makes generic sizing approaches unreliable.

PawFit enables users to:
- Select their dog's breed from five supported breeds
- Optionally input their dog's measurements (back length, neck girth, chest girth)
- Visualize selected apparel on a breed-specific 3D dog avatar
- Receive a personalized size recommendation with a confidence indicator
- Add items to cart and complete a simulated checkout

---

## 🐶 Supported Breeds

| Breed | Body Type |
|---|---|
| Labrador Retriever | Large-bodied, deep-chested |
| Shih Tzu | Compact, low-slung |
| Dachshund | Elongated, short-legged |
| Pomeranian | Small, densely coated |
| Aspin / Mixed Breed | Median measurement ranges |

---

## 👕 Supported Apparel Types

- Shirts
- Coats
- Sweaters
- Hoodies

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js v18+, Tailwind CSS, React Router |
| 3D Rendering | Three.js r150+, GLB/glTF assets |
| State Management | React Context API |
| Backend | Node.js v18+, Express.js |
| Database | MongoDB Atlas (NoSQL) |
| Authentication | JSON Web Tokens (JWT) |
| 3D Modeling | Blender v3.6+ |
| API Architecture | RESTful API |

---

## 📁 Repository Structure

```
PawFit/
├── PAWFIT-Frontend/     ← React.js frontend (Vite)
├── PAWFIT-Backend/      ← Node.js/Express.js backend
└── README.md            ← You are here
```

Each folder has its own README with setup instructions:
- [Frontend README](./PAWFIT-Frontend/README.md)
- [Backend README](./PAWFIT-Backend/README.md)

---

## ✨ Key Features

### For Users
- **3D Virtual Fitting** — View selected dog apparel on a breed-specific 3D avatar with 360-degree rotation and zoom
- **Size Recommendation** — Get a personalized size (XS–XL) with a confidence indicator based on your dog's measurements
- **Pet Profile Management** — Save your dog's breed and measurements for faster future purchases
- **Product Catalog** — Browse and filter apparel by breed compatibility and size category
- **Shopping Cart** — Add items with recommended sizes pre-populated
- **Checkout Simulation** — Complete a simulated purchase with order confirmation and order history

### For Admin/Sellers
- **Product Management** — Add, edit, and delete apparel products
- **Order Management** — View and update order statuses
- **3D Asset Management** — Upload and manage GLB avatar and apparel assets
- **Dashboard** — Overview of orders, products, and users

---

## 📐 Size Recommendation Algorithm

PawFit uses a **rule-based size recommendation algorithm** that:

1. Accepts three measurements as input: back length, neck girth, and chest girth
2. Compares inputs against breed-specific threshold tables derived from empirical measurement data
3. Returns a size category (XS, S, M, L, or XL)
4. Returns a confidence state:
   - ✅ **Good Fit** — measurements fall within the central range of a size category
   - ⚠️ **Check Fit** — measurements fall within 5% of a size boundary
   - 📏 **Custom Fit Recommended** — measurements exceed the maximum range for the breed

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm
- MongoDB Atlas account

### Quick Start

**1. Clone the repository:**
```bash
git clone https://github.com/Astrazee2/PawFit-An-Interactive-3D-Virtual-Fitting-and-E-Commerce-Platform-for-Dog-Apparel.git
cd PawFit-An-Interactive-3D-Virtual-Fitting-and-E-Commerce-Platform-for-Dog-Apparel
```

**2. Set up and run the backend:**
```bash
cd PAWFIT-Backend
npm install
# Create .env file with your MongoDB Atlas connection string
npm run dev
```

**3. Set up and run the frontend:**
```bash
cd PAWFIT-Frontend
npm install --legacy-peer-deps
npm install react@18.3.1 react-dom@18.3.1 --legacy-peer-deps
npm run dev
```

**4. Open your browser:**
```
http://localhost:5173
```

> ⚠️ Both the frontend and backend must be running at the same time for the full system to work.

---

## 🔌 API Overview

The backend exposes RESTful API endpoints at `http://localhost:5000/api`:

| Resource | Endpoints |
|---|---|
| Auth | `/api/auth/register`, `/api/auth/login` |
| Pets | `/api/pets` |
| Products | `/api/products` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |

Full API documentation is available in the [Backend README](./PAWFIT-Backend/README.md).

---

## 📊 Research Context

This project is developed as an undergraduate thesis at **Mapúa University — School of Information Technology** in partial fulfillment of the requirements for the degree of **Bachelor of Science in Information Technology**.

**Research Question:**
> How usable is the PawFit 3D pet apparel e-commerce system based on user evaluation of system usefulness, information quality, and interface quality?

**Evaluation Instrument:** Post-Study System Usability Questionnaire (PSSUQ)

**Target Respondents:** 30 dog owner respondents from Metro Manila, Philippines

---

## 📄 License

This project is developed for academic purposes only. All rights reserved by the development team.

---

> *"PawFit extends the functional capacity of dog apparel platforms beyond static representation and provides interactive, system-assisted support for fit evaluation and purchase decision-making."*
```
🐾
