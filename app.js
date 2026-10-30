/* MedStock: a local-first academic prototype demonstrating DSA ideas in an inventory workflow. */
const STORAGE_KEY = 'medstock-dsa-demo-v1';

const SEED_SUPPLIERS = ['Apex Pharma', 'LifeLine Medico', 'MediCore Supplies', 'NorthStar Health'];
const SEED_ITEMS = [
  { id: 'MED-1001', name: 'Paracetamol 500 mg', category: 'Analgesic', batch: 'PCM-24-108', quantity: 128, reorderLevel: 40, expiry: '2027-05-14', supplier: 'Apex Pharma', unitCost: 2.5, location: 'Central Warehouse', priority: 8 },
  { id: 'MED-1002', name: 'Amoxicillin 250 mg', category: 'Antibiotic', batch: 'AMX-26-022', quantity: 24, reorderLevel: 30, expiry: '2027-02-19', supplier: 'LifeLine Medico', unitCost: 4.2, location: 'General Ward', priority: 9 },
  { id: 'MED-1003', name: 'Insulin Glargine 100 IU', category: 'Diabetes care', batch: 'INS-25-071', quantity: 9, reorderLevel: 18, expiry: '2026-12-12', supplier: 'MediCore Supplies', unitCost: 385, location: 'ICU', priority: 10 },
  { id: 'MED-1004', name: 'Atorvastatin 10 mg', category: 'Cardiovascular', batch: 'ATV-25-116', quantity: 62, reorderLevel: 25, expiry: '2027-01-27', supplier: 'Apex Pharma', unitCost: 3.8, location: 'Central Warehouse', priority: 6 },
  { id: 'MED-1005', name: 'Ceftriaxone 1 g', category: 'Antibiotic', batch: 'CFT-26-041', quantity: 14, reorderLevel: 28, expiry: '2027-01-16', supplier: 'LifeLine Medico', unitCost: 36, location: 'Oncology', priority: 9 },
  { id: 'MED-1006', name: 'Metformin 500 mg', category: 'Diabetes care', batch: 'MTF-25-093', quantity: 70, reorderLevel: 35, expiry: '2027-08-03', supplier: 'MediCore Supplies', unitCost: 1.6, location: 'General Ward', priority: 7 },
  { id: 'MED-1007', name: 'Salbutamol inhaler', category: 'Respiratory', batch: 'SAL-25-034', quantity: 11, reorderLevel: 20, expiry: '2027-01-04', supplier: 'NorthStar Health', unitCost: 112, location: 'ICU', priority: 8 },
  { id: 'MED-1008', name: 'Povidone-Iodine 10%', category: 'Antiseptic', batch: 'PVI-25-054', quantity: 46, reorderLevel: 15, expiry: '2027-07-21', supplier: 'NorthStar Health', unitCost: 28, location: 'Central Warehouse', priority: 5 },
  { id: 'MED-1009', name: 'Ondansetron 4 mg', category: 'Gastrointestinal', batch: 'OND-25-008', quantity: 18, reorderLevel: 25, expiry: '2026-11-28', supplier: 'Apex Pharma', unitCost: 5.5, location: 'Oncology', priority: 7 },
  { id: 'MED-1010', name: 'Nitrile examination gloves', category: 'Medical supply', batch: 'NGL-26-012', quantity: 140, reorderLevel: 60, expiry: '2028-04-01', supplier: 'NorthStar Health', unitCost: 1.2, location: 'Central Warehouse', priority: 5 }
];

const GRAPH_NODES = [
  { id: 'apex', name: 'Apex Pharma', kind: 'supplier', x: 13, y: 25 },
  { id: 'lifeline', name: 'LifeLine Medico', kind: 'supplier', x: 13, y: 75 },
  { id: 'medicore', name: 'MediCore Supplies', kind: 'supplier', x: 13, y: 50 },
  { id: 'northstar', name: 'NorthStar Health', kind: 'supplier', x: 13, y: 93 },
  { id: 'central', name: 'Central warehouse', kind: 'warehouse', x: 48, y: 50 },
  { id: 'icu', name: 'ICU', kind: 'department', x: 78, y: 18 },
  { id: 'ward', name: 'General ward', kind: 'department', x: 78, y: 50 },
  { id: 'oncology', name: 'Oncology', kind: 'department', x: 78, y: 82 }
];
const SEED_EDGES = [
  { from: 'apex', to: 'central', weight: 12 }, { from: 'lifeline', to: 'central', weight: 18 },
  { from: 'medicore', to: 'central', weight: 14 }, { from: 'northstar', to: 'central', weight: 22 },
  { from: 'central', to: 'icu', weight: 5 }, { from: 'central', to: 'ward', weight: 4 },
  { from: 'central', to: 'oncology', weight: 9 }, { from: 'apex', to: 'ward', weight: 10 },
  { from: 'lifeline', to: 'icu', weight: 8 }, { from: 'lifeline', to: 'oncology', weight: 7 },
  { from: 'icu', to: 'oncology', weight: 6 }, { from: 'northstar', to: 'ward', weight: 24 }
];
const DEPARTMENTS = [
  { name: 'ICU', priority: 10, demand: 14 }, { name: 'Oncology', priority: 9, demand: 12 },
  { name: 'Emergency', priority: 10, demand: 12 }, { name: 'General ward', priority: 6, demand: 20 }
];

function initialState() {
  return { version: 1, items: SEED_ITEMS.map(item => ({ ...item })), suppliers: [...SEED_SUPPLIERS], edges: SEED_EDGES.map(edge => ({ ...edge })), budget: 18000 };
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.items) && saved.version === 1) return { ...initialState(), ...saved };
  } catch (error) { console.info('Starting a fresh demo inventory.', error); }
  return initialState();
}
let state = loadState();
let currentPage = 'overview';
let alertFilter = 'all';
let toastTimer;
let cachedNameIndex = null;

function saveState() {
  cachedNameIndex = null;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast('Browser storage is unavailable. Changes last for this visit.'); }
  updateNavCounts();
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function money(value, decimals = 0) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(Number(value) || 0);
}
function dateObj(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}
function daysUntil(value) {
  const target = dateObj(value); const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj(value));
}
function formatDays(days) {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  return `${days}d left`;
}
function itemStatus(item) {
  const remaining = daysUntil(item.expiry);
  if (remaining < 0) return ['Expired', 'status-urgent'];
  if (item.quantity <= item.reorderLevel * .5) return ['Critical stock', 'status-urgent'];
  if (item.quantity <= item.reorderLevel) return ['Low stock', 'status-low'];
  if (remaining <= 30) return ['Expiring soon', 'status-expiring'];
  return ['In stock', 'status-good'];
}
function showToast(message) {
  const node = document.getElementById('toast');
  node.textContent = message; node.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2400);
}

// Separate-chaining hash table used for exact medicine-name lookup (average O(1)).
class HashTable {
  constructor(size = 67) { this.buckets = Array.from({ length: size }, () => []); }
  hash(key) {
    let hash = 2166136261;
    for (const char of String(key)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0) % this.buckets.length;
  }
  set(key, value) {
    const bucket = this.buckets[this.hash(key)]; const found = bucket.find(entry => entry[0] === key);
    if (found) found[1] = value; else bucket.push([key, value]);
  }
  get(key) { return this.buckets[this.hash(key)].find(entry => entry[0] === key)?.[1]; }
}

// AVL tree keeps expiry-keyed records balanced; in-order traversal gives expiry order.
class AVLNode {
  constructor(value, key) { this.value = value; this.key = key; this.left = null; this.right = null; this.height = 1; }
}
class AVLTree {
  constructor() { this.root = null; }
  height(node) { return node ? node.height : 0; }
  update(node) { node.height = 1 + Math.max(this.height(node.left), this.height(node.right)); return node; }
  rotateRight(root) { const next = root.left; root.left = next.right; next.right = this.update(root); return this.update(next); }
  rotateLeft(root) { const next = root.right; root.right = next.left; next.left = this.update(root); return this.update(next); }
  insert(value, key) {
    const place = node => {
      if (!node) return new AVLNode(value, key);
      if (key < node.key) node.left = place(node.left); else node.right = place(node.right);
      this.update(node);
      const balance = this.height(node.left) - this.height(node.right);
      if (balance > 1 && key < node.left.key) return this.rotateRight(node);
      if (balance < -1 && key >= node.right.key) return this.rotateLeft(node);
      if (balance > 1 && key >= node.left.key) { node.left = this.rotateLeft(node.left); return this.rotateRight(node); }
      if (balance < -1 && key < node.right.key) { node.right = this.rotateRight(node.right); return this.rotateLeft(node); }
      return node;
    };
    this.root = place(this.root);
  }
  inOrder() {
    const result = []; const walk = node => { if (!node) return; walk(node.left); result.push(node.value); walk(node.right); };
    walk(this.root); return result;
  }
}

