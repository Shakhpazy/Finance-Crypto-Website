
//Changing the multiple color to red if the muliple is below 1 or keep defult as green
document.addEventListener("DOMContentLoaded", () => {
  let multiple = document.querySelector("#compartingcoins > div > div.mb-4 > div > h2 > span").innerHTML
  if (multiple.charAt(1) == 0) {
    console.log("hi")
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
  console.log(amount)
  console.log(muliple)
  console.log(total)
  if(!amount) {
    document.querySelector("#price").innerHTML = Number(muliple.toFixed(2)).toLocaleString()
  } 
  else {
    document.querySelector("#price").innerHTML = Number(total.toFixed(2)).toLocaleString()
  }
})
