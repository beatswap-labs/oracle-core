import { parentPort } from 'worker_threads';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createCanisterService } from "./canister.factory";
import { Logger } from '@nestjs/common';
import { ethers, getAddress, id } from 'ethers';
import * as moment from 'moment';
import * as https from 'https';
import { exec } from "child_process";
import { TelegramService } from '../telegram/telegram.service';
import { userDBService } from './db.factory';
import * as httpMocks from 'node-mocks-http';
import { EventEmitter } from 'stream';
import { In } from "typeorm";

const configService = new ConfigService();
const telegramService = new TelegramService();
const web3Router2 = require('../web3/bnb.js').default;
const web3Router3 = require('../web3/vesting.js').default;
const web3Router4 = require('../web3/btx.js').default;
let canister: any;
let db: any;
const logger = new Logger('UserWorker');

(async () => {
    canister = await createCanisterService();
    logger.log("Worker: canister service ready");
    db = await userDBService();
    logger.log("Worker: db service ready");
})();

parentPort?.on('message', async (userData) => {
  try {
      const { id, partnerIdx, data, address, year, month, type, detail, owner, spender, amount } = userData;
        if(data) {
            const result = await getAddressInfo(data);
            parentPort?.postMessage(result);
        } else if(type === 'balance') {
            const result = await getSnapshotBalance(year, month);
            parentPort?.postMessage(result);
        } else if(type === 'updateAddress') {
            const result = await updateAddress(id, address);
            parentPort?.postMessage(result);
        } else if(type === 'evmAddressBinding') {
            const result = await evmAddressBinding(id, address);
            parentPort?.postMessage(result);
        } else if(type === 'evmAddressCompare') {
            const result = await evmAddressCompare(id, address);
            parentPort?.postMessage(result);
        } else if(type === 'updateAddressBatch') {
            const result = await updateAddressBatch();
            parentPort?.postMessage(result);
        } else if (type === 'snapshot') {
            const result = await getSnapshot(address);
            parentPort?.postMessage(result);
        } else if (type === 'userDashboard') {
            const result = await getUserDashboard(address);
            parentPort?.postMessage(result);
        } else if (type === 'vestingProof') {
            const result = await getVestingProof(address);
            parentPort?.postMessage(result);
        } else if (type === 'whiteProof') {
            const result = await getVestingWhiteProof(address);
            parentPort?.postMessage(result);
        } else if (type === 'history') {
            const result = await getVestingHistory(address, detail);
            parentPort?.postMessage(result);
        } else if (type === 'allowance') {
            const result = await getBtxAllowance(owner, spender);
            parentPort?.postMessage(result);
        } else if (type === 'claimableAmount') {
            const result = await getClaimableAmount(address);
            parentPort?.postMessage(result);
        } else if (type === 'claimedTotal') {
            const result = await getClaimedTotal(address);
            parentPort?.postMessage(result);
        } else if (type === 'insertTemp') {
            const result = await insertTemp(id, amount);
            parentPort?.postMessage(result);
        } else if (type === 'whiteTemp') {
            const result = await getVestingWhiteTemp(address);
            parentPort?.postMessage(result);
        } else if (type === 'getTelegramAddress') {
            const result = await getTelegramAddress(id, address);
            parentPort?.postMessage(result);
        } else if (type === 'getPrincipalById') {                                 
            const result = await getPrincipalById(partnerIdx, id);
            parentPort?.postMessage(result);
        }

    } catch (error) {
      parentPort?.postMessage({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  async function getAddressInfo(data: any) {
    try {
        for (let i = 0; i < data.rankList.top_100.length; i++) {
            const item = data.rankList.top_100[i];
            const whitelistInfo = await db.whiteListRepo
                                        .createQueryBuilder('whitelistinfo')
                                        .where('whitelistinfo.address = :address', { address: item.address })
                                        .getOne();
            
            const userInfo = await db.userBackupRepo
                                        .createQueryBuilder('userbackup')
                                        .where('userbackup.principal = :principal', { principal: whitelistInfo.principal })
                                        .getOne();


            logger.log(`userInfo ::: ${i} ${JSON.stringify(userInfo.evmAddress)}`);

            const type =  await isEvmAddress(userInfo.evmAddress) ? 'evm' : await isNumericOnly(userInfo.evmAddress) ? 'telegram' : 'paykhan';

            if(await isNumericOnly(userInfo.evmAddress)) {
                const telegramname = await telegramUserIfo(userInfo.evmAddress);
                logger.log(`telegram name ::: ${telegramname.first_name} ${telegramname.last_name}`);
                userInfo.evmAddress = `${telegramname.first_name} ${telegramname.last_name}`;
            }

            data.rankList.top_100[i] = {
                ...item,
                address: userInfo.evmAddress,
                type,
            };


        }
    } catch (e) {
        logger.error('Error in getAddressInfo:', e);
        return { success: false, error: 'Failed to get address info' };
    }

     logger.log(`getAddressInfo data ::: ${JSON.stringify(data.rankList.top_100)}`);

    return { success: true, data };
}

async function getTelegramAddress(id: string, address: string) {
    let telAddress: any[] = [];
    let result: any;

    id = telegramService.decrypt(id);

    console.log(id);

    try {
        const TEL_ADDRESS_URL = configService.get<string>('TEL_ADDRESS_URL');
        const res = await axios.get(`${TEL_ADDRESS_URL}${id}`);

        telAddress = res.data.result;
        
        console.log(`telegram evm address ::: ${JSON.stringify(telAddress)}`);

        const filtered = telAddress.filter((v): v is string => v !== null);

        const isMatched = filtered.includes(address);
        const userInfo = await db.userBackupRepo
                                        .createQueryBuilder('userbackup')
                                        .where('userbackup.id = :id', { id })
                                        .andWhere('userbackup.id != userbackup.evmAddress')
                                        .getOne();

        console.log(`user evm address ::: ${userInfo}`);

        if(filtered.length === 0) {
            result = {
                status: false
            }
            return { success: true, result };
        } else {
            result = {
                status: isMatched,
                addressList: filtered,
                registeredAddress: ''
            }
            
            if(userInfo) {
                result.registeredAddress = userInfo.evmAddress;
            }

            return { success: true, result };
        }
    } catch (e) {
        logger.error('Error in getTelegramAddress:', e);
        return { success: false, error: 'Failed to get address info' };
    }
}

async function updateAddress(id: string, address: string) {

    try {
        const result = await db.userBackupRepo.update(
                            { partnerIdx: 1, id: id },
                            { evmAddress: address }
                        );
        return { success: true,  result };
    } catch (e) {
        logger.error('Error in getAddressInfo:', e);
        return { success: false, error: 'Failed to get address info' };
    }
}

async function evmAddressBinding(id: string, address: string) {
    id = telegramService.decrypt(id);

    try {
        const result = await db.userBackupRepo.update(
                            { partnerIdx: In([2, 5]), id: id },
                            { evmAddress: address }
                        );
        return { success: true,  result };
    } catch (e) {
        logger.error('Error in evmAddressBinding:', e);
        return { success: false, error: 'Failed to get address info' };
    }
}


async function evmAddressCompare(id: string, address: string) {
    id = telegramService.decrypt(id);

    try {
        const result = await db.userBackupRepo.createQueryBuilder('userbackup')
                            .where('userbackup.id = :id', { id })
                            .andWhere('userbackup.evmAddress = :address', { address })
                            .getOne();
        return { success: true,  result: !!result };
    } catch (e) {
        logger.error('Error in evmAddressBinding:', e);
        return { success: false, error: 'Failed to get address info' };
    }
}

async function updateAddressBatch() {

    try {
        const batchSize = 1000;

        const idList = await db.userBackupRepo
                            .createQueryBuilder('userbackup')
                            .where('userbackup.partnerIdx = :partnerIdx', { partnerIdx: 1 })
                            .getMany();
        for (let i = 0; i < idList.length; i += batchSize) {
            const batch = idList.slice(i, i + batchSize);
            console.log(`Processing batch ${i / batchSize + 1}`);
            for (const item of batch) {
                const address = await axios.get(`https://paykhan.org/nftAudio/getEvmAddressById?id=${item.id}`);
                if (!address.data || address.data === '' || address.data === null || address.data === 'null') {
                    logger.log(`updateAddressBatch skip address ::: ${item.id} ${address.data}`);
                    address.data = '0x0000000000000000000000000000000000000000';
                } else {
                    logger.log(`updateAddressBatch address ::: ${item.id} ${address.data}`);
                }
                await db.userBackupRepo.update(
                    { partnerIdx: 1, id: item.id },
                    { evmAddress: address.data }
                );
            }
        }

        return { success: true };
    } catch (e) {
        logger.error('Error in getAddressInfo:', e);
        return { success: false, error: 'Failed to get address info' };
    }
}

async function telegramUserIfo (telegram_id: string) {
    const BOT_TOKEN = configService.get<string>('TELEGRAM_BOT_TOKEN');
    try {
        const agent = new https.Agent({
        family: 4,
        });

        const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
            params: { chat_id: telegram_id },
            httpsAgent: agent, // agent add option
        });

        if (!response.data || !response.data.ok) {
        throw new Error("telegram api response not ok");
        }

        return response.data.result;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`call telegram api failed : ${error.response?.status} ${error.response?.statusText}`);
        }
        throw error;
    }
}

async function isEvmAddress (value: string): Promise<boolean> {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}

async function isNumericOnly(value: string): Promise<boolean> {
    return /^[0-9]+$/.test(value);
};

async function getUserDashboard(address: string): Promise<any> {

        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/getUserDashboard',
            body: { address , offset: 0, limit: 1 },
        });
        
          const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
          await new Promise((resolve, reject) => {
              res.on('end', resolve);
              res.on('finish', resolve);
              res.on('error', reject);
  
              web3Router3.handle(req, res, (err:any) => {
                  if(err) return reject(err);
  
                  setImmediate(() => {
                  if(!res.writableEnded) {
                      reject(new Error('Router not Response'));
                  }
                  })
              })
          });
          const data = res._getData();
        
    
        return data;
    }


