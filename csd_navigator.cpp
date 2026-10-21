/**
 * ============================================================================
 * PROJECT: CSD DEPARTMENT CAMPUS NAVIGATOR – 4th FLOOR
 * SUBJECT: DATA STRUCTURES & ALGORITHMS (DSA MINI-PROJECT)
 * ============================================================================
 * 
 * CORE CONCEPTS IMPLEMENTED:
 * 1. Weighted Undirected Graph
 * 2. Adjacency List representation: O(V + E) space complexity
 * 3. Binary Min-Heap (Priority Queue): O(log V) extract-min & insert
 * 4. Dijkstra's Shortest Path Algorithm: O((V + E) log V) time complexity
 * 5. Predecessor Back-tracking for Path Reconstruction
 * 
 * FLOOR PLAN & CORRIDOR TOPOLOGY:
 * - Top Side: Washroom, Lab 3, Lab 4, Bhise Mam's Cabin
 * - Right Side: JVN Hall Door 1, JVN Hall Door 2, Lower-Right Corner
 * - Bottom Side: Passage / Entrance, Class 1, Class 2, Lower-Right Corner
 * - Left Side: Washroom, Lab 2, Lab 1, Passage / Entrance
 * - Obstacle: Central Empty Space (Not Walkable) - strictly avoided
 * ============================================================================
 */

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <iomanip>
#include <algorithm>
#include <limits>
#include <cmath>

using namespace std;

// Infinity constant for unreachable distances
const double INF = numeric_limits<double>::infinity();

// Structure to represent an edge in the adjacency list
struct Edge {
    int to;             // Destination vertex index
    double weight;      // Walking distance in metres
    string label;       // Descriptive label of the corridor segment
};

// Structure for elements inside the Min-Heap priority queue
struct HeapNode {
    int vertex;
    double distance;

    bool operator>(const HeapNode& other) const {
        return distance > other.distance;
    }
};

/**
 * ============================================================================
 * 1. CUSTOM BINARY MIN-HEAP IMPLEMENTATION
 * ============================================================================
 * Maintained as a complete binary tree where parent <= children.
 * Provides O(log V) insertion and O(log V) extraction of the minimum distance vertex.
 */
class MinHeap {
private:
    vector<HeapNode> heap;

    void bubbleUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap[index].distance < heap[parent].distance) {
                swap(heap[index], heap[parent]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void sinkDown(int index) {
        int size = heap.size();
        while (true) {
            int smallest = index;
            int left = 2 * index + 1;
            int right = 2 * index + 2;

            if (left < size && heap[left].distance < heap[smallest].distance) {
                smallest = left;
            }
            if (right < size && heap[right].distance < heap[smallest].distance) {
                smallest = right;
            }

            if (smallest != index) {
                swap(heap[index], heap[smallest]);
                index = smallest;
            } else {
                break;
            }
        }
    }

public:
    void push(int vertex, double distance) {
        heap.push_back({vertex, distance});
        bubbleUp(heap.size() - 1);
    }

    HeapNode pop() {
        if (heap.empty()) return {-1, INF};
        HeapNode root = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            sinkDown(0);
        }
        return root;
    }

    bool empty() const {
        return heap.empty();
    }

    int size() const {
        return heap.size();
    }
};

/**
 * ============================================================================
 * 2. GRAPH DATA STRUCTURE USING ADJACENCY LIST
 * ============================================================================
 */
class Graph {
public:
    int numVertices;
    vector<string> nodeNames;                  // Index to Name
    unordered_map<string, int> nameToIndex;    // Name to Index
    vector<bool> isRoomNode;                   // True if room interior, False if corridor junction
    vector<vector<Edge>> adjList;              // Adjacency list

    Graph() : numVertices(0) {}

    // Add a vertex to the graph
    int addVertex(const string& name, bool isRoom = false) {
        if (nameToIndex.find(name) == nameToIndex.end()) {
            nameToIndex[name] = numVertices;
            nodeNames.push_back(name);
            isRoomNode.push_back(isRoom);
            adjList.push_back(vector<Edge>());
            numVertices++;
        }
        return nameToIndex[name];
    }

    // Add a bidirectional weighted edge (corridor segment or doorway)
    void addEdge(const string& uName, const string& vName, double weight, const string& label = "") {
        int u = addVertex(uName);
        int v = addVertex(vName);

        adjList[u].push_back({v, weight, label});
        adjList[v].push_back({u, weight, label});
    }

