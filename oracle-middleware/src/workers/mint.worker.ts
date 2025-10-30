import { parentPort } from 'worker_threads';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Principal } from "@dfinity/principal";
import { createCanisterService } from "./canister.factory";
import { Logger } from '@nestjs/common';

const configService = new ConfigService();
let canister: any;
const logger = new Logger('MintWorker');

(async () => {
  canister = await createCanisterService();
  logger.log("Worker: canister service ready");
})();

parentPort?.on('message', async (data) => {
  try {
      const { id, partnerIdx, mintType, amount } = data;

      // working mint method
      const result = await iplMint(id, partnerIdx, mintType, amount);

      parentPort?.postMessage({
        result,
      });
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
