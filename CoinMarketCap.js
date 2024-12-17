import axios from 'axios'

const API = "869bb1c9-4100-449f-93b4-383168b93565"

export class coinmarketcap {

    constructor() {
        //empty don't need anything initialized here.
    }

    bark() {
        console.log("woof")
    }

    async fetchCryptoData(end) {
        const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";

        const headers = {
            "Accept": "application/json",
            "X-CMC_PRO_API_KEY": API,
        }

        const params = {
            start: "1",  
            limit: end,   
            convert: "USD"   
        }

        try {
              const response = await axios.get(url, { headers, params });
              const data = response.data.data;
              let stringSymbol = "";
              // Example: Log the first cryptocurrency
              //return all data in key values
              console.log("API IS USED");
              console.log(data);
              (data).forEach(crypto => {
                stringSymbol += crypto.symbol + ",";
              });
              console.log(stringSymbol);
              const logoLinks = await this.getCoinLogo(stringSymbol);
              console.log(logoLinks);

              for (const key in logoLinks) {
                const link = logoLinks[key]
                for (let i = 0; i < data.length; i++) {
                    const crypto = data[i];
                    if (crypto.id == key) {
                        crypto["logo"] = link;
                        break; // Break out of the inner loop
                    }
                }
              }
              return data
          } catch (error) {
            console.log("API FAILED")
            console.log(error)
          }
    }

    //param StringofSymbols = "BTC,ETH,XRP"
    async getCoinLogo(StringofSymbols) {
        const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info"

        const headers = {
            "Accept": "application/json",
            "X-CMC_PRO_API_KEY": API,
        }

        const params = {
            "symbol" : StringofSymbols
        }

        try {
            const response = await axios.get(url, { headers, params })
            const data = response.data.data
            let logosLink = {}
            for (const key in data) {
                logosLink[data[key].id] = data[key].logo
            }

            return logosLink
        } catch (error) {
            console.log("API FAILED")
            console.log(error)
        }
    }

    async fetchCoin() {
        //returns information given a coin like 
        // market cap and previous history of the coin
    }




}