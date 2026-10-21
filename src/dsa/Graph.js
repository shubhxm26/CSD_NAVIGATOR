/**
 * Weighted Graph implementation using an Adjacency List.
 * Represents corridor junctions and rooms on CSD Department 4th Floor.
 */
export class Graph {
  constructor() {
    // Map of vertexId -> Array of { node: string, distance: number, edgeId: string }
    this.adjacencyList = new Map();
    // Map of vertexId -> metadata { id, name, type, x, y, isRoom }
    this.vertices = new Map();
    // Map of edgeId -> { from, to, distance, description, isProvisional }
    this.edges = new Map();
  }

  /**
   * Add a vertex with metadata to the graph
   */
  addVertex(id, metadata = {}) {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
      this.vertices.set(id, { id, ...metadata });
    }
  }

  /**
   * Add an edge between two vertices. By default bidirectional (undirected graph).
   */
  addEdge(u, v, distance, bidirectional = true, metadata = {}) {
    if (!this.adjacencyList.has(u)) this.addVertex(u);
    if (!this.adjacencyList.has(v)) this.addVertex(v);

    const edgeId = metadata.edgeId || `${u}__${v}`;

    // Avoid duplicate edges in adjacency list
    const existingU = this.adjacencyList.get(u).find((e) => e.node === v);
    if (existingU) {
      existingU.distance = distance;
    } else {
      this.adjacencyList.get(u).push({ node: v, distance, edgeId, ...metadata });
    }

    if (bidirectional) {
      const existingV = this.adjacencyList.get(v).find((e) => e.node === u);
      if (existingV) {
        existingV.distance = distance;
      } else {
        this.adjacencyList.get(v).push({ node: u, distance, edgeId, ...metadata });
      }
    }

    this.edges.set(edgeId, {
      id: edgeId,
      from: u,
      to: v,
      distance,
      bidirectional,
      ...metadata,
    });
  }

  /**
   * Update weight of an existing edge
   */
  updateEdgeWeight(u, v, newDistance) {
    const listU = this.adjacencyList.get(u);
    if (listU) {
      const edge = listU.find((e) => e.node === v);
      if (edge) edge.distance = newDistance;
    }

    const listV = this.adjacencyList.get(v);
    if (listV) {
      const edge = listV.find((e) => e.node === u);
      if (edge) edge.distance = newDistance;
    }

    // Update in edges map
    const forwardId = `${u}__${v}`;
    const reverseId = `${v}__${u}`;
    if (this.edges.has(forwardId)) {
      this.edges.get(forwardId).distance = newDistance;
    } else if (this.edges.has(reverseId)) {
      this.edges.get(reverseId).distance = newDistance;
    }
  }

  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }

  getVertex(vertexId) {
    return this.vertices.get(vertexId);
  }

  getAllVertices() {
    return Array.from(this.vertices.values());
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }

  getEdgeWeight(u, v) {
    const neighbors = this.getNeighbors(u);
    const target = neighbors.find((n) => n.node === v);
    return target ? target.distance : Infinity;
  }

  /**
   * Returns a plain JavaScript object representing the Adjacency List
   * for educational inspection and academic explanation.
   */
  toAdjacencyListObject() {
    const obj = {};
    for (const [vertex, neighbors] of this.adjacencyList.entries()) {
      obj[vertex] = neighbors.map((n) => ({
        node: n.node,
        distance: n.distance,
      }));
    }
    return obj;
  }

  /**
   * Clone the graph for simulation or temporary blockage tests
   */
  clone() {
    const newGraph = new Graph();
    for (const [id, meta] of this.vertices.entries()) {
      newGraph.addVertex(id, { ...meta });
    }
    for (const edge of this.edges.values()) {
      newGraph.addEdge(edge.from, edge.to, edge.distance, edge.bidirectional, { ...edge });
    }
    return newGraph;
  }
}
