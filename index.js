import express from 'express'
import bodyParser from 'body-parser'

//api
import { coinmarketcap } from './CoinMarketCap.js'

const PORT = 3000
const app = express()
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", async (req, res) => {
    console.log("get")
    //let theData = {name: 'Bitcoin', symbol: 'BTC', circulating_supply: 19796721, price: 104763.486, volume_24h: 62172072377.837494, max_supply: 21000000}
    const api = new coinmarketcap();
    const theData = (await api.fetchCryptoData(20))
    res.render("index.ejs", {data : theData})
})

app.post("/", (req, res) => {
    console.log("post")
    console.log(req.body)
})

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})