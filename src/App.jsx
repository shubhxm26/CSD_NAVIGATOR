import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import FloorMap from './components/FloorMap';
import ControlPanel from './components/ControlPanel';
import JourneyTracker from './components/JourneyTracker';
import LocationPickerModal from './components/LocationPickerModal';
import EdgeSettingsModal from './components/EdgeSettingsModal';
import DsaVisualizerModal from './components/DsaVisualizerModal';
import DsaDocsModal from './components/DsaDocsModal';
import TestSuiteModal from './components/TestSuiteModal';
import ArrivalModal from './components/ArrivalModal';

import {
  INITIAL_EDGE_WEIGHTS,
  ROOM_DOOR_DISTANCE,
  createFloorGraph,
} from './data/floorData';
import { dijkstra, generateStepDirections } from './dsa/dijkstra';
import { sounds } from './utils/soundEffects';

export default function App() {
  // Edge Weights & Graph Configuration
  const [edgeWeights, setEdgeWeights] = useState(INITIAL_EDGE_WEIGHTS);
  const [doorDistance, setDoorDistance] = useState(ROOM_DOOR_DISTANCE);

  // Re-build Graph when edge weights or door distances change
  const graph = useMemo(() => {
    return createFloorGraph(edgeWeights, doorDistance);
  }, [edgeWeights, doorDistance]);

  // Navigation State
  // Requirement: Bhise Mam's Cabin is the suggested default start location
  const [startNode, setStartNode] = useState('bhise_cabin');
  const [endNode, setEndNode] = useState('');
  const [currentConfirmedNode, setCurrentConfirmedNode] = useState('bhise_cabin');
  const [isNavigating, setIsNavigating] = useState(false);
  const [walkingSpeed, setWalkingSpeed] = useState(1.2); // m/s (approx 4.3 km/h)

  // Route metrics
  const [plannedPath, setPlannedPath] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [originalPlannedDistance, setOriginalPlannedDistance] = useState(0);
  const [confirmedTravelledDistance, setConfirmedTravelledDistance] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [travelHistory, setTravelHistory] = useState([]);
  const [hasDeviated, setHasDeviated] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [stepDirections, setStepDirections] = useState([]);
  const [dijkstraTrace, setDijkstraTrace] = useState([]);
  const [highlightedStepNode, setHighlightedStepNode] = useState(null);

  // Audio mute state
  const [soundMuted, setSoundMuted] = useState(false);

  // Modals visibility
  const [isWhereAmIOpen, setIsWhereAmIOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isDsaDocsOpen, setIsDsaDocsOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isArrivalOpen, setIsArrivalOpen] = useState(false);

  // 1. Calculate Initial Shortest Route
  const handleFindShortestPath = useCallback(
    (overrideStart, overrideEnd) => {
      const from = overrideStart || startNode;
      const to = overrideEnd || endNode;

      if (!from || !to) {
        setRouteError('Please select both a starting location and destination.');
        return;
      }

      setRouteError(null);
      const result = dijkstra(graph, from, to);

      if (!result.success) {
        setRouteError(result.error);
        sounds.playClick();
        return;
      }

      // Record Dijkstra execution trace for DSA inspector
      setDijkstraTrace(result.steps);
      setPlannedPath(result.path);
      setCurrentPath(result.path);
      setOriginalPlannedDistance(result.distance);
      setRemainingDistance(result.distance);
      setConfirmedTravelledDistance(0);
      setCurrentConfirmedNode(from);
      setTravelHistory([{ node: from, timestamp: Date.now() }]);
      setHasDeviated(false);
      setIsNavigating(true);

      const dirs = generateStepDirections(graph, result.path);
      setStepDirections(dirs);
      sounds.playRouteFound();
    },
    [graph, startNode, endNode]
  );

  // 2. User confirms new physical location ("Where am I now?")
  const handleConfirmNewLocation = useCallback(
    (newLocationId) => {
      if (!newLocationId || newLocationId === currentConfirmedNode) return;

      // Calculate distance between previous confirmed location and new location
      const subLegResult = dijkstra(graph, currentConfirmedNode, newLocationId);
      const addedDistance = subLegResult.success ? subLegResult.distance : 0;
      const newTotalTravelled = confirmedTravelledDistance + addedDistance;
      setConfirmedTravelledDistance(newTotalTravelled);

      // Check if new location is on the planned path
      const wasOnPlannedPath = plannedPath.includes(newLocationId);
      if (!wasOnPlannedPath) {
        setHasDeviated(true);
      }

      setCurrentConfirmedNode(newLocationId);
      setTravelHistory((prev) => [
        ...prev,
        { node: newLocationId, timestamp: Date.now(), legDist: addedDistance },
      ]);

      // If user has arrived at destination
      if (newLocationId === endNode) {
        setRemainingDistance(0);
        setCurrentPath([endNode]);
        setStepDirections([]);
        setIsArrivalOpen(true);
        return;
      }

      // Recalculate shortest remaining route from new confirmed location to destination
      const remainingResult = dijkstra(graph, newLocationId, endNode);
      if (remainingResult.success) {
        setCurrentPath(remainingResult.path);
        setRemainingDistance(remainingResult.distance);
        setDijkstraTrace(remainingResult.steps);
        const newDirs = generateStepDirections(graph, remainingResult.path);
        setStepDirections(newDirs);
      } else {
        setRouteError(remainingResult.error);
      }
    },
    [currentConfirmedNode, confirmedTravelledDistance, plannedPath, endNode, graph]
  );

  // 3. Recalculate Route manually
  const handleRecalculateRoute = useCallback(() => {
    const from = currentConfirmedNode || startNode;
    if (!from || !endNode) return;

    const result = dijkstra(graph, from, endNode);
    if (result.success) {
      setCurrentPath(result.path);
      setRemainingDistance(result.distance);
      setDijkstraTrace(result.steps);
      const dirs = generateStepDirections(graph, result.path);
      setStepDirections(dirs);
      sounds.playRouteFound();
    } else {
      setRouteError(result.error);
    }
  }, [graph, currentConfirmedNode, startNode, endNode]);

  // 4. Reset Navigation state
  const handleResetNavigation = useCallback(() => {
    sounds.playClick();
    setStartNode('bhise_cabin');
    setEndNode('');
    setCurrentConfirmedNode('bhise_cabin');
    setIsNavigating(false);
    setPlannedPath([]);
    setCurrentPath([]);
    setOriginalPlannedDistance(0);
    setConfirmedTravelledDistance(0);
    setRemainingDistance(0);
    setTravelHistory([]);
    setHasDeviated(false);
    setRouteError(null);
    setStepDirections([]);
    setDijkstraTrace([]);
  }, []);

  // 5. Click on Map room / junction
  const handleSelectMapNode = useCallback(
    (nodeId) => {
      sounds.playClick();
      if (!isNavigating) {
        if (!startNode) {
          setStartNode(nodeId);
        } else if (!endNode) {
          setEndNode(nodeId);
          handleFindShortestPath(startNode, nodeId);
        } else {
          // If both already set, update destination
          setEndNode(nodeId);
          handleFindShortestPath(startNode, nodeId);
        }
      } else {
        // When navigating, clicking a node triggers checkpoint update
        setIsWhereAmIOpen(true);
      }
    },
    [isNavigating, startNode, endNode, handleFindShortestPath]
  );

  // Save modified edge weights
  const handleSaveEdgeWeights = (newWeights) => {
    setEdgeWeights(newWeights);
    // If route was active, recompute
    if (isNavigating && endNode) {
      const from = currentConfirmedNode || startNode;
      const newG = createFloorGraph(newWeights, doorDistance);
      const r = dijkstra(newG, from, endNode);
      if (r.success) {
        setCurrentPath(r.path);
        setRemainingDistance(r.distance);
        setStepDirections(generateStepDirections(newG, r.path));
      }
    }
  };

  // Progress percentage calculation: (confirmed distance travelled along planned route / original distance) * 100
  const progressPercent = useMemo(() => {
    if (originalPlannedDistance <= 0) return 0;
    if (currentConfirmedNode === endNode) return 100;
    const pct = (confirmedTravelledDistance / originalPlannedDistance) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [confirmedTravelledDistance, originalPlannedDistance, currentConfirmedNode, endNode]);

  // Estimated walking time in seconds
  const estimatedTimeSeconds = useMemo(() => {
    if (remainingDistance <= 0 || walkingSpeed <= 0) return 0;
    return remainingDistance / walkingSpeed;
  }, [remainingDistance, walkingSpeed]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        onReset={handleResetNavigation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDsaDocs={() => setIsDsaDocsOpen(true)}
        onOpenVisualizer={() => setIsVisualizerOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Route Controls & Selectors (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <ControlPanel
            graph={graph}
            startNode={startNode}
            setStartNode={setStartNode}
            endNode={endNode}
            setEndNode={setEndNode}
            onFindShortestPath={() => handleFindShortestPath()}
            onOpenWhereAmINow={() => setIsWhereAmIOpen(true)}
            onRecalculateRoute={handleRecalculateRoute}
            onResetNavigation={handleResetNavigation}
            walkingSpeed={walkingSpeed}
            setWalkingSpeed={setWalkingSpeed}
            isNavigating={isNavigating}
            currentConfirmedNode={currentConfirmedNode}
            hasActiveRoute={currentPath.length > 0}
            routeError={routeError}
          />
        </section>

        {/* Center Column: Interactive 2D Floor Map (6 cols) */}
        <section className="lg:col-span-6 h-[460px] md:h-[580px] lg:h-auto flex flex-col">
          <FloorMap
            graph={graph}
            startNode={startNode}
            endNode={endNode}
            currentConfirmedNode={currentConfirmedNode}
            calculatedPath={currentPath}
            travelHistory={travelHistory}
            onSelectNode={handleSelectMapNode}
            edgeWeights={edgeWeights}
            highlightedStepNode={highlightedStepNode}
          />
        </section>

        {/* Right Column: Journey Tracker, Metrics & Step Directions (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <JourneyTracker
            graph={graph}
            startNode={startNode}
            endNode={endNode}
            currentConfirmedNode={currentConfirmedNode}
            originalPlannedDistance={originalPlannedDistance}
            confirmedTravelledDistance={confirmedTravelledDistance}
            remainingDistance={remainingDistance}
            progressPercent={progressPercent}
            estimatedTimeSeconds={estimatedTimeSeconds}
            isNavigating={isNavigating}
            hasDeviated={hasDeviated}
            stepDirections={stepDirections}
            onConfirmArrival={() => setIsArrivalOpen(true)}
            onHoverStepNode={setHighlightedStepNode}
          />
        </section>
      </main>

      {/* Modals */}
      <LocationPickerModal
        isOpen={isWhereAmIOpen}
        onClose={() => setIsWhereAmIOpen(false)}
        currentConfirmedNode={currentConfirmedNode}
        calculatedPath={currentPath}
        onConfirmNewLocation={handleConfirmNewLocation}
      />

      <EdgeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentEdgeWeights={edgeWeights}
        onSaveEdgeWeights={handleSaveEdgeWeights}
        doorDistance={doorDistance}
        setDoorDistance={setDoorDistance}
      />

      <DsaVisualizerModal
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
        dijkstraTrace={dijkstraTrace}
        graph={graph}
        startNode={startNode}
        endNode={endNode}
        calculatedDistance={remainingDistance || originalPlannedDistance}
      />

      <DsaDocsModal
        isOpen={isDsaDocsOpen}
        onClose={() => setIsDsaDocsOpen(false)}
      />

      <TestSuiteModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
        graph={graph}
        onApplyTestRoute={(s, d) => {
          setStartNode(s);
          setEndNode(d);
          handleFindShortestPath(s, d);
        }}
      />

      <ArrivalModal
        isOpen={isArrivalOpen}
        onClose={() => setIsArrivalOpen(false)}
        startNode={startNode}
        endNode={endNode}
        graph={graph}
        totalDistanceWalked={confirmedTravelledDistance}
        originalPlannedDistance={originalPlannedDistance}
        confirmedCheckpointsCount={travelHistory.length}
        onStartNewJourney={handleResetNavigation}
      />
    </div>
  );
}
