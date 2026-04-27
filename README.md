# DJIA Intelligence Dashboard

**Real-time Dow Jones data pipeline*

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![Stack](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Stack](https://img.shields.io/badge/Recharts-2-22C55E?style=flat)
![Stack](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Stack](https://img.shields.io/badge/Gradle-8-02303A?style=flat&logo=gradle&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)

---

## Overview

This project is a full-stack data pipeline that queries the **Dow Jones Industrial Average (^DJI)** from the Yahoo Finance API every 5 seconds, stores each price-timestamp pair in a Java `LinkedList` queue, and surfaces the data stream into a multi-tab interactive dashboard.


---

## Live Demo

> **[View the live dashboard →](https://your-netlify-url.netlify.app)**

---

## Screenshots

| Live Feed | Analysis | Report | Pipeline |
|-----------|----------|--------|----------|
| Real-time price, queue log, tick delta | Moving average, distribution, volatility | Executive write-up with findings | Architecture breakdown + annotated code |

---

## Features

**Live Feed tab**
- Real-time DJIA price with session change and percentage
- Session high, low, range, and 5-tick momentum indicator
- Area chart of full price history with open price reference line
- Live queue log showing the most recent 30 entries with fade effect
- Tick delta bar chart showing price change per 5-second interval

**Analysis tab**
- Up/down tick counts and win rate
- Max single gain and max single loss
- Standard deviation of tick moves
- Price vs 5-tick moving average chart
- Price distribution histogram
- Volatility index with visual classification (Low / Moderate / High)

**Report tab**
- Executive summary with session narrative
- Four key findings with data-backed explanations
- Full session statistics table
- Transferable skills section mapping pipeline components to higher education analytics use cases

**Pipeline tab**
- End-to-end architecture flow diagram
- Step-by-step breakdown of each pipeline component
- Annotated `App.java` code block showing the core implementation

---

## Tech Stack

### Backend — Java data pipeline
| Component | Technology |
|-----------|------------|
| Language | Java 17 |
| Build tool | Gradle |
| API library | YahooFinanceAPI v3.17.0 |
| Data structure | `LinkedList<String>` (Queue interface) |
| Scheduling | `Thread.sleep(5000)` polling loop |

### Frontend — React dashboard
| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Charts | Recharts 2 |
| Typography | IBM Plex Sans + IBM Plex Mono |
| Deployment | Netlify |

---

## Project Structure

```
djia-dashboard/
├── src/
│   ├── App.jsx          # Main dashboard — all tabs and components
│   └── main.jsx         # React entry point
├── index.html           # Vite HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── netlify.toml         # Netlify build config
```

```
java-pipeline/
└── app/src/main/java/
    └── App.java         # Core Java pipeline — API query + queue storage
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Java 17+
- Gradle 8+

### Run the frontend locally

```bash
git clone https://github.com/YOUR_USERNAME/djia-dashboard.git
cd djia-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Run the Java pipeline

```bash
cd java-pipeline
gradle build
gradle run
```

The pipeline will print live DJIA prices to the console every 5 seconds:

```
[2026-04-27 10:58:18] DJIA: $38518.43
Queue size: 1
[2026-04-27 10:58:23] DJIA: $38568.19
Queue size: 2
```

---

## Deploy to Netlify

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from GitHub**
3. Select this repository
4. Build settings are auto-configured via `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy** — live in ~60 seconds

---

## Architecture

```
Yahoo Finance API
      ↓
YahooFinanceAPI v3.17 (Gradle dependency)
      ↓
Java App — while(true) loop, 5s sleep
      ↓
LinkedList<String> Queue — O(1) insertion
      ↓
[timestamp] DJIA: $price entries
      ↓
React Dashboard — Live · Analysis · Report · Pipeline
```

The frontend simulates the queue output in real-time to demonstrate what a full-stack integration produces, including statistical derivations from the raw price stream.

---

## Key Code — App.java

```java
Queue<String> stockQueue = new LinkedList<>();

while (true) {
    Stock dow = YahooFinance.get("^DJI");
    BigDecimal price = dow.getQuote().getPrice();
    String timestamp = LocalDateTime.now()
        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

    String entry = String.format("[%s] DJIA: $%s",
        timestamp, price.toPlainString());
    stockQueue.add(entry);

    System.out.println(entry);
    System.out.println("Queue size: " + stockQueue.size());

    Thread.sleep(5000);
}
```

---

## About

Built by **Krishna Inukonda**
MS Computer Science & AI/Data Analytics — Virginia Tech

- [LinkedIn](https://linkedin.com/in/krishnainukonda)
- [GitHub](https://github.com/krishnaink)

*Part of the Citi Software Engineering Virtual Experience · Extended with full-stack dashboard for portfolio demonstration.*