// Binary min-heap for urgency ordered alerts and Dijkstra's frontier.
class MinHeap {
  constructor(compare = (a, b) => a.priority - b.priority) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  push(value) {
    this.data.push(value); let i = this.data.length - 1;
    while (i > 0) { const parent = Math.floor((i - 1) / 2); if (this.compare(this.data[i], this.data[parent]) >= 0) break; [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]]; i = parent; }
  }
  pop() {
    if (!this.data.length) return undefined;
    const first = this.data[0]; const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last; let i = 0;
      while (true) { let next = i; const left = i * 2 + 1; const right = left + 1;
        if (left < this.data.length && this.compare(this.data[left], this.data[next]) < 0) next = left;
        if (right < this.data.length && this.compare(this.data[right], this.data[next]) < 0) next = right;
        if (next === i) break; [this.data[i], this.data[next]] = [this.data[next], this.data[i]]; i = next;
      }
    }
    return first;
  }
}

function expiryTree() {
  const tree = new AVLTree();
  for (const item of state.items) tree.insert(item, `${item.expiry}|${item.id}`);
  return tree;
}
function nameIndex() {
  if (cachedNameIndex) return cachedNameIndex;
  const index = new HashTable();
  for (const item of state.items) {
    const key = item.name.trim().toLowerCase(); const matches = index.get(key) || [];
    matches.push(item); index.set(key, matches);
  }
  cachedNameIndex = index;
  return cachedNameIndex;
}
function lcsLength(a, b) {
  const left = String(a).toLowerCase(); const right = String(b).toLowerCase();
  let previous = new Uint16Array(right.length + 1); let current = new Uint16Array(right.length + 1);
  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) current[j] = left[i - 1] === right[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], current[j - 1]);
    [previous, current] = [current, previous]; current.fill(0);
  }
  return previous[right.length];
}
function searchItems(query) {
  const text = query.trim().toLowerCase();
  if (!text) return expiryTree().inOrder();
  const exact = nameIndex().get(text);
  if (exact?.length) return [...exact, ...state.items.filter(item => !exact.includes(item) && `${item.name} ${item.batch} ${item.supplier} ${item.location}`.toLowerCase().includes(text))];
  const direct = state.items.filter(item => `${item.name} ${item.batch} ${item.supplier} ${item.location} ${item.category}`.toLowerCase().includes(text));
  if (direct.length) return direct;
  return state.items.map(item => ({ item, score: lcsLength(text, item.name.toLowerCase()) / Math.max(text.length, item.name.length) }))
    .filter(entry => entry.score >= .35).sort((a, b) => b.score - a.score).slice(0, 5).map(entry => entry.item);
}
function buildAlerts() {
  const heap = new MinHeap((a, b) => a.priority - b.priority);
  for (const item of state.items) {
    const days = daysUntil(item.expiry);
    if (days < 0) heap.push({ kind: 'expired', priority: -100 + days, item, message: 'Batch has passed its expiry date', detail: `Expired ${formatDays(days)} · ${item.batch}` });
    if (item.quantity <= item.reorderLevel) {
      const ratio = item.reorderLevel ? item.quantity / item.reorderLevel : 0;
      heap.push({ kind: 'low', priority: ratio * 100, item, message: item.quantity === 0 ? 'Out of stock' : 'Below reorder level', detail: `${item.quantity} units left · reorder at ${item.reorderLevel}` });
    }
    if (days >= 0 && days <= 90) heap.push({ kind: 'expiry', priority: 100 + days, item, message: days <= 30 ? 'Expiring soon' : 'Expiry approaching', detail: `Expires ${formatDate(item.expiry)} · ${formatDays(days)}` });
  }
  const alerts = []; while (heap.size) alerts.push(heap.pop()); return alerts;
}

