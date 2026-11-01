import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp from './testApp.js';
import personService from '../src/features/person/person.service.js';

const app = createTestApp();

describe('Person routes', () => {
  it('adds a person to a tree', async () => {
    personService.createPerson.mockResolvedValue({ id: 'p1', fullName: 'John Doe' });

    const response = await request(app)
      .post('/api/v1/trees/1/person')
      .send({ fullName: 'John Doe' });

    expect(response.status).toBe(201);
    expect(response.body.data.fullName).toBe('John Doe');
    expect(personService.createPerson).toHaveBeenCalledOnce();
  });

  it('returns 400 when adding a person without fullName', async () => {
    const response = await request(app).post('/api/v1/trees/1/person').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('gets all people in a tree', async () => {
    personService.getAllPeople.mockResolvedValue([{ id: 'p1', fullName: 'John Doe' }]);

    const response = await request(app).get('/api/v1/trees/1/person');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(personService.getAllPeople).toHaveBeenCalledOnce();
  });

  it('gets one person in a tree', async () => {
    personService.getPersonInTree.mockResolvedValue({ id: 'p1', fullName: 'John Doe' });

    const response = await request(app).get('/api/v1/trees/1/person/p1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('p1');
    expect(personService.getPersonInTree).toHaveBeenCalledOnce();
  });

  it('gets one person by id', async () => {
    personService.getPersonById.mockResolvedValue({ id: 'p1', fullName: 'John Doe' });

    const response = await request(app).get('/api/v1/people/p1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('p1');
    expect(personService.getPersonById).toHaveBeenCalledOnce();
  });

  it('updates a person successfully', async () => {
    personService.updatePerson.mockResolvedValue({ id: 'p1', fullName: 'Jane Doe' });

    const response = await request(app)
      .patch('/api/v1/people/p1')
      .send({ fullName: 'Jane Doe' });

    expect(response.status).toBe(200);
    expect(response.body.data.fullName).toBe('Jane Doe');
    expect(personService.updatePerson).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating a person with no fields', async () => {
    const response = await request(app).patch('/api/v1/people/p1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('deletes a person', async () => {
    personService.deletePerson.mockResolvedValue({ id: 'p1' });

    const response = await request(app).delete('/api/v1/people/p1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('p1');
    expect(personService.deletePerson).toHaveBeenCalledOnce();
  });
});
