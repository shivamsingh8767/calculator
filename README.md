# MATH/OS

> A modern, responsive mathematical utility platform built for fast calculations, scientific computing, and formula exploration.

MATH/OS is a full-stack mathematics utility web application that combines a powerful calculator engine with a structured mathematical formula library and persistent calculation history.

The application is designed with a **mobile-first approach**, making it comfortable to use on smartphones while maintaining a polished desktop experience.

---

## ✨ Features

### 🧮 Normal Calculator

A clean and fast calculator for everyday mathematical operations.

- Addition
- Subtraction
- Multiplication
- Division
- Percentage
- Decimal calculations
- Positive/negative toggle
- Calculation chaining
- Delete and clear operations
- Keyboard support

---

### 🔬 Scientific Calculator

A complete scientific calculator for advanced mathematical operations.

- Trigonometric functions
  - sin
  - cos
  - tan
- Inverse trigonometric functions
- Logarithm (base 10)
- Natural logarithm (ln)
- Square root (√x)
- Square (x²)
- Power (xʸ)
- Reciprocal (1/x)
- Factorial (x!)
- Mathematical constants:
  - π (Pi)
  - e (Euler's number)
- Parentheses
- EXP scientific notation
- DEG / RAD angle modes
- INV function toggles

*The scientific calculator uses a custom tokenized Recursive Descent Expression Parser with domain validation rather than JavaScript's `eval()`.*

---

## 📚 Formula Library

MATH/OS includes an interactive mathematical formula library containing **65+ formulas** across multiple disciplines.

### Supported Topics

- Algebra
- Trigonometry
- Coordinate Geometry
- Differential Calculus
- Integral Calculus
- Differential Equations
- Matrices & Linear Algebra
- Vector Algebra
- Probability & Statistics
- Complex Numbers
- Fourier Analysis
- Laplace Transforms
- Numerical Methods
- Discrete Mathematics
- Engineering Mathematics

### Formula Library Features

- Topic-based browsing
- Subtopic filtering
- Real-time search by keyword, equation, or application
- Mathematical formula descriptions
- Worked examples
- Topic tags
- One-click copy formula functionality
- Breadcrumb navigation
- Responsive formula cards
- Instant local fallback when backend is offline

---

## 🕘 Calculation History

MATH/OS persists calculator calculations through the REST API to MongoDB Atlas.

History features include:

- Normal calculator calculations
- Scientific calculator calculations
- Expression and result storage
- Calculation timestamps
- Quick-copy result to clipboard
- Delete individual records
- Clear all history
- Slide-over history drawer
- Optimistic local UI updates for responsiveness

> *Authentication is intentionally not included in the current version. Therefore, calculation history is application-level storage rather than private per-user storage.*

---

## 📱 Mobile-First Design

MATH/OS is engineered primarily for mobile usage with zero horizontal overflow and fluid typography.

### Responsive Support
- 320px (iPhone SE 1st gen / Small Android)
- 360px (Compact Android)
- 375px (iPhone standard)
- 390px (iPhone modern)
- 412px (Google Pixel / Samsung Galaxy)
- 430px (iPhone Pro Max)
- 768px (Tablet)
- 1024px+ (Desktop)

### Mobile Improvements
- Touch-friendly calculator buttons with $\ge 44\text{px}$ touch targets
- Responsive 6-column scientific keypad without font clipping
- Zero horizontal page scrolling (`overflow-x: hidden`)
- Thumb-accessible segmented mobile navigation
- Full-width ($100\text{vw}$) slide-over history drawer
- Single-column responsive formula cards on phone viewports
- Swipeable formula category filter pills with native scroll inertia
- Safe area inset support (`env(safe-area-inset-*)`) for modern phone notches
- Responsive typography powered by CSS `clamp()`
- Active touch feedback (`scale(0.95)`) and tap delay elimination (`touch-action: manipulation`)

---

## 🎨 Design System

MATH/OS uses a minimal dark interface with a lime-green visual identity.

| Token | Hex Value | Purpose |
|---|---|---|
| Primary Lime | `#E4FD97` | Accents, Active Tabs, Mode Indicators, Equal Key |
| Forest Green | `#2D3E2C` | Surface Base, Glass Panels, Badges |
| Background Deep | `#10140F` | Main Background, Contrast Cards |
| Off-White | `#F3F7E8` | Primary Typography, Numbers, Equations |
| Muted Gray | `#A9B29F` | Secondary Text, Labels, Inactive Controls |

### Interface Aesthetics
- Glassmorphism backdrop blur (`16px`)
- Subtle organic radial gradients
- Soft border contours (`1px solid rgba(169, 178, 159, 0.12)`)
- Minimalist, high-contrast calculator buttons

### Typography
- **Display**: Syne (Headings & Wordmark)
- **Body**: Plus Jakarta Sans (Labels, Descriptions, UI Copy)
- **Code & Calculations**: JetBrains Mono (Keypads, Formulas, Expressions, Results)

---

## 🏗️ Architecture

```text
                    MATH/OS
                       │
          ┌────────────┴────────────┐
          │                         │
      Frontend                   Backend
          │                         │
   HTML / CSS / JS           Node.js + Express
          │                         │
      Calculator                 Mongoose
      Formula UI                    │
      History UI                    │
          │                         │
          └──────── REST API ───────┘
                                    │
                              MongoDB Atlas
```

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI
npm run seed     # Seeds 65 mathematical formulas
npm start        # Starts Express server on http://0.0.0.0:5000
```

### 2. Frontend Setup
```bash
# In project root:
npm install
npm run dev      # Runs Vite dev server on http://localhost:3000
```

### 3. Production Build
```bash
npm run build    # Produces optimized production bundle in dist/
```
