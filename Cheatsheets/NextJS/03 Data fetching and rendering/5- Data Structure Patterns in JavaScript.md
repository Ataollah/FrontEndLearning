# Data Structure Patterns in JavaScript

A practical guide to the patterns you'll actually use — with code, use cases, and trade-offs.

---

## 1. The Core Structures

Before patterns, know the primitives:

| Structure | Access | Insert | Delete | Search | Order |
|-----------|--------|--------|--------|--------|-------|
| **Array** | O(1) by index | O(1) push / O(n) shift | O(n) | O(n) | ✅ |
| **Object** | O(1) | O(1) | O(1) | O(1) keys | ❌ |
| **Map** | O(1) | O(1) | O(1) | O(1) | ✅ (insertion) |
| **Set** | O(1) | O(1) | O(1) | O(1) | ✅ (insertion) |
| **WeakMap / WeakSet** | O(1) | O(1) | O(1) | O(1) | ❌ |

---

## 2. Object Pattern (Key-Value Store)

**Use when:** You have a known, fixed shape and need fast lookups.

```js
const users = {
  1: { name: 'Ali' },
  2: { name: 'Sara' }
}

users[1].name        // 'Ali' — O(1)
delete users[2]      // O(1)
Object.keys(users)   // ['1']
```

**Gotchas:**
- Keys are always strings (or symbols)
- No `.length`, no `.map()`
- Not iterable directly (use `Object.entries`)

```js
for (const [id, user] of Object.entries(users)) {
  console.log(id, user.name)
}
```

---

## 3. Map Pattern (Better Key-Value)

**Use when:** You need any-type keys, frequent add/delete, or guaranteed order.

```js
const cache = new Map()

cache.set('user:1', { name: 'Ali' })
cache.set(42, 'number key')
cache.set({ id: 1 }, 'object key')

cache.get('user:1')  // O(1)
cache.has(42)        // true
cache.delete(42)     // O(1)
cache.size           // 2
```

**Iteration:**
```js
for (const [key, value] of cache) { ... }
cache.forEach((v, k) => { ... })
```

### Map vs Object — when to pick which

| Need | Object | Map |
|------|--------|-----|
| Known keys, JSON | ✅ | ❌ |
| Dynamic keys | ⚠️ | ✅ |
| Non-string keys | ❌ | ✅ |
| Frequent add/delete | ⚠️ | ✅ |
| Ordered iteration | ⚠️ | ✅ |
| Performance (many keys) | ⚠️ | ✅ |

---

## 4. Set Pattern (Unique Collections)

**Use when:** You need uniqueness, membership tests, or dedup.

```js
const tags = new Set(['js', 'react', 'js']) // Set { 'js', 'react' }

tags.add('node')
tags.has('react')   // true — O(1)
tags.delete('js')
tags.size           // 2
```

### Classic dedup
```js
const unique = [...new Set([1, 2, 2, 3, 3, 3])] // [1, 2, 3]
```

### Set operations
```js
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

const union        = new Set([...a, ...b])              // {1,2,3,4}
const intersection = new Set([...a].filter(x => b.has(x))) // {2,3}
const difference   = new Set([...a].filter(x => !b.has(x))) // {1}
```

> Modern JS (2024+) has native `a.union(b)`, `a.intersection(b)`, `a.difference(b)`.

---

## 5. Stack Pattern (LIFO)

**Use when:** Undo/redo, parsing, DFS, backtracking.

```js
class Stack {
  #items = []
  push(x) { this.#items.push(x) }
  pop()   { return this.#items.pop() }
  peek()  { return this.#items[this.#items.length - 1] }
  get size() { return this.#items.length }
  isEmpty() { return this.#items.length === 0 }
}

const s = new Stack()
s.push(1); s.push(2)
s.pop() // 2
```

**Real use — balanced brackets:**
```js
function isBalanced(str) {
  const stack = []
  const pairs = { ')': '(', ']': '[', '}': '{' }
  for (const ch of str) {
    if ('([{'.includes(ch)) stack.push(ch)
    else if (pairs[ch] !== stack.pop()) return false
  }
  return stack.length === 0
}
```

---

## 6. Queue Pattern (FIFO)

**Use when:** Task scheduling, BFS, rate limiting.

```js
class Queue {
  #items = []
  #head = 0

  enqueue(x) { this.#items.push(x) }
  dequeue() {
    if (this.#head >= this.#items.length) return undefined
    const val = this.#items[this.#head++]
    if (this.#head > 100) { // cleanup
      this.#items = this.#items.slice(this.#head)
      this.#head = 0
    }
    return val
  }
  get size() { return this.#items.length - this.#head }
}
```

