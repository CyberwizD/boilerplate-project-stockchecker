'use strict';
const axios = require('axios');
const crypto = require('crypto'); // For IP anonymization

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        // Extract the stock symbol(s) and like flag from the query parameters
        const stock = req.query.stock;
        const like = req.query.like || false;
        const ip = req.ip;

        // Anonymize the IP address (using a hash)
        const anonymizedIp = crypto.createHash('sha256').update(ip).digest('hex');

        // Fetch stock data for one or two stocks
        if (Array.isArray(stock)) {
          const [stock1, stock2] = await Promise.all([
            getStockData(stock[0], like, anonymizedIp),
            getStockData(stock[1], like, anonymizedIp),
          ]);

          // Compare likes between the two stocks
          const rel_likes1 = stock1.likes - stock2.likes;
          const rel_likes2 = stock2.likes - stock1.likes;

          return res.json({
            stockData: [
              { stock: stock1.symbol, price: stock1.price, rel_likes: rel_likes1 },
              { stock: stock2.symbol, price: stock2.price, rel_likes: rel_likes2 }
            ]
          });
        } else {
          // Handle a single stock
          const stockData = await getStockData(stock, like, anonymizedIp);
          return res.json({
            stockData: {
              stock: stockData.symbol,
              price: stockData.price,
              likes: stockData.likes
            }
          });
        }

      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

  // Helper function to get stock data and update likes if necessary
  async function getStockData(stockSymbol, like, anonymizedIp) {
    // Check if stock is already in the database
    let stock = await Stock.findOne({ symbol: stockSymbol.toUpperCase() });

    if (!stock) {
      // Fetch stock price from FreeCodeCamp proxy API
      const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`);
      const stockPrice = response.data.latestPrice;

      // Create a new stock entry in the database
      stock = new Stock({
        symbol: stockSymbol.toUpperCase(),
        price: stockPrice,
        likes: 0,
        ips: []
      });
    }

    // Handle likes
    if (like === 'true') {
      // Check if this IP has already liked the stock
      if (!stock.ips.includes(anonymizedIp)) {
        stock.likes += 1;
        stock.ips.push(anonymizedIp);
      }
    }

    // Save the updated stock data
    await stock.save();

    return stock;
  }
};
