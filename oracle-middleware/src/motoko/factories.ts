import { idlFactory as oracleIdlFactory } from "./oracle.did.js";
import { idlFactory as unlockIdlFactory } from "./unlock.did.js";
import { idlFactory as playIdlFactory } from "./play.did.js";
import { idlFactory as memberIdlFactory } from "./member.did.js";
import { idlFactory as memberSnapIdlFactory } from "./memberSnap.did.js";
import { idlFactory as holderIdlFactory } from "./holder.did.js";
import { idlFactory as trafficIdlFactory } from "./traffic.did.js";
import { idlFactory as traffic2IdlFactory } from "./traffic2.did.js";
import { idlFactory as tokenIdlFactory } from "./token.did.js";
import { idlFactory as tokenArcIdlFactory } from "./tokenArc.did.js";
import { idlFactory as mintIdlFactory } from "./mint.did.js";

export const CanisterFactories = {
    memberSnap: memberSnapIdlFactory,
    token: tokenIdlFactory,
    tokenArc: tokenArcIdlFactory,
    oracle: oracleIdlFactory,
    unlock: unlockIdlFactory,
    play: playIdlFactory,
    member: memberIdlFactory,
    holder: holderIdlFactory,
    traffic: trafficIdlFactory,
    traffic2: traffic2IdlFactory,
    mint: mintIdlFactory,
};