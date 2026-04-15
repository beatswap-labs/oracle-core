import Web3 from "web3";
import {ethers} from "ethers";
import { Agent } from "http";
import Web3HttpProvider from "web3-providers-http";
import { Router } from "express";
import * as dotenv from 'dotenv';
import { userDBService } from '../workers/db.factory';
dotenv.config();
var router = Router();
let db;

//BNB mainnet
const MAIN_RPC_URL = process.env.BNB_RPC_URL;

//SEPOLIA
// const MAIN_RPC_URL = process.env.SEPO_RPC_URL;


//IPL Contract And ABI
const vestingUrl = "0x46ea706c9462A78D0921eE822cc7c48de649b922"; // bnb
// const vestingUrl = "0x3D8bfb1A45c2e19867F4b268CB9b7fF453CF4a4A"; // sepolia
const vestingAbi = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address","name":"btxAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AlreadyJoinedRound","type":"error"},{"inputs":[],"name":"EnforcedPause","type":"error"},{"inputs":[],"name":"ExpectedPause","type":"error"},{"inputs":[],"name":"InvalidBatchLimit","type":"error"},{"inputs":[],"name":"InvalidPoolId","type":"error"},{"inputs":[],"name":"InvalidProof","type":"error"},{"inputs":[],"name":"InvalidRoundId","type":"error"},{"inputs":[],"name":"IsStakingPool","type":"error"},{"inputs":[],"name":"MaxParticipantsReached","type":"error"},{"inputs":[],"name":"NotStakingPool","type":"error"},{"inputs":[],"name":"NothingToClaim","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[],"name":"RootAlreadyUsed","type":"error"},{"inputs":[],"name":"RoundPaused","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"inputs":[],"name":"ZeroAddress","type":"error"},{"inputs":[],"name":"ZeroAmount","type":"error"},{"inputs":[],"name":"ZeroDuration","type":"error"},{"inputs":[],"name":"ZeroMultiplier","type":"error"},{"inputs":[],"name":"ZeroRoot","type":"error"},{"inputs":[],"name":"ZeroTotalUsers","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AdminTokenRecovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newLimit","type":"uint256"}],"name":"ClaimBatchLimitUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"bool","name":"isStaking","type":"bool"}],"name":"PoolCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"root","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalUsers","type":"uint256"}],"name":"RoundRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isPaused","type":"bool"}],"name":"RoundStatusChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"newRoundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newDuration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newMultiplier","type":"uint256"}],"name":"StakingRoundUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"baseAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"}],"name":"VestingStarted","type":"event"},{"inputs":[],"name":"BTX","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DENOMINATOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimBatchLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"claimSinglePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimVested","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isStaking","type":"bool"},{"internalType":"uint256","name":"initialDuration","type":"uint256"},{"internalType":"uint256","name":"initialMultiplier","type":"uint256"}],"name":"createPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositFund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllPoolsInfo","outputs":[{"components":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isStaking","type":"bool"},{"internalType":"uint256","name":"currentRoundId","type":"uint256"},{"internalType":"uint256","name":"totalFunded","type":"uint256"},{"internalType":"uint256","name":"currentDuration","type":"uint256"},{"internalType":"uint256","name":"currentMultiplier","type":"uint256"},{"internalType":"uint256","name":"roundTotalUsers","type":"uint256"},{"internalType":"uint256","name":"roundJoinedUsers","type":"uint256"},{"internalType":"uint256","name":"poolTotalBase","type":"uint256"},{"internalType":"uint256","name":"poolTotalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"poolTotalClaimed","type":"uint256"},{"internalType":"uint256","name":"poolOutstanding","type":"uint256"}],"internalType":"struct VestingSettlementVault.PoolViewInfo[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getClaimableAmount","outputs":[{"internalType":"uint256","name":"totalClaimable","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"components":[{"internalType":"uint256","name":"totalVestedBase","type":"uint256"},{"internalType":"uint256","name":"totalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"totalClaimed","type":"uint256"},{"internalType":"uint256","name":"totalOutstanding","type":"uint256"},{"internalType":"uint256","name":"vaultBalance","type":"uint256"},{"internalType":"uint256","name":"solvencyGap","type":"uint256"}],"internalType":"struct VestingSettlementVault.GlobalStatsView","name":"viewData","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"offset","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"getUserDetailedDashboard","outputs":[{"components":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"string","name":"poolName","type":"string"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"uint256","name":"totalVestingAmount","type":"uint256"},{"internalType":"uint256","name":"releasedAmount","type":"uint256"},{"internalType":"uint256","name":"claimableNow","type":"uint256"},{"internalType":"uint256","name":"remaining","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"bool","name":"isCompleted","type":"bool"}],"internalType":"struct VestingSettlementVault.DashboardItem[]","name":"items","type":"tuple[]"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"poolId","type":"uint256"}],"name":"getUserPoolRoundStatus","outputs":[{"internalType":"uint256","name":"currentRoundId","type":"uint256"},{"internalType":"bool[]","name":"isJoined","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"poolId","type":"uint256"}],"name":"getUserVestingCountByPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"globalStats","outputs":[{"internalType":"uint256","name":"totalVestedBase","type":"uint256"},{"internalType":"uint256","name":"totalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"totalClaimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"hasUserJoinedRound","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pools","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isStaking","type":"bool"},{"internalType":"uint256","name":"currentRoundId","type":"uint256"},{"internalType":"uint256","name":"totalFunded","type":"uint256"},{"internalType":"uint256","name":"currentDuration","type":"uint256"},{"internalType":"uint256","name":"currentMultiplier","type":"uint256"},{"internalType":"uint256","name":"poolTotalVestedBase","type":"uint256"},{"internalType":"uint256","name":"poolTotalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"poolTotalClaimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"recoverERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"uint256","name":"totalUsers","type":"uint256"}],"name":"registerRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"rounds","outputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"bool","name":"isPaused","type":"bool"},{"internalType":"uint256","name":"totalEligibleUsers","type":"uint256"},{"internalType":"uint256","name":"joinedUsers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"newLimit","type":"uint256"}],"name":"setClaimBatchLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"bool","name":"paused","type":"bool"}],"name":"setRoundPaused","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"startVesting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"newDuration","type":"uint256"},{"internalType":"uint256","name":"newMultiplier","type":"uint256"}],"name":"updateStakingRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"usedRoots","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userActiveVestingIndices","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userClaimCursors","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userVestingHistory","outputs":[{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"releasedAmount","type":"uint256"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"bool","name":"isCompleted","type":"bool"}],"stateMutability":"view","type":"function"}];


