import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface DailyMemberSnap {
  'member_count' : bigint,
  'snap_date' : string,
}
export interface DailyRoyaltySnap {
  'total_royalty' : bigint,
  'snap_date' : string,
}
export interface DailyTransactionSnap {
  'transaction_count' : bigint,
  'snap_date' : string,
}
export interface MonthlyIPLSnap {
  'snap_idx' : bigint,
  'snap_principal' : string,
  'snap_date' : string,
}
export interface MonthlyIPLSnapV2 {
  'snap_idx' : bigint,
  'snap_principal' : string,
  'snap_date' : string,
  'last_idx' : bigint,
}
export interface _SERVICE {
  'addDailyMemberSnap' : ActorMethod<[string, string, bigint], boolean>,
  'addDailyRoyaltySnap' : ActorMethod<[string, string, bigint], boolean>,
  'addDailyTransactionSnap' : ActorMethod<[string, string, bigint], boolean>,
  'addMonthlyIPLSnap' : ActorMethod<[string, string, string, bigint], boolean>,
  'getDailyMemberSnap' : ActorMethod<[string], [] | [DailyMemberSnap]>,
  'getDailyRoyaltySnap' : ActorMethod<[string], [] | [DailyRoyaltySnap]>,
  'getDailyTransactionSnap' : ActorMethod<
    [string],
    [] | [DailyTransactionSnap]
  >,
  'getMonthlyIPLSnapsArr' : ActorMethod<[string], Array<MonthlyIPLSnap>>,
  'getMonthlyIPLSnapsArrV2' : ActorMethod<[string], Array<MonthlyIPLSnapV2>>,
  'getMonthlyMemberSnapsArr' : ActorMethod<[string], Array<DailyMemberSnap>>,
  'getMonthlyMemberSnapsWithTotal' : ActorMethod<
    [string],
    { 'total' : bigint, 'snaps' : Array<DailyMemberSnap> }
  >,
  'getMonthlyRoyaltySnapsArr' : ActorMethod<[string], Array<DailyRoyaltySnap>>,
  'getMonthlyRoyaltySnapsWithTotal' : ActorMethod<
    [string],
    { 'total' : bigint, 'snaps' : Array<DailyRoyaltySnap> }
  >,
  'getMonthlyTransactionSnapsArr' : ActorMethod<
    [string],
    Array<DailyTransactionSnap>
  >,
  'getMonthlyTransactionSnapsWithTotal' : ActorMethod<
    [string],
    { 'total' : bigint, 'snaps' : Array<DailyTransactionSnap> }
  >,
  'getSnapLastIndex' : ActorMethod<[], bigint>,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'setSnapLastIndex' : ActorMethod<[string, bigint], boolean>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
