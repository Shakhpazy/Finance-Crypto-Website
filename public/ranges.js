//Finding the range pecent for the specfic crypto page
document.addEventListener("DOMContentLoaded", () => {
    let currentprice = document.querySelector("#current_price").innerHTML
    let high = document.querySelector("#high").innerHTML
    let low = document.querySelector("#low").innerHTML

    currentprice = parseFloat(currentprice.replace("$", "").replace(/,/g, ""))
    high = parseFloat(high.replace("$", "").replace(/,/g, ""))
    low = parseFloat(low.replace("$", "").replace(/,/g, ""))

    const percent = ((currentprice - low) / (high - low)) * 100
    
    document.querySelectorAll(".current-price-marker").forEach((element) => {
      element.style.width = percent + "%"
    })
  })