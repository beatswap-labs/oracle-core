// canister.factory.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { CanisterFactories } from '../motoko/factories';
import { ConfigService } from "@nestjs/config";

export async function createCanisterService() {
  const config = new ConfigService();
  const MEMBER_CANISTER_ID = config.get<string>('MEMBER_CANISTER_ID');
  const MINT_CANISTER_ID = config.get<string>('MINT_CANISTER_ID');

  const agent = new HttpAgent({host: 'https://ic0.app'});
    if (!MEMBER_CANISTER_ID) {
        this.logger.error('Cannot find MEMBER_CANISTER_ID');
        throw new Error('Cannot find MEMBER_CANISTER_ID');
    }
    if (!MINT_CANISTER_ID) {
        this.logger.error('Cannot find MINT_CANISTER_ID');
        throw new Error('Cannot find MINT_CANISTER_ID');
    }

  const memberActor = Actor.createActor(CanisterFactories.member, {
    agent,
    canisterId: MEMBER_CANISTER_ID,
  });

  const mintActor = Actor.createActor(CanisterFactories.mint, {
    agent,
    canisterId: MINT_CANISTER_ID,
  });

  return { memberActor, mintActor };
}
