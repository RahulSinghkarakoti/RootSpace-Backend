import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp, { mockController } from './testApp.js';

const app = createTestApp();

describe('Relation routes', () => {
  it('creates a relation successfully', async () => {
    mockController.createRelation.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: { id: 'r1', type: 'FATHER_OF' },
      });
    });

    const response = await request(app)
      .post('/api/v1/trees/1/relations')
      .send({ fromId: 'p1', toId: 'p2', type: 'FATHER_OF' });

    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('FATHER_OF');
    expect(mockController.createRelation).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating a relation with missing type', async () => {
    mockController.createRelation.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'Type is required' }],
      });
    });

    const response = await request(app)
      .post('/api/v1/trees/1/relations')
      .send({ fromId: 'p1', toId: 'p2' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.createRelation).toHaveBeenCalledOnce();
  });

  it('gets relations for a tree', async () => {
    mockController.getTreeRelations.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [{ id: 'r1', type: 'SIBLING_OF' }],
      });
    });

    const response = await request(app).get('/api/v1/trees/1/relations');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mockController.getTreeRelations).toHaveBeenCalledOnce();
  });

  it('gets relation by id', async () => {
    mockController.getRelationById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'r1', type: 'SIBLING_OF' },
      });
    });

    const response = await request(app).get('/api/v1/relations/r1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('r1');
    expect(mockController.getRelationById).toHaveBeenCalledOnce();
  });

  it('updates a relation successfully', async () => {
    mockController.updateRelation.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'r1', type: 'MOTHER_OF' },
      });
    });

    const response = await request(app)
      .patch('/api/v1/relations/r1')
      .send({ type: 'MOTHER_OF' });

    expect(response.status).toBe(200);
    expect(response.body.data.type).toBe('MOTHER_OF');
    expect(mockController.updateRelation).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating relation with empty body', async () => {
    mockController.updateRelation.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'At least one field must be provided' }],
      });
    });

    const response = await request(app).patch('/api/v1/relations/r1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.updateRelation).toHaveBeenCalledOnce();
  });

  it('deletes a relation', async () => {
    mockController.deleteRelation.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'r1' },
      });
    });

    const response = await request(app).delete('/api/v1/relations/r1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('r1');
    expect(mockController.deleteRelation).toHaveBeenCalledOnce();
  });
});
