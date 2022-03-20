import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { ethToSol } from './ethToSol';

const port = process.env.PORT || 4000

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.post("/swap", async (req, res, next) => {
    const {
        amount, 
        ETH_PV_KEY,
        ETH_PUB_KEY,
        ETH_ERC20_ADDRESS,
        SOL_PV_KEY,
        SOL_PUB_KEY,
        SOL_SPL_TOKEN_ADDRESS
    } = req.body.params;
    console.log(req.body);

    // const amount = 1;
    // const ETH_PV_KEY = "";
    // const ETH_PUB_KEY = "";
    // const ETH_ERC20_ADDRESS = "";
    // const SOL_PV_KEY = "";
    // const SOL_PUB_KEY = "";
    // const SOL_SPL_TOKEN_ADDRESS = "";

    const {
        ethereumTransactionID,
        solanaTransactionID
    } = await ethToSol({
        amount, 
        ETH_PV_KEY,
        ETH_PUB_KEY,
        ETH_ERC20_ADDRESS,
        SOL_PV_KEY,
        SOL_PUB_KEY,
        SOL_SPL_TOKEN_ADDRESS
    })

    // return the transaction IDs when the transaction completes
    res.status(200).send({ethereumTransactionID, solanaTransactionID});
});

app.listen(port, () => {
    console.log("Server running on port 4000");
});