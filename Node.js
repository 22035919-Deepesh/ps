const express = require("express");
const fetch = require("node-fetch");
const app = express();

const CLIENT_ID = "AZCv0tBekdAB7iOscCsq13O14hDEm6sNK7gHhU5jQHzE49FylhOadctY7ER7PGR_ggc5NPJt42koX0Dc"; // Replace with your actual client ID
const APP_SECRET = "YOUR_APP_SECRET"; // Replace with your actual app secret

const baseURL = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com"
};

app.use(express.json());

app.post("/create-paypal-order", async (req, res) => {
  const order = await createOrder();
  res.json(order);
});

app.post("/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  const captureData = await capturePayment(orderID);
  // TODO: Store payment information if needed
  res.json(captureData);
});

async function createOrder() {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100.00",
          },
        },
      ],
    }),
  });
  const data = await response.json();
  return data;
}

async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
