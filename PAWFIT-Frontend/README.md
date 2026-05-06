# 🐾 PawFit VER1

A virtual pet apparel fitting prototype built with React, Vite, Tailwind CSS, and Three.js. The original Figma prototype is available at https://www.figma.com/design/ks5jZE8rUOhE1oIrD92EAX/PAWFIT-VER1.

## 🛠️ Prerequisites

Before running the project, make sure you have **Node.js** installed.

1. Go to https://nodejs.org
2. Download the **LTS version** (recommended)
3. Run the installer and follow the steps
4. Restart your terminal or VS Code after installing

To verify the installation, run:
```bash
node -v
npm -v
```
Both should return a version number.

## 🚀 Running the Project

**Step 1 — Install dependencies:**
```bash
npm install --legacy-peer-deps
```

**Step 2 — Install React (required separately):**
```bash
npm install react@18.3.1 react-dom@18.3.1 --legacy-peer-deps
```

**Step 3 — Start the development server:**
```bash
npm run dev
```

**Step 4 — Open your browser and go to:**
http://localhost:5173

## ⚠️ Notes

- Always use `--legacy-peer-deps` when installing packages — this project has peer dependency conflicts between React 18 and `@react-three/fiber` that require it.
- `node_modules/` is not included in this repository. You must run the install commands above before running the project.
