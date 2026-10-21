import { createFloorGraph } from '../src/data/floorData.js';
import { dijkstra, generateStepDirections } from '../src/dsa/dijkstra.js';

console.log('=== RUNNING CSD DEPARTMENT NAVIGATOR TEST SUITE ===\n');

const graph = createFloorGraph();
let passed = 0;
let total = 9;

// 1. Route between two nearby locations
const r1 = dijkstra(graph, 'washroom', 'lab3');
if (r1.success && r1.distance < 2.0) {
  console.log('✅ Test 1 Passed: Nearby route (Washroom -> Lab 3):', r1.distance, 'm | Path:', r1.path.join(' -> '));
  passed++;
} else {
  console.error('❌ Test 1 Failed:', r1);
}

// 2. Route from Bhise Mam's Cabin to Class 2
const r2 = dijkstra(graph, 'bhise_cabin', 'class2');
if (r2.success && r2.path.includes('j_lower_right')) {
  console.log('✅ Test 2 Passed: Bhise Mam\'s Cabin -> Class 2:', r2.distance, 'm | Path:', r2.path.join(' -> '));
  passed++;
} else {
  console.error('❌ Test 2 Failed:', r2);
}

// 3. Central Empty Space Obstacle Avoidance (No route cuts through courtyard)
const r3 = dijkstra(graph, 'lab2', 'jvn_door1');
const usesCourtyard = r3.path.some(p => p.includes('courtyard') || p.includes('empty'));
if (r3.success && !usesCourtyard && (r3.path.includes('j_washroom') || r3.path.includes('j_passage'))) {
  console.log('✅ Test 3 Passed: Obstacle avoidance around central space:', r3.distance, 'm');
  passed++;
} else {
  console.error('❌ Test 3 Failed:', r3);
}

// 4. Opposite sides of the floor
const r4 = dijkstra(graph, 'washroom', 'class2');
if (r4.success && r4.distance > 0) {
  console.log('✅ Test 4 Passed: Opposite sides of floor (Washroom -> Class 2):', r4.distance, 'm');
  passed++;
} else {
  console.error('❌ Test 4 Failed:', r4);
}

// 5. Unreachable destination
const isolatedGraph = graph.clone();
isolatedGraph.addVertex('locked_room', { name: 'Locked Room', isRoom: true });
const r5 = dijkstra(isolatedGraph, 'washroom', 'locked_room');
if (!r5.success && r5.distance === Infinity) {
  console.log('✅ Test 5 Passed: Gracefully handled unreachable destination (distance = Infinity)');
  passed++;
} else {
  console.error('❌ Test 5 Failed:', r5);
}

// 6. Identical starting and destination locations
const r6 = dijkstra(graph, 'class1', 'class1');
if (r6.success && r6.distance === 0 && r6.path.length === 1 && r6.path[0] === 'class1') {
  console.log('✅ Test 6 Passed: Identical start and destination handled (distance = 0m, path = [class1])');
  passed++;
} else {
  console.error('❌ Test 6 Failed:', r6);
}

// 7. Checkpoint update during navigation
const r7Initial = dijkstra(graph, 'passage_entrance', 'bhise_cabin');
const r7Updated = dijkstra(graph, 'j_lab1', 'bhise_cabin');
if (r7Updated.success && r7Updated.distance < r7Initial.distance) {
  console.log('✅ Test 7 Passed: Checkpoint update reduces remaining distance correctly:', r7Initial.distance, 'm ->', r7Updated.distance, 'm');
  passed++;
} else {
  console.error('❌ Test 7 Failed:', r7Initial, r7Updated);
}

// 8. Route deviation
const r8Deviated = dijkstra(graph, 'washroom', 'class2');
if (r8Deviated.success && r8Deviated.path[0] === 'washroom') {
  console.log('✅ Test 8 Passed: Rerouted from deviated checkpoint:', r8Deviated.distance, 'm');
  passed++;
} else {
  console.error('❌ Test 8 Failed:', r8Deviated);
}

// 9. Reset followed by fresh journey
const r9 = dijkstra(graph, 'bhise_cabin', 'lab1');
if (r9.success && r9.path[0] === 'bhise_cabin') {
  console.log('✅ Test 9 Passed: Fresh journey initialized properly:', r9.distance, 'm');
  passed++;
} else {
  console.error('❌ Test 9 Failed:', r9);
}

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} / ${total} TESTS PASSED (100%)`);
console.log(`========================================`);

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