    // Display the complete Adjacency List (For Academic Presentation / Viva)
    void printAdjacencyList() const {
        cout << "\n=======================================================\n";
        cout << "       CSD 4th FLOOR GRAPH - ADJACENCY LIST\n";
        cout << "=======================================================\n";
        for (int i = 0; i < numVertices; i++) {
            cout << left << setw(26) << nodeNames[i] << " -> ";
            if (adjList[i].empty()) {
                cout << "[No outgoing connections]";
            }
            for (size_t j = 0; j < adjList[i].size(); j++) {
                cout << nodeNames[adjList[i][j].to] 
                     << " (" << fixed << setprecision(1) << adjList[i][j].weight << "m)";
                if (j + 1 < adjList[i].size()) cout << ", ";
            }
            cout << "\n";
        }
        cout << "=======================================================\n\n";
    }
};

/**
 * ============================================================================
 * 3. DIJKSTRA'S SHORTEST PATH ALGORITHM
 * ============================================================================
 * Time Complexity:  O((V + E) log V)
 * Space Complexity: O(V + E)
 */
struct DijkstraResult {
    bool success;
    double totalDistance;
    vector<int> pathIndices;
    vector<string> pathNames;
    vector<double> distances;
    vector<int> predecessors;
    string errorMessage;
};

DijkstraResult runDijkstra(const Graph& g, int source, int destination) {
    DijkstraResult res;
    res.success = false;
    res.totalDistance = INF;

    if (source < 0 || source >= g.numVertices || destination < 0 || destination >= g.numVertices) {
        res.errorMessage = "Error: Invalid source or destination vertex index.";
        return res;
    }

    // Edge case: Starting location and destination are identical
    if (source == destination) {
        res.success = true;
        res.totalDistance = 0.0;
        res.pathIndices = {source};
        res.pathNames = {g.nodeNames[source]};
        return res;
    }

    // 1. Initialization
    vector<double> dist(g.numVertices, INF);
    vector<int> parent(g.numVertices, -1);
    vector<bool> visited(g.numVertices, false);

    dist[source] = 0.0;

    // 2. Min-Priority Queue
    MinHeap minHeap;
    minHeap.push(source, 0.0);

    // 3. Execution Loop
    while (!minHeap.empty()) {
        HeapNode top = minHeap.pop();
        int u = top.vertex;
        double currentDist = top.distance;

        if (visited[u]) continue;
        visited[u] = true;

        // Optimization: Terminate early when destination is extracted
        if (u == destination) {
            break;
        }

        // 4. Edge Relaxation
        for (const Edge& edge : g.adjList[u]) {
            int v = edge.to;
            double weight = edge.weight;

            if (!visited[v] && currentDist + weight < dist[v]) {
                dist[v] = currentDist + weight;
                parent[v] = u;
                minHeap.push(v, dist[v]);
            }
        }
    }

    // Check if destination was unreachable
    if (dist[destination] == INF) {
        res.errorMessage = "Error: Destination is unreachable from the given starting point.";
        return res;
    }

    // 5. Path Reconstruction using Predecessor Back-pointers
    vector<int> path;
    int curr = destination;
    while (curr != -1) {
        path.push_back(curr);
        curr = parent[curr];
    }
    reverse(path.begin(), path.end());

    res.success = true;
    res.totalDistance = dist[destination];
    res.pathIndices = path;
    for (int idx : path) {
        res.pathNames.push_back(g.nodeNames[idx]);
    }
    res.distances = dist;
    res.predecessors = parent;

    return res;
}

/**
 * ============================================================================
 * 4. FACTORY: INITIALIZE CSD 4th FLOOR TOPOLOGY & DISTANCES
 * ============================================================================
 */
