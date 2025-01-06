console.log("search.js loaded")

//home page searching for coins
document.querySelectorAll('.search-bar').forEach(searchBar => {
    searchBar.addEventListener('input', async (e) => {
        const query = e.target.value;
        const searchBarId = e.target.id; // Get the ID of the triggered search bar
        const suggestionsId = `suggestions-${searchBarId.split('-')[2]}`; // Match dropdown ID
        const suggestions = document.getElementById(suggestionsId);

        if (query.length > 1) {
            const response = await fetch('/search?q=' + (query) )
            const coins = await response.json();

            // Populate dropdown
            suggestions.innerHTML = '';
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
    });
})


//submission to search coin for the top 20 section
document.getElementById('coin-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting the default way
    // Get the coin symbol from the input field
    console.log("coin-form submitted");
    let coinName = document.getElementById('search-bar-3').value.trim();
    if (coinName) {
      // Dynamically change the form action to match the /:coin route
      this.action = `/coin/${coinName}`;

      // Now submit the form
      this.submit();
    } else {
      alert("Please enter a coin symbol.");
    }
  })

//close the search bar on click anywhere on screen
document.body.addEventListener("click", () => {
    console.log("pressed on page")
    drop_downs = document.querySelectorAll(".dropdown")
    drop_downs.forEach(elem => {
      let style = getComputedStyle(elem).display
      if (style != "none") {
        elem.style.display = "none"
      }
    });
  })