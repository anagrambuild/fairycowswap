import { app } from "./api";
import { orderBookApi } from "./cow";
import { submitMsgToFairychain } from "./fairy";
// const submitToFairy = require('./fairy');
// import { apiConfig } from "./api-config";
import { logger } from "./logger";

// Start the server
const port = process.env.PORT || 3001;

app.get("/heartbeat", (req, res) => {
  res.send("OK");
});

app.post('/submit-order', async (req, res) => {
    console.log('submit-order', req.body);
    console.log(req.body.payload);

    const orderPayload = req.body.payload;
    const apiContext = req.body.apiContext;
    console.log(req.body.apiContext);


    await submitMsgToFairychain(JSON.stringify(orderPayload))

    const orderId = await orderBookApi.sendOrder(orderPayload, apiContext)

    console.log('orderId', orderId)
    res.json({
        status: "OK",
        orderId,
    });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
