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
export interface VerificationUnlockListV2 {
  'idx' : bigint,
  'principal' : string,
  'unlock_date' : string,
  'partner_idx' : bigint,
  'unlocked_at' : string,
  'unlocked_ts' : bigint,
  'icp_year_month' : string,
}
export interface VerificationUnlockUserData {
  'idx' : bigint,
  'principal' : string,
  'unlock_date' : string,
  'partner_idx' : bigint,
}
export interface _SERVICE {
  'addVerificationUnlockListData' : ActorMethod<[string, string], string>,
  'addVerificationUnlockListDataV2' : ActorMethod<[string, string], string>,
  'getCountByUser' : ActorMethod<[string], bigint>,
  'getEventsByUser' : ActorMethod<[string], Array<VerificationUnlockUserData>>,
  'getKCountByYm' : ActorMethod<[string], bigint>,
  'getKCountV2ByYm' : ActorMethod<[string], bigint>,
  'getKEventsByYm' : ActorMethod<[string], Array<VerificationUnlockList>>,
  'getKEventsV2ByYm' : ActorMethod<[string], Array<VerificationUnlockListV2>>,
  'getOracleDataRowCnt2' : ActorMethod<[], bigint>,
  'getPCountByYm' : ActorMethod<[string], bigint>,
  'getPCountV2ByYm' : ActorMethod<[string], bigint>,
  'getPEventsByYm' : ActorMethod<[string], Array<VerificationUnlockList>>,
  'getPEventsV2ByYm' : ActorMethod<[string], Array<VerificationUnlockListV2>>,
  'getTCountByYm' : ActorMethod<[string], bigint>,
  'getTCountV2ByYm' : ActorMethod<[string], bigint>,
  'getTEventsByYm' : ActorMethod<[string], Array<VerificationUnlockList>>,
  'getTEventsV2ByYm' : ActorMethod<[string], Array<VerificationUnlockListV2>>,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
