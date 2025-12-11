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
import { userDBService } from './db.factory';
import { start } from 'repl';

const configService = new ConfigService();
const telegramService = new TelegramService();
let canister: any;
let db: any;
const logger = new Logger('UserWorker');

(async () => {
   canister = await createCanisterService();
   logger.log("Worker: canister service ready");
  db = await userDBService();
  logger.log("Worker: db service ready");
})();

parentPort?.on('message', async (data) => {
  try {
      const { id, partnerIdx, migration, startIdx, endIdx } = data;
        if(migration) {
            const result = await userPrincipalMigration(startIdx, endIdx);
            parentPort?.postMessage(result);
        } else {
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

  async function userPrincipalMigration(startIdx: number, endIdx: number): Promise<any> {
        const userInfo = await db.userRepo2
                        .createQueryBuilder('userbackup')
                        .where('userbackup.principal = :principal', {principal: ''})
                        .andWhere('userbackup.idx BETWEEN :startIdx AND :endIdx', { startIdx, endIdx })
                        .getMany();

        if(userInfo.length > 0) {
            
            for(const user of userInfo) {
                
                const uniqueId = `${user.id}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                // identity
                await runDfxCommand(`identity new ${uniqueId} --storage-mode=plaintext`, uniqueId);
                // identity list
                await runDfxCommand(`identity use ${uniqueId}`, uniqueId);
                // principal
                const principal = await runDfxCommand("identity get-principal", uniqueId);
                
                logger.log(`migration start :: ${user.idx}, id :: ${user.id} principal :: ${principal}`);


            await db.userRepo2.update({
                        id: user.id,
                        evmAddress: user.evmAddress,
                        partnerIdx: user.partnerIdx},
                        { principal: principal }
                    );
            }
        }
 }

  async function getPrincipalById(partnerIdx: number, id: string) {
    
          let principal:any[] = [];
          let pid: any;
          if(partnerIdx === 2 || partnerIdx === 5) { 
            id = telegramService.decrypt(id);

            const userInfo = await db.userRepo2
                                .createQueryBuilder('userbackup')
                                .where('userbackup.evmAddress = :id', { id })
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

              await db.userRepo2.save({
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
            const userInfo = await db.userRepo2
                                .createQueryBuilder('userbackup')
                                .where('userbackup.evmAddress = :id', { id })
                                .getMany();

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
            }

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
                          pid = resId.data.replace(/[^a-zA-Z0-9._@-]/g, 'd');
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
                        if(idx === 1) {         
                          await db.userRepo2.save({
                              id: pid,
                              evmAddress: id,
                              principal: m.principle,
                              partnerIdx: Number(m.partner_idx),
                              createdAt: m.created_at,
                          });
                        } else {
                            await db.userRepo2.save({
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
      
              try {
                  id = id.toString().replace(/[^a-zA-Z0-9._@-]/g, 'd');
                  const principalCheck = await canister.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                  if(principalCheck.length > 0) {
                      logger.log('This member already exists.');
                      return { response: 'This member already exists.'};
                  }

                  const uniqueId = `${id}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                  // identity
                  await runDfxCommand(`identity new ${uniqueId} --storage-mode=plaintext`,  uniqueId);
                  // identity list
                  await runDfxCommand(`identity use ${uniqueId}`, uniqueId);
                  // principal
                  const principal = await runDfxCommand("identity get-principal", uniqueId);
      
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

        function runDfxCommand(cmd: string, uniqueId: string): Promise<string> {
            return new Promise(async (resolve, reject) => {
                try {
                const dfxBin = await resolveDfx();

                const identityPath = `/tmp/dfx_identity_${uniqueId}`; // 고유 폴더

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
      
