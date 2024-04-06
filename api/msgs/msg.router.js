const {getOrders,createOrder} = require('./order.controller');
const router = require('express').Router();

router.get('/orders', getOrders);

router.post('/create/order', createOrder);

module.exports = router;
