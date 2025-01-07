import axios from 'axios'
import env from 'dotenv'
import { db } from './index.js'


env.config()
const API = process.env.CMC_API



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
              await this.insertCoins(map)
              return

          } catch (error) {
            console.log("API FAILED1")
            console.log(error)
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
    async insertCoins(map) {
        console.log("coins to database");
    
        try {
            // Check if the database has items already so we can decide the action
            const checkQuery = await db.query('SELECT * FROM coins');
    
            // Start a transaction
            await db.query('BEGIN');
    
            if (checkQuery.rows.length <= 0) {
                const insertQuery = `
                    INSERT INTO coins (
                        cmc_id, name, symbol, description, logo_url, social_media_urls, 
                        price, market_cap, volume_24h, percent_change_1h, percent_change_24h, 
                        percent_change_7d, circulating_supply, total_supply, max_supply, 
                        last_updated, cmc_rank
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
                        $12, $13, $14, $15, $16, $17
                    )`;
    
                for (const key in map) {
                    let coinData = map[key];
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
                console.log('Coins inserted successfully');
            } else {
                const upsertQuery = `
                    INSERT INTO coins (
                        cmc_id, name, symbol, description, logo_url, social_media_urls, 
                        price, market_cap, volume_24h, percent_change_1h, percent_change_24h, 
                        percent_change_7d, circulating_supply, total_supply, max_supply, 
                        last_updated, cmc_rank
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
                        $12, $13, $14, $15, $16, $17
                    ) ON CONFLICT (cmc_id) DO UPDATE SET 
                        name = EXCLUDED.name,
                        symbol = EXCLUDED.symbol,
                        description = EXCLUDED.description,
                        logo_url = EXCLUDED.logo_url,
                        social_media_urls = EXCLUDED.social_media_urls,
                        price = EXCLUDED.price,
                        market_cap = EXCLUDED.market_cap,
                        volume_24h = EXCLUDED.volume_24h,
                        percent_change_1h = EXCLUDED.percent_change_1h,
                        percent_change_24h = EXCLUDED.percent_change_24h,
                        percent_change_7d = EXCLUDED.percent_change_7d,
                        circulating_supply = EXCLUDED.circulating_supply,
                        total_supply = EXCLUDED.total_supply,
                        max_supply = EXCLUDED.max_supply,
                        last_updated = EXCLUDED.last_updated,
                        cmc_rank = EXCLUDED.cmc_rank;
                `;
    
                for (const key in map) {
                    let coinData = map[key];
                    await db.query(upsertQuery, [
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
                console.log('Coins upserted successfully');
            }
    
            // Commit the transaction after all queries
            await db.query('COMMIT');
        } catch (error) {
            if (db) {
                // Rollback transaction in case of error
                await db.query('ROLLBACK');
            }
            console.error('Error inserting coins:', error);
        }
    }

}