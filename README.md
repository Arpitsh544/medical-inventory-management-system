# MedStock — Medical Inventory Management System

A small, self-contained browser prototype for a Data Structures and Algorithms project. It uses fictional sample batches to demonstrate stock tracking, expiry alerts, supplier routes, and procurement planning.

## Run it on localhost

On Windows, extract the package and double-click `Start MedStock.cmd`. It starts a Python server on `127.0.0.1`, chooses a free port from 8765–8790, and opens the app in your browser. Keep the command window open while using the app; press `Ctrl+C` there to stop it. Python 3 must be installed. You can also open `index.html` directly. The app has no build step or external service requirement. Google Fonts are optional; system fonts are used as a fallback. Changes are saved in the browser's local storage. Use the circular-arrow button in the top bar to restore the original sample data.

## GitHub Pages deployment

The `.github/workflows/pages.yml` workflow copies `index.html`, `app.js`, and `styles.css` into a clean site folder and deploys them to GitHub Pages on pushes to `main`. In the repository, choose **Settings → Pages → Build and deployment → GitHub Actions** once. The workflow then publishes the site and reports its URL in the GitHub Actions run.

## Included workflows

- Add and edit medicine or supply batches, receive stock, and record dispensing.
- Search by medicine, batch, supplier, category, or location; an LCS-based approximate name match is used when there is no direct match.
- Review low-stock, expired, and near-expiry alerts in urgency order.
- Explore the supplier and department network with BFS, DFS, Dijkstra, Bellman–Ford, Floyd–Warshall, Prim, Kruskal, connected components, and transitive closure.
- Plan whole-batch reorders under a budget using 0/1 knapsack and preview department stock allocation with dynamic programming.
- Review expiry-wise and supplier-wise reports and export the inventory as CSV.

## DSA mapping

| Feature | Structure or algorithm | Complexity shown |
| --- | --- | --- |
| Exact medicine-name lookup | Separate-chaining hash table | Average O(1) |
| Expiry-ordered report | AVL tree and in-order traversal | O(log n) insertion, O(n) report |
| Alert queue and shortest-path frontier | Binary min-heap | O(log n) push/pop |
| Supplier network traversal | Adjacency list, BFS, DFS | O(V + E) |
| Lowest-cost supplier route | Dijkstra | O((V + E) log V) |
| All-pairs shortest paths | Floyd–Warshall | O(V^3) |
| Minimum-cost network links | Prim and Kruskal | O(E log V), O(E log E) |
| Budget-limited purchase plan | 0/1 knapsack | O(nW) |
| Approximate medicine-name match | Longest common subsequence | O(mn) |

## Prototype boundary

This is an academic demonstration, not a production pharmacy system. The data is fictional and stored in the current browser only. It has no authentication, multi-user sync, clinical decision support, or live supplier connection. Review all sample values before using the app for a presentation.

