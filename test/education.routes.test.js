import request from 'supertest';
import { describe, it, expect } from 'vitest';
import './setup.js';
import createTestApp from './testApp.js';
import educationService from '../src/features/education/education.service.js';

const app = createTestApp();

describe('Education routes', () => {
  it('creates an education entry for a person', async () => {
    educationService.createEducation.mockResolvedValue({
      id: 'e1',
      title: 'Bachelor of Science',
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
    expect(educationService.createEducation).toHaveBeenCalledOnce();
  });

  it('returns 400 when creating education with missing title', async () => {
    const response = await request(app)
      .post('/api/v1/people/p1/education')
      .send({ institution: 'Example University', level: 'BACHELORS' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('gets education entries for a person', async () => {
    educationService.getPersonEducation.mockResolvedValue([
      { id: 'e1', title: 'Bachelor of Science' },
    ]);

    const response = await request(app).get('/api/v1/people/p1/education');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(educationService.getPersonEducation).toHaveBeenCalledOnce();
  });

  it('gets education entry by id', async () => {
    educationService.getEducationById.mockResolvedValue({
      id: 'e1',
      title: 'Bachelor of Science',
    });

    const response = await request(app).get('/api/v1/education/e1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('e1');
    expect(educationService.getEducationById).toHaveBeenCalledOnce();
  });

  it('updates an education entry successfully', async () => {
    educationService.updateEducation.mockResolvedValue({
      id: 'e1',
      title: 'Master of Science',
    });

    const response = await request(app)
      .patch('/api/v1/education/e1')
      .send({ title: 'Master of Science' });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Master of Science');
    expect(educationService.updateEducation).toHaveBeenCalledOnce();
  });

  it('returns 400 when updating education with no fields', async () => {
    const response = await request(app).patch('/api/v1/education/e1').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('deletes an education entry', async () => {
    educationService.deleteEducation.mockResolvedValue({ id: 'e1' });

    const response = await request(app).delete('/api/v1/education/e1');

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('e1');
    expect(educationService.deleteEducation).toHaveBeenCalledOnce();
  });
});