// const vestingAbi = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address","name":"btxAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AlreadyJoinedRound","type":"error"},{"inputs":[],"name":"EnforcedPause","type":"error"},{"inputs":[],"name":"ExpectedPause","type":"error"},{"inputs":[],"name":"InvalidBatchLimit","type":"error"},{"inputs":[],"name":"InvalidPoolId","type":"error"},{"inputs":[],"name":"InvalidProof","type":"error"},{"inputs":[],"name":"InvalidRoundId","type":"error"},{"inputs":[],"name":"IsStakingPool","type":"error"},{"inputs":[],"name":"MaxParticipantsReached","type":"error"},{"inputs":[],"name":"NotStakingPool","type":"error"},{"inputs":[],"name":"NothingToClaim","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[],"name":"RootAlreadyUsed","type":"error"},{"inputs":[],"name":"RoundPaused","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"inputs":[],"name":"ZeroAddress","type":"error"},{"inputs":[],"name":"ZeroAmount","type":"error"},{"inputs":[],"name":"ZeroDuration","type":"error"},{"inputs":[],"name":"ZeroMultiplier","type":"error"},{"inputs":[],"name":"ZeroRoot","type":"error"},{"inputs":[],"name":"ZeroTotalUsers","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AdminTokenRecovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newLimit","type":"uint256"}],"name":"ClaimBatchLimitUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"bool","name":"isStaking","type":"bool"}],"name":"PoolCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"root","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalUsers","type":"uint256"}],"name":"RoundRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isPaused","type":"bool"}],"name":"RoundStatusChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"newRoundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newDuration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newMultiplier","type":"uint256"}],"name":"StakingRoundUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"poolId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"baseAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"multiplier","type":"uint256"}],"name":"VestingStarted","type":"event"},{"inputs":[],"name":"BTX","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DENOMINATOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimBatchLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"claimSinglePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimVested","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isStaking","type":"bool"},{"internalType":"uint256","name":"initialDuration","type":"uint256"},{"internalType":"uint256","name":"initialMultiplier","type":"uint256"}],"name":"createPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositFund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllPoolsInfo","outputs":[{"components":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isStaking","type":"bool"},{"internalType":"uint256","name":"currentRoundId","type":"uint256"},{"internalType":"uint256","name":"totalFunded","type":"uint256"},{"internalType":"uint256","name":"currentDuration","type":"uint256"},{"internalType":"uint256","name":"currentMultiplier","type":"uint256"},{"internalType":"uint256","name":"roundTotalUsers","type":"uint256"},{"internalType":"uint256","name":"roundJoinedUsers","type":"uint256"},{"internalType":"uint256","name":"poolTotalBase","type":"uint256"},{"internalType":"uint256","name":"poolTotalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"poolTotalClaimed","type":"uint256"},{"internalType":"uint256","name":"poolOutstanding","type":"uint256"}],"internalType":"struct VestingSettlementVault.PoolViewInfo[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getClaimableAmount","outputs":[{"internalType":"uint256","name":"totalClaimable","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"components":[{"internalType":"uint256","name":"totalVestedBase","type":"uint256"},{"internalType":"uint256","name":"totalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"totalClaimed","type":"uint256"},{"internalType":"uint256","name":"totalOutstanding","type":"uint256"},{"internalType":"uint256","name":"vaultBalance","type":"uint256"},{"internalType":"uint256","name":"solvencyGap","type":"uint256"}],"internalType":"struct VestingSettlementVault.GlobalStatsView","name":"viewData","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"offset","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"getUserDetailedDashboard","outputs":[{"components":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"string","name":"poolName","type":"string"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"uint256","name":"totalVestingAmount","type":"uint256"},{"internalType":"uint256","name":"releasedAmount","type":"uint256"},{"internalType":"uint256","name":"claimableNow","type":"uint256"},{"internalType":"uint256","name":"remaining","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"bool","name":"isCompleted","type":"bool"}],"internalType":"struct VestingSettlementVault.DashboardItem[]","name":"items","type":"tuple[]"},{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"poolId","type":"uint256"}],"name":"getUserPoolRoundStatus","outputs":[{"internalType":"uint256","name":"currentRoundId","type":"uint256"},{"internalType":"bool[]","name":"isJoined","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"poolId","type":"uint256"}],"name":"getUserVestingCountByPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"globalStats","outputs":[{"internalType":"uint256","name":"totalVestedBase","type":"uint256"},{"internalType":"uint256","name":"totalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"totalClaimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"hasUserJoinedRound","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pools","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"bool","name":"isStaking","type":"bool"},{"internalType":"uint256","name":"currentRoundId","type":"uint256"},{"internalType":"uint256","name":"totalFunded","type":"uint256"},{"internalType":"uint256","name":"currentDuration","type":"uint256"},{"internalType":"uint256","name":"currentMultiplier","type":"uint256"},{"internalType":"uint256","name":"poolTotalVestedBase","type":"uint256"},{"internalType":"uint256","name":"poolTotalCommittedAmount","type":"uint256"},{"internalType":"uint256","name":"poolTotalClaimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"recoverERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"uint256","name":"totalUsers","type":"uint256"}],"name":"registerRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"rounds","outputs":[{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"bool","name":"isPaused","type":"bool"},{"internalType":"uint256","name":"totalEligibleUsers","type":"uint256"},{"internalType":"uint256","name":"joinedUsers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"newLimit","type":"uint256"}],"name":"setClaimBatchLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"bool","name":"paused","type":"bool"}],"name":"setRoundPaused","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"startVesting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"poolId","type":"uint256"},{"internalType":"uint256","name":"newDuration","type":"uint256"},{"internalType":"uint256","name":"newMultiplier","type":"uint256"}],"name":"updateStakingRound","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"usedRoots","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userActiveVestingIndices","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userClaimCursors","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userVestingHistory","outputs":[{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"releasedAmount","type":"uint256"},{"internalType":"uint256","name":"roundId","type":"uint256"},{"internalType":"uint256","name":"multiplier","type":"uint256"},{"internalType":"bool","name":"isCompleted","type":"bool"}],"stateMutability":"view","type":"function"}];

