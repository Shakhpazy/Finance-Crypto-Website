console.log("portfolioListeners.js loaded")

//Toggle the Form Button
document.getElementById("togglebutton").addEventListener("click", () => {
    const form = document.getElementById("addcoinform")
    form.classList.toggle("inactive")

    const button = document.getElementById("togglebutton")

    if (button.innerHTML === "+ Add Coin") {
        button.innerHTML = "Close Form"
    } else {
        button.innerHTML = "+ Add Coin"
    }
})

//Portfolio Search Bar
document.querySelector(".search-bar").addEventListener("input", async (e) => {
    const query = e.target.value;
    const suggestions = document.getElementById("coinlist")

    if (query.length > 1) {
        const response = await fetch('/search?q=' + (query) )
        const coins = await response.json();
        // Populate dropdown
        suggestions.innerHTML = "";
        coins.forEach((coin) => {
            const item = document.createElement('li');
            item.textContent = coin.name;
            item.addEventListener('click', () => {
                e.target.value = coin.name;
                suggestions.style.display = 'none';
            });
            suggestions.appendChild(item);
        });

        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }

})



//Close portfolio search bar on click
document.body.addEventListener("click", () => {
    drop_down = document.getElementById("coinlist")
    let style = getComputedStyle(drop_down).display
    if (style != "none") {
        drop_down.style.display = "none"
    }
})

const pnlEntries = document.querySelectorAll(".pnl")
pnlEntries.forEach(elm => {
    const val = elm.innerHTML
    if (val.charAt(1) == '-') {
        elm.style.color = "#eb3131"
    } else {
        elm.style.color = "#16c783"
    }
});

function getTotal() {
    let total = 0;
    document.querySelectorAll(".choldings").forEach((item) => {
        // Extract the numerical part of the innerHTML and convert it to a float
        const amountStr = item.innerHTML.replace(/[^0-9.-]+/g, ""); 
        const amount = parseFloat(amountStr);

        // Add the parsed amount to the total
        if (!isNaN(amount)) {
            total += amount;
        }
    });

    total = (Number(total.toFixed(2))).toLocaleString()
    document.querySelector(".totalAmount").innerHTML = total
    // Output the total to the console
    console.log(`Total: $${total}`);
}

document.querySelectorAll(".a_trash").forEach(trash => {
    trash.addEventListener("click", async (e) => {

        if (confirm("Would you like to delete the coin?")) {
            const value = trash.getAttribute('value');

            const response = await fetch("/deletePortfolioItem?id=" + value, {
                method: "DELETE"
            })

            if (response.status == 200) {
                const row = document.getElementById("row"+value)
                row.remove()
                getTotal()
            } 
            else {
                console.log("error deleting item")
            }
        } 
        else {
            return
        }

    })
})