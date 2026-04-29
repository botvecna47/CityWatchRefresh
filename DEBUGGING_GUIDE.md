# Frontend Memory Profiling Guide (React + Vite)

Since adding heavy monitoring libraries to the frontend bundle negatively impacts performance, the best way to profile memory leaks and optimize your React application is by using **Chrome DevTools**.

## How to Catch Memory Leaks in CityWatch

### Step 1: Open Chrome DevTools
1. Open your React app (`http://localhost:5173`).
2. Press `F12` or `Ctrl + Shift + I` to open Chrome DevTools.
3. Click on the **Memory** tab.

### Step 2: Take a Heap Snapshot
A heap snapshot shows you exactly what is stored in your browser's memory at that exact moment.
1. Select the **Heap snapshot** radio button.
2. Click the **Take snapshot** button at the bottom.
3. *Perform an action in your app* (e.g., navigate to a report, upload an image, then navigate back to home).
4. Take a **second snapshot**.
5. Select the second snapshot, and change the view filter from "Summary" to **"Comparison"**.
6. Compare Snapshot 1 vs Snapshot 2 to see if objects (like detached DOM nodes, large arrays, or unmounted React components) failed to garbage collect.

### Step 3: Allocation Timelines (Real-time monitoring)
To see memory usage spike in real-time as you use the app:
1. Select the **Allocation instrumentation on timeline** radio button.
2. Click **Start**.
3. Use the CityWatch app normally (scroll the feed, open the map, upload an image).
4. Watch the blue bars (memory allocated) and gray bars (memory freed). 
5. If you see repeated blue spikes that never turn gray, you have found a memory leak (likely an un-cleared `useEffect` interval, un-removed event listener, or stale state).

### Common React Memory Leak Culprits
- **Event Listeners**: Adding `window.addEventListener` inside a `useEffect` without a proper `return () => window.removeEventListener(...)` cleanup function.
- **SetInterval/SetTimeout**: Forgetting to `clearInterval()` when the component unmounts.
- **Large State Arrays**: Keeping unnecessary historical data in Redux/Zustand or local state instead of paginating.
- **Leaflet Maps**: Not properly destroying map instances when the component unmounts.
