import { parentPort } from 'worker_threads';
import { ConfigService } from '@nestjs/config';
import { Principal } from "@dfinity/principal";
import { createCanisterService } from "./canister.factory";
import { Logger } from '@nestjs/common';
import { userDBService } from './db.factory';

const configService = new ConfigService();
let canister: any;
let db: any;
const logger = new Logger('ServiceWorker');

(async () => {
  canister = await createCanisterService();
  db = await userDBService();
  logger.log("Worker: canister service ready");
})();

parentPort?.on('message', async (data) => {
  try {
      const { principal, mintType, amount } = data;

      // working mint method
        const result = await iplMint(principal, mintType, amount);
        parentPort?.postMessage(result);

    } catch (error) {
      parentPort?.postMessage({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  async function iplMint(principal: string, mintType: string, amount: number) {
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