> ⚠️ `array.shift()` is O(n) — the head-index trick makes `dequeue` O(1) amortized.

---

## 7. Linked List Pattern

**Use when:** Frequent inserts/deletes at arbitrary positions (e.g., LRU cache internals).

```js
class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

class LinkedList {
  #head = null

  prepend(value) {
    const node = new Node(value)
    node.next = this.#head
    this.#head = node
  }

  *[Symbol.iterator]() {
    let cur = this.#head
    while (cur) {
      yield cur.value
      cur = cur.next
    }
  }
}

const list = new LinkedList()
list.prepend(3); list.prepend(2); list.prepend(1)
console.log([...list]) // [1, 2, 3]
```

---

## 8. Tree Pattern

**Use when:** Hierarchical data, UI trees, file systems, DOM.

```js
const tree = {
  name: 'root',
  children: [
    { name: 'a', children: [{ name: 'a1', children: [] }] },
    { name: 'b', children: [] }
  ]
}
```

### Recursive traversal (DFS)
```js
function walk(node, visit) {
  visit(node)
  for (const child of node.children || []) walk(child, visit)
}

walk(tree, n => console.log(n.name))
// root, a, a1, b
```

### Iterative traversal
```js
function walk(tree) {
  const stack = [tree]
  while (stack.length) {
    const node = stack.pop()
    console.log(node.name)
    stack.push(...(node.children || []))
  }
}
```

### Building a tree from flat list
```js
function buildTree(items, parentId = null) {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => ({ ...item, children: buildTree(items, item.id) }))
}
```

---

## 9. Graph Pattern (Adjacency List)

**Use when:** Relationships, networks, dependencies, social graphs.

```js
const graph = new Map([
  ['A', ['B', 'C']],
  ['B', ['D']],
  ['C', ['D']],
  ['D', []]
])
```

### BFS
```js
function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []

  while (queue.length) {
    const node = queue.shift()
    order.push(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  return order
}
```

### DFS
```js
function dfs(graph, start, visited = new Set()) {
  if (visited.has(start)) return
  visited.add(start)
  console.log(start)
  for (const n of graph.get(start) || []) dfs(graph, n, visited)
}
```

---

## 10. LRU Cache Pattern (Map Trick)

**Use when:** Caching with a size limit; evict least-recently-used.

```js
class LRUCache {
  #capacity
  #map = new Map()

  constructor(capacity) {
    this.#capacity = capacity
  }

  get(key) {
    if (!this.#map.has(key)) return undefined
    const value = this.#map.get(key)
    this.#map.delete(key)      // remove...
    this.#map.set(key, value)  // ...and re-insert = move to end
    return value
  }

  set(key, value) {
    if (this.#map.has(key)) this.#map.delete(key)
    this.#map.set(key, value)
    if (this.#map.size > this.#capacity) {
      this.#map.delete(this.#map.keys().next().value) // evict oldest
    }
  }
}
```

**Why it works:** JS `Map` preserves insertion order, so the first key is the least-recently-used.

---

## 11. Trie Pattern (Prefix Tree)

**Use when:** Autocomplete, spell-check, prefix search.

```js
class TrieNode {
  constructor() {
    this.children = new Map()
    this.isEnd = false
  }
}

class Trie {
  #root = new TrieNode()

  insert(word) {
    let node = this.#root
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode())
      node = node.children.get(ch)
    }
    node.isEnd = true
  }

  has(word) {
    let node = this.#root
    for (const ch of word) {
      if (!node.children.has(ch)) return false
      node = node.children.get(ch)
    }
    return node.isEnd
  }

  startsWith(prefix) {
    let node = this.#root
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false
      node = node.children.get(ch)
    }
    return true
  }
}
```

---

## 12. Heap / Priority Queue

**Use when:** Top-K problems, scheduling, Dijkstra.

```js
class MinHeap {
  #heap = []

  push(x) {
    this.#heap.push(x)
    this.#bubbleUp(this.#heap.length - 1)
  }

  pop() {
    const top = this.#heap[0]
    const last = this.#heap.pop()
    if (this.#heap.length) {
      this.#heap[0] = last
      this.#sinkDown(0)
    }
    return top
  }

  #bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.#heap[parent] <= this.#heap[i]) break
      ;[this.#heap[parent], this.#heap[i]] = [this.#heap[i], this.#heap[parent]]
      i = parent
    }
  }

  #sinkDown(i) {
    const n = this.#heap.length
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2
      let smallest = i
      if (l < n && this.#heap[l] < this.#heap[smallest]) smallest = l
      if (r < n && this.#heap[r] < this.#heap[smallest]) smallest = r
      if (smallest === i) break
      ;[this.#heap[i], this.#heap[smallest]] = [this.#heap[smallest], this.#heap[i]]
      i = smallest
    }
  }

  get size() { return this.#heap.length }
  peek() { return this.#heap[0] }
}
```

