import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// 1. Create a generic Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 5000,
});

// 2. Wrap it with the Mock Adapter
// delayResponse simulates network latency (milliseconds)
const mock = new MockAdapter(api, { delayResponse: 800 });

// -------------------------------------------------------------
// Mock Data Generators
// -------------------------------------------------------------

const mockDevices = Array.from({length: 45}, (_, i) => {
  const isCritical = Math.random() > 0.95;
  const isWarning = !isCritical && Math.random() > 0.8;
  return {
    id: `BAT-${1000 + i}`,
    name: `Extruder Unit ${i + 1}`,
    status: isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy',
    health: isCritical ? Math.floor(Math.random() * 30) + 10 : isWarning ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 30) + 70,
    voltage: (Math.random() * 10 + 40).toFixed(1),
    temp: (Math.random() * 20 + 25).toFixed(1),
    chargeCycles: Math.floor(Math.random() * 1500)
  };
});

// -------------------------------------------------------------
// Registered Endpoints
// -------------------------------------------------------------

// GET /api/fleet/summary
mock.onGet('/fleet/summary').reply(200, {
  totalDevices: 1248,
  healthy: 1180,
  warning: 50,
  critical: 18,
  averageHealth: 94.5,
  activeAlerts: 12
});

// GET /api/devices
mock.onGet('/devices').reply(200, mockDevices);

// GET /api/devices/:id
mock.onGet(/\/devices\/\w+/).reply((config) => {
  const id = config.url.split('/').pop();
  const device = mockDevices.find(d => d.id === id) || mockDevices[0];
  return [200, device];
});

// POST /api/auth/login
mock.onPost('/auth/login').reply((config) => {
  const { email, password } = JSON.parse(config.data);
  if (email && password) {
    return [200, { token: 'mock-jwt-token-12345', user: { name: 'Admin User', role: 'system_admin' } }];
  }
  return [401, { message: 'Invalid credentials' }];
});

export default api;
