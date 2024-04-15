import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);
const expect = chai.expect;

describe('AppController and AuthController Endpoints', () => {
    it('GET /status responds with status 200 and JSON object with system status', async () => {
      const response = await request(app).get('/status');
      expect(response).to.have.status(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('system');
    });

    it('GET /stats responds with status 200 and JSON object with statistics', async () => {
        const response = await request(app).get('/stats');
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('statistics');
    });

    it('GET /connect responds with status 401 when token is missing', async () => {
      const response = await request(app).get('/connect');
      expect(response).to.have.status(401);
    });

    it('GET /disconnect responds with status 401 when token is missing', async () => {
      const response = await request(app).get('/disconnect');
      expect(response).to.have.status(401);
    });
});
