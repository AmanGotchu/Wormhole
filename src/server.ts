import solanaWeb3 from '@solana/web3.js';
import request from 'request';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import path from 'path';

import { run } from './ethToSol';

const port = process.env.PORT || 4000

import fs from 'fs';

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.post("/swap", async (req, res, next) => {
    const {
        ethPvKey, ethTokenAddr, solPubKey, solPvKey, solTokenAddr, attest
    } = req.body;

    const {
        ethereumTransactionID,
        solanaTransactionID
    } = await run({
        ethPvKey, ethTokenAddr, solPubKey, solPvKey, solTokenAddr, attest
    })

    // return the transaction IDs when the transaction completes
    res.status(200).send({ethereumTransactionID, solanaTransactionID});
});

app.get("/:publicKey", async (req, res, next) => {
    //if we want to pull a history of previous transactions
    // run();
    console.log("Weird");
});

app.listen(port, () => {
    console.log("Server running on port 4000");
});