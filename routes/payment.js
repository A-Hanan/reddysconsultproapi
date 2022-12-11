const express = require("express");
const stripe = require("stripe")(
  "sk_test_51MD3nmH3RSV9Ih5PnlKUpEYWz4fBHV97ykD2J0sRPRKOcg7ZwHqx37dMLUg9TcCGSUXiMGcKDPprfP37DM7GaMwZ00eAiUjY8I"
);
const router = express.Router();
// const uuid = require("uuid");
const { v4: uuidv4 } = require("uuid");
router.get("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "usd",
      payment_method_types: ["card"],
    });
    console.log("creating payment intent", paymentIntent);
    res.status(200).json({ clientSecret: paymentIntent?.client_secret });
  } catch (err) {
    console.log(err);
    res.status(500).send("error while creating payment Intent");
  }
});
router.post("/", (req, res) => {
  console.log("req.body", req.body);
  const { product, token } = req.body;
  console.log("PRODUCT", product);
  console.log("PRICE", product.price);
  const idempotencyKey = uuidv4();
  console.log("idempontencyKey", idempotencyKey);
  //this key will fire only once and take care of the user will not more than once

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of ${product.name}`,
          // shipping: {
          //   name: token.card.name,
          //   address: {
          //     country: token.card.address_country,
          //   },
          // },
        },
        { idempotencyKey: idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});
//whenever you work with stripe you have to multiply price with 100, because it deals in cent

module.exports = router;
