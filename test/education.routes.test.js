import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp, { mockController } from './testApp.js';

const app = createTestApp();

describe('Education routes', () => {
  it('creates an education entry for a person', async () => {
    mockController.createEducation.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: { id: 'e1', title: 'Bachelor of Science' },
      });
    });

    const response = await request(app)
      .post('/api/v1/people/p1/education')
      .send({
        title: 'Bachelor of Science',
        institution: 'Example University',
        level: 'BACHELORS',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Bachelor of Science');
    expect(mockController.createEducation).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating education with missing title', async () => {
    mockController.createEducation.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'Title is required' }],
      });
    });

    const response = await request(app)
      .post('/api/v1/people/p1/education')
      .send({ institution: 'Example University', level: 'BACHELORS' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.createEducation).toHaveBeenCalledOnce();
  });

  it('gets education entries for a person', async () => {
    mockController.getPersonEducation.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [{ id: 'e1', title: 'Bachelor of Science' }],
      });
    });

    const response = await request(app).get('/api/v1/people/p1/education');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(mockController.getPersonEducation).toHaveBeenCalledOnce();
  });

  it('gets education entry by id', async () => {
    mockController.getEducationById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'e1', title: 'Bachelor of Science' },
      });
    });

    const response = await request(app).get('/api/v1/education/e1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('e1');
    expect(mockController.getEducationById).toHaveBeenCalledOnce();
  });

  it('updates an education entry successfully', async () => {
    mockController.updateEducation.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'e1', title: 'Master of Science' },
      });
    });

    const response = await request(app)
      .patch('/api/v1/education/e1')
      .send({ title: 'Master of Science' });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Master of Science');
    expect(mockController.updateEducation).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating education with no fields', async () => {
    mockController.updateEducation.mockImplementation((req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ message: 'At least one field must be provided' }],
      });
    });

    const response = await request(app).patch('/api/v1/education/e1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockController.updateEducation).toHaveBeenCalledOnce();
  });

  it('deletes an education entry', async () => {
    mockController.deleteEducation.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: 'e1' },
      });
    });

    const response = await request(app).delete('/api/v1/education/e1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('e1');
    expect(mockController.deleteEducation).toHaveBeenCalledOnce();
  });
});
