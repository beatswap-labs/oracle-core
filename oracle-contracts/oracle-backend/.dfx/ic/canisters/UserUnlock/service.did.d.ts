import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface MemberUnlockDate {
  'principle' : string,
  'unlock_idxs' : bigint,
}
export interface _SERVICE {
  'addMemberUnlock' : ActorMethod<[string, string, MemberUnlockDate], bigint>,
  'getAllMemberUnlockKeys' : ActorMethod<[], Array<string>>,
  'getMemberUnlockByKey' : ActorMethod<[string], Array<MemberUnlockDate>>,
  'getMemberUnlockCountByKey' : ActorMethod<[string], bigint>,
  'getUserUnlockRowCnt' : ActorMethod<[], bigint>,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
