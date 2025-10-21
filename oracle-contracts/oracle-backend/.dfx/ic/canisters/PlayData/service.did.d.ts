import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface UserPlayData {
  'partner_idx' : bigint,
  'user' : string,
  'play_at' : string,
  'music_idx' : bigint,
}
export interface _SERVICE {
  'addUserPlayData' : ActorMethod<[string, UserPlayData], boolean>,
  'getPlayDataRowCnt' : ActorMethod<[], bigint>,
  'getUserPlayDataByYMD' : ActorMethod<[string], Array<UserPlayData>>,
  'getUserPlayDataCountByYMD' : ActorMethod<[string], bigint>,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
