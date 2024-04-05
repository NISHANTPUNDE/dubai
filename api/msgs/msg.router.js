const {getOrders} = require('./order.controller');
const router = require('express').Router();

router.get('/orders', getOrders);

module.exports = router;
