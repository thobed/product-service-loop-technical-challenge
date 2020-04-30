const expect = require('chai').expect;
const agent = require('supertest').agent(require('../../app.js'));
const base64 = require('base-64');
const expectedResponse = require('../../test/response.json');
const config = require('../../config/config.js');
usersecret = config.users.testuser;

describe('Component Testing: Get productInfo Data ', function () {

  it('returns status code 401 unauthroized for no basic auth provided', function (done) {
    agent.get('/api/v1/productInfo')
      .set('Content-Type', 'application/json')
      .send({})
      .end(function (err, res) {
        expect(res.statusCode).to.be.equal(401);
        expect(res.body).to.deep.equal({});
        done();
      });
  });

  it('returns status code 404 for not found when tyrin', function (done) {
    agent.get('/api/v1/productInfo/123135423')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${base64.encode(`testuser:${usersecret}`)}`)
      .send({})
      .end(function (err, res) {
        expect(res.statusCode).to.be.equal(404);
        expect(res.body).to.deep.equal({});
        done();
      });
  });

  it('returns status code 200 and only name field sorted by -name', function (done) {
    agent.get('/api/v1/productInfo')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${base64.encode(`testuser:${usersecret}`)}`)
      .send({})
      .end(function (err, res) {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.deep.equal(expectedResponse);
        done();
      });
  });
});