async function getVestingProof(address: string): Promise<any> {


        if (isVestingBlockedPeriod()) {
            return { success: true, data: 'coming soon' };
        }

        const snapMonth = getTargetYearMonth();
        console.log(`snapshot month ::: ${snapMonth}`);
        try {
            const monthlySnapshotData = await db.snapshotInfoRepo
                                                    .createQueryBuilder('monthlySnap')
                                                    .where('monthlySnap.month = :month', {month: snapMonth})
                                                    .getOne();
            console.log(`monthlySnapshotData round_id ::: ${monthlySnapshotData.round_id}`);

            const vestingData = await db.vestingClaimsRepo
                                        .createQueryBuilder('vc')
                                        .where('vc.address = :address', { address: address })
                                        .andWhere('vc.status = :status', { status: 'pending' })
                                        .andWhere('vc.round_id = :round_id', { round_id: monthlySnapshotData.round_id })
                                        .getOne();

            logger.log(`${JSON.stringify(vestingData)}`);
            return vestingData;
        } catch (e) {
            logger.error('Error in getVestingProof:', e);
            return { success: true, data: 'coming soon' };
        }
    }

async function getVestingWhiteProof(address: string): Promise<any> {

        const vestingData = await db.vestingWhitelistRepo
                                        .createQueryBuilder('vw')
                                        .where('vw.address = :address', { address: address })
                                        .andWhere('vw.status = :status', { status: 'pending' })
                                        .orderBy('vw.round_id', 'ASC')
                                        .getOne();

        logger.log(`${JSON.stringify(vestingData)}`);

    
        return vestingData;
    }


