import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp from './testApp.js';
import relationService from '../src/features/relation/relation.service.js';

const app = createTestApp();

const validFromId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const validToId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const validRelId = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

describe('Relation routes', () => {
  it('creates a relation successfully', async () => {
    relationService.createRelation.mockResolvedValue({
      id: validRelId,
      type: 'PARENT_OF',
    });

    const response = await request(app)
      .post('/api/v1/trees/1/relations')
      .send({ fromId: validFromId, toId: validToId, type: 'PARENT_OF' });

    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('PARENT_OF');
    expect(relationService.createRelation).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating a relation with missing type', async () => {
    const response = await request(app)
      .post('/api/v1/trees/1/relations')
      .send({ fromId: validFromId, toId: validToId });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('gets relations for a tree', async () => {
    relationService.getTreeRelations.mockResolvedValue([
      { id: validRelId, type: 'SIBLING_OF' },
    ]);

    const response = await request(app).get('/api/v1/trees/1/relations');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(relationService.getTreeRelations).toHaveBeenCalledOnce();
  });

  it('gets relation by id', async () => {
    relationService.getRelationById.mockResolvedValue({
      id: validRelId,
      type: 'SIBLING_OF',
    });

    const response = await request(app).get(`/api/v1/relations/${validRelId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(validRelId);
    expect(relationService.getRelationById).toHaveBeenCalledOnce();
  });

  it('updates a relation successfully', async () => {
    relationService.updateRelation.mockResolvedValue({
      id: validRelId,
      type: 'SPOUSE_OF',
    });

    const response = await request(app)
      .patch(`/api/v1/relations/${validRelId}`)
      .send({ type: 'SPOUSE_OF' });

    expect(response.status).toBe(200);
    expect(response.body.data.type).toBe('SPOUSE_OF');
    expect(relationService.updateRelation).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating relation with empty body', async () => {
    const response = await request(app)
      .patch(`/api/v1/relations/${validRelId}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('deletes a relation', async () => {
    relationService.deleteRelation.mockResolvedValue({ id: validRelId });

    const response = await request(app).delete(`/api/v1/relations/${validRelId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(validRelId);
    expect(relationService.deleteRelation).toHaveBeenCalledOnce();
  });
});
