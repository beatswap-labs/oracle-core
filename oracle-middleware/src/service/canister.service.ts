// src/canisters/canister.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpAgent, Actor } from '@dfinity/agent';
import { CanisterFactories } from '../motoko/factories';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CanisterService {

    
    private readonly logger = new Logger(CanisterService.name); 
    configService = new ConfigService();

    oracleActor: any;
    unlockActor: any;
    playActor: any;
    memberActor: any;
    memberSnapActor: any;
    holderActor: any;
    trafficActor: any;
    traffic2Actor: any;
    tokenActor: any;
    tokenArcActor: any;
    mintActor: any;

    async onModuleInit() {

        const agent = new HttpAgent({host: 'https://ic0.app'});
        const ORACLE_CANISTER_ID = this.configService.get<string>('ORACLE_CANISTER_ID');
        const UNLOCK_CANISTER_ID = this.configService.get<string>('UNLOCK_CANISTER_ID');
        const PLAY_CANISTER_ID = this.configService.get<string>('PLAY_CANISTER_ID');
        const MEMBER_CANISTER_ID = this.configService.get<string>('MEMBER_CANISTER_ID');
        const MEMBERSNAP_CANISTER_ID = this.configService.get<string>('MEMBERSNAP_CANISTER_ID');
        const HOLDER_CANISTER_ID = this.configService.get<string>('HOLDER_CANISTER_ID');
        const TRAFFIC_CANISTER_ID = this.configService.get<string>('TRAFFIC_CANISTER_ID');
        const TRAFFIC2_CANISTER_ID = this.configService.get<string>('TRAFFIC2_CANISTER_ID');
        const TOKEN_CANISTER_ID = this.configService.get<string>('TOKEN_CANISTER_ID');
        const TOKEN_ARC_CANISTER_ID = this.configService.get<string>('TOKEN_ARC_CANISTER_ID');
        const MINT_CANISTER_ID = this.configService.get<string>('MINT_CANISTER_ID');


        if (!ORACLE_CANISTER_ID) {
        this.logger.error('Cannot find ORACLE_CANISTER_ID');
        throw new Error('Cannot find ORACLE_CANISTER_ID');
        }
        if (!UNLOCK_CANISTER_ID) {
        this.logger.error('Cannot find UNLOCK_CANISTER_ID');
        throw new Error('Cannot find UNLOCK_CANISTER_ID');
        }
        if (!PLAY_CANISTER_ID) {
        this.logger.error('Cannot find PLAY_CANISTER_ID');
        throw new Error('Cannot find PLAY_CANISTER_ID');
        }
        if (!MEMBER_CANISTER_ID) {
        this.logger.error('Cannot find MEMBER_CANISTER_ID');
        throw new Error('Cannot find MEMBER_CANISTER_ID');
        }
        if (!MEMBERSNAP_CANISTER_ID) {
        this.logger.error('Cannot find MEMBERSNAP_CANISTER_ID');
        throw new Error('Cannot find MEMBERSNAP_CANISTER_ID');
        }
        if (!HOLDER_CANISTER_ID) {
        this.logger.error('Cannot find HOLDER_CANISTER_ID');
        throw new Error('Cannot find HOLDER_CANISTER_ID');
        }
        if (!TRAFFIC_CANISTER_ID) {
        this.logger.error('Cannot find TRAFFIC_CANISTER_ID');
        throw new Error('Cannot find TRAFFIC_CANISTER_ID');
        }
        if (!TRAFFIC2_CANISTER_ID) {
        this.logger.error('Cannot find TRAFFIC2_CANISTER_ID');
        throw new Error('Cannot find TRAFFIC2_CANISTER_ID');
        }
        if (!TOKEN_CANISTER_ID) {
        this.logger.error('Cannot find TOKEN_CANISTER_ID');
        throw new Error('Cannot find TOKEN_CANISTER_ID');
        }
        if (!TOKEN_ARC_CANISTER_ID) {
        this.logger.error('Cannot find TOKEN_ARC_CANISTER_ID');
        throw new Error('Cannot find TOKEN_ARC_CANISTER_ID');
        }
        if (!MINT_CANISTER_ID) {
        this.logger.error('Cannot find MINT_CANISTER_ID');
        throw new Error('Cannot find MINT_CANISTER_ID');
        }
    
        await agent.fetchRootKey();

        this.oracleActor = Actor.createActor(CanisterFactories.oracle, {
        agent,
        canisterId: ORACLE_CANISTER_ID,
        });

        this.unlockActor = Actor.createActor(CanisterFactories.unlock, {
        agent,
        canisterId: UNLOCK_CANISTER_ID,
        });

        this.playActor = Actor.createActor(CanisterFactories.play, {
        agent,
        canisterId: PLAY_CANISTER_ID,
        });

        this.memberActor = Actor.createActor(CanisterFactories.member, {
        agent,
        canisterId: MEMBER_CANISTER_ID,
        });

        this.memberSnapActor = Actor.createActor(CanisterFactories.memberSnap, {
        agent,
        canisterId: MEMBERSNAP_CANISTER_ID,
        });

        this.holderActor = Actor.createActor(CanisterFactories.holder, {
        agent,
        canisterId: HOLDER_CANISTER_ID,
        });

        this.trafficActor = Actor.createActor(CanisterFactories.traffic, {
        agent,
        canisterId: TRAFFIC_CANISTER_ID,
        });

        this.traffic2Actor = Actor.createActor(CanisterFactories.traffic2, {
        agent,
        canisterId: TRAFFIC2_CANISTER_ID,
        });

        this.tokenActor = Actor.createActor(CanisterFactories.token, {
        agent,
        canisterId: TOKEN_CANISTER_ID,
        });

        this.tokenArcActor = Actor.createActor(CanisterFactories.tokenArc, {
        agent,
        canisterId: TOKEN_ARC_CANISTER_ID,
        });

        this.mintActor = Actor.createActor(CanisterFactories.mint, {
        agent,
        canisterId: MINT_CANISTER_ID,
        });
    }
}
