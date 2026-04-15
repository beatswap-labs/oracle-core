import Web3, { eth } from "web3";
import { Agent } from "http";
import Web3HttpProvider from "web3-providers-http";
import { Router } from "express";
import { ethers } from "ethers";
import * as dotenv from 'dotenv';
dotenv.config();
var router = Router();


//BNB mainnet
const MAIN_RPC_URL = process.env.OPBNB_RPC_URL;
const MULTICALL3_ADDRESS =
  process.env.OPBNB_MULTICALL3_ADDRESS ||
  process.env.MULTICALL3_ADDRESS ||
  "0xcA11bde05977b3631167028862bE2a173976CA11";
const IPL_HISTORY_MULTICALL_CHUNK_SIZE = Number(process.env.IPL_HISTORY_MULTICALL_CHUNK_SIZE || 1000);

//SEPOLIA
// const MAIN_RPC_URL = process.env.SEPO_RPC_URL;


//IPL Contract And ABI
const iplUrl = "0xdEB3FC49eb63765CDAbCD0917ae4D90b75847001"; // opbnb
// const iplUrl = "0xE4459E5e203913C02be6804d422a769EDB2FFef5"; // sepolia
const iplAbi = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccountMismatch","type":"error"},{"inputs":[],"name":"AlreadyMinted","type":"error"},{"inputs":[],"name":"AmountOverflow","type":"error"},{"inputs":[],"name":"ArrayLengthMismatch","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[],"name":"EmptyArray","type":"error"},{"inputs":[],"name":"InvalidMonth","type":"error"},{"inputs":[],"name":"InvalidType","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[],"name":"SnapshotAlreadyTaken","type":"error"},{"inputs":[],"name":"TransfersDisabled","type":"error"},{"inputs":[],"name":"UserAlreadyAuthorized","type":"error"},{"inputs":[],"name":"UserNotAuthorized","type":"error"},{"inputs":[],"name":"WhitelistAlreadyExists","type":"error"},{"inputs":[],"name":"ZeroAccount","type":"error"},{"inputs":[],"name":"ZeroAmount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"AuthorizedUserAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"AuthorizedUserRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"count","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"startIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endIndex","type":"uint256"}],"name":"BatchAddToWhitelistCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"mintType","type":"uint8"},{"indexed":false,"internalType":"string","name":"rewardType","type":"string"}],"name":"MintOccurred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint16","name":"year","type":"uint16"},{"indexed":true,"internalType":"uint8","name":"month","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"snapshotBlock","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"MonthlySnapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"mintType","type":"uint8"}],"name":"WhitelistAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"canceledAmount","type":"uint256"}],"name":"WhitelistRemoved","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"addAuthorizedUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorizedUsers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"balanceOfAtBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"users","type":"address[]"}],"name":"batchAddAuthorizedUsers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"indices","type":"uint256[]"},{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint8[]","name":"types","type":"uint8[]"}],"name":"batchAddToWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"indices","type":"uint256[]"},{"internalType":"bool","name":"revertOnMinted","type":"bool"}],"name":"batchRemoveFromWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"year","type":"uint16"},{"internalType":"uint8","name":"month","type":"uint8"},{"internalType":"address","name":"account","type":"address"}],"name":"getMonthlySnapshotShare","outputs":[{"internalType":"uint256","name":"balAt","type":"uint256"},{"internalType":"uint256","name":"totalAt","type":"uint256"},{"internalType":"uint256","name":"shareRay","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getWhitelistInfo","outputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"enum IPLicensingIndex.MintType","name":"mintType","type":"uint8"},{"internalType":"bool","name":"isMinted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"hasMintedByIndex","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"rewardType","type":"string"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"","type":"uint16"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"monthlySnapshotBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"year","type":"uint16"},{"internalType":"uint8","name":"month","type":"uint8"},{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"monthlyAllocation","type":"uint256"}],"name":"previewMonthlyReward","outputs":[{"internalType":"uint256","name":"reward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"removeAuthorizedUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"year","type":"uint16"},{"internalType":"uint8","name":"month","type":"uint8"}],"name":"takeMonthlySnapshot","outputs":[{"internalType":"uint256","name":"snapshotBlock","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"totalSupplyAtBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"whitelistByIndex","outputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"mintType","type":"uint8"}],"stateMutability":"view","type":"function"}]; 


