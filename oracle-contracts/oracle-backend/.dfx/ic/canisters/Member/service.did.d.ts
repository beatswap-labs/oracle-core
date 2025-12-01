import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Member {
  'idx' : bigint,
  'principle' : string,
  'partner_idx' : bigint,
  'user' : string,
  'created_at' : string,
}
export interface _SERVICE {
  'addMember' : ActorMethod<[string, Member], bigint>,
  'addMembers' : ActorMethod<[string, Array<Member>], bigint>,
  'getAllMembers' : ActorMethod<[string, bigint, bigint], Array<Member>>,
  'getMemberByIdx' : ActorMethod<[bigint], [] | [Member]>,
  'getMemberByPartnerIdx' : ActorMethod<[string, bigint], Array<Member>>,
  'getMemberByPartnerIdxAndUser' : ActorMethod<[bigint, string], [] | [Member]>,
  'getMemberByPrinciple' : ActorMethod<[string], [] | [Member]>,
  'getMemberCountByPartnerIdx' : ActorMethod<[bigint], bigint>,
  'getMemberRowCnt' : ActorMethod<[], bigint>,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
