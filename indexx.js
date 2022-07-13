const express = require("express");
const Topgg = require("@top-gg/sdk");

const app = express();

const webhook = new Topgg.Webhook(
    "t3xA6XrFdjkV59VjneBMCZCH825KuXF2MHNfHStwS6smwCyR74"
);

app.post(
    "/dblwebhook",
    webhook.listener((vote) => {
        console.log(vote.user);
    })
);

app.listen(8080);
