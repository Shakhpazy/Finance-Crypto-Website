import { coinmarketcap } from './CoinMarketCap.js'

const cmc = new coinmarketcap()

//const test = await cmc.getCoinLogo("BTC,ETH,XRP")
//cmc.fetchCryptoData(5)

//let testdata = await cmc.getMoreCoinData("BTC")

//console.log(testdata)

let testing = await cmc.fetchCoin("BTC")
console.log(testing)