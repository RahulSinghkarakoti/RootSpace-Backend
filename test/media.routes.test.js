import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp from './testApp.js';
import mediaService from '../src/features/media/media.service.js';

const app = createTestApp();

describe('Media routes', () => {
  it('creates media successfully', async () => {
    mediaService.createMedia.mockResolvedValue({
      id: 'm1',
      url: 'https://example.com/photo.jpg',
    });

    const response = await request(app)
      .post('/api/v1/trees/1/media')
      .send({ url: 'https://example.com/photo.jpg', type: 'PHOTO' });

    expect(response.status).toBe(201);
    expect(response.body.data.url).toBe('https://example.com/photo.jpg');
    expect(mediaService.createMedia).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating media with invalid url', async () => {
    const response = await request(app)
      .post('/api/v1/trees/1/media')
      .send({ url: 'not-a-url', type: 'PHOTO' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('gets media for a tree', async () => {
    mediaService.getTreeMedia.mockResolvedValue([
      { id: 'm1', url: 'https://example.com/photo.jpg' },
    ]);

    const response = await request(app).get('/api/v1/trees/1/media');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mediaService.getTreeMedia).toHaveBeenCalledOnce();
  });

  it('gets media by id', async () => {
    mediaService.getMediaById.mockResolvedValue({
      id: 'm1',
      url: 'https://example.com/photo.jpg',
    });

    const response = await request(app).get('/api/v1/media/m1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('m1');
    expect(mediaService.getMediaById).toHaveBeenCalledOnce();
  });

  it('updates media successfully', async () => {
    mediaService.updateMedia.mockResolvedValue({
      id: 'm1',
      altText: 'Updated alt',
    });

    const response = await request(app)
      .patch('/api/v1/media/m1')
      .send({ altText: 'Updated alt' });

    expect(response.status).toBe(200);
    expect(response.body.data.altText).toBe('Updated alt');
    expect(mediaService.updateMedia).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating media with no fields', async () => {
    const response = await request(app).patch('/api/v1/media/m1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('deletes media', async () => {
    mediaService.deleteMedia.mockResolvedValue({ id: 'm1' });

    const response = await request(app).delete('/api/v1/media/m1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('m1');
    expect(mediaService.deleteMedia).toHaveBeenCalledOnce();
  });
});
