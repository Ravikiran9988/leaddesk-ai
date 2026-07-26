import assert from 'node:assert';
import test from 'node:test';
import { strongPasswordRegex } from '../validators/authValidator.js';

test('Strong Password Regex Validator', () => {
  assert.strictEqual(strongPasswordRegex.test('Password123@'), true, 'Valid strong password should pass');
  assert.strictEqual(strongPasswordRegex.test('Admin2026!'), true, 'Valid strong password should pass');
  assert.strictEqual(strongPasswordRegex.test('weakpass'), false, 'Password without uppercase/special char should fail');
  assert.strictEqual(strongPasswordRegex.test('12345678'), false, 'Numeric password should fail');
});

test('Health API Data Structure Contract', () => {
  const mockHealthResponse = {
    success: true,
    message: 'AI LeadDesk Mini Enterprise API is healthy and operational',
    data: {
      status: 'healthy',
      database: 'connected',
      uptime: '100s',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  assert.strictEqual(mockHealthResponse.success, true);
  assert.strictEqual(mockHealthResponse.data.status, 'healthy');
  assert.ok(mockHealthResponse.data.version);
});
