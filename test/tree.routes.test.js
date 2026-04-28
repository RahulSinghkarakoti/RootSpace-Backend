import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import './setup.js';
import createTestApp, { mockController } from './testApp.js';

const app = createTestApp();

describe('Tree routes', () => {
  it('creates a tree successfully', async () => {
    mockController.createTree.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: {
          id: 1,
          name: 'Family Tree',
          slug: 'family-tree',
          type: 'FAMILY',
          createdBy: 'test-user',
        },
      });
    });

    const response = await request(app)
      .post('/api/v1/trees')
      .send({ treeName: 'Family Tree' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Family Tree');
    expect(mockController.createTree).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating a tree without required fields', async () => {
    mockController.createTree.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'treeName is required' }],
      });
    });

    const response = await request(app).post('/api/v1/trees').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
    expect(mockController.createTree).toHaveBeenCalledOnce();
  });

  it('fetches all trees', async () => {
    mockController.getAllTrees.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [{ id: 1, name: 'Family Tree' }],
      });
    });

    const response = await request(app).get('/api/v1/trees');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mockController.getAllTrees).toHaveBeenCalledOnce();
  });

  it('fetches a tree by id', async () => {
    mockController.getTreeById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 1, name: 'Family Tree' },
      });
    });

    const response = await request(app).get('/api/v1/trees/1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(mockController.getTreeById).toHaveBeenCalledOnce();
  });

  it('fetches a tree by slug', async () => {
    mockController.getTreeBySlug.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 1, slug: 'family-tree' },
      });
    });

    const response = await request(app).get('/api/v1/trees/slug/family-tree');

    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('family-tree');
    expect(mockController.getTreeBySlug).toHaveBeenCalledOnce();
  });

  it('updates a tree successfully', async () => {
    mockController.updateTree.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 1, name: 'Updated Tree' },
      });
    });

    const response = await request(app)
      .patch('/api/v1/trees/1')
      .send({ treeName: 'Updated Tree' });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Tree');
    expect(mockController.updateTree).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating a tree with no body', async () => {
    mockController.updateTree.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'At least one field must be provided' }],
      });
    });

    const response = await request(app).patch('/api/v1/trees/1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.updateTree).toHaveBeenCalledOnce();
  });

  it('deletes a tree', async () => {
    mockController.deleteTree.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 1 },
      });
    });

    const response = await request(app).delete('/api/v1/trees/1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(mockController.deleteTree).toHaveBeenCalledOnce();
  });
});
