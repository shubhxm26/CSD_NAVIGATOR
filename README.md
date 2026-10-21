# CSD Department Campus Navigator – 4th Floor
### Interactive Shortest-Path Navigation Using Dijkstra's Algorithm &amp; Min-Heap

A modern, interactive 2D web application designed for students and faculty of the **Computer Science and Design (CSD)** department to navigate the fourth floor.

The application faithfully reproduces the department floor plan and distance sketch, allowing users to select an origin and destination, calculate the exact shortest route using **Dijkstra's Algorithm**, view the walking path visually on an interactive floor map, and track journey progress step-by-step with manual checkpoints.

---

## 🏛️ Floor Plan & Reference Architecture

The floor layout is a rectangular corridor enclosing a **Central Empty Space (Not Walkable)**:

- **Top Side (North):** Washroom, Lab 3, Lab 4, Bhise Mam's Cabin *(Default Starting Location)*
- **Right Side (East):** JVN Hall Door 1, JVN Hall Door 2, Lower-Right Corner
- **Bottom Side (South):** Passage / Entrance, Class 1, Class 2, Lower-Right Corner
- **Left Side (West):** Washroom, Lab 2, Lab 1, Passage / Entrance
- **Obstacle Constraint:** The central rectangular area is an obstacle. All routes strictly traverse the surrounding corridors.

---

## 📐 Provisional Edge Weights (From Handwritten Sketch)

| Section | From | To | Distance |
|---|---|---|:---:|
| **Top Side** | Washroom | Lab 3 | 0.5 m |
| **Top Side** | Lab 3 | Lab 4 | 2.0 m |
| **Top Side** | Lab 4 | Bhise Mam's Cabin | 2.0 m |
| **Left Side** | Washroom | Lab 2 | 0.5 m |
| **Left Side** | Lab 2 | Lab 1 | 2.0 m |
| **Left Side** | Lab 1 | Passage (Entrance) | 2.0 m *(Configurable Placeholder)* |
| **Bottom Side** | Passage (Entrance) | Class 1 | 1.0 m |
| **Bottom Side** | Class 1 | Class 2 | 2.0 m |
| **Bottom Side** | Class 2 | Lower-Right Corner | 2.0 m |
| **Right Side** | Bhise Mam's Cabin | JVN Hall Door 1 | 2.0 m |
| **Right Side** | JVN Hall Door 1 | JVN Hall Door 2 | 2.0 m |
| **Right Side** | JVN Hall Door 2 | Lower-Right Corner | 2.0 m |

> **Note:** All distances can be viewed and edited dynamically in the **"Distances"** modal within the web app, and routes immediately recalculate.

---

## 🧠 Data Structures & Algorithms (DSA) Implementation

- **Graph Structure:** Weighted undirected graph stored via an **Adjacency List** (`Map<VertexId, Array<{node, distance}>>`), ensuring $O(V + E)$ space complexity instead of $O(V^2)$ dense matrix storage.
- **Priority Queue:** Custom binary **Min-Heap** (`src/dsa/MinHeap.js`) providing $O(\log V)$ `extractMin` and insertion.
- **Shortest Path Algorithm:** Dijkstra's Algorithm (`src/dsa/dijkstra.js`) using edge relaxation with non-negative weights and predecessor pointer tracking.
- **Time Complexity:** $\mathcal{O}((V + E) \log V)$
- **Space Complexity:** $\mathcal{O}(V + E)$
- **Path Reconstruction:** Unwinds optimal route backwards from destination to source in $\mathcal{O}(\text{path length})$ time using $prev[v]$.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
# Clone or navigate to the directory
cd miniproject

# Install dependencies (already completed)
npm install
```

### Running the Application Locally
```bash
npm run dev
```
Open your browser at the local server URL (typically `http://localhost:5173/`).

### Running the Verification Test Suite
```bash
npm test
```
Executes all **9 required test scenarios** (nearby routes, cross-floor routes, central obstacle avoidance, unreachable nodes, identical start/end, and deviation handling) directly in the CLI.

### Building for Production
```bash
npm run build
```

---

## 🗺️ Key Features

1. **Interactive 2D SVG Department Map:**
   - Accurate proportions, doorway cutouts, room colors matching the reference legend.
   - Zoom in/out, pan around, and reset view.
   - Click any room to select as start or destination.
   - Toggle marked corridor distances and junction node dots.
   - Animated glowing route with directional arrows.

2. **Route Progress Tracking ("Where am I now?"):**
   - Manual user-confirmed indoor positioning (no fake indoor GPS claims).
   - Recalculates remaining shortest path dynamically from confirmed checkpoint.
   - Visual distinction between **travelled route** (muted green dashed line) and **remaining route** (vibrant sky-blue glowing line).
   - Progress percentage tracking:
     $$\text{Progress \%} = \min\left(100\%, \frac{\text{Distance Travelled along Planned Route}}{\text{Original Planned Distance}} \times 100\right)$$
   - Automatic route deviation detection with rerouting.

3. **Academic Viva Tools:**
   - **Dijkstra Algorithm Trace & Heap Inspector:** Step through algorithm iterations, inspect active Min-Heap contents, and view `dist[]` & `prev[]` table updates.
   - **Academic DSA Docs Modal:** Full theoretical explanations, definitions, and Big-O proofs.
   - **Automated Test Runner Modal:** Run all 9 assertions with 1-click inside the UI.
   - **Provisional Edge Weights Editor:** Adjust any corridor segment distance live.
   - **Celebration Arrival Screen:** Confetti and journey summary report upon reaching the destination.
