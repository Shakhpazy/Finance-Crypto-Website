# 🪙 CoinCapCrypto

A full-stack cryptocurrency web application that lets users explore the crypto market, compare coins, and manage a personal portfolio. Built with **Node.js**, **Express**, **PostgreSQL**, and **EJS**.

## 🚀 Features

- **Live Market Data** – Fetches crypto market information from an online database/third-party API.  
- **Coin Comparison Tool** – Compare two or more cryptocurrencies side by side on price, market cap, and performance.  
- **Personal Portfolio** – Track holdings, add/remove coins, and view real-time value updates.  
- **Search with Dropdown** – Search functionality forces selection from dropdown to prevent invalid queries.  
- **Bug-fixed Portfolio View** – Smooth experience with updated database queries and refined UI.  

## 📂 Project Structure

├── images_extra/ # Extra images/assets
├── public/ # Static assets (CSS, JS, etc.)
├── views/ # EJS templates for frontend
├── index.js # Main server file (Express entry point)
├── CoinMarketCap.js # Handles API/database crypto data
├── package.json # Dependencies and scripts
├── package-lock.json # Dependency lock file
├── .gitignore # Ignored files for git


## ⚡ Getting Started

### 1. Clone the repo
git clone https://github.com/your-username/CoinCapCrypto.git
cd CoinCapCrypto

2. Install dependencies
bash
Copy code
npm install

3. Set up the database
Ensure you have PostgreSQL installed and running.

Create a new database (e.g., coincapcrypto).

Update your DB credentials in the code (index.js and config file).

Recreate the schema (since this project does not use migrations).

4. Run the app
bash
Copy code
npm start
The server will start on http://localhost:3000/ (default).

🛠 Tech Stack
Backend: Node.js, Express
Frontend: EJS, HTML, CSS, Bootstrap
Database: PostgreSQL
Other: Git, Render for hosting

📊 Future Improvements
User authentication for secure portfolios
Advanced analytics & charts
Mobile-friendly UI/React frontend
