const solanaWeb3 = require('@solana/web3.js');
const request = require('request');
var express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
var path = require('path');

var port = process.env.PORT || 4000

const fs = require('fs');

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());


app.post("/swap", async (req, res, next) => {
    // amount to send in currency
    console.log(req.body.amount);

    // either "Ethereum" or "Solana"
    console.log(req.body.sendingChain);

    // either "Ethereum" or "Solana"
    console.log(req.body.receivingChain);
    
    // return the transaction IDs when the transaction completes
    res.status(200).send({ethereumTransactionID: "123", solanaTransactionID: "123"});
});

app.get("/:publicKey", async (req, res, next) => {
    //if we want to pull a history of previous transactions

});

app.listen(port, () => {
    console.log("Server running on port 4000");
});