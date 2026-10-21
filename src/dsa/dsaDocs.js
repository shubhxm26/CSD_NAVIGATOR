/**
 * Academic DSA Documentation and Reference for CSD Department Campus Navigator.
 * Prepared for Viva, evaluation, and project presentation.
 */

export const DSA_EXPLANATIONS = {
  graphBasics: {
    title: '1. What is a Graph?',
    content: `A graph G = (V, E) is a fundamental non-linear data structure consisting of a finite set of **Vertices (Nodes)** V and a set of **Edges** E that connect pairs of vertices.

In this project, our department floor plan is modelled as an **undirected weighted graph**, because pedestrian walking along hallways is bidirectional: any student can walk from point A to point B and back from B to A along the same corridor path.`,
  },

  verticesAndEdges: {
    title: '2. Vertices & Edges in our Department Floor Plan',
    content: `To accurately represent physical reality and prevent cutting through walls or across the inaccessible central courtyard, vertices are categorized into two logical layers:

1. **Room & Facility Access Vertices (11 Nodes):**
   - Washroom (NW corner)
   - Lab 1, Lab 2, Lab 3, Lab 4
   - Bhise Mam's Cabin (Faculty Cabin, NE corner)
   - JVN Hall Door 1 & Door 2 (East corridor)
   - Class 1 & Class 2 (South corridor)
   - Passage / Entrance (SW corner)

2. **Corridor Junction Vertices (12 Nodes):**
   - Precise hallway navigation points aligned with room doorways and structural corridor corners (such as the Lower Right Corner).

**Edges (Corridor Links & Doorways):**
- Walkable corridor segments connecting adjacent junctions.
- Door transitions connecting room interiors to the adjacent hallway junction.
- Crucially, no edges cross through the **Central Empty Space (Not Walkable)**.`,
  },

  whyWeighted: {
    title: '3. Why is the Graph Weighted?',
    content: `An unweighted graph assumes every step has an identical cost of 1. However, walking between physical locations has varying distances:
- E.g., Washroom to Lab 3 is **0.5 metres**.
- While Lab 3 to Lab 4 is **2.0 metres**.
- Passage (Entrance) to Class 1 is **1.0 metre**.

By assigning the estimated walking distance in metres as edge weights $w(u, v) > 0$, our navigation system finds the route with the **true minimum walking distance**, rather than merely the minimum number of turns.`,
  },

  adjacencyList: {
    title: '4. How the Adjacency List Stores Connections',
    content: `We represent the graph using an **Adjacency List** rather than an Adjacency Matrix:
- An adjacency matrix of $|V| = 23$ vertices would require a $23 \\times 23$ table (529 entries), most of which are 0 because corridors only connect immediate neighbors (sparse graph).
- An **Adjacency List** associates each vertex $u$ with an array of its actual adjacent neighbors:
\`\`\`javascript
const adjacencyList = {
  "j_washroom": [
    { node: "j_lab3", distance: 0.5 },
    { node: "j_lab2", distance: 0.5 },
    { node: "washroom", distance: 0.3 }
  ],
  "j_lab3": [
    { node: "j_washroom", distance: 0.5 },
    { node: "j_lab4", distance: 2.0 },
    { node: "lab3", distance: 0.3 }
  ]
};
\`\`\`
- **Space Complexity:** $O(V + E)$ — significantly more memory-efficient.
- **Neighbor Lookup:** $O(\\text{deg}(u))$ — directly iterates over valid outgoing corridor segments.`,
  },

  dijkstraStepByStep: {
    title: "5. Dijkstra's Algorithm Step-by-Step",
    content: `Invented by Edsger W. Dijkstra in 1956, this greedy algorithm finds the shortest path from a starting node to all other nodes in a graph with non-negative edge weights.

**Execution Lifecycle:**
1. **Distance Array Initialization:** Set $dist[source] = 0$. For all other $v \\in V$, set $dist[v] = \\infty$.
2. **Predecessor Array:** Set $prev[v] = \\text{null}$ for all vertices.
3. **Priority Queue:** Insert $(source, 0)$ into a Min-Heap.
4. **Greedy Extraction:** While the heap is not empty, extract the vertex $u$ with the minimum tentative distance $dist[u]$.
5. **Visited Set:** Mark $u$ as finalized. Once extracted from a min-heap with non-negative weights, $dist[u]$ is guaranteed to be optimal.
6. **Edge Relaxation:** For every neighbor $v$ of $u$ along corridor edge $(u, v)$ with weight $w$:
   $$\\text{If } dist[u] + w < dist[v] \\implies dist[v] = dist[u] + w, \\quad prev[v] = u$$
   Push $(v, dist[v])$ into the min-priority queue.
7. **Destination Reached:** If $u == \\text{destination}$, we terminate early and return the finalized route.`,
  },

  minHeapImportance: {
    title: '6. Why a Min-Priority Queue / Binary Min-Heap is Essential',
    content: `In a naive implementation using a plain unsorted array, finding the minimum distance vertex in each iteration requires scanning all remaining unvisited vertices in $O(V)$ time, leading to an overall time complexity of $O(V^2)$.

By using a **Binary Min-Heap**:
- Minimum extraction (\`extractMin\`): $O(\\log V)$
- Inserting or updating candidate distance (\`push\` / \`bubbleUp\`): $O(\\log V)$
- Overall time complexity drops to:
  $$\\mathbf{O((V + E) \\log V)}$$
This ensures instant path calculation even on dense multi-floor university floor plans.`,
  },

  pathReconstruction: {
    title: '7. Path Reconstruction Using Predecessors',
    content: `Dijkstra's relaxation step maintains a predecessor pointer $prev[v] = u$, indicating that the optimal path to $v$ comes directly from $u$.

Once the destination vertex is reached, the route is reconstructed backwards:
\`\`\`javascript
const path = [];
let curr = destination;
while (curr !== null) {
  path.unshift(curr);
  curr = predecessors[curr];
}
\`\`\`
This unwinds the shortest path in $O(\\text{path length})$ time from start to destination.`,
  },

  routeProgressMath: {
    title: '8. How the Route Progress Tracking Feature Works',
    content: `Our application features manual user-confirmed progress tracking ("Where am I now?"):

1. **Original Planned Route:** $P_{\\text{orig}} = [v_0, v_1, \\dots, v_k]$ with distance $D_{\\text{orig}}$.
2. **User Confirmation:** When the user arrives at node $v_i$, they confirm their current location.
3. **Distance Travelled ($D_{\\text{travelled}}$):** Sum of confirmed corridor edge weights walked along the path:
   $$D_{\\text{travelled}} = \\sum_{j=0}^{i-1} \\text{weight}(v_j, v_{j+1})$$
4. **Progress Percentage:**
   $$\\text{Progress } \\% = \\min\\left(100\\%, \\left(\\frac{D_{\\text{travelled}}}{D_{\\text{orig}}}\\right) \\times 100\\right)$$
5. **Remaining Distance & Time:** Recalculated by running Dijkstra from current confirmed position to destination:
   $$T_{\\text{remaining}} = \\frac{D_{\\text{remaining}}}{\\text{walking speed (e.g. } 1.2 \\text{ m/s)}}$$
6. **Deviation Handling:** If a user confirms a location outside the planned route, a deviation alert is triggered, actual travelled distance is preserved, and a new optimal route is generated without invalid double-counting.`,
  },

  cppCode: {
    title: '9. Standalone C++ (DSA Implementation)',
    content: `A complete, standalone C++ program implementing the Weighted Adjacency List, Binary Min-Heap Priority Queue, and Dijkstra's Algorithm for our CSD 4th floor is located at:

📁 **\`csd_navigator.cpp\`** (Project Root)
📁 **\`cpp/csd_navigator.cpp\`**

**How to compile and run in terminal / IDE:**
\`\`\`bash
# Compile using g++
g++ -O2 csd_navigator.cpp -o csd_navigator.exe

# Run the interactive CLI
.\\csd_navigator.exe
\`\`\`

**Key Features of the C++ Code:**
1. **Custom \`MinHeap\` class:** Complete binary heap with \`bubbleUp\` and \`sinkDown\` operations.
2. **\`Graph\` class:** Adjacency list storing all 23 nodes (11 rooms + 12 corridor junctions) and sketch edge weights.
3. **\`runDijkstra()\`:** Priority queue relaxation with predecessor back-pointers.
4. **Interactive Console Menu:** Select start/end points, view adjacency list, and run all 9 verification tests.`,
  },
};
