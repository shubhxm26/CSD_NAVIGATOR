import { MinHeap } from './MinHeap.js';

/**
 * Dijkstra's Shortest Path Algorithm Implementation.
 * 
 * Computes the minimum walking distance path between startNode and endNode
 * using a binary min-priority queue and predecessor pointer tracking.
 *
 * @param {Graph} graph - Instance of Graph
 * @param {string} startNode - ID of the origin vertex
 * @param {string} endNode - ID of the destination vertex
 * @returns {Object} Result object containing path, distance, predecessor map, and execution trace
 */
export function dijkstra(graph, startNode, endNode) {
  // Input validation
  const allVertices = graph.getAllVertices().map((v) => v.id);
  
  if (!startNode || !allVertices.includes(startNode)) {
    return {
      success: false,
      error: `Invalid or unselected starting location: "${startNode}"`,
      path: [],
      distance: Infinity,
      steps: [],
      distances: {},
      predecessors: {},
    };
  }

  if (!endNode || !allVertices.includes(endNode)) {
    return {
      success: false,
      error: `Invalid or unselected destination location: "${endNode}"`,
      path: [],
      distance: Infinity,
      steps: [],
      distances: {},
      predecessors: {},
    };
  }

  // Edge case: Starting location is identical to destination
  if (startNode === endNode) {
    const distances = {};
    allVertices.forEach((v) => (distances[v] = v === startNode ? 0 : Infinity));
    return {
      success: true,
      path: [startNode],
      distance: 0,
      steps: [
        {
          stepNumber: 1,
          description: `Starting location and destination are identical (${startNode}). Distance is 0m.`,
          current: startNode,
          currentDist: 0,
          heapSnapshot: [],
          distances: { ...distances },
          predecessors: { [startNode]: null },
        },
      ],
      distances,
      predecessors: { [startNode]: null },
    };
  }

  // 1. Initialization
  const distances = {};
  const predecessors = {};
  const visited = new Set();
  const steps = [];

  for (const vertex of allVertices) {
    distances[vertex] = Infinity;
    predecessors[vertex] = null;
  }
  distances[startNode] = 0;

  // 2. Initialize Min-Priority Queue
  const minHeap = new MinHeap((a, b) => a.distance - b.distance);
  minHeap.push({ node: startNode, distance: 0 });

  let stepCounter = 1;
  let destinationReached = false;

  // 3. Execution Loop
  while (!minHeap.isEmpty()) {
    const { node: current, distance: currentDist } = minHeap.pop();

    // Skip if we already finalized this vertex with a smaller distance
    if (visited.has(current)) continue;
    visited.add(current);

    // Record step for DSA inspector
    const stepRecord = {
      stepNumber: stepCounter++,
      current,
      currentDist,
      visitedCount: visited.size,
      heapSnapshot: minHeap.toArray(),
      relaxedEdges: [],
      distances: { ...distances },
      predecessors: { ...predecessors },
    };

    // Optimization: Stop if destination is extracted
    if (current === endNode) {
      destinationReached = true;
      stepRecord.description = `Destination "${endNode}" reached with finalized shortest distance: ${currentDist.toFixed(1)} m.`;
      steps.push(stepRecord);
      break;
    }

    // 4. Relax adjacent edges
    const neighbors = graph.getNeighbors(current);
    for (const edge of neighbors) {
      const neighbor = edge.node;
      const weight = edge.distance;

      if (!visited.has(neighbor)) {
        const candidateDistance = currentDist + weight;

        if (candidateDistance < distances[neighbor]) {
          const oldDist = distances[neighbor];
          distances[neighbor] = candidateDistance;
          predecessors[neighbor] = current;
          minHeap.push({ node: neighbor, distance: candidateDistance });

          stepRecord.relaxedEdges.push({
            neighbor,
            weight,
            oldDist: oldDist === Infinity ? '∞' : oldDist.toFixed(1),
            newDist: candidateDistance.toFixed(1),
            relaxed: true,
          });
        } else {
          stepRecord.relaxedEdges.push({
            neighbor,
            weight,
            oldDist: distances[neighbor].toFixed(1),
            newDist: candidateDistance.toFixed(1),
            relaxed: false,
          });
        }
      }
    }

    stepRecord.description = `Popped "${current}" (dist: ${currentDist.toFixed(1)}m). Evaluated ${neighbors.length} neighbors.`;
    steps.push(stepRecord);
  }

  // 5. Unreachable Destination handling
  if (distances[endNode] === Infinity) {
    return {
      success: false,
      error: `Destination "${endNode}" is unreachable from "${startNode}". No walkable path exists.`,
      path: [],
      distance: Infinity,
      steps,
      distances,
      predecessors,
    };
  }

  // 6. Path Reconstruction using Predecessor information
  const path = [];
  let curr = endNode;
  while (curr !== null) {
    path.unshift(curr);
    curr = predecessors[curr];
  }

  return {
    success: true,
    path,
    distance: parseFloat(distances[endNode].toFixed(2)),
    steps,
    distances,
    predecessors,
  };
}

/**
 * Generate human-friendly step-by-step turn-by-turn navigation instructions.
 */
export function generateStepDirections(graph, path) {
  if (!path || path.length <= 1) return [];

  const directions = [];

  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const fromVertex = graph.getVertex(fromId);
    const toVertex = graph.getVertex(toId);
    const edgeDist = graph.getEdgeWeight(fromId, toId);

    let instruction = '';
    let icon = 'straight';

    if (fromVertex.isRoom && !toVertex.isRoom) {
      instruction = `Exit ${fromVertex.name} into the corridor`;
      icon = 'door-open';
    } else if (!fromVertex.isRoom && toVertex.isRoom) {
      instruction = `Enter ${toVertex.name}`;
      icon = 'door-closed';
    } else {
      // Determine walking direction by coordinates
      const dx = toVertex.x - fromVertex.x;
      const dy = toVertex.y - fromVertex.y;

      let compass = 'forward';
      if (Math.abs(dx) > Math.abs(dy)) {
        compass = dx > 0 ? 'East (right)' : 'West (left)';
      } else {
        compass = dy > 0 ? 'South (down)' : 'North (up)';
      }

      instruction = `Walk ${compass} along corridor towards ${toVertex.name}`;
      icon = dx > 0 ? 'arrow-right' : dx < 0 ? 'arrow-left' : dy > 0 ? 'arrow-down' : 'arrow-up';
    }

    directions.push({
      stepNumber: i + 1,
      from: fromVertex ? fromVertex.name : fromId,
      to: toVertex ? toVertex.name : toId,
      distance: edgeDist,
      instruction,
      icon,
    });
  }

  return directions;
}
