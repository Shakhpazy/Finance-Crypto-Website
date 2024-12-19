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
    console.log("get")
    //let theData = {name: 'Bitcoin', symbol: 'BTC', circulating_supply: 19796721, price: 104763.486, volume_24h: 62172072377.837494, max_supply: 21000000}
    const theData = (await API.fetchCryptoData(20))
    //res.render("index.ejs", {data : theData})
    res.render("index.ejs", {data : theData, crypto1 : undefined, crypto2 : undefined})
})

app.post("/", async (req, res) => {
    console.log("post")
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

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})