# 🌐 GeoPulse 3D
**High-Frequency Real-Time Telemetry & Data Visualization Engine**

GeoPulse 3D is a full-stack system designed to ingest, process, and render high-volume data streams in real-time. It maps simulated global events (like financial transactions or network telemetry) onto an interactive 3D WebGL globe.

## 🚀 System Architecture & Optimizations

This project solves major performance bottlenecks typically found in real-time browser applications:

*   **Multi-Threading (Web Workers):** Network I/O and JSON parsing for the WebSocket stream (50+ events/sec) are offloaded to a background Web Worker. This prevents the main UI thread from blocking, ensuring a smooth 60 FPS render loop.
*   **Zero Garbage Collection Spikes:** Avoids continuous instantiation of 3D meshes. Instead, it utilizes a pre-allocated `Float32Array` ring buffer and `THREE.BufferGeometry` to update particle coordinates directly in GPU memory.
*   **Real-Time Spherical Mathematics:** Implements custom trigonometric algorithms to map 2D Geographic Coordinates (Latitude/Longitude) into 3D Cartesian space $(X, Y, Z)$ on the fly.
*   **High-Throughput Backend:** A lightweight Node.js/Express server paired with the `ws` library acts as the data firehose, broadcasting continuous event frames to all connected clients.

## 💻 Tech Stack
*   **Backend:** Node.js, Express, WebSockets (`ws`)
*   **Frontend Engine:** Three.js (WebGL), Vanilla JavaScript
*   **UI/Styling:** CSS3 Glassmorphism

## ⚙️ Local Setup & Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/DARSHAN-byte77/geopulse-3d.git](https://github.com/DARSHAN-byte77/geopulse-3d.git)