const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const productController = require('../../../server/controllers/productController.js');
const productDAL = require('../../../server/database/productDAL.js');
const responseClass = require('node-service-utilities').responseClass;
const postClass = require('node-service-utilities').postClass;
const patchClass = require('node-service-utilities').patchClass;

const statusType = responseClass.statusType;

// Initialize stubs
let getValidFilterFieldsStub;
let getValidSortFieldsStub;
let getProductsStub;
// TO DO use below stub for /getproductInfo/{product_id}
///let getProductStub;

describe('productController.js - The getProductsInfo function', () => {
  before(function (done) {
    getProductsStub = sinon.stub(productDAL, 'getProductInfo');
    getValidFilterFieldsStub = sinon.stub(productController, 'getValidFilterFields');
    getValidSortFieldsStub = sinon.stub(productController, 'getValidSortFields');
    done();
  });

  afterEach(function (done) {
    getProductsStub.reset();
    getValidFilterFieldsStub.reset();
    getValidSortFieldsStub.reset();
    done();
  });

  after(function (done) {
    getProductsStub.restore();
    getValidFilterFieldsStub.restore();
    getValidSortFieldsStub.restore();
    done();
  });

  it('returns 200 response with all products data on success (no fields specified)', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/productInfo',
    });
    const res = httpMocks.createResponse();
    const productData = [
      {
          product_name: "Colorful Birds",
          variants: [
              {
                  variant_id: 42336694548,
                  product_id: 10826345236,
                  image: "https://cdn.shopify.com/s/files/1/2048/9723/products/birds-874891_1280.jpg?v=1496242959",
                  variant_name: "Colorful Birds - Small / Red",
                  price: "12.00",
                  stock: 30,
                  quantity: 18,
                  total: "216.00"
              },
              {
                  variant_id: 155461517332,
                  product_id: 10826345236,
                  image: "https://cdn.shopify.com/s/files/1/2048/9723/products/birds-874891_1280.jpg?v=1496242959",
                  variant_name: "Colorful Birds - Small / Blue",
                  price: "12.00",
                  stock: 38,
                  quantity: 11,
                  total: "120.00"
              }
          ]
      }
    ]
   
    const successfulGetResponse = new responseClass.Response(statusType.SUCCESS, productData);
    const validFieldsRepsponse = new responseClass.Response(statusType.VALID, ['*']);
    getValidFilterFieldsStub.returns(validFieldsRepsponse);
    getProductsStub.callsArgWith(3, successfulGetResponse);

    productController.getProductInfo(req, res);
    expect(res.statusCode).to.be.equal(200);
    expect(JSON.parse(res._getData())).to.deep.equal(successfulGetResponse.message);
    sinon.assert.calledOnce(getProductsStub);
    done();
  });

  it('returns 500 error response for sql errors', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/productInfo',
    });
    const res = httpMocks.createResponse();
    const thrownError = {
      message: 'Random SQL Error',
      code: 9999,
      name: 'error',
      stack: 'stack-trace',
    };
    const validFieldsResponse = new responseClass.Response(statusType.VALID, ['*']);
    const validSortResponse = new responseClass.Response(statusType.VALID, 'price ASC');
    const sqlErrorResponse = new responseClass.SQLErrorResponse(thrownError);
    getValidFilterFieldsStub.returns(validFieldsResponse);
    getValidSortFieldsStub.returns(validSortResponse);
    getProductsStub.callsArgWith(3, sqlErrorResponse);

    productController.getProductInfo(req, res);
    expect(res.statusCode).to.be.equal(500);
    expect(JSON.parse(res._getData())).to.deep.equal(sqlErrorResponse.toJsonApiResponse());
    sinon.assert.calledOnce(getProductsStub);
    done();
  });

  it('returns 400 error response for invalid query field (filter)', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/productInfo',
      query: {
        fields: 'invalid-field',
      },
    });
    const res = httpMocks.createResponse();
    const invalidFieldsResponse = new responseClass.Response(statusType.INVALID, 'Invalid Field: invalid-field');
    getValidFilterFieldsStub.returns(invalidFieldsResponse);

    productController.getProductInfo(req, res);
    expect(res.statusCode).to.be.equal(400);
    expect(JSON.parse(res._getData())).to.deep.equal(invalidFieldsResponse.toJsonApiResponse());
    done();
  });

  it('returns 400 error response for invalid query field (sort)', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/productInfo',
      query: {
        sort: 'invalid-field',
      },
    });
    const res = httpMocks.createResponse();
    const invalidSortResponse = new responseClass.Response(statusType.INVALID, 'Invalid sort field: invalid-field');
    getValidSortFieldsStub.returns(invalidSortResponse);

    productController.getProductInfo(req, res);
    expect(res.statusCode).to.be.equal(400);
    expect(JSON.parse(res._getData())).to.deep.equal(invalidSortResponse.toJsonApiResponse());
    done();
  });
});


