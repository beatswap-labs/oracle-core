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
export interface _SERVICE {
  'addDailyMemberSnap' : ActorMethod<[string, string, bigint], boolean>,
  'addDailyRoyaltySnap' : ActorMethod<[string, string, bigint], boolean>,
  'addDailyTransactionSnap' : ActorMethod<[string, string, bigint], boolean>,
  'getDailyMemberSnap' : ActorMethod<[string], [] | [DailyMemberSnap]>,
  'getDailyRoyaltySnap' : ActorMethod<[string], [] | [DailyRoyaltySnap]>,
  'getDailyTransactionSnap' : ActorMethod<
    [string],
    [] | [DailyTransactionSnap]
  >,
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
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
