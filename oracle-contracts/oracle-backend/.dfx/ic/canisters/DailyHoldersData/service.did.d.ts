import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface DailyRightsHolders {
  'neighboring_holder_staked_address' : string,
  'staked_amount' : string,
  'neighboring_token_address' : string,
  'verification_date' : string,
  'neighboring_holder_staked_mainnet' : string,
}
export interface _SERVICE {
  'addDailyRightsHoldersData' : ActorMethod<[string, string], string>,
  'getDailyHoldersRowCnt' : ActorMethod<[], bigint>,
  'getDailyRightsHolderCountByYMD' : ActorMethod<[string], bigint>,
  'getDailyRightsHoldersByYMD' : ActorMethod<
    [string, string],
    Array<DailyRightsHolders>
  >,
  'getDailyRightsHoldersByYMD_List' : ActorMethod<
    [Array<string>, string],
    Array<DailyRightsHolders>
  >,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
