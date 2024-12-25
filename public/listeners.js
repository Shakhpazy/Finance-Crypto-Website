//Finding the range pecent for the specfic crypto page
document.addEventListener("DOMContentLoaded", () => {
  let low = document.querySelector("#range-coin > div > div.item.mt-3 > div.data.d-flex.justify-content-between > p:nth-child(1)").innerHTML
  let high = document.querySelector("#range-coin > div > div.item.mt-3 > div.data.d-flex.justify-content-between > p:nth-child(2)").innerHTML
  low = parseFloat((low.substring(1)).replace(/,/g, ''));
  high = parseFloat((high.substring(1)).replace(/,/g, ''));
  const currentprice = (low+high)/2
  const percent = (currentprice/high)*100
  document.querySelectorAll(".current-price-marker").forEach((element) => {
    element.style.width = percent + "%"
  })
})

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('coin-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting the default way
    // Get the coin symbol from the input field
    let coinSymbol = document.getElementById('fcoin').value.trim().toUpperCase();
    
    if (coinSymbol) {
      // Dynamically change the form action to match the /:coin route
      this.action = `/coin/${coinSymbol}`;
  
      // Now submit the form
      this.submit();
    } else {
      alert("Please enter a coin symbol.");
    }
  })
})
//Changing the multiple color to red if the muliple is below 1 or keep defult as green
document.addEventListener("DOMContentLoaded", () => {
  let multiple = document.querySelector("#compartingcoins > div > div.mb-4 > div > h2 > span.multiple").innerHTML
  console.log(multiple)
  if (multiple.charAt(1) == 0) {
    document.querySelector("#compartingcoins > div > div.mb-4 > div > h2 > span.multiple").style.color = "#c46647"
  }
})

let amountInput = document.getElementById("amount")
const muliple = parseFloat(document.querySelector("#price").innerHTML)

function keepnumber(input) {
  ret = ""
  for (const char of input) {
    if (!isNaN(char) && char.trim() !== '') {
      ret += char
    } 
  }

  return ret
}

amountInput.addEventListener("input", () => {
  const amount = keepnumber(amountInput.value)
  let total = amount * muliple
  if(!amount) {
    document.querySelector("#price").innerHTML = Number(muliple.toFixed(2)).toLocaleString()
  } 
  else {
    document.querySelector("#price").innerHTML = Number(total.toFixed(2)).toLocaleString()
  }
})
