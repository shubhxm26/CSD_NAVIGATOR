/**
 * CSD Department - 4th Floor Data & Layout Geometry
 * Faithfully follows the floor plan and distance sketch.
 */

// Visual styling constants matching the reference image's color scheme
export const CATEGORY_COLORS = {
  Classroom: {
    fill: '#ddd6fe',
    stroke: '#7c3aed',
    text: '#4c1d95',
    badge: 'bg-violet-100 text-violet-800 border-violet-300',
  },
  Laboratory: {
    fill: '#bbf7d0',
    stroke: '#16a34a',
    text: '#14532d',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  FacultyCabin: {
    fill: '#fbcfe8',
    stroke: '#db2777',
    text: '#831843',
    badge: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  HallDoor: {
    fill: '#fef08a',
    stroke: '#ca8a04',
    text: '#713f12',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  Passage: {
    fill: '#e0e7ff',
    stroke: '#4f46e5',
    text: '#312e81',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  Washroom: {
    fill: '#bae6fd',
    stroke: '#0284c7',
    text: '#0c4a6e',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  Corridor: {
    fill: '#f8fafc',
    stroke: '#cbd5e1',
    line: '#94a3b8',
  },
  CentralEmptySpace: {
    fill: '#f1f5f9',
    stroke: '#94a3b8',
    text: '#475569',
  },
};

/**
 * Floor Map Dimensions (SVG viewBox)
 */
export const MAP_DIMENSIONS = {
  width: 1040,
  height: 640,
  padding: 30,
};

/**
 * Central Empty Space (Obstacle - Not Walkable)
 */
export const CENTRAL_EMPTY_SPACE = {
  x: 215,
  y: 195,
  width: 535,
  height: 250,
  label: 'Central Empty Space',
  sublabel: '(Not Walkable)',
};

/**
 * Department Rooms & Entrances
 */
export const ROOMS_DATA = [
  // --- TOP ROW ---
  {
    id: 'washroom',
    name: 'Washroom',
    category: 'Washroom',
    x: 45,
    y: 35,
    width: 135,
    height: 90,
    door: { x: 112, y: 125, width: 24, height: 8, orientation: 'bottom' },
    junctionId: 'j_washroom',
    description: 'Department Washroom (North-West corner)',
  },
  {
    id: 'lab3',
    name: 'Lab 3',
    category: 'Laboratory',
    x: 220,
    y: 35,
    width: 145,
    height: 90,
    door: { x: 292, y: 125, width: 24, height: 8, orientation: 'bottom' },
    junctionId: 'j_lab3',
    description: 'Computer Lab 3 (North wing)',
  },
  {
    id: 'lab4',
    name: 'Lab 4',
    category: 'Laboratory',
    x: 410,
    y: 35,
    width: 155,
    height: 90,
    door: { x: 487, y: 125, width: 24, height: 8, orientation: 'bottom' },
    junctionId: 'j_lab4',
    description: 'Computer Lab 4 (North wing)',
  },
  {
    id: 'bhise_cabin',
    name: "Bhise Mam's Cabin",
    category: 'FacultyCabin',
    x: 605,
    y: 35,
    width: 165,
    height: 90,
    door: { x: 687, y: 125, width: 24, height: 8, orientation: 'bottom' },
    junctionId: 'j_cabin',
    description: "Faculty Cabin - Bhise Mam (Default Starting Point)",
    isDefaultStart: true,
  },

  // --- RIGHT COLUMN ---
  {
    id: 'jvn_door1',
    name: 'JVN Hall Door 1',
    category: 'HallDoor',
    x: 820,
    y: 195,
    width: 125,
    height: 75,
    door: { x: 820, y: 227, width: 8, height: 24, orientation: 'left' },
    junctionId: 'j_jvn1',
    description: 'JVN Hall Entry Door 1 (East corridor, upper)',
  },
  {
    id: 'jvn_door2',
    name: 'JVN Hall Door 2',
    category: 'HallDoor',
    x: 820,
    y: 345,
    width: 125,
    height: 75,
    door: { x: 820, y: 377, width: 8, height: 24, orientation: 'left' },
    junctionId: 'j_jvn2',
    description: 'JVN Hall Entry Door 2 (East corridor, lower)',
  },

  // --- BOTTOM ROW ---
  {
    id: 'passage_entrance',
    name: 'Passage (Entrance)',
    category: 'Passage',
    x: 45,
    y: 505,
    width: 135,
    height: 85,
    door: { x: 112, y: 505, width: 24, height: 8, orientation: 'top' },
    junctionId: 'j_passage',
    description: 'Main Passage / Entrance of 4th Floor CSD Department',
  },
  {
    id: 'class1',
    name: 'Class 1',
    category: 'Classroom',
    x: 230,
    y: 505,
    width: 155,
    height: 85,
    door: { x: 307, y: 505, width: 24, height: 8, orientation: 'top' },
    junctionId: 'j_class1',
    description: 'Classroom 1 (South corridor)',
  },
  {
    id: 'class2',
    name: 'Class 2',
    category: 'Classroom',
    x: 440,
    y: 505,
    width: 155,
    height: 85,
    door: { x: 517, y: 505, width: 24, height: 8, orientation: 'top' },
    junctionId: 'j_class2',
    description: 'Classroom 2 (South corridor)',
  },

  // --- LEFT COLUMN ---
  {
    id: 'lab2',
    name: 'Lab 2',
    category: 'Laboratory',
    x: 45,
    y: 185,
    width: 100,
    height: 110,
    door: { x: 145, y: 235, width: 8, height: 24, orientation: 'right' },
    junctionId: 'j_lab2',
    description: 'Computer Lab 2 (West corridor, upper)',
  },
  {
    id: 'lab1',
    name: 'Lab 1',
    category: 'Laboratory',
    x: 45,
    y: 345,
    width: 100,
    height: 110,
    door: { x: 145, y: 395, width: 8, height: 24, orientation: 'right' },
    junctionId: 'j_lab1',
    description: 'Computer Lab 1 (West corridor, lower)',
  },
];

/**
 * Corridor Junction Vertices (Walkable network points along corridors)
 */
export const CORRIDOR_JUNCTIONS = [
  // Top Corridor (y = 158)
  { id: 'j_washroom', name: 'Washroom Junction', x: 180, y: 158, isCorridor: true },
  { id: 'j_lab3', name: 'Lab 3 Junction', x: 292, y: 158, isCorridor: true },
  { id: 'j_lab4', name: 'Lab 4 Junction', x: 487, y: 158, isCorridor: true },
  { id: 'j_cabin', name: "Bhise Cabin Junction", x: 780, y: 158, isCorridor: true },

  // Right Corridor (x = 780)
  { id: 'j_jvn1', name: 'JVN Door 1 Junction', x: 780, y: 239, isCorridor: true },
  { id: 'j_jvn2', name: 'JVN Door 2 Junction', x: 780, y: 389, isCorridor: true },
  { id: 'j_lower_right', name: 'Lower Right Corner', x: 780, y: 475, isCorridor: true, isCorner: true },

  // Bottom Corridor (y = 475)
  { id: 'j_class2', name: 'Class 2 Junction', x: 517, y: 475, isCorridor: true },
  { id: 'j_class1', name: 'Class 1 Junction', x: 307, y: 475, isCorridor: true },
  { id: 'j_passage', name: 'Passage Entrance Junction', x: 180, y: 475, isCorridor: true },

  // Left Corridor (x = 180)
  { id: 'j_lab1', name: 'Lab 1 Junction', x: 180, y: 395, isCorridor: true },
  { id: 'j_lab2', name: 'Lab 2 Junction', x: 180, y: 235, isCorridor: true },
];

/**
 * Initial provisional edge weights from user's sketch table
 */
export const INITIAL_EDGE_WEIGHTS = [
  // --- A. Top Side (Washroom to Bhise Mam's Cabin) ---
  {
    id: 'edge_washroom_lab3',
    u: 'j_washroom',
    v: 'j_lab3',
    distance: 0.5,
    tableSection: 'A. Top Side',
    label: 'Washroom ➔ Lab 3',
    provisional: true,
    sketchItemNo: 1,
  },
  {
    id: 'edge_lab3_lab4',
    u: 'j_lab3',
    v: 'j_lab4',
    distance: 2.0,
    tableSection: 'A. Top Side',
    label: 'Lab 3 ➔ Lab 4',
    provisional: true,
    sketchItemNo: 2,
  },
  {
    id: 'edge_lab4_cabin',
    u: 'j_lab4',
    v: 'j_cabin',
    distance: 2.0,
    tableSection: 'A. Top Side',
    label: "Lab 4 ➔ Bhise Mam's Cabin",
    provisional: true,
    sketchItemNo: 3,
  },

  // --- B. Left Side (Washroom to Lab 2 down to Lab 1 & Passage) ---
  {
    id: 'edge_washroom_lab2',
    u: 'j_washroom',
    v: 'j_lab2',
    distance: 0.5,
    tableSection: 'B. Left Side',
    label: 'Washroom ➔ Lab 2',
    provisional: true,
    sketchItemNo: 4,
  },
  {
    id: 'edge_lab2_lab1',
    u: 'j_lab2',
    v: 'j_lab1',
    distance: 2.0,
    tableSection: 'B. Left Side',
    label: 'Lab 2 ➔ Lab 1',
    provisional: true,
    sketchItemNo: 5,
  },
  {
    id: 'edge_lab1_passage',
    u: 'j_lab1',
    v: 'j_passage',
    distance: 2.0, // Configurable placeholder as required in prompt item 3
    tableSection: 'B. Left Side',
    label: 'Lab 1 ➔ Passage (Entrance)',
    provisional: true,
    isPlaceholder: true,
    notes: 'Configurable placeholder (shown with arrow in sketch)',
  },

  // --- C. Bottom Side (Passage to Class 2 to Lower Right Corner) ---
  {
    id: 'edge_passage_class1',
    u: 'j_passage',
    v: 'j_class1',
    distance: 1.0,
    tableSection: 'C. Bottom Side',
    label: 'Passage (Entrance) ➔ Class 1',
    provisional: true,
    sketchItemNo: 6,
  },
  {
    id: 'edge_class1_class2',
    u: 'j_class1',
    v: 'j_class2',
    distance: 2.0,
    tableSection: 'C. Bottom Side',
    label: 'Class 1 ➔ Class 2',
    provisional: true,
    sketchItemNo: 7,
  },
  {
    id: 'edge_class2_lower_right',
    u: 'j_class2',
    v: 'j_lower_right',
    distance: 2.0,
    tableSection: 'C. Bottom Side',
    label: 'Class 2 ➔ Lower Right Corner',
    provisional: true,
    sketchItemNo: 8,
  },

  // --- D. Right Side (Bhise Mam's Cabin to Lower Right Corner) ---
  {
    id: 'edge_cabin_jvn1',
    u: 'j_cabin',
    v: 'j_jvn1',
    distance: 2.0,
    tableSection: 'D. Right Side',
    label: "Bhise Mam's Cabin ➔ JVN Hall Door 1",
    provisional: true,
    sketchItemNo: 9,
  },
  {
    id: 'edge_jvn1_jvn2',
    u: 'j_jvn1',
    v: 'j_jvn2',
    distance: 2.0,
    tableSection: 'D. Right Side',
    label: 'JVN Hall Door 1 ➔ JVN Hall Door 2',
    provisional: true,
    sketchItemNo: 10,
  },
  {
    id: 'edge_jvn2_lower_right',
    u: 'j_jvn2',
    v: 'j_lower_right',
    distance: 2.0,
    tableSection: 'D. Right Side',
    label: 'JVN Hall Door 2 ➔ Lower Right Corner',
    provisional: true,
    sketchItemNo: 11,
  },
];

/**
 * Access connection from each room to its corridor junction
 * Distance: 0.3 m estimated doorway threshold
 */
export const ROOM_DOOR_DISTANCE = 0.3;

/**
 * Factory to build a Graph instance from room and edge definitions
 */
import { Graph } from '../dsa/Graph.js';

export function createFloorGraph(edgeWeights = INITIAL_EDGE_WEIGHTS, doorDist = ROOM_DOOR_DISTANCE) {
  const g = new Graph();

  // 1. Add Corridor Junctions
  for (const junc of CORRIDOR_JUNCTIONS) {
    g.addVertex(junc.id, {
      name: junc.name,
      x: junc.x,
      y: junc.y,
      isCorridor: true,
      isRoom: false,
    });
  }

  // 2. Add Rooms
  for (const room of ROOMS_DATA) {
    // Room node position: center of room
    const roomCenterX = room.x + room.width / 2;
    const roomCenterY = room.y + room.height / 2;

    g.addVertex(room.id, {
      name: room.name,
      category: room.category,
      x: roomCenterX,
      y: roomCenterY,
      doorX: room.door.x,
      doorY: room.door.y,
      isRoom: true,
      isCorridor: false,
      junctionId: room.junctionId,
      description: room.description,
    });

    // Connect Room to its Corridor Junction
    if (room.junctionId) {
      g.addEdge(room.id, room.junctionId, doorDist, true, {
        edgeId: `door_${room.id}`,
        isDoorway: true,
        label: `${room.name} Doorway`,
      });
    }
  }

  // 3. Add Corridor Edges with provisional weights
  for (const edge of edgeWeights) {
    g.addEdge(edge.u, edge.v, edge.distance, true, {
      edgeId: edge.id,
      label: edge.label,
      tableSection: edge.tableSection,
      provisional: edge.provisional,
      isPlaceholder: !!edge.isPlaceholder,
    });
  }

  return g;
}

/**
 * Map legend items matching reference image
 */
export const MAP_LEGEND = [
  { label: 'Classroom', color: '#ddd6fe', border: '#7c3aed' },
  { label: 'Laboratory', color: '#bbf7d0', border: '#16a34a' },
  { label: 'Faculty Cabin', color: '#fbcfe8', border: '#db2777' },
  { label: 'Hall Door', color: '#fef08a', border: '#ca8a04' },
  { label: 'Passage/Entrance', color: '#e0e7ff', border: '#4f46e5' },
  { label: 'Washroom', color: '#bae6fd', border: '#0284c7' },
  { label: 'Corridor', color: '#f8fafc', border: '#cbd5e1' },
  { label: 'Central Empty Space', color: '#f1f5f9', border: '#94a3b8' },
];