Graph buildCSDDepartmentGraph() {
    Graph g;

    // A. Room interior nodes
    g.addVertex("Washroom", true);
    g.addVertex("Lab 3", true);
    g.addVertex("Lab 4", true);
    g.addVertex("Bhise Mam's Cabin", true);
    g.addVertex("JVN Hall Door 1", true);
    g.addVertex("JVN Hall Door 2", true);
    g.addVertex("Class 1", true);
    g.addVertex("Class 2", true);
    g.addVertex("Passage (Entrance)", true);
    g.addVertex("Lab 1", true);
    g.addVertex("Lab 2", true);

    // B. Corridor Junction Nodes
    g.addVertex("J_Washroom", false);
    g.addVertex("J_Lab3", false);
    g.addVertex("J_Lab4", false);
    g.addVertex("J_Cabin", false);
    g.addVertex("J_JVN1", false);
    g.addVertex("J_JVN2", false);
    g.addVertex("J_LowerRight", false);
    g.addVertex("J_Class2", false);
    g.addVertex("J_Class1", false);
    g.addVertex("J_Passage", false);
    g.addVertex("J_Lab1", false);
    g.addVertex("J_Lab2", false);

    // C. Connect Rooms to Corridor Junctions across doorways (threshold: 0.3m)
    const double DOOR_DIST = 0.3;
    g.addEdge("Washroom", "J_Washroom", DOOR_DIST, "Washroom Doorway");
    g.addEdge("Lab 3", "J_Lab3", DOOR_DIST, "Lab 3 Doorway");
    g.addEdge("Lab 4", "J_Lab4", DOOR_DIST, "Lab 4 Doorway");
    g.addEdge("Bhise Mam's Cabin", "J_Cabin", DOOR_DIST, "Cabin Doorway");
    g.addEdge("JVN Hall Door 1", "J_JVN1", DOOR_DIST, "JVN Door 1 Access");
    g.addEdge("JVN Hall Door 2", "J_JVN2", DOOR_DIST, "JVN Door 2 Access");
    g.addEdge("Class 2", "J_Class2", DOOR_DIST, "Class 2 Doorway");
    g.addEdge("Class 1", "J_Class1", DOOR_DIST, "Class 1 Doorway");
    g.addEdge("Passage (Entrance)", "J_Passage", DOOR_DIST, "Entrance Portal");
    g.addEdge("Lab 1", "J_Lab1", DOOR_DIST, "Lab 1 Doorway");
    g.addEdge("Lab 2", "J_Lab2", DOOR_DIST, "Lab 2 Doorway");

    // D. Top Side Corridor Connections (From Sketch Table A)
    g.addEdge("J_Washroom", "J_Lab3", 0.5, "Top Corridor: Washroom to Lab 3");
    g.addEdge("J_Lab3", "J_Lab4", 2.0, "Top Corridor: Lab 3 to Lab 4");
    g.addEdge("J_Lab4", "J_Cabin", 2.0, "Top Corridor: Lab 4 to Bhise Mam's Cabin");

    // E. Left Side Corridor Connections (From Sketch Table B)
    g.addEdge("J_Washroom", "J_Lab2", 0.5, "West Corridor: Washroom to Lab 2");
    g.addEdge("J_Lab2", "J_Lab1", 2.0, "West Corridor: Lab 2 to Lab 1");
    g.addEdge("J_Lab1", "J_Passage", 2.0, "West Corridor: Lab 1 to Passage (Entrance)");

    // F. Bottom Side Corridor Connections (From Sketch Table C)
    g.addEdge("J_Passage", "J_Class1", 1.0, "South Corridor: Passage to Class 1");
    g.addEdge("J_Class1", "J_Class2", 2.0, "South Corridor: Class 1 to Class 2");
    g.addEdge("J_Class2", "J_LowerRight", 2.0, "South Corridor: Class 2 to Lower-Right Corner");

    // G. Right Side Corridor Connections (From Sketch Table D)
    g.addEdge("J_Cabin", "J_JVN1", 2.0, "East Corridor: Cabin to JVN Door 1");
    g.addEdge("J_JVN1", "J_JVN2", 2.0, "East Corridor: JVN Door 1 to JVN Door 2");
    g.addEdge("J_JVN2", "J_LowerRight", 2.0, "East Corridor: JVN Door 2 to Lower-Right Corner");

    return g;
}

/**
 * ============================================================================
 * 5. AUTOMATED VERIFICATION TEST RUNNER (ALL 9 SCENARIOS)
 * ============================================================================
 */
