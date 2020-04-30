// Load external modules
const logger = require('../../logger.js');
const responseClass = require('node-service-utilities').responseClass;
const validation = require('node-service-utilities').validation;
const loopDAL = require('../database/productDAL.js');

const statusType = responseClass.statusType;

// Declare valid sort fields
const validProductSortFields = ['price', 'stock', 'quantity', 'total'];
// Declare valid fields
const validProductFields = [
  'product_name',
  'variants',
  'variant_id',
  'product_id',
  'image',
  'variant_name',
  'price',
  'stock',
  'quantity',
  'total'
];

function getValidSortFields(sortFields, validFields) {
  const defaultSort = 'total ASC';
  if (sortFields != null) {
    return validation.sortSqlGenerator(sortFields, validFields);
  }
  return new responseClass.Response(statusType.VALID, defaultSort);
}

function getValidFilterFields(filterFields, validFields) {
  const defaultColumns = ['*'];
  if (filterFields !== undefined) {
    return validation.fieldValidator(filterFields, validFields);
  }
  return new responseClass.Response(statusType.VALID, defaultColumns);
}

function getProductInfo(req, res) {
  logger.log('info', 'GET - Get products');
  const limit = req.query.limit || null;

  // Get validated filter fields. If not valid, return error response.
  const validFilterFields = getValidFilterFields(req.query.fields, validProductFields);
  if (validFilterFields.status === statusType.INVALID) {
    logger.log('critical', `Validation error: ${validFilterFields.message}`);
    res.status(400).json(validFilterFields.toJsonApiResponse());
    return;
  }

   // Get validated sort fields. If not valid, return error response.
   const validSortFields = getValidSortFields(req.query.sort, validProductSortFields);
   if (validSortFields.status === statusType.INVALID) {
     logger.log('critical', `Validation error: ${validSortFields.message}`);
     res.status(400).json(validSortFields.toJsonApiResponse());
     return;
   }

  // Get product information
  loopDAL.getProductInfo(validSortFields, validFilterFields, limit, (endpointResponse) => {
    switch (endpointResponse.status) {
      case statusType.SUCCESS:
        logger.log('info', `Successful product get for: universe-of-birds `);
        res.status(200).json(endpointResponse.message);
        break;
      case statusType.NOT_FOUND:
        logger.log('info', endpointResponse.message);
        res.status(404).json(endpointResponse.toJsonApiResponse());
        break;
      case statusType.ERROR:
        logger.log('critical', `${endpointResponse.message} - ${endpointResponse.stacktrace}`);
        res.status(500).json(endpointResponse.toJsonApiResponse());
        break;
      default:
        logger.log('critical', 'Unexpected response status type.');
    }
  });

}

module.exports = {
  getValidSortFields,
  getProductInfo,

};
