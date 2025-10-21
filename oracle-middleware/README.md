# beatswap\_middleware

> Middleware service for managing API interactions in the BeatSwap ecosystem.

---

## 🔹 Project Overview

`beatswap_middleware` is the backend middleware for the **BeatSwap platform**, designed to efficiently manage communication between services and API interactions.

* Ensures fast and secure data transfer between external sources and internal services
* Centralizes repetitive data processing and validation logic
* Modular design for scalability and maintainability

---

## 🔹 Key Features

1. **API Integration**

   * Handles data exchange between BeatSwap frontend and ICP Network APIs
   * Validates requests/responses and transforms data formats

2. **Data Processing**

   * Processes real-time transaction data
   * Prevents duplicates and filters data based on timestamps

3. **Logging & Monitoring**

   * Records request/response logs
   * Tracks errors and system status

---

## 🔹 Tech Stack

* **Backend**: Node.js / TypeScript
* **Framework**: NestJS
* **Deployment/Operations**: PM2, AWS (CodeCommit)

---
# Install dependencies
npm install

# Run local server
npm run start:dev

---

## 🔹 License

MIT License

---