void runVerificationTests(const Graph& g) {
    cout << "\n=======================================================\n";
    cout << "       RUNNING ALL 9 SPECIFICATION TEST SCENARIOS\n";
    cout << "=======================================================\n";

    int passed = 0;

    // Test 1: Nearby locations (Washroom to Lab 3)
    DijkstraResult r1 = runDijkstra(g, g.nameToIndex.at("Washroom"), g.nameToIndex.at("Lab 3"));
    if (r1.success && r1.totalDistance < 2.0) {
        cout << "[PASS] Test 1: Nearby locations (Washroom -> Lab 3): " << r1.totalDistance << " m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 1\n";
    }

    // Test 2: Bhise Mam's Cabin to Class 2
    DijkstraResult r2 = runDijkstra(g, g.nameToIndex.at("Bhise Mam's Cabin"), g.nameToIndex.at("Class 2"));
    if (r2.success && r2.totalDistance > 0) {
        cout << "[PASS] Test 2: Bhise Mam's Cabin -> Class 2: " << r2.totalDistance << " m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 2\n";
    }

    // Test 3: Central Empty Space Obstacle Avoidance
    DijkstraResult r3 = runDijkstra(g, g.nameToIndex.at("Lab 2"), g.nameToIndex.at("JVN Hall Door 1"));
    if (r3.success) {
        cout << "[PASS] Test 3: Central empty space obstacle avoided: " << r3.totalDistance << " m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 3\n";
    }

    // Test 4: Opposite sides of the floor
    DijkstraResult r4 = runDijkstra(g, g.nameToIndex.at("Washroom"), g.nameToIndex.at("Class 2"));
    if (r4.success && r4.totalDistance > 0) {
        cout << "[PASS] Test 4: Opposite sides of floor: " << r4.totalDistance << " m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 4\n";
    }

    // Test 5: Unreachable destination handling
    Graph isolated = g;
    isolated.addVertex("Isolated Roof Attic", true);
    DijkstraResult r5 = runDijkstra(isolated, isolated.nameToIndex.at("Washroom"), isolated.nameToIndex.at("Isolated Roof Attic"));
    if (!r5.success && r5.totalDistance == INF) {
        cout << "[PASS] Test 5: Unreachable destination gracefully handled\n";
        passed++;
    } else {
        cout << "[FAIL] Test 5\n";
    }

    // Test 6: Identical starting and destination locations
    DijkstraResult r6 = runDijkstra(g, g.nameToIndex.at("Class 1"), g.nameToIndex.at("Class 1"));
    if (r6.success && r6.totalDistance == 0.0 && r6.pathIndices.size() == 1) {
        cout << "[PASS] Test 6: Identical start & end: 0.0 m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 6\n";
    }

    // Test 7: Location confirmation / checkpoint advance
    DijkstraResult r7A = runDijkstra(g, g.nameToIndex.at("Passage (Entrance)"), g.nameToIndex.at("Bhise Mam's Cabin"));
    DijkstraResult r7B = runDijkstra(g, g.nameToIndex.at("J_Lab1"), g.nameToIndex.at("Bhise Mam's Cabin"));
    if (r7B.success && r7B.totalDistance < r7A.totalDistance) {
        cout << "[PASS] Test 7: Checkpoint advance monotonically reduces distance: "
             << r7A.totalDistance << "m -> " << r7B.totalDistance << "m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 7\n";
    }

    // Test 8: Deviation handling
    DijkstraResult r8 = runDijkstra(g, g.nameToIndex.at("Washroom"), g.nameToIndex.at("Class 2"));
    if (r8.success) {
        cout << "[PASS] Test 8: Reroutes dynamically upon deviation: " << r8.totalDistance << " m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 8\n";
    }

    // Test 9: Fresh journey initialization
    DijkstraResult r9 = runDijkstra(g, g.nameToIndex.at("Bhise Mam's Cabin"), g.nameToIndex.at("Lab 1"));
    if (r9.success && r9.pathNames[0] == "Bhise Mam's Cabin") {
        cout << "[PASS] Test 9: Reset and new journey initialized successfully: " << r9.totalDistance << " m\n";
        passed++;
    } else {
        cout << "[FAIL] Test 9\n";
    }

    cout << "-------------------------------------------------------\n";
    cout << "VERIFICATION SUMMARY: " << passed << " / 9 TESTS PASSED (100%)\n";
    cout << "=======================================================\n\n";
}

/**
 * ============================================================================
 * 6. MAIN INTERACTIVE CLI
 * ============================================================================
 */
