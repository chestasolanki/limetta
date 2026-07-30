import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { sendOTPEmail } from '../utils/emailService.js';

const originalEnvironment = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NODE_ENV: process.env.NODE_ENV
};
const originalFetch = global.fetch;
const originalConsoleError = console.error;

afterEach(() => {
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
  global.fetch = originalFetch;
  console.error = originalConsoleError;
});

test('returns false without provider configuration and does not expose the OTP', async () => {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  const otp = '123456';
  const logs = [];
  console.error = (...values) => logs.push(values.join(' '));

  assert.equal(await sendOTPEmail('customer@example.com', otp), false);
  assert.equal(logs.some((message) => message.includes(otp)), false);
});

test('returns true when Resend accepts the email', async () => {
  process.env.RESEND_API_KEY = 're_test_secret';
  process.env.EMAIL_FROM = 'Limetta <noreply@example.com>';
  const otp = '234567';
  let requestBody;
  global.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: 'email_test_id' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  assert.equal(await sendOTPEmail('customer@example.com', otp), true);
  assert.equal(requestBody.from, process.env.EMAIL_FROM);
  assert.equal(requestBody.to, 'customer@example.com');
  assert.match(requestBody.text, new RegExp(otp));
  assert.match(requestBody.html, new RegExp(otp));
});

test('returns false on a provider error without logging the OTP or API key', async () => {
  const apiKey = 're_test_secret';
  const otp = '345678';
  process.env.RESEND_API_KEY = apiKey;
  process.env.EMAIL_FROM = 'Limetta <noreply@example.com>';
  process.env.NODE_ENV = 'production';
  const logs = [];
  console.error = (...values) => logs.push(values.join(' '));
  global.fetch = async () => new Response(
    JSON.stringify({
      name: 'validation_error',
      message: 'The email provider rejected the request.'
    }),
    {
      status: 422,
      headers: { 'Content-Type': 'application/json' }
    }
  );

  assert.equal(await sendOTPEmail('customer@example.com', otp), false);
  assert.equal(logs.some((message) => message.includes(otp)), false);
  assert.equal(logs.some((message) => message.includes(apiKey)), false);
});
