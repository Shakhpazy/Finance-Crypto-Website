import express from 'express'
import bodyParser from 'body-parser'

//api
import { coinmarketcap } from './CoinMarketCap.js'

const PORT = 3000
const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))

const API = new coinmarketcap();

app.get("/", async (req, res) => {
    console.log("get main page")
    const theData = (await API.fetchCryptoData(20))

    res.render("index.ejs", {data : theData, crypto1 : undefined, crypto2 : undefined})
})

app.post("/", async (req, res) => {
    console.log("post 2 coins")
    const theData = (await API.fetchCryptoData(20))
    const data = req.body
    const theCrypto1 = await API.fetchCoin((data.fcoin1).toUpperCase())
    const theCrypto2 = await API.fetchCoin((data.fcoin2).toUpperCase())
    if (theCrypto1 == undefined || theCrypto2 == undefined) {
        console.log("API search not valid for one of the query")
        res.redirect("/")
    }
    //crypto1.quote.USD.market_cap
    res.render("index.ejs", {data : theData, crypto1 : theCrypto1, crypto2 : theCrypto2})
})

app.get("/coin/:coin", async (req, res) => {
    console.log("get specific coin")
    const theData = await API.fetchCoin(req.params.coin)
    res.render("coin.ejs", { data : theData })
})

app.get("/portfolio", (req, res) => {
    console.log("get about portfolio")
    res.render("portfolio.ejs")
})

app.post("/portfolio", async (req, res) => {
    const data = req.body
    console.log(data)
    console.log("post about portfolio")
    res.redirect("/portfolio")
})

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})