function graphAdjacency() {
  const graph = new Map(GRAPH_NODES.map(node => [node.id, []]));
  for (const edge of state.edges) { graph.get(edge.from)?.push({ node: edge.to, weight: Number(edge.weight) }); graph.get(edge.to)?.push({ node: edge.from, weight: Number(edge.weight) }); }
  return graph;
}
function dijkstra(start, finish) {
  const graph = graphAdjacency(); const dist = new Map([...graph.keys()].map(id => [id, Infinity])); const prev = new Map();
  const queue = new MinHeap((a, b) => a.priority - b.priority); dist.set(start, 0); queue.push({ node: start, priority: 0 });
  while (queue.size) {
    const current = queue.pop(); if (current.priority !== dist.get(current.node)) continue;
    if (current.node === finish) break;
    for (const next of graph.get(current.node) || []) {
      const candidate = current.priority + next.weight;
      if (candidate < dist.get(next.node)) { dist.set(next.node, candidate); prev.set(next.node, current.node); queue.push({ node: next.node, priority: candidate }); }
    }
  }
  return reconstructPath(start, finish, dist.get(finish), prev);
}
function reconstructPath(start, finish, cost, previous) {
  if (!Number.isFinite(cost)) return { path: [], cost: Infinity };
  const path = [finish]; let cursor = finish;
  while (cursor !== start) { cursor = previous.get(cursor); if (!cursor) return { path: [], cost: Infinity }; path.unshift(cursor); }
  return { path, cost };
}
function bellmanFord(start, finish) {
  const edges = state.edges.flatMap(edge => [{ from: edge.from, to: edge.to, weight: Number(edge.weight) }, { from: edge.to, to: edge.from, weight: Number(edge.weight) }]);
  const dist = new Map(GRAPH_NODES.map(node => [node.id, Infinity])); const prev = new Map(); dist.set(start, 0);
  for (let pass = 0; pass < GRAPH_NODES.length - 1; pass++) {
    let changed = false;
    for (const edge of edges) if (Number.isFinite(dist.get(edge.from)) && dist.get(edge.from) + edge.weight < dist.get(edge.to)) { dist.set(edge.to, dist.get(edge.from) + edge.weight); prev.set(edge.to, edge.from); changed = true; }
    if (!changed) break;
  }
  return reconstructPath(start, finish, dist.get(finish), prev);
}
function bfs(start) {
  const graph = graphAdjacency(); const queue = [start]; const seen = new Set([start]); const order = [];
  while (queue.length) { const id = queue.shift(); order.push(id); for (const next of graph.get(id) || []) if (!seen.has(next.node)) { seen.add(next.node); queue.push(next.node); } }
  return order;
}
function dfs(start) {
  const graph = graphAdjacency(); const stack = [start]; const seen = new Set(); const order = [];
  while (stack.length) { const id = stack.pop(); if (seen.has(id)) continue; seen.add(id); order.push(id); const neighbors = [...(graph.get(id) || [])].reverse(); for (const next of neighbors) if (!seen.has(next.node)) stack.push(next.node); }
  return order;
}
function connectedComponents() {
  const graph = graphAdjacency(); const seen = new Set(); const components = [];
  for (const node of GRAPH_NODES) if (!seen.has(node.id)) { const component = []; const stack = [node.id]; seen.add(node.id); while (stack.length) { const id = stack.pop(); component.push(id); for (const next of graph.get(id) || []) if (!seen.has(next.node)) { seen.add(next.node); stack.push(next.node); } } components.push(component); }
  return components;
}
function kruskal() {
  const parent = new Map(GRAPH_NODES.map(node => [node.id, node.id])); const rank = new Map(GRAPH_NODES.map(node => [node.id, 0]));
  const find = id => { if (parent.get(id) !== id) parent.set(id, find(parent.get(id))); return parent.get(id); };
  const join = (a, b) => { let ra = find(a), rb = find(b); if (ra === rb) return false; if (rank.get(ra) < rank.get(rb)) [ra, rb] = [rb, ra]; parent.set(rb, ra); if (rank.get(ra) === rank.get(rb)) rank.set(ra, rank.get(ra) + 1); return true; };
  const chosen = [];
  for (const edge of [...state.edges].sort((a, b) => a.weight - b.weight)) if (join(edge.from, edge.to)) chosen.push(edge);
  return { edges: chosen, cost: chosen.reduce((sum, edge) => sum + Number(edge.weight), 0) };
}
function prim(start = GRAPH_NODES[0].id) {
  const graph = graphAdjacency(); const visited = new Set([start]); const heap = new MinHeap((a, b) => a.weight - b.weight); const chosen = [];
  for (const edge of graph.get(start) || []) heap.push({ from: start, to: edge.node, weight: edge.weight });
  while (heap.size && visited.size < GRAPH_NODES.length) {
    const edge = heap.pop(); if (visited.has(edge.to)) continue; visited.add(edge.to); chosen.push(edge);
    for (const next of graph.get(edge.to) || []) if (!visited.has(next.node)) heap.push({ from: edge.to, to: next.node, weight: next.weight });
  }
  return { edges: chosen, cost: chosen.reduce((sum, edge) => sum + edge.weight, 0) };
}
function floydWarshall() {
  const ids = GRAPH_NODES.map(node => node.id); const d = ids.map((id, i) => ids.map((other, j) => i === j ? 0 : (state.edges.find(edge => (edge.from === id && edge.to === other) || (edge.to === id && edge.from === other))?.weight ?? Infinity)));
  for (let k = 0; k < ids.length; k++) for (let i = 0; i < ids.length; i++) for (let j = 0; j < ids.length; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  return { ids, distances: d };
}
function transitiveClosure() {
  const graph = graphAdjacency(); const reachable = GRAPH_NODES.map(node => GRAPH_NODES.map(other => node.id === other.id || (graph.get(node.id) || []).some(edge => edge.node === other.id)));
  for (let k = 0; k < GRAPH_NODES.length; k++) for (let i = 0; i < GRAPH_NODES.length; i++) for (let j = 0; j < GRAPH_NODES.length; j++) reachable[i][j] = reachable[i][j] || (reachable[i][k] && reachable[k][j]);
  return reachable;
}

// 0/1 knapsack picks whole reorder batches; value reflects medicine criticality.
function planOrders(budget) {
  const candidates = state.items.filter(item => item.quantity <= item.reorderLevel).map(item => {
    const units = Math.max(item.reorderLevel * 2 - item.quantity, item.reorderLevel);
    const cost = Math.max(1, Math.round(units * item.unitCost));
    const urgency = Math.max(0, 60 - Math.max(0, daysUntil(item.expiry)));
    return { item, units, cost, value: Math.round(item.priority * 100 + urgency * 2) };
  });
  const capacity = Math.max(0, Math.min(100000, Math.floor(Number(budget) || 0)));
  const dp = new Int32Array(capacity + 1); const take = Array.from({ length: candidates.length }, () => new Uint8Array(capacity + 1));
  candidates.forEach((candidate, index) => {
    for (let amount = capacity; amount >= candidate.cost; amount--) {
      if (dp[amount - candidate.cost] + candidate.value > dp[amount]) { dp[amount] = dp[amount - candidate.cost] + candidate.value; take[index][amount] = 1; }
    }
  });
  const chosen = []; let amount = capacity;
  for (let index = candidates.length - 1; index >= 0; index--) if (take[index][amount]) { chosen.unshift(candidates[index]); amount -= candidates[index].cost; }
  return { candidates, chosen, cost: chosen.reduce((sum, entry) => sum + entry.cost, 0), value: chosen.reduce((sum, entry) => sum + entry.value, 0), capacity };
}
function allocateStock(capacity, departments) {
  const units = departments.flatMap((department, departmentIndex) => Array.from({ length: department.demand }, (_, unitIndex) => ({ departmentIndex, unitIndex, value: department.priority * 10 })));
  const max = Math.max(0, Math.min(250, Math.floor(Number(capacity) || 0)));
  const dp = Array.from({ length: units.length + 1 }, () => new Int32Array(max + 1));
  units.forEach((unit, i) => {
    for (let c = 0; c <= max; c++) {
      dp[i + 1][c] = dp[i][c];
      if (c > 0 && dp[i][c - 1] + unit.value > dp[i + 1][c]) dp[i + 1][c] = dp[i][c - 1] + unit.value;
    }
  });
  const assigned = departments.map(() => 0); let c = max;
  for (let i = units.length; i > 0 && c > 0; i--) if (dp[i][c] !== dp[i - 1][c]) { assigned[units[i - 1].departmentIndex]++; c--; }
  return { assigned, used: assigned.reduce((sum, quantity) => sum + quantity, 0), value: dp[units.length][max] };
}

function updateNavCounts() {
  const inventoryCount = document.getElementById('inventory-nav-count'); const alertCount = document.getElementById('alerts-nav-count');
  if (inventoryCount) inventoryCount.textContent = state.items.length;
  if (alertCount) alertCount.textContent = buildAlerts().length;
}
function pageTitle(page) {
  return ({ overview: 'Overview', inventory: 'Inventory', alerts: 'Alerts & expiry', network: 'Supply network', planning: 'Reorder planning', reports: 'Reports', dsa: 'DSA lab' })[page] || 'Overview';
}
function renderPage() {
  document.querySelectorAll('.nav-item[data-page]').forEach(button => button.classList.toggle('active', button.dataset.page === currentPage));
  document.getElementById('breadcrumb-current').textContent = pageTitle(currentPage);
  const main = document.getElementById('main-content');
  const views = { overview: renderOverview, inventory: renderInventory, alerts: renderAlerts, network: renderNetwork, planning: renderPlanning, reports: renderReports, dsa: renderDSALab };
  main.innerHTML = (views[currentPage] || renderOverview)();
  if (currentPage === 'inventory') refreshInventoryRows();
  if (currentPage === 'planning') refreshPlanner();
  updateNavCounts();
}
function pageHeading(title, subtitle, actions = '') {
  return `<div class="page-heading"><div><div class="eyebrow">MEDSTOCK / ${escapeHTML(pageTitle(currentPage).toUpperCase())}</div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
function metricCard(label, value, foot, icon, tone) {
  return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon ${tone}">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></article>`;
}
function medicineCell(item) {
  const tone = item.category === 'Antibiotic' || item.category === 'Analgesic' ? '' : item.category === 'Diabetes care' ? 'orange' : 'blue';
  return `<div class="medicine-cell"><span class="medicine-avatar ${tone}">${escapeHTML(item.name.slice(0, 1).toUpperCase())}</span><span class="medicine-copy"><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.category)}</small></span></div>`;
}
function alertRows(alerts, limit = Infinity) {
  if (!alerts.length) return `<div class="no-data"><strong>You're all caught up</strong>No active alerts for this filter.</div>`;
  return `<div class="alert-list">${alerts.slice(0, limit).map(alert => `<div class="alert-row"><span class="alert-mark ${alert.kind === 'low' || alert.kind === 'expired' ? 'low' : 'expiry'}">${alert.kind === 'low' ? '!' : alert.kind === 'expired' ? '×' : '⌛'}</span><span class="alert-copy"><strong>${escapeHTML(alert.item.name)} · ${escapeHTML(alert.message)}</strong><small>${escapeHTML(alert.detail)}</small></span><span class="alert-age">${alert.kind === 'low' ? 'STOCK' : 'EXPIRY'}</span></div>`).join('')}</div>`;
}
function renderOverview() {
  const alerts = buildAlerts(); const lowItems = state.items.filter(item => item.quantity <= item.reorderLevel);
  const expiring = state.items.filter(item => daysUntil(item.expiry) >= 0 && daysUntil(item.expiry) <= 90).sort((a, b) => a.expiry.localeCompare(b.expiry));
  const stockValue = state.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const healthy = state.items.filter(item => item.quantity > item.reorderLevel && daysUntil(item.expiry) > 30).length;
  const health = state.items.length ? Math.round(healthy / state.items.length * 100) : 0;
  const bars = [42, 56, 48, 66, 53, 78]; const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const chart = bars.map((value, i) => `<div class="bar-group"><div class="bar-pair"><span class="bar" style="height:${value * .92}px"></span><span class="bar current" style="height:${Math.max(12, value * (i === 5 ? 1.14 : .74))}px"></span></div><span class="bar-label">${months[i]}</span></div>`).join('');
  return `${pageHeading('Welcome back, Arpit <span style="color:#3a9b82">✳</span>', 'Here’s what’s happening across your sample inventory today.', `<button class="btn" data-action="export-csv"><span class="btn-symbol">↓</span> Export data</button><button class="btn btn-primary" data-action="add-item"><span class="btn-symbol">＋</span> Add medicine</button>`)}
    <section class="metric-grid">
      ${metricCard('Tracked batches', state.items.length, `<strong>Across ${new Set(state.items.map(item => item.category)).size} categories</strong>`, '▤', 'teal')}
      ${metricCard('Stock on hand', state.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('en-IN'), `<strong>${money(stockValue)} value</strong> at unit cost`, '▦', 'blue')}
      ${metricCard('Needs reordering', lowItems.length, `<span class="negative">${lowItems.filter(item => item.quantity <= item.reorderLevel / 2).length} critically low</span> · review today`, '!', 'amber')}
      ${metricCard('Expiry watch', expiring.length, `${alerts.filter(alert => alert.kind === 'expired').length} expired · next 90 days`, '⌛', 'red')}
    </section>
    <section class="overview-grid">
      <article class="panel"><div class="panel-header"><div><div class="panel-title">Inventory movement</div><div class="panel-subtitle">Illustrative stock activity · last 6 months</div></div><span class="tag teal">Sample view</span></div><div class="bar-chart">${chart}</div><div class="chart-legend"><span><i class="legend-swatch"></i>Received</span><span><i class="legend-swatch current"></i>Dispensed</span><span class="chart-caption">Units · illustrative sample only</span></div></article>
      <article class="panel"><div class="panel-header"><div><div class="panel-title">Stock health</div><div class="panel-subtitle">Batches above reorder and expiry thresholds</div></div><span class="tag">Today</span></div><div class="stock-health"><div class="health-ring" style="background:conic-gradient(var(--teal) 0 ${health}%,#e5eeea ${health}% 100%)"><div class="ring-value">${health}%<small>healthy</small></div></div><div class="health-stats"><div class="health-stat"><span>Healthy batches</span><strong>${healthy}</strong></div><div class="health-stat"><span>Low stock</span><strong class="warning">${lowItems.length}</strong></div><div class="health-stat"><span>On expiry watch</span><strong class="critical">${expiring.length}</strong></div><div class="health-stat"><span>Total batches</span><strong>${state.items.length}</strong></div></div></div><div class="health-foot"><span>Inventory health</span><span><b>${health}%</b> in good standing<div class="tiny-progress"><span style="width:${health}%"></span></div></span></div></article>
    </section>
    <section class="bottom-grid">
      <article class="panel"><div class="panel-header"><div><div class="panel-title">Priority stock review</div><div class="panel-subtitle">Low stock and near-expiry batches, ranked by heap priority</div></div><button class="text-link" data-page="alerts">View all alerts →</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Medicine / batch</th><th>On hand</th><th>Reorder at</th><th>Expiry</th><th>Status</th></tr></thead><tbody>${[...lowItems].sort((a, b) => a.quantity / Math.max(a.reorderLevel, 1) - b.quantity / Math.max(b.reorderLevel, 1)).slice(0, 4).map(item => { const [label, klass] = itemStatus(item); return `<tr><td>${medicineCell(item)}<small class="muted">${escapeHTML(item.batch)}</small></td><td><span class="stock-number">${item.quantity}</span></td><td>${item.reorderLevel}</td><td>${formatDate(item.expiry)}</td><td><span class="status-pill ${klass}">${label}</span></td></tr>`; }).join('') || `<tr><td colspan="5"><div class="no-data"><strong>No low-stock items</strong>Everything is above its reorder point.</div></td></tr>`}</tbody></table></div></article>
      <article class="panel"><div class="panel-header"><div><div class="panel-title">Needs your attention</div><div class="panel-subtitle">${alerts.length} active flags · most urgent first</div></div><span class="tag">Live</span></div>${alertRows(alerts, 4)}<div style="margin-top:11px"><button class="text-link" data-page="alerts">Open alert center →</button></div></article>
    </section>
    <div class="dsa-note" style="margin-top:14px"><strong>Academic prototype:</strong> This workspace uses fictional sample stock for demonstration. It is not connected to a pharmacy system and contains no patient data.</div>`;
}

function renderInventory() {
  return `${pageHeading('Medicine inventory', 'Track each batch, check expiry dates, and keep stock levels current.', `<button class="btn" data-action="export-csv"><span class="btn-symbol">↓</span> Export CSV</button><button class="btn btn-primary" data-action="add-item"><span class="btn-symbol">＋</span> Add medicine</button>`)}
    <div class="toolbar"><div class="toolbar-left"><label class="search-box"><span class="search-icon">⌕</span><input id="inventory-search" type="search" placeholder="Search name, batch, supplier…" autocomplete="off" /></label><select class="select-control" id="inventory-status"><option value="all">All stock status</option><option value="low">Below reorder</option><option value="expiry">Expiry watch</option><option value="healthy">In stock</option></select></div><div class="toolbar-right"><span class="muted" style="font-size:9px">Sort by</span><select class="select-control" id="inventory-sort"><option value="expiry">Expiry date</option><option value="name">Medicine name</option><option value="quantity">Quantity: low to high</option><option value="supplier">Supplier</option></select></div></div>
    <div class="inventory-card data-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Medicine / category</th><th>Batch</th><th>On hand</th><th>Reorder level</th><th>Expiry date</th><th>Supplier</th><th>Status</th><th>Actions</th></tr></thead><tbody id="inventory-rows"></tbody></table></div><div class="table-footer"><span id="inventory-count">Showing ${state.items.length} batches</span><span>Inventory is saved in this browser</span></div></div>
    <p class="muted" id="search-hint" style="font-size:9px;margin:10px 3px 0"></p>`;
}
function inventoryRows(items) {
  if (!items.length) return `<tr><td colspan="8"><div class="no-data"><strong>No matching batches</strong>Try another name, batch number, or supplier.</div></td></tr>`;
  return items.map(item => {
    const [status, klass] = itemStatus(item); const pct = Math.min(100, item.quantity / Math.max(item.reorderLevel * 2, 1) * 100); const trackClass = item.quantity <= item.reorderLevel * .5 ? 'critical' : item.quantity <= item.reorderLevel ? 'low' : '';
    return `<tr><td>${medicineCell(item)}</td><td>${escapeHTML(item.batch)}</td><td><span class="stock-track"><span class="${trackClass}" style="width:${pct}%"></span></span><span class="stock-number">${item.quantity}</span></td><td>${item.reorderLevel}</td><td>${formatDate(item.expiry)}</td><td>${escapeHTML(item.supplier)}</td><td><span class="status-pill ${klass}">${status}</span></td><td><div class="table-actions"><button class="row-action" data-action="movement" data-kind="dispense" data-id="${escapeHTML(item.id)}" title="Dispense stock">− Dispense</button><button class="row-action" data-action="movement" data-kind="receive" data-id="${escapeHTML(item.id)}" title="Receive stock">＋ Receive</button><button class="row-action" data-action="edit-item" data-id="${escapeHTML(item.id)}" title="Edit batch">Edit</button></div></td></tr>`;
  }).join('');
}
function refreshInventoryRows() {
  const rows = document.getElementById('inventory-rows'); if (!rows) return;
  const query = document.getElementById('inventory-search')?.value || ''; let items = searchItems(query);
  const filter = document.getElementById('inventory-status')?.value || 'all';
  if (filter === 'low') items = items.filter(item => item.quantity <= item.reorderLevel);
  if (filter === 'expiry') items = items.filter(item => daysUntil(item.expiry) <= 90);
  if (filter === 'healthy') items = items.filter(item => item.quantity > item.reorderLevel && daysUntil(item.expiry) > 30);
  const sort = document.getElementById('inventory-sort')?.value || 'expiry';
  if (sort === 'expiry') items.sort((a, b) => a.expiry.localeCompare(b.expiry));
  if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'quantity') items.sort((a, b) => a.quantity - b.quantity);
  if (sort === 'supplier') items.sort((a, b) => a.supplier.localeCompare(b.supplier) || a.name.localeCompare(b.name));
  rows.innerHTML = inventoryRows(items);
  const count = document.getElementById('inventory-count'); if (count) count.textContent = `Showing ${items.length} of ${state.items.length} batches`;
  const hint = document.getElementById('search-hint');
  if (hint) hint.textContent = query && items.length && !items.some(item => item.name.toLowerCase().includes(query.trim().toLowerCase())) ? 'Approximate match powered by longest common subsequence (LCS).' : '';
}

