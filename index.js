const API = "869bb1c9-4100-449f-93b4-383168b93565"

import axios from 'axios'

axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map', {
      headers: {
        'X-CMC_PRO_API_KEY': API,
      },
    })
    .then(response => {
        // Access the response data
        const responseData = response.data
        console.log(responseData)
        // Process the response data here
    })
    .catch(error => {
        console.log(error)
    });