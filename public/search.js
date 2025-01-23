console.log("search.js loaded")

//home page searching for coins
document.querySelectorAll('.search-bar').forEach(searchBar => {

    let isSelectingFromDropdown = false;

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
                item.setAttribute('data-value', coin.name);
                item.addEventListener('mousedown', () => {
                    isSelectingFromDropdown = true
                    e.target.value = coin.name;
                    suggestions.style.display = 'none';
                });
                suggestions.appendChild(item);
            });

            suggestions.style.display = coins.length > 0 ? 'block' : 'none';
        } else {
            suggestions.style.display = 'none';
        }
    });

    searchBar.addEventListener('blur', () => {
      const inputValue = searchBar.value.trim();
      const suggestionsId = `suggestions-${searchBar.id.split('-')[2]}`;
      const suggestions = document.getElementById(suggestionsId);

      if (inputValue.length == 0) {
        return
      }

      if (isSelectingFromDropdown) {
          isSelectingFromDropdown = false; // Reset the flag
          return; // Skip validation
      }

      // Check if the input matches any of the dropdown options
      const isValid = Array.from(suggestions.children).some(
          (child) => child.dataset.value === inputValue
      );

      if (!isValid) {
          // Clear the input if it's not valid and notify the user
          alert('Please select a valid cryptocurrency from the list.');
          searchBar.value = ''; // Clear the input field
      }

      suggestions.style.display = 'none'; // Hide dropdown
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
    drop_downs = document.querySelectorAll(".dropdown")
    drop_downs.forEach(elem => {
      let style = getComputedStyle(elem).display
      if (style != "none") {
        elem.style.display = "none"
      }
    });
  })