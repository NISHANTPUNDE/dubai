const Shopify = require('shopify-api-node');

const shopify = new Shopify({
    shopName: process.env.SHOPNAME,
    apiKey: process.env.APIKEY,
    password: process.env.PASSWORD
});

module.exports = {
    getOrders: async (req, res) => {
        try {
            const orders = await shopify.order.list();
            res.json({ success: true, orders });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    createOrder: async (req, res) => {
        try {
            const newOrder = await shopify.order.create(req.body.order);
            res.status(201).json({ success: true, order: newOrder });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ success: false, error: 'Error creating order' });
        }
    }

};
