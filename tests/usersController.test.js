import { expect } from 'chai';
import request from 'supertest';
import app from '../server';

describe('UsersController Endpoints', () => {
  it('POST /users responds with status 400 when email is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ password: 'testPassword' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Missing email');
  });

  it('POST /users responds with status 400 when password is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Missing password');
  });

  it('POST /users responds with status 400 when user already exists', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'testPassword' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('User already exists');
  });

  it('GET /users/me responds with status 401 when authentication token is missing', async () => {
    const response = await request(app)
      .get('/users/me');
    expect(response).to.have.status(401);
  });

  it('GET /users/me responds with user data when authentication token is provided', async () => {
    // Assuming you have a valid authentication token for testing
    const authToken = 'valid_auth_token';

    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response).to.have.status(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('email');
  });
});