function renderAlerts() {
  const alerts = buildAlerts(); const shown = alertFilter === 'all' ? alerts : alerts.filter(alert => alertFilter === 'low' ? alert.kind === 'low' : alert.kind !== 'low');
  const expiring = alerts.filter(alert => alert.kind === 'expiry').length; const low = alerts.filter(alert => alert.kind === 'low').length; const expired = alerts.filter(alert => alert.kind === 'expired').length;
  return `${pageHeading('Alerts & expiry', 'The priority queue puts the most urgent stock and expiry items first.', `<button class="btn" data-action="export-csv"><span class="btn-symbol">↓</span> Export list</button>`)}
    <section class="alert-summary"><div class="alert-stat"><span class="metric-icon amber">!</span><div><strong>${low}</strong><span>Below reorder level</span></div></div><div class="alert-stat"><span class="metric-icon red">⌛</span><div><strong>${expiring}</strong><span>Expiry watch · 90 days</span></div></div><div class="alert-stat"><span class="metric-icon blue">×</span><div><strong>${expired}</strong><span>Expired batches</span></div></div></section>
    <section class="panel"><div class="panel-header"><div><div class="panel-title">Priority queue</div><div class="panel-subtitle">Urgency is calculated from remaining stock and days to expiry.</div></div><span class="tag teal">Min-heap · O(log n) updates</span></div><div class="filter-tabs"><button class="filter-tab ${alertFilter === 'all' ? 'active' : ''}" data-filter="all">All alerts <span class="muted">${alerts.length}</span></button><button class="filter-tab ${alertFilter === 'low' ? 'active' : ''}" data-filter="low">Low stock <span class="muted">${low}</span></button><button class="filter-tab ${alertFilter === 'expiry' ? 'active' : ''}" data-filter="expiry">Expiry <span class="muted">${expiring + expired}</span></button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Priority</th><th>Medicine / batch</th><th>Alert</th><th>Current stock</th><th>Expiry</th><th>Suggested action</th></tr></thead><tbody>${shown.length ? shown.map((alert, index) => `<tr><td><span class="tag ${index < 2 ? 'teal' : ''}">#${index + 1}</span></td><td>${medicineCell(alert.item)}<small class="muted">${escapeHTML(alert.item.batch)}</small></td><td><span class="status-pill ${alert.kind === 'expired' ? 'status-urgent' : alert.kind === 'low' ? 'status-low' : 'status-expiring'}">${escapeHTML(alert.message)}</span><div class="muted" style="font-size:8px;margin-top:4px">${escapeHTML(alert.detail)}</div></td><td>${alert.item.quantity} / ${alert.item.reorderLevel}</td><td>${formatDate(alert.item.expiry)}</td><td>${alert.kind === 'low' ? `<button class="btn btn-sm" data-action="movement" data-kind="receive" data-id="${escapeHTML(alert.item.id)}">Receive stock</button>` : `<button class="btn btn-sm" data-action="edit-item" data-id="${escapeHTML(alert.item.id)}">Review batch</button>`}</td></tr>`).join('') : `<tr><td colspan="6"><div class="no-data"><strong>You're all caught up</strong>No alerts match this view.</div></td></tr>`}</tbody></table></div></section>
    <div class="dsa-note"><strong>Alert ordering:</strong> A min-heap keeps the next action at the root. A low stock ratio or a shorter time to expiry receives a higher urgency and appears nearer the top.</div>`;
}

function graphNodeLabel(id) { return GRAPH_NODES.find(node => node.id === id)?.name || id; }
function renderGraphCanvas(highlight = []) {
  const active = new Set(highlight.map((id, index) => index ? `${highlight[index - 1]}|${id}` : '').filter(Boolean));
  const line = state.edges.map(edge => {
    const from = GRAPH_NODES.find(node => node.id === edge.from); const to = GRAPH_NODES.find(node => node.id === edge.to); const isActive = active.has(`${edge.from}|${edge.to}`) || active.has(`${edge.to}|${edge.from}`);
    const x1 = from.x * 10, y1 = from.y * 5, x2 = to.x * 10, y2 = to.y * 5;
    return `<line class="graph-edge ${isActive ? 'active' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="edge-label ${isActive ? 'active' : ''}" x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}">${edge.weight}</text>`;
  }).join('');
  const nodes = GRAPH_NODES.map(node => `<button class="graph-node" style="left:${node.x}%;top:${node.y}%" data-node="${node.id}" title="${escapeHTML(node.name)}"><i class="node-dot ${node.kind}"></i>${escapeHTML(node.name)}</button>`).join('');
  return `<div class="network-canvas"><svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-label="Weighted supplier distribution network">${line}</svg>${nodes}</div>`;
}
function nodeOptions(selected) { return GRAPH_NODES.map(node => `<option value="${node.id}" ${node.id === selected ? 'selected' : ''}>${escapeHTML(node.name)}</option>`).join(''); }
function renderNetwork() {
  const components = connectedComponents().length; const mst = kruskal();
  return `${pageHeading('Supply network', 'Explore supplier-to-department connections and compare weighted routes.', `<span class="tag teal">Adjacency list · ${GRAPH_NODES.length} nodes · ${state.edges.length} links</span>`)}
    <section class="network-layout"><article class="panel"><div class="panel-header"><div><div class="panel-title">Supplier & distribution graph</div><div class="panel-subtitle">Edge labels show illustrative delivery cost units. Select a route to highlight it.</div></div><span class="tag">Weighted, undirected</span></div>${renderGraphCanvas()}<div class="graph-legend"><span><i class="node-dot"></i>Supplier</span><span><i class="node-dot warehouse"></i>Warehouse</span><span><i class="node-dot department"></i>Department</span><span>━ Delivery link</span></div></article>
    <aside class="panel"><div class="panel-header"><div><div class="panel-title">Find a route</div><div class="panel-subtitle">Dijkstra's shortest path with a min-heap</div></div><span class="metric-icon teal">↗</span></div><form class="route-form" id="route-form"><div class="field"><label class="field-label" for="route-from">From</label><select class="select-control" id="route-from">${nodeOptions('apex')}</select></div><div class="field"><label class="field-label" for="route-to">To</label><select class="select-control" id="route-to">${nodeOptions('icu')}</select></div><button class="btn btn-primary" type="submit">Calculate best route <span>→</span></button></form><div class="route-result" id="route-result">${routeResultHTML(dijkstra('apex', 'icu'))}</div><div class="mini-metric-grid"><div class="mini-metric"><small>Connected components</small><strong>${components}</strong></div><div class="mini-metric"><small>Minimum spanning cost</small><strong>${mst.cost} units</strong></div></div><div class="separator"></div><div class="secondary-title">Explore graph algorithms</div><div class="network-methods"><button class="btn btn-sm" data-algorithm="bfs">BFS traversal</button><button class="btn btn-sm" data-algorithm="dfs">DFS traversal</button><button class="btn btn-sm" data-algorithm="bellman">Bellman–Ford</button><button class="btn btn-sm" data-algorithm="prim">Prim MST</button><button class="btn btn-sm" data-algorithm="kruskal">Kruskal MST</button><button class="btn btn-sm" data-algorithm="floyd">Floyd–Warshall</button><button class="btn btn-sm" data-algorithm="closure">Reachability</button></div><div class="algorithm-output" id="algorithm-output">Choose an algorithm to see its result. This network is sample data, so the values illustrate the method.</div></aside></section>`;
}
function routeResultHTML(result) {
  if (!result.path.length) return '<strong>No route found</strong><div class="route-path">These nodes are not connected in the current graph.</div>';
  return `<strong>Lowest route · ${result.cost} cost units</strong><div class="route-path">${result.path.map(graphNodeLabel).map(escapeHTML).join(' <span style="color:#9cbab0">→</span> ')}</div><div class="route-meta"><span>${result.path.length - 1} links</span><span>Weighted path</span><span>Dijkstra</span></div>`;
}
function renderPlanning() {
  const itemForAllocation = state.items.find(item => item.quantity > 0) || state.items[0];
  return `${pageHeading('Reorder planning', 'Use dynamic programming to prioritize whole-batch purchases within a fixed budget.', `<span class="tag teal">0/1 knapsack · O(nW)</span>`)}
    <section class="planning-grid"><article class="panel"><div class="panel-header"><div><div class="panel-title">Procurement optimizer</div><div class="panel-subtitle">Choose the set of urgent reorders with the highest criticality value.</div></div><span class="metric-icon teal">⌘</span></div><div class="budget-panel"><div class="field"><label class="field-label" for="budget-input">Available procurement budget</label><input class="input-control" id="budget-input" type="number" min="0" max="100000" step="500" value="${Number(state.budget) || 18000}" /></div><button class="btn btn-primary" data-action="run-planner">Optimize plan</button></div><div id="planner-content"></div><div class="notice">Each reorder is treated as a whole batch. Criticality and expiry urgency contribute to its priority score. Values are for this sample project only.</div></article>
    <article class="panel"><div class="panel-header"><div><div class="panel-title">Allocate scarce stock</div><div class="panel-subtitle">Distribute limited units to departments by criticality.</div></div><span class="tag">Resource allocation DP</span></div><div class="field"><label class="field-label" for="allocation-medicine">Medicine batch</label><select class="select-control" id="allocation-medicine">${state.items.filter(item => item.quantity > 0).map(item => `<option value="${escapeHTML(item.id)}" ${item.id === itemForAllocation?.id ? 'selected' : ''}>${escapeHTML(item.name)} · ${item.quantity} available</option>`).join('')}</select></div><form id="allocation-form" class="allocation-form"><div class="field"><label class="field-label" for="allocation-quantity">Units to allocate</label><input class="input-control" id="allocation-quantity" type="number" min="1" max="250" value="${Math.min(18, itemForAllocation?.quantity || 18)}" /></div><button class="btn" type="submit">Calculate split</button></form><div id="allocation-result"></div><div class="notice" style="margin-top:13px">Illustrative department priorities: ICU 10, Oncology 9, Emergency 10, General ward 6. You can review the suggested split before applying inventory changes.</div><button class="btn btn-quiet" style="margin-top:9px" data-action="apply-allocation">Apply suggested split to stock</button></article></section>`;
}
function refreshPlanner() {
  const input = document.getElementById('budget-input'); if (!input) return;
  const result = planOrders(input.value); const host = document.getElementById('planner-content');
  if (!result.candidates.length) { host.innerHTML = `<div class="no-data"><strong>No reorders needed right now</strong>All batches are above their reorder levels.</div>`; }
  else {
    host.innerHTML = `<div class="budget-result"><div><strong>${result.chosen.length}</strong><small>recommended orders</small></div><div class="result-spacer"><strong>${money(result.cost)}</strong><small>of ${money(result.capacity)} budget used</small></div></div><div class="planner-list">${result.chosen.length ? result.chosen.map(entry => `<div class="planner-item"><span class="metric-icon amber" style="height:24px;width:24px;font-size:10px">!</span><span class="planner-copy"><strong>${escapeHTML(entry.item.name)}</strong><small>Order ${entry.units} units · ${escapeHTML(entry.item.supplier)} · priority ${entry.item.priority}/10</small></span><span class="planner-value"><strong>${money(entry.cost)}</strong><small>${entry.value} points</small></span></div>`).join('') : `<div class="no-data"><strong>Budget is below the cost of every reorder</strong>Increase the budget to include at least one batch.</div>`}</div>${result.chosen.length ? `<div class="table-footer" style="padding:9px 0 0"><span>Criticality score · ${result.value} points</span><button class="btn btn-sm btn-primary" data-action="apply-plan">Apply suggested orders</button></div>` : ''}`;
  }
  const allocation = document.getElementById('allocation-result'); if (allocation) renderAllocationPreview();
}
function renderAllocationPreview() {
  const host = document.getElementById('allocation-result'); if (!host) return;
  const item = state.items.find(entry => entry.id === document.getElementById('allocation-medicine')?.value) || state.items[0];
  let amount = Number(document.getElementById('allocation-quantity')?.value) || 0; amount = Math.max(0, Math.min(250, amount, item?.quantity || 0));
  const result = allocateStock(amount, DEPARTMENTS);
  host.innerHTML = `<div class="allocation-bars">${DEPARTMENTS.map((department, i) => `<div class="allocation-row"><label>${department.name}</label><div class="allocation-bar"><span style="width:${department.demand ? result.assigned[i] / department.demand * 100 : 0}%"></span></div><strong>${result.assigned[i]} units</strong></div>`).join('')}</div><div class="table-footer" style="padding:9px 0 0"><span>Allocated ${result.used} of ${amount} units · score ${result.value}</span><span>DP allocation</span></div>`;
}

