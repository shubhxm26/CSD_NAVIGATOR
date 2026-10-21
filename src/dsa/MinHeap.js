/**
 * Binary Min-Heap implementation for Dijkstra's Algorithm
 * Optimized for O(log V) insertion and extraction of minimum-weight vertices.
 */
export class MinHeap {
  constructor(comparator = (a, b) => a.distance - b.distance) {
    this.heap = [];
    this.comparator = comparator;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return min;
  }

  _bubbleUp(index) {
    let current = index;
    while (current > 0) {
      const parentIndex = Math.floor((current - 1) / 2);
      if (this.comparator(this.heap[current], this.heap[parentIndex]) < 0) {
        [this.heap[current], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[current]];
        current = parentIndex;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let smallest = current;
      const leftChild = 2 * current + 1;
      const rightChild = 2 * current + 2;

      if (
        leftChild < length &&
        this.comparator(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this.comparator(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest !== current) {
        [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
        current = smallest;
      } else {
        break;
      }
    }
  }

  /**
   * Return a shallow clone of the internal array for DSA visualizer
   */
  toArray() {
    return this.heap.map((item) => ({ ...item }));
  }
}
