import Web3, { utils } from "web3";
import { Agent } from "http";
import Web3HttpProvider from "web3-providers-http";
import { Router } from "express";
var router = Router();

const OPTIMISM_RPC_URL = "https://opt-mainnet.g.alchemy.com/v2/-KAMI6ilHMNuwBx-L6rIT";

const SCAN_HANPRICE_URL = "https://scan.khans.io/trade/hanAveragePrice"

const MusikhanStakingABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_rewardToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_musikhan",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RecoveredERC20",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "RecoveredERC721",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_l2Ca",
        type: "address",
      },
    ],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getCanClaimedTokenList",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getStakedTokenList",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_l2Ca",
        type: "address",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getStaker",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "address",
            name: "l2Ca",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountStaked",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "claimedReward",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeOfLastUpdate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unclaimedRewards",
            type: "uint256",
          },
        ],
        internalType: "struct MusikhanStaking.Staker",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "getStakerAddressList",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_l2Ca",
        type: "address",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getStakerAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hanTokenPerLpToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenAmount",
        type: "uint256",
      },
    ],
    name: "recoverERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "recoverERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardsDuration",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newDuration",
        type: "uint256",
      },
    ],
    name: "setRewardsDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newQuota",
        type: "uint256",
      },
    ],
    name: "setTokenQuota",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_l2Ca",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "stakers",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "address",
        name: "l2Ca",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountStaked",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimedReward",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeOfLastUpdate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unclaimedRewards",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenQuota",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "totalReward",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_l2Ca",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

router.get("/getStakerAddressList", async (req, res) => {

  const options = {
    keepAlive: true,
    timeout: 100000,
    headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
    withCredentials: false,
    agent: new Agent({ keepAlive: true }),
  };

  const optProvider = new Web3HttpProvider(OPTIMISM_RPC_URL, options);
  const oweb3 = new Web3(optProvider);


  const contractAddress = '0x5AD7e2BF0204C066ac9C3DD7028cE30B41D12682';

  const contract = new oweb3.eth.Contract(MusikhanStakingABI, contractAddress);

  const musikhanContractAddress = '0x7aa21aba208eEDB68C26043Cd1E6660Bce050d43';

  const functionSelector = contract.methods.getStakerAddressList(musikhanContractAddress).encodeABI();


  return res.send(functionSelector);


});


router.get("/getStakerAmount", async (req, res) => {

  const options = {
    keepAlive: true,
    timeout: 100000,
    headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
    withCredentials: false,
    agent: new Agent({ keepAlive: true }),
  };

  const optProvider = new Web3HttpProvider(OPTIMISM_RPC_URL, options);
  const oweb3 = new Web3(optProvider);


  const contractAddress = '0x5AD7e2BF0204C066ac9C3DD7028cE30B41D12682';

  const contract = new oweb3.eth.Contract(MusikhanStakingABI, contractAddress);

  const musikhanContractAddress = '0x7aa21aba208eEDB68C26043Cd1E6660Bce050d43';
  const userAddress = '0x8f159B11d71B8E1bB00F192Ee63e094e447959Ca'; // Replace with the actual user address
                       
  const functionSelector = contract.methods.getStakerAmount(musikhanContractAddress, userAddress).encodeABI();


  return res.send(functionSelector);


});

router.get("/getStaker", async (req, res) => {

  const options = {
    keepAlive: true,
    timeout: 100000,
    headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
    withCredentials: false,
    agent: new Agent({ keepAlive: true }),
  };                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

  
  const optProvider = new Web3HttpProvider(OPTIMISM_RPC_URL, options);
  const oweb3 = new Web3(optProvider);
  const contractAddress = '0x5AD7e2BF0204C066ac9C3DD7028cE30B41D12682';
  const contract = new oweb3.eth.Contract(MusikhanStakingABI, contractAddress);

  //파라메터 받기
  let contract_address = req.query.contract_address;

  const stakingUserList = await contract.methods.getStakerAddressList(contract_address).call();
  let returnDataList = [];
  let admin2Amount = utils.fromWei(String("2000000000000000000000"), "ether");
  admin2Amount = Number(admin2Amount);
  const KADMIN2 = "0x3904bB307D06775c91d442E82566ffC5Fa6e8119";
      if (stakingUserList.length > 0) {
        let usersTotal = 0;
        for (let j = 0; j < stakingUserList.length; j++) {
          let returnData = {};
  
          let userStakingAmount = await contract.methods.getStakerAmount(contract_address, stakingUserList[j]).call();
          userStakingAmount = utils.fromWei(userStakingAmount, "ether");
          returnData.songContract = contract_address;
          returnData.userMetaId = stakingUserList[j];
          returnData.userStakingAmount = Number(userStakingAmount);
          returnDataList.push(returnData);
  
          usersTotal = Number(usersTotal) + Number(userStakingAmount);
          if (j == stakingUserList.length - 1) {
            let returnDataAdmin = {};
            admin2Amount = Number(admin2Amount) - Number(usersTotal);
            returnDataAdmin.songContract = contract_address;
            returnDataAdmin.userMetaId = KADMIN2;
            returnDataAdmin.userStakingAmount = Number(admin2Amount);
  
            returnDataList.push(returnDataAdmin);
          }
        }
      } else {
        //데이터가 없으니 admin2 계정에 2000개로 입력해라
        let returnData = {};
  
        returnData.songIdx = 1;
        returnData.songContract = contract_address;
        returnData.userMetaId = KADMIN2;
        returnData.userStakingAmount = Number(admin2Amount);
  
        returnDataList.push(returnData);
      }

      res.send(returnDataList);


});


export default router;