function renderReports() {
  const sorted = expiryTree().inOrder(); const supplierGroups = new Map();
  for (const item of state.items) { const group = supplierGroups.get(item.supplier) || { batches: 0, units: 0, value: 0 }; group.batches++; group.units += item.quantity; group.value += item.quantity * item.unitCost; supplierGroups.set(item.supplier, group); }
  const groups = [...supplierGroups.entries()].sort((a, b) => b[1].value - a[1].value);
  return `${pageHeading('Reports', 'Expiry-wise and supplier-wise summaries for the current sample inventory.', `<button class="btn btn-primary" data-action="export-csv"><span class="btn-symbol">↓</span> Download inventory CSV</button>`)}
    <section class="report-cards"><article class="panel"><div class="panel-header"><div><div class="panel-title">Inventory snapshot</div><div class="panel-subtitle">Current recorded batches</div></div><span class="tag">${new Date().toLocaleDateString('en-IN')}</span></div><div class="report-summary"><span class="metric-icon teal">▤</span><div><strong>${state.items.length} batches</strong><small>${state.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('en-IN')} total units · estimated value ${money(state.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0))}</small></div></div></article><article class="panel"><div class="panel-header"><div><div class="panel-title">Expiry watch</div><div class="panel-subtitle">Sorted by date using an AVL tree in-order traversal</div></div><span class="tag teal">Tree · O(n) report</span></div><div class="report-summary"><span class="metric-icon amber">⌛</span><div><strong>${sorted.filter(item => daysUntil(item.expiry) >= 0 && daysUntil(item.expiry) <= 90).length} batches</strong><small>Not yet expired; expiry in the next 90 days</small></div></div></article></section>
    <section class="bottom-grid"><article class="panel"><div class="panel-header"><div><div class="panel-title">Expiry-wise batch report</div><div class="panel-subtitle">Earliest expiry appears first</div></div><span class="tag">${sorted.length} records</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Medicine / batch</th><th>Expiry date</th><th>Time left</th><th>On hand</th><th>Status</th></tr></thead><tbody>${sorted.map(item => { const days = daysUntil(item.expiry); const [status, klass] = itemStatus(item); return `<tr><td>${medicineCell(item)}<small class="muted">${escapeHTML(item.batch)}</small></td><td>${formatDate(item.expiry)}</td><td>${formatDays(days)}</td><td>${item.quantity}</td><td><span class="status-pill ${klass}">${status}</span></td></tr>`; }).join('')}</tbody></table></div></article><article class="panel"><div class="panel-header"><div><div class="panel-title">Supplier-wise stock</div><div class="panel-subtitle">Batch count and on-hand value by supplier</div></div><span class="tag">${groups.length} suppliers</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Supplier</th><th>Batches</th><th>Units</th><th>Stock value</th></tr></thead><tbody>${groups.map(([supplier, group]) => `<tr><td><strong style="font-size:9px;color:#405c5e">${escapeHTML(supplier)}</strong></td><td>${group.batches}</td><td>${group.units}</td><td>${money(group.value)}</td></tr>`).join('')}</tbody></table></div></article></section>`;
}

