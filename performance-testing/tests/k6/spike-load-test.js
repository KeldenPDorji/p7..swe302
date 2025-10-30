import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track error rate
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 100 },  // Spike to 100 users (extremely high VUs)
    { duration: '30s', target: 10 },  // Ramp down to 10 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms during spike
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10% (more lenient for spike)
    errors: ['rate<0.1'],              // Custom error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Homepage
  const homepageResponse = http.get(BASE_URL);
  check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get random dog image
  const randomDogResponse = http.get(`${BASE_URL}/api/dogs`);
  check(randomDogResponse, {
    'random dog status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Get breeds list
  const breedsResponse = http.get(`${BASE_URL}/api/dogs/breeds`);
  check(breedsResponse, {
    'breeds status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Get specific breed
  const breedResponse = http.get(`${BASE_URL}/api/dogs?breed=husky`);
  check(breedResponse, {
    'specific breed status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}