async function getVestingWhiteTemp(address: string): Promise<any> {

        const vestingData = await db.vestingWhitelistTempRepo
                                        .createQueryBuilder('vwr')
                                        .where('vwr.address = :address', { address: address })
                                        .getOne();

        logger.log(`${JSON.stringify(vestingData)}`);

    
        return vestingData;
    }

async function getClaimedTotal(address: string): Promise<any> {

        const result = await db.vestingHistoryRepo
                                .createQueryBuilder('vh')
                                .select('SUM(vh.amount)', 'total_claimed')
                                .where('vh.address = :address', { address })
                                .andWhere('vh.pool_id = :poolId', { poolId: 0 })
                                .andWhere('vh.round_id = :roundId', { roundId: 0 })
                                .getRawOne();

        logger.log(`${JSON.stringify(result)}`);

        const response = {
            total_claimed: ethers.formatEther(result.total_claimed),
        };

    
        return { success: true, data: response };
    }

async function insertTemp(id: string, amount: string): Promise<any> {

        const address = await axios.get(`https://paykhan.org/nftAudio/getEvmAddressById?id=${id}`);

        const etherWei = ethers.parseEther(amount);

        const result = await db.vestingWhitelistTempRepo.save({
                                    id: id,
                                    address: address.data,
                                    amount: etherWei,
                                });

        logger.log(`${result}`);
    
        return { success: true, data: result };
    }