function renderDSALab() {
  const cards = [
    ['⌕', 'Hash table', 'Exact medicine-name lookups and batch indexing use separate chaining to handle collisions.', 'Average lookup', 'O(1)'],
    ['⌬', 'AVL expiry tree', 'Self-balancing rotations keep batch records ordered by expiry. In-order traversal powers expiry reports.', 'Insert / search', 'O(log n)'],
    ['◉', 'Binary min-heap', 'The root is the most urgent stock or expiry alert. Insert and remove operations keep priorities in order.', 'Push / pop', 'O(log n)'],
    ['⌘', 'Graph traversal', 'An adjacency list models suppliers, a warehouse, and departments. BFS and DFS explore reachable nodes.', 'BFS / DFS', 'O(V + E)'],
    ['↗', 'Shortest paths', 'Dijkstra finds the lowest weighted route. Bellman–Ford also supports negative edges; Floyd–Warshall checks every pair.', 'Dijkstra', 'O((V + E) log V)'],
    ['⌗', 'Minimum spanning tree', 'Prim and Kruskal select a minimum-cost set of links that reaches every node in the connected graph.', 'Kruskal', 'O(E log E)'],
    ['▦', '0/1 knapsack', 'The procurement planner chooses whole reorder batches that maximize criticality under the budget limit.', 'Time / space', 'O(nW) / O(W)'],
    ['⇄', 'Resource allocation', 'A dynamic-programming table assigns limited units to departments by demand and priority.', 'Time', 'O(nW)'],
    ['≈', 'LCS name matching', 'A longest common subsequence score can suggest a medicine when the typed name has a small spelling difference.', 'Time', 'O(mn)']
  ];
  return `${pageHeading('DSA lab', 'A practical map from course concepts to the features in this prototype.', `<button class="btn" data-page="network">Open graph explorer <span>→</span></button>`)}
    <section class="dsa-grid">${cards.map(([icon, title, description, label, complexity]) => `<article class="dsa-card"><div class="dsa-card-top"><span class="dsa-icon">${icon}</span><h3>${title}</h3></div><p>${description}</p><div class="complexity"><span>${label}</span><strong>${complexity}</strong></div></article>`).join('')}</section>
    <div class="dsa-note"><strong>Implementation note:</strong> The graph uses sample delivery weights, and the inventory starts with fictional batches. The algorithms are included to demonstrate data structures and decision flows for a DSA project; they are not operational procurement advice. “W” is the integer budget capacity, “n” is the number of candidate batches, and “V/E” are graph nodes/edges.</div>`;
}

