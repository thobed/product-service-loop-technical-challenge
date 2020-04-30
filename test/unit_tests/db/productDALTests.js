const expect = require('chai').expect;
const sinon = require('sinon');
const database = require('../../../server/database/db.js');
const productDAL = require('../../../server/database/productDAL.js');
const responseClass = require('node-service-utilities').responseClass;
const expectedResponse = require('../../../test/response.json');


const statusType = responseClass.statusType;

const array = [{id: '123',
                name: 'product1'},
              {id: '123',
               name: 'product1-red'}];
const key = 'id';
const groupedArray = { '123': 
[ { id: '123', name: 'product1' },
  { id: '123', name: 'product1-red' } ] }

//let queryOneStub;
let queryAnyStub;
//let queryResultStub;

describe('productDAL.js - The getProductInfo function', () => {
  before(function (done) {
    queryAnyStub = sinon.stub(database.db, 'any');
    done();
  });

  afterEach(function (done) {
    queryAnyStub.reset();
    done();
  });

  after(function (done) {
    queryAnyStub.restore();
    done();
  });

  // it('returns \'error\' response for other errors', (done) => {
  //   const columns = ['*'];
  //   const sortBySQL = 'price ASC';
  //   const thrownError = {
  //     error: 'not null violation',
  //     name: 'error',
  //     code: '23502',
  //     message: 'not null violation',
  //     stack: 'not null violation',
  //   };
  //   const expectedResponse = {
  //     status: 'error',
  //     message: 'SQL Exception (23502): not null violation',
  //     stacktrace: 'not null violation',
  //   };
  //   queryAnyStub.rejects(thrownError);

  //   productDAL.getProductInfo(columns, null, sortBySQL, (handleResult) => {
  //     expect(handleResult).to.deep.equal(expectedResponse);
  //     done();
  //   });
  // });

  it('returns \'success\' response with all productInfo data on success', (done) => {
    const columns = ['*'];
    const sortBySQL = 'price ASC';
   
    const successfulGetAllResponse = new responseClass.Response(statusType.SUCCESS, expectedResponse);

    queryAnyStub.resolves(expectedResponse);

    productDAL.getProductInfo(columns, null, sortBySQL, (handleResult) => {
      expect(handleResult).to.deep.equal(successfulGetAllResponse);
      done();
    });
  });
});

describe('productDAL.js = The groupBy function', () => {
  it('return grouped array for passed in array and key value', (done) => {
    expect(productDAL.groupBy(array, key)).to.deep.equal(groupedArray);
    done();
  })
});