// const iplAbi = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccountMismatch","type":"error"},{"inputs":[],"name":"AlreadyMinted","type":"error"},{"inputs":[],"name":"AmountOverflow","type":"error"},{"inputs":[],"name":"ArrayLengthMismatch","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[],"name":"EmptyArray","type":"error"},{"inputs":[],"name":"InvalidMonth","type":"error"},{"inputs":[],"name":"InvalidType","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[],"name":"SnapshotAlreadyTaken","type":"error"},{"inputs":[],"name":"TransfersDisabled","type":"error"},{"inputs":[],"name":"UserAlreadyAuthorized","type":"error"},{"inputs":[],"name":"UserNotAuthorized","type":"error"},{"inputs":[],"name":"WhitelistAlreadyExists","type":"error"},{"inputs":[],"name":"ZeroAccount","type":"error"},{"inputs":[],"name":"ZeroAmount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"AuthorizedUserAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"AuthorizedUserRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"count","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"startIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endIndex","type":"uint256"}],"name":"BatchAddToWhitelistCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"mintType","type":"uint8"},{"indexed":false,"internalType":"string","name":"rewardType","type":"string"}],"name":"MintOccurred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint16","name":"year","type":"uint16"},{"indexed":true,"internalType":"uint8","name":"month","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"snapshotBlock","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"MonthlySnapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"uint8","name":"mintType","type":"uint8"}],"name":"WhitelistAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"index","type":"uint256"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"canceledAmount","type":"uint256"}],"name":"WhitelistRemoved","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"addAuthorizedUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorizedUsers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"balanceOfAtBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"users","type":"address[]"}],"name":"batchAddAuthorizedUsers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"indices","type":"uint256[]"},{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint8[]","name":"types","type":"uint8[]"}],"name":"batchAddToWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"indices","type":"uint256[]"},{"internalType":"bool","name":"revertOnMinted","type":"bool"}],"name":"batchRemoveFromWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"year","type":"uint16"},{"internalType":"uint8","name":"month","type":"uint8"},{"internalType":"address","name":"account","type":"address"}],"name":"getMonthlySnapshotShare","outputs":[{"internalType":"uint256","name":"balAt","type":"uint256"},{"internalType":"uint256","name":"totalAt","type":"uint256"},{"internalType":"uint256","name":"shareRay","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getWhitelistInfo","outputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"enum IPLicensingIndex.MintType","name":"mintType","type":"uint8"},{"internalType":"bool","name":"isMinted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"hasMintedByIndex","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"rewardType","type":"string"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"","type":"uint16"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"monthlySnapshotBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"year","type":"uint16"},{"internalType":"uint8","name":"month","type":"uint8"},{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"monthlyAllocation","type":"uint256"}],"name":"previewMonthlyReward","outputs":[{"internalType":"uint256","name":"reward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"removeAuthorizedUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"year","type":"uint16"},{"internalType":"uint8","name":"month","type":"uint8"}],"name":"takeMonthlySnapshot","outputs":[{"internalType":"uint256","name":"snapshotBlock","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"totalSupplyAtBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"whitelistByIndex","outputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"mintType","type":"uint8"}],"stateMutability":"view","type":"function"}];


const multicallAbi = [
  {
    inputs: [
      {
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" },
        ],
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" },
        ],
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

const iplInterface = new ethers.Interface(iplAbi);
const multicallInterface = new ethers.Interface(multicallAbi);
const defaultWeb3Options = {
  keepAlive: true,
  timeout: 100000,
  headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
  withCredentials: false,
  agent: new Agent({ keepAlive: true }),
};
const mainProvider = new Web3HttpProvider(MAIN_RPC_URL, defaultWeb3Options);
const mweb3 = new Web3(mainProvider);
const bnbIplContract = new mweb3.eth.Contract(iplAbi, iplUrl);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRpcErrorCode(error) {
  return error?.code || error?.errno;
}

function isRetryableRpcError(error) {
  const code = getRpcErrorCode(error);
  const message = error?.message || "";

  return code === "EAI_AGAIN" || message.includes("EAI_AGAIN");
}

async function withRpcRetry(task, label, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt > maxRetries || !isRetryableRpcError(error)) {
        throw error;
      }

      const code = getRpcErrorCode(error) || "UNKNOWN";
      console.warn(`[opbnb rpc retry] ${label} attempt ${attempt}/${maxRetries} failed with ${code}`);
      await sleep(delayMs * attempt);
    }
  }
}

