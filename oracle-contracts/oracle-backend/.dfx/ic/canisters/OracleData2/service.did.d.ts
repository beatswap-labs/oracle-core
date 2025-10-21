import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface VerificationUnlockList {
  'idx' : bigint,
  'unlock_date' : string,
  'partner_idx' : bigint,
  'unlocked_at' : string,
  'unlocked_ts' : bigint,
  'icp_year_month' : string,
}
export interface _SERVICE {
  'addVerificationUnlockListData' : ActorMethod<[string, string], string>,
  'getKCountByYm' : ActorMethod<[string], bigint>,
  'getKEventsByYm' : ActorMethod<[string], Array<VerificationUnlockList>>,
  'getOracleDataRowCnt2' : ActorMethod<[], bigint>,
  'getPCountByYm' : ActorMethod<[string], bigint>,
  'getPEventsByYm' : ActorMethod<[string], Array<VerificationUnlockList>>,
  'getTCountByYm' : ActorMethod<[string], bigint>,
  'getTEventsByYm' : ActorMethod<[string], Array<VerificationUnlockList>>,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
