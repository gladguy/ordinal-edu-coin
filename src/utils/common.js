import { Actor, HttpAgent } from "@dfinity/agent";
import axios from "axios";
import { ethers } from "ethers";
import Web3 from "web3";
import meta from "../assets/wallet-logo/meta.png";
import Notify from "../component/notification";

export const API_METHODS = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};

export const apiUrl = {
  Asset_server_base_url: process.env.REACT_APP_ASSET_SERVER,
};

export const META_WALLET_KEY = "meta";
export const CHAIN_ETHEREUM = "ethereum";
export const CHAIN_BNB = "bnb";
export const CHAIN_POLYGON = "polygon";
export const nullAddress = "0x0000000000000000000000000000000000000000";
export const chainId = 41923; // OpenCampus Mainnet Chain ID
export const IS_USER = true;
export const IS_DEV = false;

export const opencampusCanister = process.env.REACT_APP_OPENCAMPUS_CANISTER_ID;
export const foundaryId = Number(process.env.REACT_APP_FOUNDARY_ID);
export const custodyAddress = process.env.REACT_APP_TOKEN_CUSTODY_ADDRESS;

export const paymentWallets = [
  {
    label: "META",
    image: meta,
    key: META_WALLET_KEY,
  }
]

export const agentCreator = (apiFactory, canisterId) => {
  const agent = new HttpAgent({
    host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
  });
  const API = Actor.createActor(apiFactory, {
    agent,
    canisterId,
  });
  return API;
};

export const sliceAddress = (address, slicePoint = 5) => (
  <>
    {address?.slice(0, slicePoint)}
    ...
    {address?.slice(address.length - slicePoint, address.length)}
  </>
);

export const calculateFee = (bytes, preference) => {
  return Math.round(
    (Number(
      bytes?.split(" ")[0]
    ) /
      4) *
    preference *
    3.47
  )
}

function fractionToFixed(numerator, denominator, minDecimalPlaces = 2, maxDecimalPlaces = 20) {
  // Convert fraction to decimal
  const decimalValue = numerator / denominator;

  // If the decimalValue is 0, return 0 with minDecimalPlaces
  if (decimalValue === 0) {
    return decimalValue.toFixed(minDecimalPlaces);
  }

  // Calculate the number of significant decimal places needed
  let significantDecimalPlaces = 0;
  for (let i = 2; i <= maxDecimalPlaces; i++) {
    const fixedValue = decimalValue.toFixed(i);
    if (parseFloat(fixedValue) !== 0) {
      significantDecimalPlaces = i;
      break;
    }
  }

  // Ensure at least minDecimalPlaces
  significantDecimalPlaces = Math.max(minDecimalPlaces, significantDecimalPlaces);

  // Use toFixed to format the decimal value to the determined number of decimal places
  const formattedValue = decimalValue.toFixed(significantDecimalPlaces);

  return formattedValue;
}

export const calculateOrdinalInCrypto = (ordinalFloor, BTCPriceInUSD, CryptoPriceInUSD) => {
  // Calculate Floor to USD
  // const floorInUSD = ordinalFloor / BTC_ZERO;

  // Calculate ordinal price in USD
  const ordinalInUSD = ordinalFloor * BTCPriceInUSD;

  // Calculate ordinal price in BNB
  const ordinalIncrypto = fractionToFixed(ordinalInUSD, CryptoPriceInUSD);

  return {
    ordinalInUSD: ordinalInUSD.toFixed(2),
    ordinalIncrypto: ordinalIncrypto
  };
}

export const IndexContractAddress = process.env.REACT_APP_REGISTRATION;
export const TokenContractAddress = process.env.REACT_APP_NFT_CONTRACT;
export const BorrowContractAddress = process.env.REACT_APP_LOAN_CONTRACT;

export const contractGenerator = async (abi, contractAddress) => {
  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(abi, contractAddress);
  return contract;
}

export const ethersContractCreator = async (abi, contractAddress) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(abi, contractAddress, signer);
  return contract
}

export const calculateAPY = (interestRate, numberOfDays, toFixed = 2) => {
  const rateDecimal = interestRate / 100;
  const apy = Math.pow(1 + rateDecimal, 365 / numberOfDays) - 1;
  const apyPercentage = apy * 100;

  return apyPercentage.toFixed(toFixed);
}