async function getWhitelistInfoViaMulticall(mweb3, bnbIplContract, indices) {
  const result = {};
  const chunkSize = IPL_HISTORY_MULTICALL_CHUNK_SIZE;

  for (let offset = 0; offset < indices.length; offset += chunkSize) {
    const chunk = indices.slice(offset, offset + chunkSize);
    const calls = chunk.map((index) => ({
      target: iplUrl,
      allowFailure: true,
      callData: iplInterface.encodeFunctionData("hasMintedByIndex", [BigInt(index)]),
    }));

    const payload = multicallInterface.encodeFunctionData("aggregate3", [calls]);
    const raw = await withRpcRetry(
      () =>
        mweb3.eth.call({
          to: MULTICALL3_ADDRESS,
          data: payload,
        }),
      "multicall aggregate3",
    );
    const [responses] = multicallInterface.decodeFunctionResult("aggregate3", raw);
    const fallbackIndices = [];

    responses.forEach((response, idx) => {
      const index = chunk[idx];
      if (!response.success) {
        fallbackIndices.push(index);
        return;
      }

      try {
        const decoded = iplInterface.decodeFunctionResult("hasMintedByIndex", response.returnData);
        result[index] = {
          account: decoded.account.toString(),
          amount: decoded.amount.toString(),
          mintType: decoded.mintType.toString(),
        };
      } catch (error) {
        fallbackIndices.push(index);
      }
    });

    if (fallbackIndices.length > 0) {
      await Promise.all(
        fallbackIndices.map(async (index) => {
          const row = await withRpcRetry(
            () => bnbIplContract.methods.whitelistByIndex(index).call(),
            `whitelistByIndex(${index})`,
          );
          result[index] = {
            account: row.account.toString(),
            amount: row.amount.toString(),
            mintType: row.mintType.toString(),
          };
        }),
      );
    }
  }

  return result;
}

router.post("/getIplBalance", async (req, res) => {
  try {
    console.log("Contract Address:", iplUrl);
    console.log("Network:", MAIN_RPC_URL);

    const address = req.body.address; //array of addresses

    const year = req.body.year;
    const month = req.body.month;
    const result = {};
    const BATCH_SIZE = 1000;

    for (let i = 0; i < address.length; i += BATCH_SIZE) {
      const batch = address.slice(i, i + BATCH_SIZE);

      console.log(`processing ${i} ~ ${i + batch.length}`);
      const batchResult = {};
      const promises = batch.map(address =>
        withRpcRetry(
          () =>
            bnbIplContract.methods
              .getMonthlySnapshotShare(year, month, address)
              .call(),
          `getMonthlySnapshotShare(${address})`,
        )
          .then(r => {
            batchResult[address] = {
              balance: r.balAt.toString(),
              total: r.totalAt.toString(),
              share: r.shareRay.toString()
            };
          })
      );

      await Promise.all(promises);

      Object.assign(result, batchResult);

      // RPC recovery
      await new Promise(res => setTimeout(res, 300));
    }
    
    if (result) {

      res.json(result);
    } else {
      res.status(500).json({ error: "No valid data returned from contract" });
    }
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ error: error.message });
    }
});


router.post("/getTestMint", async (req, res) => {

  const options = {
    keepAlive: true,
    timeout: 100000,
    headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
    withCredentials: false,
    agent: new Agent({ keepAlive: true }),
  };

  
  
  const mainProvider = new Web3HttpProvider(MAIN_RPC_URL, options);
  const mweb3 = new Web3(mainProvider);
  
  const account = mweb3.eth.accounts.privateKeyToAccount(
    process.env.MINTER_PRIVATE_KEY
  );
  mweb3.eth.accounts.wallet.add(account);
  mweb3.eth.defaultAccount = account.address;

  try {
    console.log("Contract Address:", iplUrl);
    console.log("Network:", MAIN_RPC_URL);
    
    const bnbIplContract = new mweb3.eth.Contract(iplAbi, iplUrl);
    
    const address = req.body.address;
    const result = {};

    for (const addr of address) {
       const r = await withRpcRetry(
        () =>
          bnbIplContract.methods.mint2(addr, 200000000000000000000).send({
            from: account.address,
            gas: 300000,
          }),
        `mint2(${addr})`,
      );

      result[addr] = {
        result: r.toString()
      };
    }
    
    if (result) {

      res.json(result);
    } else {
      res.status(500).json({ error: "No valid data returned from contract" });
    }
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ error: error.message });
    }
});

router.post("/getIplHistory", async (req, res) => {
  try {
    console.log("Contract Address:", iplUrl);
    console.log("Network:", MAIN_RPC_URL);

    const idx = req.body.firstIdx;
    const indices = Array.isArray(req.body.indices) ? req.body.indices : (idx !== undefined ? [idx] : []);
    const result = await getWhitelistInfoViaMulticall(mweb3, bnbIplContract, indices);
    
    
    if (result) {

      res.json(result);
    } else {
      res.status(500).json({ error: "No valid data returned from contract" });
    }
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ error: error.message });
    }
});


export default router;
