const products = require('../controllers/productController');

module.exports = (router) => {

  router.route('/productInfo')
    .get(products.getProductInfo);
    
  //TO DO get productInfo for single product
  // router.route('productInfo/{product_id}')
  //   .get(products.get)
};
