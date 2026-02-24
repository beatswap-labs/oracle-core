import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import axios from 'axios';
import { exec } from "child_process";
import * as zlib from 'zlib';
import { CanisterService } from './service/canister.service';
import * as util from 'util';



@Injectable()
export class AppService {

    constructor(private configService: ConfigService, private canisterService: CanisterService) {}
    private readonly logger = new Logger(AppService.name);


    roundTo(num:number, digits: number) {
        const factor = Math.pow(10, digits);
        return Math.round(num*factor)/ factor;
    }

    
    private async resolveDfx(): Promise<string> {
        return await new Promise((resolve, reject) => {
            exec('command -v dfx', (err, stdout) => {
            if (err) return reject(new Error('dfx not found in PATH'));
            resolve(stdout.toString().trim());
            });
        });
    }

    runDfxCommand(cmd: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
            const dfxBin = await this.resolveDfx();
            exec(`${dfxBin} ${cmd}`, (error, stdout, stderr) => {
                if (error) return reject(error);
                resolve((stdout + stderr).trim());
            });
            } catch (e) { reject(e); }
        });
    }
    
    private readonly ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
    
    parseTransactions(transactions: any[], type: string, idx: number = 1) {
        // CRC32
        const crc32 = (buf: Buffer): number => {
        return zlib.crc32(buf) >>> 0;
        };

        // base32 encoding
        const base32Encode = (data: Buffer): string => {
        let bits = 0;
        let value = 0;
        let output = '';
        for (const b of data) {
            value = (value << 8) | b;
            bits += 8;
            while (bits >= 5) {
            output += this.ALPHABET[(value >> (bits - 5)) & 31];
            bits -= 5;
            }
        }
        if (bits > 0) {
            output += this.ALPHABET[(value << (5 - bits)) & 31];
        }
        return output;
        };

        // blob decoding
        const decodeBlob = (blobDict: Record<string, number>): string => {
        const byteValues = Object.keys(blobDict)
            .map((k) => [Number(k), blobDict[k]])
            .sort((a, b) => a[0] - b[0])
            .map(([_, v]) => v);
        let buf = Buffer.from(byteValues);
    
        // principal 
        if (buf.length >= 28 && buf.length <= 32) {
            const crc = Buffer.alloc(4);
            crc.writeUInt32BE(crc32(buf));
            const full = Buffer.concat([crc, buf]);
            const b32 = base32Encode(full);
           return b32.match(/.{1,5}/g)?.join('-') ?? b32;
        } else if (buf.length === 10) {eeee
            buf = Buffer.from([
             10, 167, 131, 161,  38, 156, 217,
            171,   6,  51,  38, 253, 114, 227,
            131, 105, 214,  49, 124,  41, 188,
            208, 212, 127,  12, 205, 120,  12,
              2
            ]);

            const crc = Buffer.alloc(4);
            crc.writeUInt32BE(crc32(buf));
            const full = Buffer.concat([crc, buf]);
            const b32 = base32Encode(full);
           return b32.match(/.{1,5}/g)?.join('-') ?? b32;
        } 

        return buf.toString('utf8');
        };

        return transactions.map((tx) => {
            const mint = tx.mint?.[0];
            idx++;
            // principal
            let principal: string | null = null;
            if (mint?.to?.owner?._arr) {
                principal = decodeBlob(mint?.to?.owner?._arr); // blob → decode
        }

        // memo
        let memo: string | null = null;
        if (mint?.memo && mint.memo.length > 0) {
            memo = decodeBlob(mint.memo[0]);
        }

        // created_at_time trans
        let createdAt: string | null = null;
        if (mint?.created_at_time && mint.created_at_time.length > 0) {
            const tsNs = BigInt(mint.created_at_time[0]);
            const tsMs = Number(tsNs / 1_000_000n);
            if(type === 'dashboard') {
                createdAt = new Date(tsMs).toISOString().replace('T', ', ').replace(/\.\d+Z$/, ' UTC');
            } else {
                createdAt = moment(tsMs).tz('UTC').format('MM/DD/YYYY HH:mm:ss');
            }
        } else {
            createdAt = moment().tz('UTC').format('MM/DD/YYYY HH:mm:ss');
        }

        return {
            index: idx,
            method: tx.kind ?? null,
            to: principal,
            type: memo == null ? 'RoyaltyReward' : memo,
            timestamp: createdAt,
            amount: (mint?.amount ?? null) == 0 ? 1 : (mint?.amount ?? null),
        };
    });
  }



    async getMigration(startIdx: number, endIdx: number = 999999999, cnt: number, retryCnt = 0): Promise<any> {
        let allTx: any[] = [];
        const bnbWhiteListUrl = this.configService.get<string>('BNB_WHITELIST_URL') || '';

        if(startIdx > endIdx) {
            this.logger.log(`Migration Completed ::: startIdx: ${startIdx}, endIdx: ${endIdx}`);
            return { response: 'Migration Completed' };
        }

        const GetTransactionLength = ({
                    start: startIdx-1, 
                    length: cnt
            });
        try {
            const archiveInfo = await this.canisterService.tokenActor.archives();
            let mainList: any[] = [];
            this.logger.log(`>>>>>>>>>>>>>>>> start ${archiveInfo[0].block_range_start} end ${archiveInfo[0].block_range_end}`);
            for (const archive of archiveInfo) { 
                this.logger.log(`>>>>>>>>>>>>>>>> start fetching archive for idx ${archive.canister_id}`);
                if(GetTransactionLength.start > archive.block_range_end || GetTransactionLength.start < archive.block_range_start) {
                    this.logger.log(`archive skip idx ${GetTransactionLength.start} canister_id ${archive.canister_id}`);
                    continue;
                }

                const transactionArc = await this.canisterService.createArchiveActor(archive.canister_id).get_transactions(GetTransactionLength);
                const parsed = this.parseTransactions(transactionArc.transactions, "scan", GetTransactionLength.start);
                if (Array.isArray(parsed)) {
                    mainList.push(...parsed);
                }
            };

            allTx = [...mainList];
            this.logger.log(`startIdx ::: ${startIdx} totalTransaction ::: ${allTx.length}`);
            if(allTx.length <= cnt && allTx.length > 0) {
                this.logger.log(`Archive LastIndex: ${allTx[allTx.length-1].index}`);
                const GetTransactionLengthLive = ({
                    start: allTx[allTx.length-1].index,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                    length: cnt - allTx.length
                });

                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLengthLive);

                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLengthLive.start));
                allTx = [...allTx, ...archiveList];
                
            } else {
                this.logger.log(`Archive End Live Data`);
                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);

                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLength.start));
                allTx = [...allTx, ...archiveList];
            }
        } catch (error) {
            this.logger.error(`Error: ${error}`);
            return this.getMigration(startIdx, endIdx, cnt);
        }

            const stringifiedTx = allTx.map(tx => ({
            ...tx,
            amount: String(tx.amount),
            }));

            this.logger.log(util.inspect(stringifiedTx, { depth: null, colors: true }));

            this.logger.log(`stringifiedTx.length ::: ${stringifiedTx.length}`);

            
            try {
                if(stringifiedTx.length === 0) {
                    this.logger.log(`No Transactions Found, Moving to Next Batch ::: startIdx: ${startIdx + cnt}`);
                    return this.getMigration(startIdx + stringifiedTx.length, endIdx, cnt);
                }
                const whitelistRes =await axios.post(bnbWhiteListUrl, {
                    requests: stringifiedTx                
                })
                this.logger.log(`whitelistRes: ${JSON.stringify(whitelistRes?.data)}`);
                if(whitelistRes?.data?.success === true) {
                    return this.getMigration(startIdx+stringifiedTx.length, endIdx, cnt);
                } else {
                    if (retryCnt < 1) {
                        return this.getMigration(startIdx, endIdx, cnt, retryCnt + 1);
                    } else {
                        return this.getMigration(startIdx+stringifiedTx.length, endIdx, cnt);
                    }
                }
            } catch (error) {
                this.logger.error(`whitelistRes Error: ${error}`);
                await new Promise(resolve => setTimeout(resolve, 5000));

                if (retryCnt < 1) {
                    return this.getMigration(startIdx, endIdx, cnt, retryCnt + 1);
                } else {
                    return this.getMigration(startIdx+stringifiedTx.length, endIdx, cnt);
                }
            } 

        }
}