import axios from 'axios'
import env from 'dotenv'
import pg from 'pg'

//"869bb1c9-4100-449f-93b4-383168b93565"
env.config()
const API = process.env.CMC_API

//database connections
const db = new pg.Client({
    user: process.env.USER_DB,
    host: process.env.HOST_DB,
    database: process.env.DB_DB,
    password: process.env.PASS_DB,
    port: process.env.PORT_DB
})


export class coinmarketcap {

    constructor() {
        //empty don't need anything initialized here.
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
              let stringofID = ""
              let map = {}
              const data = response.data.data;
              data.forEach(coin => {
                map[coin.id] = {"name" : coin.name,
                                "cmc_id" : coin.id,
                                "symbol" : coin.symbol,
                                "price" : coin.quote.USD.price,
                                "market_cap" : coin.quote.USD.market_cap,
                                "volume_24h" : coin.quote.USD.volume_24h,
                                "percent_change_1h" : coin.quote.USD.percent_change_1h,
                                "percent_change_24h" : coin.quote.USD.percent_change_24h,
                                "percent_change_7d" : coin.quote.USD.percent_change_7d,
                                "circulating_supply" : coin.circulating_supply,
                                "total_supply" : coin.total_supply,
                                "max_supply" : coin.max_supply,
                                "last_updated" : coin.last_updated,
                                "cmc_rank" : coin.cmc_rank}
                stringofID += coin.id + ","
              });
              
              let extradata = await this.getMoreCoinData(stringofID.substring(0, stringofID.length - 1))
            
              for (const key in extradata) {
                map[key]["logo"] = extradata[key].logo
                map[key]["urls"] = extradata[key].urls
                map[key]["description"] = extradata[key].textDescription
              }
              //insert into database
              await this.#insertCoins(map)
              return

          } catch (error) {
            console.log("API FAILED1")
            console.log(error.status)
          }
    }

    //Example: "1,2"
    async getMoreCoinData(Stringofid) {
        const url = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info"

        const headers = {
            "Accept": "application/json",
            "X-CMC_PRO_API_KEY": API,
        }

        const params = {
            "id" : Stringofid
        }

        try {
            const response = await axios.get(url, { headers, params })
            const data = response.data.data
            let coinData = {}
            for (const key in data) {
                coinData[data[key].id] = {"logo" : data[key].logo,
                                          "urls" : data[key].urls,
                                          "textDescription" : data[key].description}
            }
            
            return coinData
        
        } catch (error) {
            console.log("API FAILED2")
            console.log(error)
        }
    }

    //database functions
    async #insertCoins(map) {
        console.log("Inserting coins into database")    
        try {
            await db.connect(); // Connect to the database
            
            //check if database has items already so we can delete all entries
            const checkQuery = await db.query('SELECT * FROM coins')
            if (checkQuery.rows.length > 0) {
                await db.query('DELETE FROM coins')
            }

            // Start a transaction to ensure data consistency
            await db.query('BEGIN');
            
            const insertQuery = `
            INSERT INTO coins (
                cmc_id, name, symbol, description, logo_url, social_media_urls, price, market_cap, volume_24h, percent_change_1h, percent_change_24h, percent_change_7d, circulating_supply, total_supply, max_supply, last_updated, cmc_rank
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            )`;
    
            // Loop over the map (assuming it's an array of coins)
            for (const key in map) {
                let coinData = map[key]
                // Insert each coin data into the database
                await db.query(insertQuery, [
                    coinData.cmc_id,
                    coinData.name,
                    coinData.symbol,
                    coinData.description,
                    coinData.logo,
                    coinData.urls,
                    coinData.price,
                    coinData.market_cap,
                    coinData.volume_24h,
                    coinData.percent_change_1h,
                    coinData.percent_change_24h,
                    coinData.percent_change_7d,
                    coinData.circulating_supply,
                    coinData.total_supply,
                    coinData.max_supply,
                    coinData.last_updated,
                    coinData.cmc_rank
                ]);
            }
    
            // Commit the transaction after all queries
            await db.query('COMMIT');
            console.log('Coins inserted successfully');
        } catch (error) {
            // In case of error, rollback the transaction
            await db.query('ROLLBACK');
            console.error('Error inserting coins:', error);
        } finally {
            await db.end(); // Close the database connection
        }
    }

}