// provider
let provider;

// contract
let vestingContract;
let lastBlockTime = Date.now();
let healthInterval;

export const startVestingListener = async () => {
  db = await userDBService();
  connectionHandler();
};

async function syncPastEvents() {
    provider = new ethers.JsonRpcProvider(MAIN_RPC_URL);
    vestingContract = new ethers.Contract(vestingUrl,vestingAbi,provider);

    try {
    const lastResult = await db.vestingHistoryRepo
                              .createQueryBuilder('vh')
                              .orderBy('vh.block_number', 'DESC')
                              .getOne();
    const lastBlock = lastResult?.block_number ?? 70000000;
    const currentBlock = await provider.getBlockNumber();
    const step = 10000;
    console.log(`Syncing vesting events from block ${Number(lastBlock) + 1} to ${currentBlock}`);
    for (let start = Number(lastBlock) + 1; start <= currentBlock; start += step) {
      console.log(`Syncing vesting events from block ${start} to ${Math.min(start + step - 1, currentBlock)}`);
      const end = Math.min(start + step - 1, currentBlock);
        // VestingStarted
        const vestingStartedEvents = await vestingContract.queryFilter(
          vestingContract.filters.VestingStarted(),
          start,
          end
      );  

      for (const log of vestingStartedEvents) {
        const parsed = vestingContract.interface.parseLog(log);

        const [user, poolId, roundId, baseAmount, duration, multiplier] = parsed.args;

        console.log("[Past VestingStarted]", {
          user,
          poolId: poolId.toString(),
          roundId: roundId.toString(),
          baseAmount: baseAmount.toString(),
          duration: duration.toString(),
          multiplier: multiplier.toString(),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          logIndex: log.index,
        });

      await db.vestingHistoryRepo.save({
                  address: user,
                  event_type: `VestingStarted`,
                  pool_id: poolId.toString(),
                  round_id: roundId.toString(),
                  amount: baseAmount.toString(),
                  block_number: log.blockNumber
              });
      if(poolId.toString() == '4') {
        await db.vestingWhitelistRepo.update(
          { address: user, pool_id: poolId.toString(), round_id: roundId.toString() },              
          { status: 'success' }
        );
      } else {
        await db.vestingClaimsRepo.update(
          { address: user, pool_id: poolId.toString(), round_id: roundId.toString() },
          { status: 'success' }
        );
      }
    }

    // Staked
    const stakedEvents = await vestingContract.queryFilter(
      vestingContract.filters.Staked(),
      start,
      end
    );

    for (const log of stakedEvents) {
      const parsed = vestingContract.interface.parseLog(log);
      const [user, poolId, roundId, amount, duration, multiplier] = parsed.args;

      console.log("[Past Staked]", {
        user,
        poolId: poolId.toString(),
        roundId: roundId.toString(),
        amount: amount.toString(),
        duration: duration.toString(),
        multiplier: multiplier.toString(),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        logIndex: log.index,
      });
      await db.vestingHistoryRepo.save({
        address: user,
        event_type: `Staked`,
        pool_id: poolId.toString(),
        round_id: roundId.toString(),
        amount: amount.toString(),
        block_number: log.blockNumber
      });
    }

    // RewardClaimed
    const rewardClaimedEvents = await vestingContract.queryFilter(
      vestingContract.filters.RewardClaimed(),
      start,
      end
    );

    for (const log of rewardClaimedEvents) {
      const parsed = vestingContract.interface.parseLog(log);
      const [user, totalAmount] = parsed.args;

      console.log("[Past RewardClaimed]", {
        user,
        totalAmount: totalAmount.toString(),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        logIndex: log.index,
      });
      await db.vestingHistoryRepo.save({
                  address: user,
                  event_type: `RewardClaimed`,
                  pool_id: 0,
                  round_id: 0,
                  amount: totalAmount.toString(),
                  block_number: log.blockNumber
              });
    }
  }
  } catch (err) {
    console.error("Error syncing past vesting events", err);
  } 
}