function itemFormHTML(item = null) {
  const editing = Boolean(item);
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="medicine-modal-title"><div class="modal-header"><div><h2 id="medicine-modal-title">${editing ? 'Edit batch details' : 'Add medicine batch'}</h2><p>${editing ? 'Update the selected record in your local inventory.' : 'Add a new medicine or medical supply batch.'}</p></div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-form" id="medicine-form" data-id="${editing ? escapeHTML(item.id) : ''}"><div class="form-grid"><div class="field span-2"><label class="field-label" for="med-name">Medicine / supply name</label><input id="med-name" name="name" required maxlength="80" value="${escapeHTML(item?.name || '')}" placeholder="e.g. Paracetamol 500 mg" /></div><div class="field"><label class="field-label" for="med-category">Category</label><input id="med-category" name="category" required maxlength="35" value="${escapeHTML(item?.category || '')}" placeholder="e.g. Analgesic" /></div><div class="field"><label class="field-label" for="med-batch">Batch number</label><input id="med-batch" name="batch" required maxlength="32" value="${escapeHTML(item?.batch || '')}" placeholder="e.g. PCM-26-014" /></div><div class="field"><label class="field-label" for="med-quantity">Current quantity</label><input id="med-quantity" name="quantity" type="number" min="0" step="1" required value="${item?.quantity ?? 0}" /></div><div class="field"><label class="field-label" for="med-reorder">Reorder level</label><input id="med-reorder" name="reorderLevel" type="number" min="0" step="1" required value="${item?.reorderLevel ?? 10}" /></div><div class="field"><label class="field-label" for="med-expiry">Expiry date</label><input id="med-expiry" name="expiry" type="date" required value="${escapeHTML(item?.expiry || '')}" /></div><div class="field"><label class="field-label" for="med-cost">Unit cost (₹)</label><input id="med-cost" name="unitCost" type="number" min="0" step="0.01" required value="${item?.unitCost ?? ''}" placeholder="0.00" /></div><div class="field"><label class="field-label" for="med-supplier">Supplier</label><select id="med-supplier" name="supplier">${state.suppliers.map(supplier => `<option ${supplier === item?.supplier ? 'selected' : ''}>${escapeHTML(supplier)}</option>`).join('')}</select></div><div class="field"><label class="field-label" for="med-location">Storage location / department</label><input id="med-location" name="location" maxlength="40" value="${escapeHTML(item?.location || 'Central Warehouse')}" placeholder="e.g. ICU" /></div><div class="field"><label class="field-label" for="med-priority">Criticality (1–10)</label><input id="med-priority" name="priority" type="number" min="1" max="10" step="1" value="${item?.priority ?? 5}" /></div></div><div class="modal-footer"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${editing ? 'Save changes' : 'Add batch'}</button></div></form></section></div>`;
}
function movementFormHTML(item, kind) {
  const receive = kind === 'receive'; const suggested = receive ? Math.max(1, item.reorderLevel * 2 - item.quantity) : 1;
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="movement-title" style="width:min(430px,100%)"><div class="modal-header"><div><h2 id="movement-title">${receive ? 'Receive stock' : 'Dispense stock'}</h2><p>${escapeHTML(item.name)} · batch ${escapeHTML(item.batch)} · ${item.quantity} units on hand</p></div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><form class="modal-form" id="movement-form" data-id="${escapeHTML(item.id)}" data-kind="${kind}"><div class="field"><label class="field-label" for="movement-amount">Units to ${receive ? 'receive' : 'dispense'}</label><input id="movement-amount" name="amount" type="number" min="1" step="1" required value="${suggested}" /></div><div class="notice" style="margin-top:10px">${receive ? 'This will increase the batch quantity in your local demo inventory.' : 'The amount cannot exceed the available batch quantity.'}</div><div class="modal-footer"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${receive ? 'Receive units' : 'Dispense units'}</button></div></form></section></div>`;
}
function openModal(html) { document.getElementById('modal-root').innerHTML = html; document.querySelector('#modal-root input, #modal-root select')?.focus(); }
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

function downloadCSV() {
  const headers = ['Name', 'Category', 'Batch', 'Quantity', 'Reorder level', 'Expiry', 'Supplier', 'Unit cost INR', 'Location', 'Criticality'];
  const rows = state.items.map(item => [item.name, item.category, item.batch, item.quantity, item.reorderLevel, item.expiry, item.supplier, item.unitCost, item.location, item.priority]);
  const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = 'medstock-inventory.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); showToast('Inventory CSV downloaded.');
}
function applyPlan() {
  const budget = document.getElementById('budget-input')?.value ?? state.budget; const result = planOrders(budget);
  if (!result.chosen.length) { showToast('No reorder fits within this budget.'); return; }
  for (const entry of result.chosen) entry.item.quantity += entry.units;
  state.budget = Number(budget) || 0; saveState(); showToast(`${result.chosen.length} suggested orders added to sample stock.`); renderPage();
}
function applyAllocation() {
  const item = state.items.find(entry => entry.id === document.getElementById('allocation-medicine')?.value);
  if (!item) { showToast('Choose an in-stock batch first.'); return; }
  const amount = Math.min(Number(document.getElementById('allocation-quantity')?.value) || 0, item.quantity);
  if (amount < 1) { showToast('Enter at least one unit to allocate.'); return; }
  const result = allocateStock(amount, DEPARTMENTS); item.quantity -= result.used;
  result.assigned.forEach((quantity, index) => {
    if (!quantity) return;
    const department = DEPARTMENTS[index].name;
    const destination = state.items.find(entry => entry.id !== item.id && entry.name === item.name && entry.batch === item.batch && entry.location === department);
    if (destination) destination.quantity += quantity;
    else {
      let id = `${item.id}-A${Date.now()}-${index}`;
      while (state.items.some(entry => entry.id === id)) id += 'x';
      state.items.push({ ...item, id, quantity, location: department });
    }
  });
  saveState(); showToast(`${result.used} units allocated to departments.`); renderPage();
}

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-page]');
  if (nav) { currentPage = nav.dataset.page; renderPage(); document.getElementById('main-content').focus({ preventScroll: true }); return; }
  const filter = event.target.closest('[data-filter]');
  if (filter) { alertFilter = filter.dataset.filter; renderPage(); return; }
  const button = event.target.closest('[data-action]');
  if (button) {
    const action = button.dataset.action; const id = button.dataset.id; const item = state.items.find(entry => entry.id === id);
    if (action === 'add-item') openModal(itemFormHTML());
    if (action === 'edit-item' && item) openModal(itemFormHTML(item));
    if (action === 'movement' && item) openModal(movementFormHTML(item, button.dataset.kind));
    if (action === 'close-modal') closeModal();
    if (action === 'backdrop-close' && event.target === button) closeModal();
    if (action === 'export-csv') downloadCSV();
    if (action === 'run-planner') refreshPlanner();
    if (action === 'apply-plan') applyPlan();
    if (action === 'apply-allocation') applyAllocation();
    if (action === 'reset-data') {
      if (window.confirm('Restore the original sample inventory? Your changes in this browser will be replaced.')) { state = initialState(); saveState(); currentPage = 'overview'; renderPage(); showToast('Sample inventory restored.'); }
    }
    if (action === 'reset-data' && !button.closest('.topbar')) return;
  }
  const algorithm = event.target.closest('[data-algorithm]');
  if (algorithm) runGraphAlgorithm(algorithm.dataset.algorithm);
});

document.addEventListener('input', event => {
  if (event.target.id === 'inventory-search') refreshInventoryRows();
  if (event.target.id === 'budget-input') refreshPlanner();
  if (event.target.id === 'allocation-quantity') renderAllocationPreview();
});
document.addEventListener('change', event => {
  if (['inventory-status', 'inventory-sort'].includes(event.target.id)) refreshInventoryRows();
  if (event.target.id === 'allocation-medicine') renderAllocationPreview();
});
document.addEventListener('submit', event => {
  event.preventDefault(); const form = event.target;
  if (form.id === 'medicine-form') {
    const values = Object.fromEntries(new FormData(form).entries()); const existing = state.items.find(item => item.id === form.dataset.id);
    const item = { ...existing, id: existing?.id || `MED-${Date.now().toString().slice(-7)}`, name: values.name.trim(), category: values.category.trim(), batch: values.batch.trim(), quantity: Number(values.quantity), reorderLevel: Number(values.reorderLevel), expiry: values.expiry, supplier: values.supplier, unitCost: Number(values.unitCost), location: (values.location || 'Central Warehouse').trim(), priority: Math.max(1, Math.min(10, Number(values.priority) || 5)) };
    if (existing) state.items = state.items.map(entry => entry.id === existing.id ? item : entry); else state.items.push(item);
    saveState(); closeModal(); renderPage(); showToast(existing ? 'Batch details updated.' : 'Medicine batch added.');
  }
  if (form.id === 'movement-form') {
    const item = state.items.find(entry => entry.id === form.dataset.id); const amount = Math.floor(Number(new FormData(form).get('amount')));
    if (!item || amount < 1) { showToast('Enter a valid quantity.'); return; }
    if (form.dataset.kind === 'dispense' && amount > item.quantity) { showToast(`Only ${item.quantity} units are available.`); return; }
    item.quantity += form.dataset.kind === 'receive' ? amount : -amount; saveState(); closeModal(); renderPage(); showToast(`${amount} units ${form.dataset.kind === 'receive' ? 'received' : 'dispensed'}.`);
  }
  if (form.id === 'route-form') {
    const from = document.getElementById('route-from').value; const to = document.getElementById('route-to').value; const result = dijkstra(from, to);
    const host = document.getElementById('route-result'); if (host) host.innerHTML = routeResultHTML(result);
    const canvas = document.querySelector('.network-canvas'); if (canvas) canvas.outerHTML = renderGraphCanvas(result.path);
  }
  if (form.id === 'allocation-form') renderAllocationPreview();
});

function runGraphAlgorithm(kind) {
  const output = document.getElementById('algorithm-output'); if (!output) return;
  const start = document.getElementById('route-from')?.value || 'apex'; const finish = document.getElementById('route-to')?.value || 'icu'; let result = '';
  if (kind === 'bfs' || kind === 'dfs') {
    const order = kind === 'bfs' ? bfs(start) : dfs(start); result = `<strong>${kind.toUpperCase()} order from ${escapeHTML(graphNodeLabel(start))}:</strong><br>${order.map(graphNodeLabel).map(escapeHTML).join(' → ')}<br><span>All ${order.length} reachable nodes visited · O(V + E)</span>`;
  } else if (kind === 'bellman') {
    const route = bellmanFord(start, finish); result = `<strong>Bellman–Ford:</strong> ${route.path.length ? `${escapeHTML(graphNodeLabel(start))} → ${escapeHTML(graphNodeLabel(finish))} costs ${route.cost} units.` : 'No route found.'}<br><span>Supports negative edge weights · O(VE)</span>`;
  } else if (kind === 'prim' || kind === 'kruskal') {
    const tree = kind === 'prim' ? prim() : kruskal(); result = `<strong>${kind === 'prim' ? "Prim's" : "Kruskal's"} minimum spanning tree:</strong> ${tree.edges.length} links connect ${GRAPH_NODES.length} nodes for ${tree.cost} total cost units.<br><span>Both methods should give the same cost for this connected sample graph.</span>`;
  } else if (kind === 'floyd') {
    const all = floydWarshall(); const fromIndex = all.ids.indexOf(start), toIndex = all.ids.indexOf(finish); const distance = all.distances[fromIndex][toIndex];
    result = `<strong>Floyd–Warshall all-pairs result:</strong> ${escapeHTML(graphNodeLabel(start))} to ${escapeHTML(graphNodeLabel(finish))} costs ${Number.isFinite(distance) ? distance : '∞'} units.<br><span>Computed the full ${GRAPH_NODES.length} × ${GRAPH_NODES.length} distance matrix · O(V³)</span>`;
  } else if (kind === 'closure') {
    const closure = transitiveClosure(); const i = GRAPH_NODES.findIndex(node => node.id === start); const reachable = GRAPH_NODES.filter((node, j) => closure[i][j]).map(node => node.name);
    result = `<strong>Transitive closure from ${escapeHTML(graphNodeLabel(start))}:</strong><br>${reachable.map(escapeHTML).join(' · ')}<br><span>${reachable.length} of ${GRAPH_NODES.length} nodes are reachable.</span>`;
  }
  output.innerHTML = result;
  if (kind === 'bfs') document.querySelector('.network-canvas').outerHTML = renderGraphCanvas(bfs(start));
  if (kind === 'dfs') document.querySelector('.network-canvas').outerHTML = renderGraphCanvas(dfs(start));
  if (kind === 'prim') document.querySelector('.network-canvas').outerHTML = renderGraphCanvas(prim().edges.flatMap(edge => [edge.from, edge.to]));
  if (kind === 'kruskal') document.querySelector('.network-canvas').outerHTML = renderGraphCanvas(kruskal().edges.flatMap(edge => [edge.from, edge.to]));
}

document.getElementById('reset-data').addEventListener('click', () => {
  if (window.confirm('Restore the original sample inventory? Your changes in this browser will be replaced.')) { state = initialState(); saveState(); currentPage = 'overview'; renderPage(); showToast('Sample inventory restored.'); }
});
renderPage();

