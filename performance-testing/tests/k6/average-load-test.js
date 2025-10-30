import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track error rate
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate should be below 5%
    errors: ['rate<0.05'],            // Custom error rate should be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Homepage
  const homepageResponse = http.get(BASE_URL);
  check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);

  // Test 2: Get random dog image
  const randomDogResponse = http.get(`${BASE_URL}/api/dogs`);
  check(randomDogResponse, {
    'random dog status is 200': (r) => r.status === 200,
    'random dog has message': (r) => JSON.parse(r.body).message !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Get breeds list
  const breedsResponse = http.get(`${BASE_URL}/api/dogs/breeds`);
  check(breedsResponse, {
    'breeds status is 200': (r) => r.status === 200,
    'breeds list is not empty': (r) => Object.keys(JSON.parse(r.body).message).length > 0,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Get specific breed
  const breedResponse = http.get(`${BASE_URL}/api/dogs?breed=husky`);
  check(breedResponse, {
    'specific breed status is 200': (r) => r.status === 200,
    'specific breed has message': (r) => JSON.parse(r.body).message !== undefined,
  }) || errorRate.add(1);

  sleep(2);
}
