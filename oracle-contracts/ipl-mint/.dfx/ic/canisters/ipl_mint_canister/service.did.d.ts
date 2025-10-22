import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  /**
   * / mint API
   */
  'mintForUser' : ActorMethod<
    [string, Principal, bigint, [] | [Uint8Array | number[]], [] | [bigint]],
    string
  >,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
