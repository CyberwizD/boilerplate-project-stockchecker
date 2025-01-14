'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet'); // Import helmet

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

// Set security-related HTTP headers using helmet
app.use(helmet());

// Set Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow loading content from the current domain
      scriptSrc: ["'self'", "'https://trusted-cdn.com'"], // Allow scripts from current domain and trusted CDN
      styleSrc: ["'self'", "'https://trusted-cdn.com'"],  // Allow styles from current domain and trusted CDN
      imgSrc: ["'self'", "data:"], // Allow images from current domain and data URLs
      connectSrc: ["'self'", "https://stock-price-checker-proxy.freecodecamp.rocks"], // Allow stock price API
      objectSrc: ["'none'"], // Prevent embedding objects like Flash or others
      upgradeInsecureRequests: [], // Force all requests to use HTTPS
    },
  })
);

// Serve static assets
app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); // For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);  

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // for testing
