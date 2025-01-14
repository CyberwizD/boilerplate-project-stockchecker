const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  // Test 1: Viewing one stock
  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' }) // Pass the stock symbol as query param
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'Response should be an object');
        assert.property(res.body.stockData, 'stock', 'Stock data should contain stock');
        assert.property(res.body.stockData, 'price', 'Stock data should contain price');
        assert.property(res.body.stockData, 'likes', 'Stock data should contain likes');
        done();
      });
  });

  // Test 2: Viewing one stock and liking it
  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true }) // Like the stock
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'Response should be an object');
        assert.property(res.body.stockData, 'stock', 'Stock data should contain stock');
        assert.property(res.body.stockData, 'price', 'Stock data should contain price');
        assert.property(res.body.stockData, 'likes', 'Stock data should contain likes');
        assert.isAbove(res.body.stockData.likes, 0, 'Stock should have likes');
        done();
      });
  });

  // Test 3: Viewing the same stock and liking it again (likes should not increase)
  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true }) // Liking the stock again from the same IP
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'Response should be an object');
        assert.property(res.body.stockData, 'stock', 'Stock data should contain stock');
        assert.property(res.body.stockData, 'price', 'Stock data should contain price');
        assert.property(res.body.stockData, 'likes', 'Stock data should contain likes');
        assert.isAbove(res.body.stockData.likes, 0, 'Stock should have likes');
        done();
      });
  });

  // Test 4: Viewing two stocks
  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] }) // Pass two stock symbols as query param
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData, 'Response should be an array');
        assert.lengthOf(res.body.stockData, 2, 'Array should have two elements');
        assert.property(res.body.stockData[0], 'stock', 'First stock should contain stock');
        assert.property(res.body.stockData[0], 'price', 'First stock should contain price');
        assert.property(res.body.stockData[0], 'rel_likes', 'First stock should contain relative likes');
        assert.property(res.body.stockData[1], 'stock', 'Second stock should contain stock');
        assert.property(res.body.stockData[1], 'price', 'Second stock should contain price');
        assert.property(res.body.stockData[1], 'rel_likes', 'Second stock should contain relative likes');
        done();
      });
  });

  // Test 5: Viewing two stocks and liking them
  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true }) // Pass two stock symbols and like=true
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData, 'Response should be an array');
        assert.lengthOf(res.body.stockData, 2, 'Array should have two elements');
        assert.property(res.body.stockData[0], 'stock', 'First stock should contain stock');
        assert.property(res.body.stockData[0], 'price', 'First stock should contain price');
        assert.property(res.body.stockData[0], 'rel_likes', 'First stock should contain relative likes');
        assert.property(res.body.stockData[1], 'stock', 'Second stock should contain stock');
        assert.property(res.body.stockData[1], 'price', 'Second stock should contain price');
        assert.property(res.body.stockData[1], 'rel_likes', 'Second stock should contain relative likes');
        done();
      });
  });

});

