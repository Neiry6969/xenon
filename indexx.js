const Topgg = require("@top-gg/sdk");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const webhook = new Topgg.Webhook("ajsdnad329jdidmsnakd8");

app.post(
    "/dblwebhook",
    webhook.listener((vote) => {
        console.log(vote.user);
    })
);

app.listen(8080, function () {
    console.log("Server is running...");
});