async function getVestingHistory(address: string, detail: string): Promise<any> {
    let vestingHistoryData: any;
    const rewardTypeMap: Record<string, number> = {
        "IPL Snapshot Reward": 3,
        "IP Rights Acquisition": 1,
        "Retroactive IP Rights": 2,
        "Whitelisted": 4,
        "Stake": 0,
        "Claim": 0,
    };
        if(detail === 'Claim') {
            vestingHistoryData = await db.vestingHistoryRepo
                                        .createQueryBuilder('vh')
                                        .where('vh.address = :address', { address: address })
                                        .andWhere('vh.pool_id = :poolId', { poolId: rewardTypeMap[detail] })
                                        .andWhere('vh.round_id = :roundId', { roundId: 0 })
                                        .getMany();
        } else {
            vestingHistoryData = await db.vestingHistoryRepo
                                        .createQueryBuilder('vh')
                                        .where('vh.address = :address', { address: address })
                                        .andWhere('vh.pool_id = :poolId', { poolId: rewardTypeMap[detail] })
                                        .andWhere('vh.round_id != :roundId', { roundId: 0 })
                                        .getMany();
        }

        const responseList = vestingHistoryData.map((raw) => ({
            idx: raw.idx,
            event_type: raw.event_type,
            pool_id: raw.pool_id,
            round_id: raw.round_id,
            address: raw.address,
            amount: ethers.formatEther(raw.amount),
            block_number: raw.block_number,
            createdAt: formatDate(raw.created_at),
        }));

        logger.log(`${JSON.stringify(vestingHistoryData)}`);

    return responseList;
}

async function getBtxAllowance(owner: string, spender: string): Promise<any> {

        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/allowance',
            body: { owner , spender },
        });
        
          const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
          await new Promise((resolve, reject) => {
              res.on('end', resolve);
              res.on('finish', resolve);
              res.on('error', reject);
  
              web3Router4.handle(req, res, (err:any) => {
                  if(err) return reject(err);
  
                  setImmediate(() => {
                  if(!res.writableEnded) {
                      reject(new Error('Router not Response'));
                  }
                  })
              })
          });
          const data = res._getData();
        
    
        return { success: true, data: JSON.parse(data) };
    }