---

## 13. WeakMap Pattern (Private Data / Metadata)

**Use when:** Attaching data to objects without preventing GC.

```js
const metadata = new WeakMap()

function attachMetadata(obj, data) {
  metadata.set(obj, data)
}

function getMetadata(obj) {
  return metadata.get(obj)
}
```

### True private fields
```js
const _balance = new WeakMap()

class BankAccount {
  constructor(balance) { _balance.set(this, balance) }
  get balance() { return _balance.get(this) }
}
```

Keys are weakly held → when the object is GC'd, the entry disappears automatically.

---

## 14. Immutable Update Pattern

**Use when:** React state, Redux, functional code.

```js
// ❌ Mutation
state.user.name = 'Ali'

// ✅ Immutable
const newState = {
  ...state,
  user: { ...state.user, name: 'Ali' }
}

// Arrays
const added   = [...arr, newItem]
const removed = arr.filter(x => x.id !== id)
const updated = arr.map(x => x.id === id ? { ...x, done: true } : x)
```

### Structural sharing with a helper
```js
function updateIn(obj, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  return {
    ...obj,
    [head]: updateIn(obj[head], rest, value)
  }
}
```

---

## 15. Grouping / Indexing Pattern

Turn arrays into lookup maps — a super common transform.

```js
// Group by key
function groupBy(arr, keyFn) {
  const result = new Map()
  for (const item of arr) {
    const key = keyFn(item)
    if (!result.has(key)) result.set(key, [])
    result.get(key).push(item)
  }
  return result
}

const users = [
  { id: 1, role: 'admin' },
  { id: 2, role: 'user' },
  { id: 3, role: 'admin' }
]

groupBy(users, u => u.role)
// Map { 'admin' => [...], 'user' => [...] }
```

### Index by ID (O(1) lookup)
```js
const byId = Object.fromEntries(users.map(u => [u.id, u]))
byId[2] // { id: 2, role: 'user' }
```

---

## 16. Ring Buffer / Circular Queue

**Use when:** Fixed-size logs, streaming buffers, sliding windows.

```js
class RingBuffer {
  #buffer
  #size
  #index = 0
  #count = 0

  constructor(size) {
    this.#size = size
    this.#buffer = new Array(size)
  }

  push(x) {
    this.#buffer[this.#index] = x
    this.#index = (this.#index + 1) % this.#size
    this.#count = Math.min(this.#count + 1, this.#size)
  }

  toArray() {
    return this.#count < this.#size
      ? this.#buffer.slice(0, this.#count)
      : [...this.#buffer.slice(this.#index), ...this.#buffer.slice(0, this.#index)]
  }
}
```

---

## 17. Choosing the Right Structure

| Problem | Structure |
|---------|-----------|
| Fast lookup by ID | Object / Map |
| Unique values | Set |
| Undo / redo | Stack |
| Task queue / BFS | Queue |
| Recent-first eviction | LRU (Map) |
| Prefix search | Trie |
| Top-K / scheduling | Heap |
| Hierarchy | Tree |
| Relationships | Graph |
| Fixed-size history | Ring buffer |
| Private per-object data | WeakMap |

---

## 18. Common Gotchas

**Arrays are objects**
```js
typeof [] // 'object'
```

**Objects keys are strings**
```js
const o = {}
o[1] = 'a'
o['1'] // 'a' — same key!
```

**NaN in Set/Map**
```js
new Set([NaN, NaN]).size // 1 — SameValueZero
NaN === NaN              // false — but Set treats them equal
```

**Object key order is unreliable** for integer-like keys — they're sorted numerically first. Use Map if order matters.

**WeakMap keys must be objects** — primitives throw.

**JSON drops Maps and Sets**
```js
JSON.stringify(new Map([['a', 1]])) // '{}'
```
Convert first: `Object.fromEntries(map)` or `[...set]`.

---

## TL;DR

```
Need uniqueness?         → Set
Need keyed lookup?       → Map (or Object if JSON)
Need LIFO?               → Stack (array push/pop)
Need FIFO?               → Queue (array + head index)
Need hierarchy?          → Tree
Need relationships?      → Graph
Need prefix matching?    → Trie
Need priority?           → Heap
Need bounded cache?      → LRU (Map)
Need private per-object? → WeakMap
Need immutability?       → Spread + helpers
```

**Rule of thumb:** Reach for the **simplest** structure that solves your access pattern. 90% of real code uses just Array, Object, Map, and Set — the rest are for specific algorithmic problems.