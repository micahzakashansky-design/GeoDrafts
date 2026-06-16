import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../app';

describe('Health Check API', () => {
  it('should return a 200 OK and status ok on /api/healthz', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
