const Shopify = require('shopify-api-node');

const shopify = new Shopify({
    shopName: process.env.shopName,
    apiKey: process.env.apiKey,
    password: process.env.password
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
    }
};
