import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp, { mockController } from './testApp.js';

const app = createTestApp();

describe('Media routes', () => {
  it('creates media successfully', async () => {
    mockController.createMedia.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: { id: 'm1', url: 'https://example.com/photo.jpg' },
      });
    });

    const response = await request(app)
      .post('/api/v1/trees/1/media')
      .send({ url: 'https://example.com/photo.jpg', type: 'PHOTO' });

    expect(response.status).toBe(201);
    expect(response.body.data.url).toBe('https://example.com/photo.jpg');
    expect(mockController.createMedia).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating media with invalid url', async () => {
    mockController.createMedia.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'URL must be valid' }],
      });
    });

    const response = await request(app)
      .post('/api/v1/trees/1/media')
      .send({ url: 'not-a-url', type: 'PHOTO' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.createMedia).toHaveBeenCalledOnce();
  });

  it('gets media for a tree', async () => {
    mockController.getTreeMedia.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [{ id: 'm1', url: 'https://example.com/photo.jpg' }],
      });
    });

    const response = await request(app).get('/api/v1/trees/1/media');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mockController.getTreeMedia).toHaveBeenCalledOnce();
  });

  it('gets media by id', async () => {
    mockController.getMediaById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'm1', url: 'https://example.com/photo.jpg' },
      });
    });

    const response = await request(app).get('/api/v1/media/m1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('m1');
    expect(mockController.getMediaById).toHaveBeenCalledOnce();
  });

  it('updates media successfully', async () => {
    mockController.updateMedia.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'm1', altText: 'Updated alt' },
      });
    });

    const response = await request(app)
      .patch('/api/v1/media/m1')
      .send({ altText: 'Updated alt' });

    expect(response.status).toBe(200);
    expect(response.body.data.altText).toBe('Updated alt');
    expect(mockController.updateMedia).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating media with no fields', async () => {
    mockController.updateMedia.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'At least one field must be provided' }],
      });
    });

    const response = await request(app).patch('/api/v1/media/m1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.updateMedia).toHaveBeenCalledOnce();
  });

  it('deletes media', async () => {
    mockController.deleteMedia.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'm1' },
      });
    });

    const response = await request(app).delete('/api/v1/media/m1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('m1');
    expect(mockController.deleteMedia).toHaveBeenCalledOnce();
  });
});
