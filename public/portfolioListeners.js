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
    let isSelectingFromDropdown = false;

    if (query.length > 1) {
        const response = await fetch('/search?q=' + (query) )
        const coins = await response.json();
        // Populate dropdown
        suggestions.innerHTML = "";
        coins.forEach((coin) => {
            const item = document.createElement('li');
            item.textContent = coin.name;
            item.setAttribute('data-value', coin.name);

            item.addEventListener('mousedown', () => {
                isSelectingFromDropdown = true;
                e.target.value = coin.name;
                suggestions.style.display = 'none';
            });
            suggestions.appendChild(item);
        });

        suggestions.style.display = coins.length > 0 ? 'block' : 'none';
    } else {
        suggestions.style.display = 'none';
    }

    e.target.addEventListener('blur', () => {
        const inputValue = e.target.value.trim(); // Get the trimmed input value
        const suggestions = document.getElementById("coinlist");
        if (inputValue.length == 0) {
            return
          }

        if (isSelectingFromDropdown) {
            isSelectingFromDropdown = false; // Reset the flag and skip validation
            return;
        }

        // Check if the input matches a dropdown option
        const isValid = Array.from(suggestions.children).some(
            (child) => child.dataset.value === inputValue
        );

        if (!isValid) {
            e.target.value = ''; // Clear the input field
            alert('Please select a valid cryptocurrency from the list.');
        }

        suggestions.style.display = 'none'; // Hide the dropdown
    });
    
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