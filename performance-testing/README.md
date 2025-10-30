# Performance Testing - Dog CEO API Application

This is a Next.js application integrated with the Dog CEO API, configured with comprehensive k6 performance testing scenarios.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Performance Testing Overview](#performance-testing-overview)
- [Test Scenarios](#test-scenarios)
- [Test Criteria](#test-criteria)
- [Running Tests Locally](#running-tests-locally)
- [Running Tests on Grafana Cloud](#running-tests-on-grafana-cloud)
- [Submission Requirements](#submission-requirements)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Verify k6 Installation

```bash
k6 version
```

If k6 is not installed, follow the [official installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/).

---

## Performance Testing Overview

This project includes **4 comprehensive load testing scenarios** as per Practical 7 requirements:

1. **Average-Load Test** - Normal operating conditions
2. **Spike-Load Test** - Sudden traffic spikes (1 minute, extremely high VUs)
3. **Stress Test** - System breaking point (5 minutes sustained)
4. **Soak Test** - Long-term stability (30 minutes sustained)

### Test Endpoints

All tests evaluate:
- `${BASE_URL}/` - Homepage
- `${BASE_URL}/api/dogs` - Random Dog API
- `${BASE_URL}/api/dogs/breeds` - Breeds List API
- `${BASE_URL}/api/dogs?breed=husky` - Specific Breed API

---

## Test Scenarios

### 1. Average-Load Test

**Purpose:** Evaluate performance under normal expected load.

**Configuration:**
```javascript
stages: [
  { duration: '2m', target: 20 },  // Ramp up to 20 users
  { duration: '5m', target: 20 },  // Stay at 20 users for 5 minutes
  { duration: '2m', target: 0 },   // Ramp down
]
```

**File:** `tests/k6/average-load-test.js`

---

### 2. Spike-Load Test

**Purpose:** Test resilience to sudden extreme traffic spikes.

**Configuration:**
```javascript
stages: [
  { duration: '30s', target: 10 },  // Baseline
  { duration: '1m', target: 100 },  // SPIKE to 100 users
  { duration: '30s', target: 10 },  // Recovery
  { duration: '30s', target: 0 },   // Ramp down
]
```

**File:** `tests/k6/spike-load-test.js`

**Note:** 100 VUs = extremely high load. Adjust based on laptop capability.

---

### 3. Stress Test

**Purpose:** Identify breaking points and performance limits.

**Configuration:**
```javascript
stages: [
  { duration: '1m', target: 20 },   // Ramp up
  { duration: '2m', target: 40 },   // Increase stress
  { duration: '5m', target: 40 },   // Sustain for 5 minutes
  { duration: '1m', target: 0 },    // Ramp down
]
```

**File:** `tests/k6/stress-test.js`

---

### 4. Soak Test

**Purpose:** Verify long-term stability and detect memory leaks.

**Configuration:**
```javascript
stages: [
  { duration: '2m', target: 15 },   // Ramp up
  { duration: '30m', target: 15 },  // Sustain for 30 minutes
  { duration: '2m', target: 0 },    // Ramp down
]
```

**File:** `tests/k6/soak-test.js`

---

## Test Criteria

| Test Type    | Duration | VUs | p(95) Response Time | Error Rate Threshold |
|--------------|----------|-----|---------------------|----------------------|
| **Average-Load** | Any duration | 20  | < 500ms            | < 5%                 |
| **Spike-Load**   | 1 min spike  | 100 | < 1000ms           | < 10%                |
| **Stress**       | 5 mins       | 40  | < 800ms            | < 10%                |
| **Soak**         | 30 mins      | 15  | < 600ms            | < 5%                 |

### Expected Metrics

**Response Times:**
- Average (avg): Mean response time
- Median (med): 50th percentile
- p(95): 95% of requests faster than this value
- p(99): 99% of requests faster than this value

**Reliability:**
- http_req_failed: Percentage of failed HTTP requests
- errors: Custom error rate from validation checks
- checks: Percentage of passed validation checks

**Throughput:**
- http_reqs: Total number of requests
- iterations: Completed user journeys
- vus: Active virtual users

---

## Running Tests Locally

### Prerequisites

1. **Start the application** (in one terminal):
```bash
pnpm dev
```

2. **Keep it running** while executing tests in another terminal.

### Execute Tests

#### Smoke Test (Already Completed in Class)
```bash
pnpm test:k6:smoke
```
- Duration: 30 seconds
- VUs: 1
- Purpose: Sanity check

#### Average-Load Test
```bash
pnpm test:k6:average
```
- Duration: ~9 minutes
- VUs: 20
- **Screenshot:** Capture full terminal output

#### Spike-Load Test
```bash
pnpm test:k6:spike
```
- Duration: ~2.5 minutes
- VUs: 100 peak
- **Screenshot:** Capture full terminal output

#### Stress Test
```bash
pnpm test:k6:stress
```
- Duration: ~9 minutes
- VUs: 40
- **Screenshot:** Capture full terminal output

#### Soak Test
```bash
pnpm test:k6:soak
```
- Duration: ~34 minutes
- VUs: 15
- **Screenshot:** Capture full terminal output

### Total Local Testing Time
Approximately **55 minutes** for all tests.

---

## Running Tests on Grafana Cloud

### Setup

1. **Authenticate with k6 Cloud:**
```bash
k6 cloud login --token $TOKEN
```

2. **Expose Local Application (using ngrok):**

Start your app:
```bash
pnpm dev
```

In another terminal, start ngrok:
```bash
ngrok http 3000
```

3. **Update BASE_URL in test files:**

Replace the ngrok URL in each test file:
```javascript
const BASE_URL = __ENV.BASE_URL || 'https://YOUR-NGROK-URL.ngrok-free.app';
```

### Execute Cloud Tests

#### Average-Load Test
```bash
pnpm test:k6:cloud:average
```
- **Screenshot:** Capture Grafana UI with performance graphs

#### Spike-Load Test
```bash
pnpm test:k6:cloud:spike
```
- **Screenshot:** Capture Grafana UI with spike visualization

#### Stress Test
```bash
pnpm test:k6:cloud:stress
```
- **Screenshot:** Capture Grafana UI with sustained load

#### Soak Test
```bash
pnpm test:k6:cloud:soak
```
- **Screenshot:** Capture Grafana UI with 30-minute duration

---

## Submission Requirements

### Required Files

```
practical7_[StudentID]/
├── performance-testing/          # Full Next.js app
│   ├── src/
│   ├── tests/
│   │   └── k6/
│   │       ├── smoke-test.js
│   │       ├── average-load-test.js
│   │       ├── spike-load-test.js
│   │       ├── stress-test.js
│   │       └── soak-test.js
│   ├── package.json
│   └── README.md (this file)
└── screenshots/
    ├── average-load-local.png
    ├── average-load-cloud.png
    ├── spike-load-local.png
    ├── spike-load-cloud.png
    ├── stress-test-local.png
    ├── stress-test-cloud.png
    ├── soak-test-local.png
    └── soak-test-cloud.png
```

### Screenshot Requirements

**For Local Tests:**
- Full terminal output showing k6 metrics
- All checks and thresholds visible
- Response time percentiles clearly shown

**For Cloud Tests:**
- Grafana Cloud UI dashboard
- Performance graphs visible
- Test summary and metrics displayed

### Total Screenshots: 8
- 4 local execution screenshots
- 4 cloud execution screenshots

---

## Troubleshooting

### Application Not Responding
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Restart the app
pnpm dev
```

### k6 Command Not Found
```bash
# Install k6 (macOS)
brew install k6

# Verify installation
k6 version
```

### High Error Rates
- Check Dog CEO API status: https://dog.ceo/
- Verify internet connection
- Reduce VU count if system is overwhelmed

### Tests Timing Out
- Increase thresholds in test files
- Reduce concurrent VUs
- Check system resources (CPU, memory)

### Spike Test Too Demanding
If 100 VUs crashes your laptop, adjust in `tests/k6/spike-load-test.js`:
```javascript
{ duration: '1m', target: 50 },  // Reduced from 100
```

Use the highest number your laptop can support!

---

## Quick Reference

### Available Test Commands

```bash
# Local execution
pnpm test:k6:smoke       # Smoke test
pnpm test:k6:average     # Average-load
pnpm test:k6:spike       # Spike-load
pnpm test:k6:stress      # Stress test
pnpm test:k6:soak        # Soak test

# Cloud execution
pnpm test:k6:cloud:average
pnpm test:k6:cloud:spike
pnpm test:k6:cloud:stress
pnpm test:k6:cloud:soak
```

### Expected Timeline

- Smoke: 30 seconds
- Average-Load: 9 minutes
- Spike-Load: 2.5 minutes
- Stress: 9 minutes
- Soak: 34 minutes

**Total:** ~55 minutes per environment (local + cloud = ~110 minutes)

---

## Success Criteria

✅ All tests execute without errors
✅ Thresholds met (response times, error rates)
✅ Screenshots captured for all tests
✅ Both local and cloud tests completed
✅ Application remains stable throughout testing

---

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [Load Testing Types](https://grafana.com/load-testing/types-of-load-testing/)
- [Grafana Cloud k6](https://grafana.com/docs/k6/latest/k6-studio/)
- [Dog CEO API](https://dog.ceo/dog-api/)

---

## Notes

- Tests use realistic user behavior with sleep times
- All endpoints validated for status codes and response content
- Custom error metrics track application-specific failures
- Thresholds define pass/fail criteria for each test type

Good luck with your performance testing! 🚀
