/* global web3 */
import Web3 from "web3";
import addresses from "./addresses.js";

let web3js;
// Checking if Web3 has been injected by the browser (Mist/MetaMask)
if (typeof web3 !== 'undefined') {
  // Use Mist/MetaMask's provider
  web3js = new Web3(web3.currentProvider);
} else {
  console.log('No web3? You should consider trying MetaMask!')
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Returns gas prices in gwei
const getCurrentGasPrices = async () => {
  const response = await fetch("https://ethgasstation.info/json/ethgasAPI.json")
    .then(r => r.json())
  const prices = {
    low: response.safeLow / 10,
    medium: response.average / 10,
    high: response.fast / 10
  }

  return prices
}

export default {
  ...addresses,
  web3: web3js,
  getCurrentGasPrices,
}
