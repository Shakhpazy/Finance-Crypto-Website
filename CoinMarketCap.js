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
              const data = response.data;
        
              // Example: Log the first cryptocurrency
              //console.log(data.data[0]);
              //return all data in key values
              return data.data
          } catch (error) {
            console.log("failed api")
          }
    }




}