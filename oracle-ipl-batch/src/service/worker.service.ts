import { Injectable, Logger } from '@nestjs/common';
import { WorkerPool } from '../workers/worker-pool';

@Injectable()
export class WorkerService {
    private workerPool = new WorkerPool(20); // worker pool size

    private readonly logger = new Logger(WorkerService.name);
    
    async mintToken(id: string, partnerIdx: number, mintType: string, amount: number): Promise<any> {
        this.logger.log(`mintToken called with id: ${id}, partnerIdx: ${partnerIdx}, mintType: ${mintType}, amount: ${amount}`);
        return this.workerPool.runServiceTask({ id, partnerIdx, mintType, amount });
    }

    async mintTokenForOracle(principal: string, mintType: string, amount: number): Promise<any> {
        this.logger.log(`mintTokenForOracle called with principal: ${principal}, mintType: ${mintType}, amount: ${amount}`);
        return this.workerPool.runServiceTask({ principal, mintType, amount });
    }

    async getPrincipalById(partnerIdx: number, id: any, type: string): Promise<any> {
        this.logger.log(`getPrincipalById called with partnerIdx: ${partnerIdx}, id: ${id}`);
        return this.workerPool.runUserTask({ partnerIdx, id, type });
    }
    
    async getAddressInfo(data: any): Promise<any> {
        this.logger.log(`getAddressInfo called with data: ${data}`);
        return this.workerPool.runUserTask({ data });
    }   

    async getIpl(year: number, month: number): Promise<any> {
        this.logger.log(`getIpl called with data: ${year}-${month}`);
        return this.workerPool.runUserTask({ year, month });
    }   


    async getTestMint(year: number, month: number, type: string): Promise<any> {
        this.logger.log(`getTestMint called with data: ${year}-${month}`);
        return this.workerPool.runUserTask({ year, month, type });
    }   

    async getSnapshotBalance(year: number, month: number, type: string): Promise<any> {
        this.logger.log(`getSnapshotBalance called with data: ${year}-${month}`);
        return this.workerPool.runUserTask({ year, month, type });
    }

    async getTelegramAddress(id: string, address: string, type: string): Promise<any> {
        this.logger.log(`getTelegramAddress called with data: ${id} || ${address}`);
        return this.workerPool.runUserTask({ id, address, type });
    }
    
    async updateAddress(id: string, address: string, type: string): Promise<any> {
        this.logger.log(`updateAddress called with data:  ${address}`);
        return this.workerPool.runUserTask({ id, address, type });
    }

    async evmAddressBinding(id: string, address: string, type: string): Promise<any> {
        this.logger.log(`evmAddressBinding called with data:  ${address}`);
        return this.workerPool.runUserTask({ id, address, type });
    }

    async evmAddressCompare(id: string, address: string, type: string): Promise<any> {
        this.logger.log(`evmAddressCompare called with data:  ${address}`);
        return this.workerPool.runUserTask({ id, address, type });
    }

    async updateAddressBatch(type: string): Promise<any> {
        this.logger.log(`updateAddressBatch called`);
        return this.workerPool.runUserTask({ type });
    }

    async getSnapshot(address:String, type: string): Promise<any> {
        this.logger.log(`getSnapshot called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    }

    async getUserDashboard(address:String, type: string): Promise<any> {
        this.logger.log(`getUserDashboard called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    } 

    async getClaimableAmount(address:String, type: string): Promise<any> {
        this.logger.log(`getClaimableAmount called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    } 

    async getClaimedTotal(address:String, type: string): Promise<any> {
        this.logger.log(`getClaimedTotal called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    } 

    async getVestingProof(address:String, type: string): Promise<any> {
        this.logger.log(`getVestingProof called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    }
    
    async getVestingWhiteProof(address:String, type: string): Promise<any> {
        this.logger.log(`getVestingWhiteProof called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    } 

    async getVestingHistory(address:String, type: string, detail: string): Promise<any> {
        this.logger.log(`getVestingHistory called with data:  ${address} ${type} ${detail}`);
        return this.workerPool.runUserTask({ address, type, detail });
    } 

    async insertTemp(id:String, amount: string, type: string): Promise<any> {
        this.logger.log(`insertTemp called with data:  ${id} ${amount} ${type}`);
        return this.workerPool.runUserTask({ id, type, amount });
    } 

    async getBtxAllowance(type:String, owner: string, spender: string): Promise<any> {
        this.logger.log(`getBtxAllowance called with data:  ${type} ${owner} ${spender}`);
        return this.workerPool.runUserTask({ type, owner, spender });
    }

    async getVestingWhiteTemp(address:String, type: string): Promise<any> {
        this.logger.log(`getVestingWhiteTemp called with data:  ${address}`);
        return this.workerPool.runUserTask({ address, type });
    } 
}
