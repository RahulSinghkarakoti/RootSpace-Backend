import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import './setup.js';
import createTestApp, { mockController } from './testApp.js';

const app = createTestApp();

describe('Person routes', () => {
  it('adds a person to a tree', async () => {
    mockController.createPerson.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: { id: 'p1', fullName: 'John Doe' },
      });
    });

    const response = await request(app)
      .post('/api/v1/trees/1/person')
      .send({ fullName: 'John Doe' });

    expect(response.status).toBe(201);
    expect(response.body.data.fullName).toBe('John Doe');
    expect(mockController.createPerson).toHaveBeenCalledOnce();
  });

  it('returns 400 when adding a person without fullName', async () => {
    mockController.createPerson.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'fullName is required' }],
      });
    });

    const response = await request(app).post('/api/v1/trees/1/person').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.createPerson).toHaveBeenCalledOnce();
  });

  it('gets all people in a tree', async () => {
    mockController.getAllPeople.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [{ id: 'p1', fullName: 'John Doe' }],
      });
    });

    const response = await request(app).get('/api/v1/trees/1/person');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mockController.getAllPeople).toHaveBeenCalledOnce();
  });

  it('gets one person in a tree', async () => {
    mockController.getPersonInTree.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'p1', fullName: 'John Doe' },
      });
    });

    const response = await request(app).get('/api/v1/trees/1/person/p1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('p1');
    expect(mockController.getPersonInTree).toHaveBeenCalledOnce();
  });

  it('gets one person by id', async () => {
    mockController.getPersonById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'p1', fullName: 'John Doe' },
      });
    });

    const response = await request(app).get('/api/v1/people/p1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('p1');
    expect(mockController.getPersonById).toHaveBeenCalledOnce();
  });

  it('updates a person successfully', async () => {
    mockController.updatePerson.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'p1', fullName: 'Jane Doe' },
      });
    });

    const response = await request(app)
      .patch('/api/v1/people/p1')
      .send({ fullName: 'Jane Doe' });

    expect(response.status).toBe(200);
    expect(response.body.data.fullName).toBe('Jane Doe');
    expect(mockController.updatePerson).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating a person with no fields', async () => {
    mockController.updatePerson.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'At least one field must be provided' }],
      });
    });

    const response = await request(app).patch('/api/v1/people/p1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.updatePerson).toHaveBeenCalledOnce();
  });

  it('deletes a person', async () => {
    mockController.deletePerson.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'p1' },
      });
    });

    const response = await request(app).delete('/api/v1/people/p1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('p1');
    expect(mockController.deletePerson).toHaveBeenCalledOnce();
  });
});