function connectionHandler() {
  console.log("Vesting contract WebSocket connected");
  syncPastEvents();


    // provider
    
    // contract
    console.log("JsonRpcProvider connected");
    provider = new ethers.JsonRpcProvider(MAIN_RPC_URL);
    vestingContract = new ethers.Contract(vestingUrl,vestingAbi,provider);
    vestingContract.on(
      "VestingStarted",
      async (user, poolId, roundId, baseAmount, duration, multiplier, event) => {
      lastBlockTime = Date.now();
      try {
        console.log("[VestingStarted Event]", {
          user,
          poolId: poolId.toString(),
          roundId: roundId.toString(),
          baseAmount: baseAmount.toString(),
          duration: duration.toString(),
          multiplier: multiplier.toString(),
          txHash: event?.log?.transactionHash ?? event?.transactionHash,
          blockNumber: event?.log?.blockNumber ?? event?.blockNumber,
        });
        await db.vestingHistoryRepo.save({
                  address: user,
                  event_type: `VestingStarted`,
                  pool_id: poolId.toString(),
                  round_id: roundId.toString(),
                  amount: baseAmount.toString(),
                  block_number: event?.log?.blockNumber
              });
        if(poolId.toString() == '4') {
          await db.vestingWhitelistRepo.update(
            { address: user, pool_id: poolId.toString(), round_id: roundId.toString() },              
            { status: 'success' }
          );
        } else {
          await db.vestingClaimsRepo.update(
            { address: user, pool_id: poolId.toString(), round_id: roundId.toString() },
            { status: 'success' }
          );
        }

        } catch (err) {
          console.error("VestingStarted event error", err);
        } 
      }
    );

    vestingContract.on(
      "Staked",
      async (user, poolId, roundId, amount, duration, multiplier, event) => {
      lastBlockTime = Date.now();
      try {
        console.log("[Staked Event]", {
          user,
          poolId: poolId.toString(),
          roundId: roundId.toString(),
          amount: amount.toString(),
          duration: duration.toString(),
          multiplier: multiplier.toString(),
          txHash: event?.log?.transactionHash ?? event?.transactionHash,
          blockNumber: event?.log?.blockNumber ?? event?.blockNumber,
        });
        await db.vestingHistoryRepo.save({
                  address: user,
                  event_type: `Staked`,
                  pool_id: poolId.toString(),
                  round_id: roundId.toString(),
                  amount: amount.toString(),
                  block_number: event?.log?.blockNumber
              });

        } catch (err) {
          console.error("Staked event error", err);
        }
      }
    );

    vestingContract.on(
      "RewardClaimed",
      async (user, totalAmount, event) => {
      lastBlockTime = Date.now();
        try {
          console.log("[RewardClaimed Event]", {
            user,
            totalAmount: totalAmount.toString(),
            txHash: event?.log?.transactionHash ?? event?.transactionHash,
            blockNumber: event?.log?.blockNumber ?? event?.blockNumber,
          });
          await db.vestingHistoryRepo.save({
                  address: user,
                  event_type: `RewardClaimed`,
                  pool_id: 0,
                  round_id: 0,
                  amount: totalAmount.toString(),
                  block_number: event?.log?.blockNumber
              });

        } catch (err) {
          console.error("RewardClaimed event error", err);
        }
      }
    );

    startHealthCheck();
  };

