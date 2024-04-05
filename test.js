require("dotenv").config();
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Shopify = require('shopify-api-node');

const app = express(); 
const port = 4007;

const shopify = new Shopify({
  shopName: 'storeapp-dev',
  apiKey: 'a6788f15ff87f7629dfd854937829d66',  
  password: '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',
});

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));


app.get('/orders', async (req, res) => {
  try {
    const orders = await shopify.order.list();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// app.post('/create/order', async (req, res) => {
//   try {
//     const newOrder = await shopify.order.create(req.body.order); 
//     res.status(201).json({ success: true, order: newOrder });
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ success: false, error: 'Error creating order' });
//   }
// });

// app.put('/update/order/:id', async (req, res) => {
//   try {
//     const updatedOrder = await shopify.order.update(req.params.id, req.body.order);
//     res.json({ success: true, order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

const webhookSecret = 'c748879db7bfc23d420c27b726402e98e898aaa0635d866c9378cf0b0648d509';

const message = JSON.stringify(
  {
    "id": 1234567890,
    "email": "customer@example.com",
    "financial_status": "Voided",
    "total_price": "52.00",
    "line_items": [
      {
        "id": 8794187530527,
        "variant_id": 47985279893791,
        "quantity": 1,
        "price": "52.00"
      }
    ]
  } 
); 

const hmac = crypto
  .createHmac('sha256', webhookSecret)
  .update(message)
  .digest('base64');

console.log(hmac);


app.post('/webhooks/orders/create', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const webhookSecret = 'c748879db7bfc23d420c27b726402e98e898aaa0635d866c9378cf0b0648d509';
  const digest = hmac
  //  crypto
  // .createHmac('sha256', webhookSecret)
  // .update(req.rawBody)
  // .digest('base64');
console.log("1",digest)
if (digest !== hmacHeader) {
  console.error('Webhook HMAC validation failed');
  return res.status(401).send('Unauthorized');
}
 
  const orderData = req.body;
  console.log('Received order data:', orderData);

  shopify.order.create(orderData)
    .then((order) => {
      console.log('Order created:', order);
      res.status(200).send('Order created successfully');
    })
    .catch((error) => {
      console.error('Error creating order:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.post('/webhook/orders/updated', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  const calculatedHmac = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body), 'utf8')
    .digest('base64');
    console.log("3",calculatedHmac)
  if (calculatedHmac !== hmacHeader) {
    return res.status(401).send('HMAC validation failed');
  }

  // Process the order update
  console.log('Received order update:', body);

  // Respond to Shopify to acknowledge the webhook
  res.status(200).send('Webhook processed');
});

app.put('/update-fulfillment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { fulfillmentStatus } = req.body;

    const updatedOrder = await shopify.order.update(orderId, { fulfillment_status: fulfillmentStatus });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fulfillment status' });
  }
});

app.post("/webhook/order/update", (req,res)=>{
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const webhookSecret = 'c748879db7bfc23d420c27b726402e98e898aaa0635d866c9378cf0b0648d509';
  const digest = hmac
  //  crypto
  // .createHmac('sha256', webhookSecret)
  // .update(req.rawBody)
  // .digest('base64');
console.log("2",digest)
if (digest !== hmacHeader) {
  console.error('Webhook HMAC validation failed');
  return res.status(401).send('Unauthorized');
}
 
  const { order_id, new_status } = req.body;

  shopify.order.update(order_id, { status: new_status })
    .then(() => {
      res.status(200).end('Order updated');
    })
    .catch((err) => {
      res.status(500).end(`Error updating order: ${err.message}`);
    });
})

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});
