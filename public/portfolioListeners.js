console.log("portfolioListeners.js loaded")

document.getElementById("togglebutton").addEventListener("click", () => {
    console.log("toggle button clicked")
    let form = document.getElementById("addcoinform")
    form.classList.toggle("inactive")
})