async function getClaimableAmount(address: string): Promise<any> {

        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/getClaimableAmount',
            body: { address },
        });
        
          const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
          await new Promise((resolve, reject) => {
              res.on('end', resolve);
              res.on('finish', resolve);
              res.on('error', reject);
  
              web3Router3.handle(req, res, (err:any) => {
                  if(err) return reject(err);
  
                  setImmediate(() => {
                  if(!res.writableEnded) {
                      reject(new Error('Router not Response'));
                  }
                  })
              })
          });
          const data = res._getData();
        
    
        return { success: true, data: JSON.parse(data) };
    }

async function getSnapshot(address: string): Promise<any> {

        if (isVestingBlockedPeriod()) {
            return { success: true, data: 'coming soon' };
        }

        const now = new Date();

        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based

        const vestingStart = new Date(year, month, 1, 0, 0, 0);    // Month day 1 00:00
        const vestingEnd = new Date(year, month, 26, 0, 0, 0);      // day 26 00:00

        const snapMonth = getTargetYearMonth();
        console.log(`snapshot month ::: ${snapMonth}`);
        try {
            const snapshotData = await db.snapshotRepo
                                            .createQueryBuilder('snapshot')
                                            .where('snapshot.address = :address', { address })
                                            .andWhere('snapshot.month = :month', { month: snapMonth })
                                            .getOne();

            const monthlySnapshotData = await db.snapshotInfoRepo
                                                    .createQueryBuilder('monthlySnap')
                                                    .where('monthlySnap.month = :month', {month: snapMonth})
                                                    .getOne();

            const PRECISION = 10n ** 18n;
        
            const result = {
                        month: snapshotData.month,
                        address: snapshotData.address,
                        balance: BigInt(snapshotData.balance)/PRECISION,
                        share: ethers.formatUnits(BigInt(snapshotData.share) * 100n,18),
                        total_supply: BigInt(monthlySnapshotData.total_supply)/PRECISION,
                        vesting_start_date: vestingStart.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }),
                        vesting_end_date: vestingEnd.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }),
                    };
            return result;
        } catch (e) {
            logger.error('Error in getSnapshot:', e);
            return { success: true, data: 'coming soon' };
        }
    }

