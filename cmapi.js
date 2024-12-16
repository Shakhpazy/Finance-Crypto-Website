import { coinmarketcap } from './CoinMarketCap.js'

const cmc = new coinmarketcap()

cmc.bark();

const data = (await cmc.fetchCryptoData(1))[0]
console.log(data)
console.log(data.name)

let theData = {name: 'Bitcoin', symbol: 'BTC', circulating_supply: 19796721, price: 104763.486, volume_24h: 62172072377.837494, max_supply: 21000000}

console.log(theData.name)
