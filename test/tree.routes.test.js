import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp from './testApp.js';
import treeService from '../src/features/tree/tree.service.js';

const app = createTestApp();

describe('Tree routes', () => {
  it('creates a tree successfully', async () => {
    treeService.createTree.mockResolvedValue({
      id: 1,
      name: 'Family Tree',
      slug: 'family-tree',
      type: 'FAMILY',
      createdBy: 'test-user',
    });

    const response = await request(app)
      .post('/api/v1/trees')
      .send({ treeName: 'Family Tree' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Family Tree');
    expect(treeService.createTree).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating a tree without required fields', async () => {
    const response = await request(app).post('/api/v1/trees').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('fetches all trees', async () => {
    treeService.getAllTrees.mockResolvedValue([{ id: 1, name: 'Family Tree' }]);

    const response = await request(app).get('/api/v1/trees');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(treeService.getAllTrees).toHaveBeenCalledOnce();
  });

  it('fetches a tree by id', async () => {
    treeService.getTreeById.mockResolvedValue({ id: 1, name: 'Family Tree' });

    const response = await request(app).get('/api/v1/trees/1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(treeService.getTreeById).toHaveBeenCalledOnce();
  });

  it('fetches a tree by slug', async () => {
    treeService.getTreeBySlug.mockResolvedValue({ id: 1, slug: 'family-tree' });

    const response = await request(app).get('/api/v1/trees/slug/family-tree');

    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('family-tree');
    expect(treeService.getTreeBySlug).toHaveBeenCalledOnce();
  });

  it('updates a tree successfully', async () => {
    treeService.updateTree.mockResolvedValue({ id: 1, name: 'Updated Tree' });

    const response = await request(app)
      .patch('/api/v1/trees/1')
      .send({ treeName: 'Updated Tree' });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Tree');
    expect(treeService.updateTree).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating a tree with no body', async () => {
    const response = await request(app).patch('/api/v1/trees/1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('deletes a tree', async () => {
    treeService.deleteTree.mockResolvedValue({ id: 1 });

    const response = await request(app).delete('/api/v1/trees/1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(treeService.deleteTree).toHaveBeenCalledOnce();
  });
});
