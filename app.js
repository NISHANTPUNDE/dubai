require("dotenv").config();
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');
const {getOrders} = require('./api/msgs/order.controller');
const app = express(); 



app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use("/api", getOrders);

app.listen(process.env.APP_PORT, () => {
  console.log(`server listening at http://localhost:${process.env.APP_PORT}`);
});