function startHealthCheck() {
  clearInterval(healthInterval);
  healthInterval = setInterval(() => {
    const now = Date.now();
    const diff = now - lastBlockTime;

    // 90 seconds without block event
    if (diff > 90000) {
      console.log("No block event for 90s. Reconnecting...");
      reconnect();
    }
  }, 30000);
}

function reconnect() {
  console.log("Reconnecting to Vesting contract WebSocket...");
  cleanup();
  setTimeout(() => {
    connectionHandler();
  }, 3000);
}

function cleanup() {
  vestingContract?.removeAllListeners();
  provider?.removeAllListeners();
  provider?._websocket?.terminate?.();
}


router.post("/getUserDashboard", async (req, res) => {

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
    console.log("Contract Address:", vestingUrl);
    console.log("Network:", MAIN_RPC_URL);
    
    const VestingContract = new mweb3.eth.Contract(vestingAbi, vestingUrl);
    
    const address = req.body.address;

    
    const result = await VestingContract.methods.getUserDetailedDashboard(address, 0, 999).call();
    
    const jsonResult = result.items.map((item) => ({
      poolId: item.poolId.toString(),
      poolName: item.poolName,
      roundId: item.roundId.toString(),
      baseAmount: item.baseAmount.toString(),
      claimableNow: item.claimableNow.toString(),
      isCompleted: item.isCompleted,
    }));
    
    if (result) {

      res.json(jsonResult);
    } else {
      res.status(500).json({ error: "No valid data returned from contract" });
    }
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ error: error.message });
    }
});

router.post("/getClaimableAmount", async (req, res) => {

  const options = {
    keepAlive: true,
    timeout: 100000,
    headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
    withCredentials: false,
    agent: new Agent({ keepAlive: true }),
  };


  const mainProvider = new Web3HttpProvider(MAIN_RPC_URL, options);
  const mweb3 = new Web3(mainProvider);

  try {
    console.log("Contract Address:", vestingUrl);
    console.log("Network:", MAIN_RPC_URL);
    const vestingContract = new mweb3.eth.Contract(vestingAbi, vestingUrl);

    const address = req.body.address;

    const result = await vestingContract.methods.getClaimableAmount(address).call();
    
    if (result !== null && result !== undefined) {

      res.json({ claimable: ethers.formatEther(result) });
    } else {
      res.status(500).json({ error: "No valid data returned from contract" });
    }
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ error: error.message });
    }
});


export default router;