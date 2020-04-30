const logger = require('../../logger.js');
const config = require('../../config/config.js');
const responseClass = require('node-service-utilities').responseClass;
var Request = require("request");
const statusType = responseClass.statusType;
const productURL = config.basepath + "products.json?fields=id,image,title,variants";
const orderURL = config.basepath + "orders.json?fields=line_items";


function getProductInfo(validSortFields, validFilterFields, limit, handleResult) {

  let productList = [];
  let variantList = [];
  let orderList = [];

  getInfo(productURL, function (productResponse) {
    if (JSON.parse(productResponse).errors) {
      const response = new responseClass.Response(statusType.NOT_FOUND, `products not found`);
      logger.critical(`Failed to get Products: ${productResponse}`);
      handleResult(response);
    } else {

      const products = JSON.parse(productResponse).products;

      products.forEach(function (productInfo) {
         let product = {}
         product.product_name = productInfo.title;
        // if (productInfo.image) {
        //   product.image = productInfo.image.src;
        // }
        productInfo.variants.forEach(function (pv) {
          let variant = {}
          variant.variant_id = pv.id;
          variant.product_id = pv.product_id;
          if (productInfo.image) {
            variant.image = productInfo.image.src;
          }
          variant.variant_name = `${productInfo.title} - ${pv.title}`;
          variant.price = pv.price;
          variant.stock = pv.inventory_quantity
          variantList.push(variant)
        })
        
        product.variants = variantList;

        productList.push(product);
      })

      getInfo(orderURL, function (orderResponse) {
        if (JSON.parse(orderResponse).errors) {
          const response = new responseClass.Response(statusType.NOT_FOUND, `orders not found`);
          logger.critical(`Failed to get Orders: ${orderResponse}`);
          handleResult(response);
        } else {
          const orders = JSON.parse(orderResponse).orders;

          orders.forEach(function (orderInfo) {
            let lineItems = orderInfo.line_items;
            lineItems.forEach(function (itemInfo) {
              let order = {};
              order.variant_id = itemInfo.variant_id;
              order.product_id = itemInfo.product_id;
              order.quantity = itemInfo.quantity;
              order.price = itemInfo.price;
              orderList.push(order);
            })
          })


          const groupedOrders = groupBy(orderList, 'variant_id');
          
          productList.forEach(function (productId) {
            productId.variants.forEach(function (variant){
                variant.quantity = 0;
                variant.total = 0;
              if (groupedOrders[variant.variant_id]) {
                //console.log(productId.variant_id);
                let quantity = 0;
                let price = 0.00;
                groupedOrders[variant.variant_id].forEach(function (item) {
                  quantity = quantity + item.quantity;
                  price = price + parseFloat(item.price);
                })
                
                variant.quantity = quantity;
                variant.total = price.toFixed(2);
              }

            })
          })

          //TO DO
          //if validSortFields sort response accordingly.

          //TO DO 
          //if validFilterFields return fields specified. 

          //TO DO
          //if limit return requested limited response.

          logger.info('GET - Get products: SUCCESS.');
          const response = new responseClass.Response(statusType.SUCCESS, productList);
          handleResult(response);
        }

      })
    }
  })

}

// API Request
function getInfo(callUrl, callback) {
  Request.get(callUrl, (error, response, body) => {
    if (error) {
      logger.critical(`Failed to get: ${error}`);
      return callback(error);
    }
    return callback(body);
  });
}

// Helper functions
function groupBy(array, key) {
  // Return the end result
  return array.reduce((result, currentValue) => {
    // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result;
  }, {}); // empty object is the initial value for result object
}

module.exports = {
  getProductInfo,
  groupBy,
};