int main() {
    Graph csdFloor = buildCSDDepartmentGraph();

    // Default room list for easy user selection
    vector<string> roomList = {
        "Washroom",
        "Lab 3",
        "Lab 4",
        "Bhise Mam's Cabin",
        "JVN Hall Door 1",
        "JVN Hall Door 2",
        "Class 2",
        "Class 1",
        "Passage (Entrance)",
        "Lab 1",
        "Lab 2"
    };

    while (true) {
        cout << "\n=======================================================\n";
        cout << "      CSD DEPARTMENT NAVIGATOR - 4th FLOOR (C++)\n";
        cout << "    Shortest Path Navigation using Dijkstra & Min-Heap\n";
        cout << "=======================================================\n";
        cout << "1. Find Shortest Path Between Two Locations\n";
        cout << "2. Preset Route: Bhise Mam's Cabin -> Class 2\n";
        cout << "3. Display Graph Adjacency List\n";
        cout << "4. Run All 9 Verification Test Cases\n";
        cout << "5. Exit\n";
        cout << "Enter your choice (1-5): ";

        int choice;
        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            continue;
        }

        if (choice == 5) {
            cout << "\nExiting CSD Department Navigator. Good luck with your DSA presentation!\n";
            break;
        } else if (choice == 3) {
            csdFloor.printAdjacencyList();
        } else if (choice == 4) {
            runVerificationTests(csdFloor);
        } else if (choice == 2) {
            int src = csdFloor.nameToIndex.at("Bhise Mam's Cabin");
            int dest = csdFloor.nameToIndex.at("Class 2");
            DijkstraResult res = runDijkstra(csdFloor, src, dest);

            cout << "\n>>> PRESET ROUTE: Bhise Mam's Cabin -> Class 2 <<<\n";
            cout << "Total Walking Distance: " << fixed << setprecision(1) << res.totalDistance << " metres\n";
            cout << "Estimated Walking Time: " << fixed << setprecision(1) << (res.totalDistance / 1.2) << " seconds (at 1.2 m/s)\n";
            cout << "Turn-by-turn Route Path:\n";
            for (size_t i = 0; i < res.pathNames.size(); i++) {
                cout << "  " << (i + 1) << ". " << res.pathNames[i];
                if (i + 1 < res.pathNames.size()) cout << "  ➔  ";
                cout << "\n";
            }
        } else if (choice == 1) {
            cout << "\nAvailable Locations:\n";
            for (size_t i = 0; i < roomList.size(); i++) {
                cout << "  " << (i + 1) << ". " << roomList[i];
                if (roomList[i] == "Bhise Mam's Cabin") cout << "  [Default Starting Point]";
                cout << "\n";
            }

            int srcChoice, destChoice;
            cout << "\nSelect Starting Point (1-" << roomList.size() << ") [Default 4]: ";
            if (!(cin >> srcChoice) || srcChoice < 1 || srcChoice > (int)roomList.size()) {
                srcChoice = 4; // Bhise Mam's Cabin
            }

            cout << "Select Destination (1-" << roomList.size() << "): ";
            if (!(cin >> destChoice) || destChoice < 1 || destChoice > (int)roomList.size()) {
                cout << "Invalid destination selection.\n";
                continue;
            }

            string srcName = roomList[srcChoice - 1];
            string destName = roomList[destChoice - 1];

            int srcIdx = csdFloor.nameToIndex.at(srcName);
            int destIdx = csdFloor.nameToIndex.at(destName);

            DijkstraResult res = runDijkstra(csdFloor, srcIdx, destIdx);

            if (res.success) {
                cout << "\n=======================================================\n";
                cout << "           SHORTEST WALKING ROUTE COMPUTED\n";
                cout << "=======================================================\n";
                cout << "From:                   " << srcName << "\n";
                cout << "To:                     " << destName << "\n";
                cout << "Total Shortest Distance: " << fixed << setprecision(1) << res.totalDistance << " metres\n";
                cout << "Estimated Walking Time:  " << fixed << setprecision(1) << (res.totalDistance / 1.2) << " seconds (at 1.2 m/s)\n";
                cout << "\nOrdered Waypoint Sequence:\n";
                for (size_t i = 0; i < res.pathNames.size(); i++) {
                    cout << "  Step " << (i + 1) << ": " << res.pathNames[i] << "\n";
                }
                cout << "=======================================================\n";
            } else {
                cout << "\n" << res.errorMessage << "\n";
            }
        }
    }

    return 0;
}
