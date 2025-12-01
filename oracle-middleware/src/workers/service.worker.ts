import { parentPort } from 'worker_threads';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Principal } from "@dfinity/principal";
import { createCanisterService } from "./canister.factory";
import { Logger } from '@nestjs/common';
import { getAddress } from 'ethers';
import * as moment from 'moment';
import { exec } from "child_process";
import { TelegramService } from '../telegram/telegram.service';


const configService = new ConfigService();
const telegramService = new TelegramService();
let canister: any;
const logger = new Logger('ServiceWorker');

(async () => {
  canister = await createCanisterService();
  logger.log("Worker: canister service ready");
})();

parentPort?.on('message', async (data) => {
  try {
      const { principal, id, partnerIdx, mintType, amount } = data;


      // working mint method
      if(principal) {
          const result = await iplMintForOracle(principal, mintType, amount);
          parentPort?.postMessage(result);
      } else {
        let result;

        if(mintType) {
            result = await iplMint(id, partnerIdx, mintType, amount);
        } else {
            result = await getPrincipalById(partnerIdx, id);
        }
        parentPort?.postMessage(result);
      }
    } catch (error) {
      parentPort?.postMessage({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });



  async function iplMint(id: string, partnerIdx: number, mintType: string, amount: number) {
      const OWNER_KEY = configService.get<string>('OWNER_KEY');
      
      try {

          if(partnerIdx === 4) {
              partnerIdx = 1; // ton
              const resId = await axios.get(`https://paykhan.org/nftAudio/getPaykhanIdByAddress?address=${id}`);
              id = resId.data.replace(/[^a-zA-Z0-9._@-]/g, 'd');
              if(id === '' || id === null) {
                  id = "kadmin2";
                  logger.log(`No paykhan id replace admin -> ${id}`);
              }
              logger.log(`paykhan id ${id}`);
          }

          const principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
          
          logger.log(principal[0].principle);
          const encoder = new TextEncoder();
          const nowMs = Date.now(); 

          const nowNs = BigInt(nowMs) * 1_000_000n;
          let memo: Uint8Array;
          if(mintType === 'Royalty') {
              memo = encoder.encode("RoyaltyReward");
          } else if(mintType === 'Stream') {
              memo = encoder.encode("StreamReward");
          } else if(mintType === 'Unlock') {
              memo = encoder.encode("UnlockReward");
              if(amount === 70) amount = 100;
          } else {
              memo = encoder.encode("BonusReward");
          }

          const userPrincipal = Principal.fromText(principal[0].principle);
          const stakerInfo = await canister.mintActor.mintForUser(OWNER_KEY, userPrincipal, Math.floor(amount), [memo], [nowNs])
          
          return stakerInfo;
      } catch (err) {
          console.error(`Error: id ::: ${id} ${err}`);
          return { error: 'Minting failed' };
      }

  }

  async function iplMintForOracle(principal: string, mintType: string, amount: number) {
      const OWNER_KEY = configService.get<string>('OWNER_KEY');
      
      try {
          logger.log(principal);
          const encoder = new TextEncoder();
          const nowMs = Date.now(); 

          const nowNs = BigInt(nowMs) * 1_000_000n;
          let memo: Uint8Array;
          if(mintType === 'Royalty') {
              memo = encoder.encode("RoyaltyReward");
          } else if(mintType === 'Stream') {
              memo = encoder.encode("StreamReward");
          } else if(mintType === 'Unlock') {
              memo = encoder.encode("UnlockReward");
              if(amount === 70) amount = 100;
          } else {
              memo = encoder.encode("BonusReward");
          }

          const userPrincipal = Principal.fromText(principal);
          const stakerInfo = await canister.mintActor.mintForUser(OWNER_KEY, userPrincipal, Math.floor(amount), [memo], [nowNs])
          
          return stakerInfo;
      } catch (err) {
          console.error(`Error: id ::: ${principal} ${err}`);
          return { error: 'Minting failed' };
      }

  }


  async function getPrincipalById(partnerIdx: number, id: string) {
  
          let principal:any[] = [];
          if(partnerIdx === 2 || partnerIdx === 5) { 
              logger.log(`partnerIdx ::: ${partnerIdx} id ::: ${id}`);
              id = telegramService.decrypt(id);
              principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
              if(principal[0] === undefined){
                  if(partnerIdx === 5) {
                      principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);    
                  } else { 
                      partnerIdx = 5; //new telegram member
                      await addPrincipal(id, partnerIdx);
                      principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                  }
              }
              logger.log(`principal ::: ${principal[0].principle}`);
              const ipl = await canister.tokenActor.icrc1_balance_of({ owner: Principal.fromText(principal[0].principle), subaccount: []});
              
              return {
                  partnerIdx: Number(principal[0].partner_idx),
                  principal: principal[0].principle,
                  balance: Number(ipl),
                  created_at: principal[0].created_at
              };
          } else {
              const partnerIdxList = [1, 3, 6];
              
              id = await getAddress(id);
              const lowerId = await id.toLowerCase();
              principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
              if(principal[0] === undefined){
                  principal = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, lowerId);
                  if(principal[0] === undefined) {
                      partnerIdx = 6; //new evm member
                      await addPrincipal(id, partnerIdx);
                  }
              }
              
              const results = await Promise.all(
                  partnerIdxList.map(async (idx) => {
                      let res1 = [];
                      if(idx === 1){
                          const resId = await axios.get(`https://paykhan.org/nftAudio/getPaykhanIdByAddress?address=${id}`);
                          const pid = resId.data.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                          res1 = await canister.memberActor.getMemberByPartnerIdxAndUser(idx, pid);
                      } else {
                          res1 = await canister.memberActor.getMemberByPartnerIdxAndUser(idx, id);
                      }
                   
                      const res2 = await canister.memberActor.getMemberByPartnerIdxAndUser(idx, lowerId);
  
                      // 두 결과 합치기
                      const merged = [...(res1 || []), ...(res2 || [])];
  
                      // 아무것도 없으면 null 반환
                      if (merged.length === 0) return null;
  
                      const m = merged[0];
  
                      
                      const results2: any[] = [];
                      
                      for (const m of merged) {                  
                          const ipl = await canister.tokenActor.icrc1_balance_of({ owner: Principal.fromText(m.principle), subaccount: []});
                          
                          results2.push({
                              partnerIdx: Number(m.partner_idx),
                              principal: m.principle,
                              balance: Number(ipl),
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
      
              try {
                  id = id.toString().replace(/[^a-zA-Z0-9._@-]/g, 'd');
                  const principalCheck = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                  if(principalCheck.length > 0) {
                      logger.log('This member already exists.');
                      return { response: 'This member already exists.'};
                  }
      
                  // identity
                  await runDfxCommand(`identity new ${id} --storage-mode=plaintext`);
                  // identity list
                  await runDfxCommand(`identity use ${id}`);
                  // principal
                  const principal = await runDfxCommand("identity get-principal");
      
                  const members = ({
                                      idx: 0,
                                      principle: principal,
                                      partner_idx: partnerIdx,
                                      user: id,
                                      created_at: now.format('YYYY-MM-DD HH:mm:ss'),
                                  });
                  
                  const stakerInfo = await canister.memberActor.addMember(OWNER_KEY, members)
      
      
                  return stakerInfo;
              } catch (err) {
                  console.error("Error:", err);
              }
      
          }

        function runDfxCommand(cmd: string): Promise<string> {
                  return new Promise(async (resolve, reject) => {
                      try {
                      const dfxBin = await resolveDfx();
                      exec(`${dfxBin} ${cmd}`, (error, stdout, stderr) => {
                          if (error) return reject(error);
                          resolve((stdout + stderr).trim());
                      });
                      } catch (e) { reject(e); }
            });
        }

        async function resolveDfx(): Promise<string> {
            return await new Promise((resolve, reject) => {
                exec('command -v dfx', (err, stdout) => {
                if (err) return reject(new Error('dfx not found in PATH'));
                resolve(stdout.toString().trim());
                });
            });
        }
      