async function getSnapshotBalance(year: string, month: string): Promise<any> {
        const BATCH_SIZE = 5000;
        let lastIdx = 174600;
        while(true) {
            logger.log(`>>>>>>>>>>> lastIdx ${lastIdx}`)
            const whitelistInfoList = await db.whiteListRepo
                                        .createQueryBuilder('whitelistinfo')
                                        .where('whitelistinfo.ipl_whitelist_idx > :lastIdx', { lastIdx })
                                        .limit(BATCH_SIZE)
                                        .getMany();
            lastIdx = whitelistInfoList[whitelistInfoList.length - 1].ipl_whitelist_idx;
            if (whitelistInfoList.length === 0) break;
            
            const address = whitelistInfoList.map(w => w.address);
            logger.log(`${address}`);
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/getTestBalance',
                body: { year, month, address },
            });
        
          const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
          await new Promise((resolve, reject) => {
              res.on('end', resolve);
              res.on('finish', resolve);
              res.on('error', reject);
  
              web3Router2.handle(req, res, (err:any) => {
                  if(err) return reject(err);
  
                  setImmediate(() => {
                  if(!res.writableEnded) {
                      reject(new Error('Router not Response'));
                  }
                  })
              })
          });
          const data = res._getData();
          const jsonData = JSON.parse(data);
          const total = jsonData[Object.keys(jsonData)[0]].total;
          let snapshotRow = await db.snapshotInfoRepo.findOne({
            where: { month: `${year}${month}` }
          });

        if (!snapshotRow) {
            snapshotRow = await db.snapshotInfoRepo.save({
                month: `${year}${month}`,
                total_supply: total,
                btx_distribution: 2083333,
                status: 'pending'
            });

            await db.snapshotInfoRepo.update(
                { idx: snapshotRow.idx },
                { round_id: snapshotRow.idx }
            );
        }

        //   logger.log(`getTestBalance jsonData ::: ${data}`);
        //   if(jsonData) {
        //         for (const [address, info] of Object.entries(jsonData) as [string,{ balance: string; share: string }][]) {
        //             // logger.log(`address ::: ${address} info ::: ${JSON.stringify(info)}`);

        //             const whitelistInfoList = await db.whiteListRepo
        //                                             .createQueryBuilder('whitelistinfo')
        //                                             .where('whitelistinfo.address = :address', { address })
        //                                             .getOne();

        //             const getAddress = await db.userBackupRepo
        //                                         .createQueryBuilder('userbackup')
        //                                         .where('userbackup.principal = :principal', { principal: whitelistInfoList.principal })
        //                                         .getOne();

        //             const { balance, share } = info;

        //             const monthlySnapshotData = await db.snapshotInfoRepo
        //                                         .createQueryBuilder('monthlySnap')
        //                                         .where('monthlySnap.month = :month', {month: `${year}${month}`})
        //                                         .getOne();

        //             const userShare = BigInt(share);
        //             const btx_distribution = BigInt(monthlySnapshotData.btx_distribution);
        //             const amount = btx_distribution * userShare;
        //             try {
        //             if(balance === '0' || share === '0' || getAddress.evmAddress === '0x0000000000000000000000000000000000000000' || !ethers.isAddress(getAddress.evmAddress)) {
        //                 continue;
        //             } else {
        //                 logger.log(`getTestBalance save ::: ${getAddress.evmAddress} ${balance} ${share} ${amount}`);
        //                 await db.snapshotRepo.query(`INSERT INTO ipl_snapshot (address, month, balance, amount, share, created_at, updated_at)
        //                                              VALUES (?, ?, ?, ?,?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        //                                              ON DUPLICATE KEY UPDATE
        //                                                 balance = CAST(balance AS DECIMAL(65,0)) + CAST(VALUES(balance) AS DECIMAL(65,0)),
        //                                                 amount = CAST(amount AS DECIMAL(65,0)) + CAST(VALUES(amount) AS DECIMAL(65,0)),
        //                                                 share   = CAST(share   AS DECIMAL(65,0)) + CAST(VALUES(share)   AS DECIMAL(65,0)),
        //                                                 updated_at = CURRENT_TIMESTAMP(3)
        //                                             `,
        //                                             [
        //                                                 getAddress.evmAddress,
        //                                                 `${year}${month}`,
        //                                                 balance, // string
        //                                                 amount,
        //                                                 share   // string
        //                                             ]
        //                                         );
        //             }
        //         } catch (e) {
        //             logger.error(e);
        //         }                
        //         }
        //     }
        }
          return { success: true };
      }

  async function getPrincipalById(partnerIdx: number, id: string) {
      let principal:any[] = [];
      let pid: any;
      
      if(partnerIdx === 2 || partnerIdx === 5) {
            id = telegramService.decrypt(id);
            console.log(`decrypted telegram id ::: ${id}`);

            const userInfo = await db.userBackupRepo
                                .createQueryBuilder('userbackup')
                                .where('userbackup.id = :id', { id })
                                .getMany();

            logger.log(`telegram userInfo :: ${JSON.stringify(userInfo)}`);

            

            if(userInfo.length > 0) {
                return userInfo.map(u => ({
                    partnerIdx: u.partnerIdx,
                    principal: u.principal,
                    balance: 0,
                    created_at: moment(u.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                }));
            }

              logger.log(`partnerIdx ::: ${partnerIdx} id ::: ${id}`);
              if(userInfo.length === 0){
                    partnerIdx = 5; //new telegram member
                    await addPrincipal(id, partnerIdx);
                    principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
              }
              logger.log(`principal ::: ${principal[0].principle}`);

              await db.userBackupRepo.save({
                              id: id,
                              evmAddress: id,
                              principal: principal[0].principle,
                              partnerIdx: Number(principal[0].partner_idx),
                              createdAt: principal[0].created_at
                          });
              
              return {
                  partnerIdx: Number(principal[0].partner_idx),
                  principal: principal[0].principle,
                  balance: 0,
                  created_at: principal[0].created_at
              };
          } else {
            let userInfo;
            if(partnerIdx === 1) {
                userInfo = await db.userBackupRepo
                                .createQueryBuilder('userbackup')
                                .where('userbackup.id = :id', { id })
                                .getMany();
            } else {
                userInfo = await db.userBackupRepo
                                .createQueryBuilder('userbackup')
                                .where('userbackup.evmAddress = :id', { id })
                                .getMany();
            }

            logger.log(`evm userInfo :: ${JSON.stringify(userInfo)}`);

            const isAllPartnerIdxOne = userInfo.every(u => u.partnerIdx === 1);

            if(userInfo.length > 0 && !isAllPartnerIdxOne) {
                logger.log(`partnerIdx not Paykhan`);
                return userInfo.map(u => ({
                    partnerIdx: u.partnerIdx,
                    principal: u.principal,
                    balance: 0,
                    created_at: moment(u.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                }));
            } else if (userInfo.length > 0 && isAllPartnerIdxOne){
                 return userInfo.map(u => ({
                    partnerIdx: u.partnerIdx,
                    principal: u.principal,
                    balance: 0,
                    created_at: moment(u.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                }));
            }

              const partnerIdxList = [1, 3, 6];
              
              if(userInfo.length === 0){
                if(partnerIdx === 1) {
                    const userPaykhanInfo = await db.userBackupRepo
                                                .createQueryBuilder('userbackup')
                                                .where('userbackup.id = :id', { id })
                                                .getOne();
                    if(!userPaykhanInfo) {
                        await addPrincipal(id, partnerIdx);
                    }
                } else {
                    id = await getAddress(id);
                    partnerIdx = 6; //new evm member
                    await addPrincipal(id, partnerIdx);
                }
              }
              
              const results = await Promise.all(
                  partnerIdxList.map(async (idx) => {
                      let res1: any[] = [];
                      let res2: any[] = [];
                      if(idx === 0){
                        if(partnerIdx === 1) {
                            pid = id.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                            const resId = await axios.get(`https://paykhan.org/nftAudio/getEvmAddressById?id=${id}`);
                            if(resId.data === "null") {
                                id = "0x0000000000000000000000000000000000000000";
                            } else {
                                id = resId.data;
                            }

                        } else {
                          const resId = await axios.get(`https://paykhan.org/nftAudio/getPaykhanIdByAddress?address=${id}`);
                          pid = resId.data.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                        }
                        res1 = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, pid);
                      } else {
                          res2 = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                      }
                      
  
                      // merge two results
                      const merged = [...(res1 || []), ...(res2 || [])];
  
                      // undifined null
                      if (merged.length === 0) return null;
  
                      const m = merged[0];

                      
                      
                      const results2: any[] = [];
                      
                      for (const m of merged) {
                          console.log(`merged ::: ${m.principle} ${Number(m.partner_idx)} ${m.created_at}`); 
                        if(idx === 0) {
                            await db.userBackupRepo.save({
                                id: pid,
                                evmAddress: id,
                                principal: m.principle,
                                partnerIdx: Number(m.partner_idx),
                                createdAt: m.created_at,
                            });
                        } else if(idx === 1) {
                            await db.userBackupRepo.save({
                              id: id,
                              evmAddress: id,
                              principal: m.principle,
                              partnerIdx: Number(m.partner_idx),
                              createdAt: m.created_at,
                          });
                        } else if(idx === 2) {
                            await db.userBackupRepo.save({
                              id: id,
                              evmAddress: id,
                              principal: m.principle,
                              partnerIdx: Number(m.partner_idx),
                              createdAt: m.created_at,
                          });
                        }

                        logger.log(`upserted :: idx ${id}`);

                          results2.push({
                              partnerIdx: Number(m.partner_idx),
                              principal: m.principle,
                              balance: 0,
                              created_at: m.created_at,
                          });
                      }
                  
                      return results2
                  })
              );
  
              // null filter
              const memberList = results.filter(Boolean);
              return memberList.flat();
          }
      }    

      async function addPrincipal(id: any, partnerIdx: number) {
              const OWNER_KEY = configService.get<string>('OWNER_KEY');
      
              if(!OWNER_KEY){
                  logger.error('Cannot find OWNER_KEY');
                  throw new Error('Cannot find OWNER_KEY');
              }
      
              const now = moment().utc();
              let members: any;
      
              try {
                  id = id.toString().replace(/[^a-zA-Z0-9._@-]/g, 'd');
                  const principalCheck = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                  if(principalCheck.length > 0) {
                      logger.log('This member already exists.');
                      members = ({
                                      idx: 0,
                                      principle: principalCheck[0].principle,
                                      partner_idx: partnerIdx,
                                      user: id,
                                      created_at: now.format('YYYY-MM-DD HH:mm:ss'),
                                  });
                  } else {

                    const uniqueId = `${id}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                    // identity
                    await runDfxCommand(`identity new ${uniqueId} --storage-mode=plaintext`,  uniqueId);
                    // identity list
                    await runDfxCommand(`identity use ${uniqueId}`, uniqueId);
                    // principal
                    const principal = await runDfxCommand("identity get-principal", uniqueId);
        
                    members = ({
                                        idx: 0,
                                        principle: principal,
                                        partner_idx: partnerIdx,
                                        user: id,
                                        created_at: now.format('YYYY-MM-DD HH:mm:ss'),
                                    });
                    }
                  
                  const stakerInfo = await canister.memberActor.addMember(OWNER_KEY, members)
      
      
                  return stakerInfo;
              } catch (err) {
                  console.error("Error:", err);
              }
      
          }

        function runDfxCommand(cmd: string, uniqueId: string): Promise<string> {
            return new Promise(async (resolve, reject) => {
                try {
                const dfxBin = await resolveDfx();

                const identityPath = `/tmp/dfx_identity_${uniqueId}`;

                const env = {
                    ...process.env,
                    DFX_IDENTITY_ROOT: identityPath,
                    DFX_CONFIG_ROOT: `${identityPath}/config`,
                    HOME: `${identityPath}/home`,
                };

                exec(`${dfxBin} ${cmd}`, { env }, (error, stdout, stderr) => {
                    if (error) return reject(error);
                    resolve((stdout + stderr).trim());
                });
                } catch (e) {
                reject(e);
                logger.log(e);
                }
            });
        }

        async function resolveDfx(): Promise<string> {
            return "/home/sbryu/.local/share/dfx/versions/0.29.1/dfx";
        }

        function formatDate(dateStr: string): string {
            const date = new Date(dateStr);

            return date.toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }

        function getTargetYearMonth(): string {
            const now = new Date();
            const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

            const year = kstNow.getFullYear();
            const month = kstNow.getMonth(); // 0-based

            // 1일 00:00 ~ 25일 23:59:59 → 저번달
            if (kstNow.getDate() <= 25) {
                const prevMonth = new Date(year, month - 1, 1);
                const prevYear = prevMonth.getFullYear();
                const prevMonthNumber = prevMonth.getMonth() + 1;

                return `${prevYear}${String(prevMonthNumber).padStart(2, '0')}`;
            }

            return ``;
        }

        function isVestingBlockedPeriod(): boolean {
            const now = new Date();

            const year = now.getFullYear();
            const month = now.getMonth(); // 0-based

            const blockStart = new Date(year, month, 26, 0, 0, 0);      // day 26 00:00
            const blockEnd = new Date(year, month + 1, 1, 0, 0, 0);    // Next Month day 1 00:00

            return now >= blockStart && now < blockEnd;
        }
      
