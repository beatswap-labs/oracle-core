import Text "mo:base/Text";
import Nat "mo:base/Nat";
import JSON "mo:json";
import Bool "mo:base/Bool";
import T "types";
import TrieMap "mo:base/TrieMap"; 
import Buffer "mo:base/Buffer";   


persistent actor DailyHoldersData {


  transient var canister_owner  :? Text = null;


  // set canister owner
  public func setCanisterOwner(newOwner : Text) : async Text {
  if (canister_owner == null) {
    canister_owner := ?newOwner;
    return "Canister owner set!";
  } else {
    return "Canister owner is already set!";
  }
  };

  // update canister owner
  public func updateCanisterOwner(base:? Text, newbase:? Text ) : async Text {
    
    if (canister_owner == base) {
      canister_owner := newbase;

      return "Canister owner updated!";
    } else {
      
      return "Canister owner does not match!";
    }
  };  


//holder count
 var DailyHoldersIdxCounter : Nat = 0;

private func increaseDailyHoldersIdxCounter() : Nat {
    DailyHoldersIdxCounter += 1;
    DailyHoldersIdxCounter
};

public query func getDailyHoldersRowCnt() : async Nat {
    DailyHoldersIdxCounter
};

private func toYMD(date : Text) : Text {
  var out : Text = "";
  for (c in date.chars()) {
    if (c >= '0' and c <= '9') { out #= Text.fromChar(c) };
  };
  out
}; 

// YYYYMMDD List → Buffer 
 transient var DailyRightsHoldersByYmd
  : TrieMap.TrieMap<Text, Buffer.Buffer<T.DailyRightsHolders>> =
    TrieMap.TrieMap<Text, Buffer.Buffer<T.DailyRightsHolders>>(Text.equal, Text.hash);

private func ensureDayBuf(ymd : Text) : Buffer.Buffer<T.DailyRightsHolders> {
  switch (DailyRightsHoldersByYmd.get(ymd)) {
    case (?b) b;
    case null {
      let nb = Buffer.Buffer<T.DailyRightsHolders>(1024);
      DailyRightsHoldersByYmd.put(ymd, nb);
      nb
    }
  }
};

// total
public query func getDailyRightsHolderCountByYMD(ymd : Text) : async Nat {
  switch (DailyRightsHoldersByYmd.get(ymd)) {
    case (?b) b.size();
    case null 0;
  }
};

// filter
public query func getDailyRightsHoldersByYMD(neighboring_token_address: Text, ymd : Text) : async [T.DailyRightsHolders] {
  switch (DailyRightsHoldersByYmd.get(ymd)) {
    case (?buf) {
      let out = Buffer.Buffer<T.DailyRightsHolders>(buf.size());
      var i : Nat = 0;
      let n = buf.size();
      while (i < n) {
        let v = buf.get(i);
        if (v.neighboring_token_address == neighboring_token_address) { out.add(v) };
        i += 1;
      };
      Buffer.toArray(out)
    };
    case null []
  }
};


public query func getDailyRightsHoldersByYMD_List(
  neighboring_token_addresses: [Text],
  ymd : Text
) : async [T.DailyRightsHolders] {
  if (neighboring_token_addresses.size() == 0) { return [] };

  let addrSet = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
  for (a in neighboring_token_addresses.vals()) { addrSet.put(a, true) };

  let key = toYMD(ymd);

  switch (DailyRightsHoldersByYmd.get(key)) {
    case (?buf) {
      let out = Buffer.Buffer<T.DailyRightsHolders>(buf.size());
      var i : Nat = 0;
      let n = buf.size();
      while (i < n) {
        let v = buf.get(i);
        if (switch (addrSet.get(v.neighboring_token_address)) { case (?_) true; case null false }) {
          out.add(v)
        };
        i += 1;
      };
      Buffer.toArray(out)
    };
    case null []
  }
};


//multiple holder add method
public func addDailyRightsHoldersData(owner : Text , data : Text) : async Text {
  let authorized = canister_owner == ?owner;
  if (not authorized) { return "Not authorized: Canister owner does not match!"; };

  let parsed = JSON.parse(data);
  switch (parsed) {
    case (#ok(#array(arr))) {
      for (item in arr.vals()) {
        switch (item) {
          case (#object_(_)) {
            let neighboring_token_address : Text = switch (JSON.get(item, "neighboring_token_address")) { case (? #string(t)) t; case _ "" };
            let neighboring_holder_staked_address : Text = switch (JSON.get(item, "neighboring_holder_staked_address")) { case (? #string(t)) t; case _ "" };
            let staked_amount : Text = switch (JSON.get(item, "staked_amount")) { case (? #string(t)) t; case _ "" };
            let verification_date : Text = switch (JSON.get(item, "verification_date")) { case (? #string(t)) t; case _ "" };
            let neighboring_holder_staked_mainnet : Text = switch (JSON.get(item, "neighboring_holder_staked_mainnet")) { case (? #string(t)) t; case _ "" };

            if (neighboring_token_address != "" and neighboring_holder_staked_address != "" and verification_date != "") {
              let ymd = toYMD(verification_date);
              let rec : T.DailyRightsHolders = {
                neighboring_token_address = neighboring_token_address;
                neighboring_holder_staked_address = neighboring_holder_staked_address;
                staked_amount = staked_amount;
                verification_date = verification_date;
                neighboring_holder_staked_mainnet = neighboring_holder_staked_mainnet;
              };
              let buf = ensureDayBuf(ymd);
              buf.add(rec);
              ignore increaseDailyHoldersIdxCounter();
            };
          };
          case _ {}
        }
      };
      "addDailyRightsHoldersData Success"
    };
    case (#ok(_)) { "Invalid JSON (not array)" };
    case (#err(_)) { "JSON parse error" }
  }
};


}