export const calculateDailyInterestRate = (annualInterestRate, toFixed = 2) => {
  const rateDecimal = annualInterestRate / 100;
  const dailyInterestRate = rateDecimal / 365;
  const dailyInterestRatePercentage = dailyInterestRate * 100;

  return dailyInterestRatePercentage.toFixed(toFixed); // Return daily interest rate rounded to 5 decimal places
}

// Getting time ago statement
export const getTimeAgo = (timestamp) => {
  const now = new Date(); // Current date and time
  const diff = now.getTime() - timestamp; // Difference in milliseconds

  // Convert milliseconds to seconds
  const seconds = Math.floor(diff / 1000);

  // Calculate time difference in various units
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Determine appropriate phrase based on time difference
  if (seconds < 60) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}

export const Capitalaize = (data) => {
  if (data) {
    const words = data.split(/\s+/);
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  }
};

export const DateTimeConverter = (timestamps) => {
  const date = new Date(timestamps);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let strTime = date.toLocaleString("en-IN", { timeZone: `${timezone}` });
  const timeStamp = strTime.split(",");

  return timeStamp;
};

// Function to format hours in 12-hour clock format
export const format12Hour = (hours) => {
  return hours % 12 || 12;
};

// Function to format single-digit minutes and seconds with leading zero
export const formatTwoDigits = (value) => {
  return value.toString().padStart(2, "0");
};

export const daysCalculator = (_timestamp = Date.now(), _daysAfter = 7) => {
  const timestamp = Number(_timestamp);

  const givenDate = new Date(timestamp);

  const resultDate = new Date(givenDate);
  resultDate.setDate(givenDate.getDate() + _daysAfter);

  const formattedResult = `${resultDate.getDate()}/${resultDate.getMonth() + 1
    }/${resultDate.getFullYear()} ${format12Hour(
      resultDate.getHours()
    )}:${formatTwoDigits(resultDate.getMinutes())}:${formatTwoDigits(
      resultDate.getSeconds()
    )} ${resultDate.getHours() >= 12 ? "pm" : "am"}`;

  return { date_time: formattedResult, timestamp: resultDate.getTime() };
};

export const openCampusNetworkTestnetParams = {
  chainId: "0xA045C",
  chainName: "Open Campus Codex",
  rpcUrls: [
    "https://rpc.open-campus-codex.gelato.digital/",
  ],
  blockExplorerUrls: [
    "https://opencampus-codex.blockscout.com/",
  ],
  nativeCurrency: {
    name: "EDU Token",
    symbol: "EDU", // Replace with the symbol of the native token
    decimals: 18,
  },
}

export const openCampusNetworkMainnetParams = {
  chainId: '0xa3c3',
  chainName: 'EDU Chain Mainnet', // Replace with the correct name
  nativeCurrency: {
    name: 'EDU Token', // Replace with token name
    symbol: 'EDU', // Replace with token symbol
    decimals: 18,
  },
  rpcUrls: ['https://rpc.edu-chain.network'], // Replace with the correct RPC URL
  blockExplorerUrls: ['https://explorer.edu-chain.network'], // Replace with the correct explorer URL
}

export async function switchToOpenCampusNetwork() {

  try {
    if (window.ethereum) {
      // Request MetaMask to switch to OpenCampus
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: openCampusNetworkMainnetParams.chainId }],
      });
    } else {
      Notify("error", "MetaMask is not installed!");
    }
  } catch (error) {
    if (error.code === 4902) {
      // If the network is not added, request to add it
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [openCampusNetworkMainnetParams],
        });
      } catch (addError) {
        console.error("Failed to add OpenCampus network:", addError);
      }
    } else {
      console.error("Failed to switch to OpenCampus network:", error);
    }
  }
}

export async function switchToPolygonNetwork() {
  const polygonParams = {
    chainId: "0x89", // Hexadecimal value of 137 (Polygon Mainnet chain ID)
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com"], // Recommended Polygon RPC URL
    blockExplorerUrls: ["https://polygonscan.com"],
  };

  try {
    if (window.ethereum) {
      // Request MetaMask to switch to Polygon
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonParams.chainId }],
      });
    } else {
      Notify("error", "MetaMask is not installed!");
    }
  } catch (error) {
    if (error.code === 4902) {
      // If the network is not added, request to add it
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [polygonParams],
        });
      } catch (addError) {
        console.error("Failed to add Polygon network:", addError);
      }
    } else {
      console.error("Failed to switch to Polygon network:", error);
    }
  }
}