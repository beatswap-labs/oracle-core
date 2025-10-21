import Text "mo:base/Text";
import Nat "mo:base/Nat";
import List "mo:base/List";
import JSON "mo:json";
import Int "mo:base/Int";
import T "types";
import Nat64 "mo:base/Nat64";
import TrieMap "mo:base/TrieMap";



persistent actor OracleData {

  
  var canister_owner  :? Text = null;

  public func setCanisterOwner(newOwner : Text) : async Text {
  if (canister_owner == null) {
    canister_owner := ?newOwner;
    return "Canister owner set!";
  } else {
    return "Canister owner is already set!";
  }
  };

  public func updateCanisterOwner(base:? Text, newbase:? Text ) : async Text {
    
    if (canister_owner == base) {
      canister_owner := newbase;

      return "Canister owner updated!";
    } else {
      
      return "Canister owner does not match!";
    }
  };

 

// data count
var OracleDataIdxCounter : Nat = 0;

private func increaseOracleDataIdxCounter() : Nat {
    OracleDataIdxCounter += 1;
    OracleDataIdxCounter
};

public query func getOracleDataRowCnt() : async Nat {
    OracleDataIdxCounter
};
  
  // YYYYMMDD
  transient var VerificationUnlockListDataP_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>>(Text.equal, Text.hash);

  private func addPEvent(ym : Text, ev : T.VerificationUnlockList){
    let cur = switch (VerificationUnlockListDataP_byYm.get(ym)) {
      case (?xs) xs;
      case null List.nil<T.VerificationUnlockList>();
    };
    VerificationUnlockListDataP_byYm.put(ym, List.push(ev, cur));
    ignore increaseOracleDataIdxCounter();
  };

  
  public query func getPEventsByYm(ym : Text) : async [T.VerificationUnlockList] {
    switch (VerificationUnlockListDataP_byYm.get(ym)) {
      case (?xs) List.toArray(xs);
      case null [];
    }
  };

  
  public query func getPCountByYm(ym : Text) : async Nat {
    switch (VerificationUnlockListDataP_byYm.get(ym)) {
      case (?xs) List.size(xs);
      case null 0;
    }
  };


  transient var VerificationUnlockListDataT_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>>(Text.equal, Text.hash);

  private func addTEvent(ym : Text, ev : T.VerificationUnlockList) {
    


    let cur = switch (VerificationUnlockListDataT_byYm.get(ym)) {
      case (?xs) xs;
      case null List.nil<T.VerificationUnlockList>();
    };
    VerificationUnlockListDataT_byYm.put(ym, List.push(ev, cur));
    ignore increaseOracleDataIdxCounter();
  };

  public query func getTEventsByYm(ym : Text) : async [T.VerificationUnlockList] {
    switch (VerificationUnlockListDataT_byYm.get(ym)) {
      case (?xs) List.toArray(xs);
      case null [];
    }
  };  

  public query func getTCountByYm(ym : Text) : async Nat {
    switch (VerificationUnlockListDataT_byYm.get(ym)) {
      case (?xs) List.size(xs);
      case null 0;
    }
  };  

  

  transient var VerificationUnlockListDataK_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>>(Text.equal, Text.hash);

    private func addKEvent(ym : Text, ev : T.VerificationUnlockList) {
      let cur = switch (VerificationUnlockListDataK_byYm.get(ym)) {
        case (?xs) xs;
        case null List.nil<T.VerificationUnlockList>();
      };
      VerificationUnlockListDataK_byYm.put(ym, List.push(ev, cur));
      ignore increaseOracleDataIdxCounter();
    };

    public query func getKEventsByYm(ym : Text) : async [T.VerificationUnlockList] {
      switch (VerificationUnlockListDataK_byYm.get(ym)) {
        case (?xs) List.toArray(xs);
        case null [];
      }
    };

    public query func getKCountByYm(ym : Text) : async Nat {
      switch (VerificationUnlockListDataK_byYm.get(ym)) {
        case (?xs) List.size(xs);
        case null 0;
      }
    };



private func addVerificationUnlockList(owner :Text, icp_year_month_p : Text, partner_idx_p : Nat, idx_p : Nat, unlock_date : Text, unlocked_at : Text, unlocked_ts : Nat64): async Text{

  
  //total unlockedAccumulatedData +1 
  //ignore await Oracle.incrementUnlockedAccumulated(1, owner);

  //ignore await Oracle.incrementMusicWorkInfoUnlockCount(idx_p, owner);
  
  if (partner_idx_p == 1) {
    //ignore await Oracle.incrementVerificationUnlockCount(partner_idx_p, idx_p, owner);

    addPEvent(icp_year_month_p, {
      icp_year_month = icp_year_month_p;
      partner_idx = partner_idx_p;
      idx = idx_p;
      unlock_date = unlock_date;
      unlocked_at = unlocked_at;
      unlocked_ts = unlocked_ts
    });
  } else {
    if (partner_idx_p == 2) {
     //ignore await Oracle.incrementVerificationUnlockCount(partner_idx_p, idx_p, owner);
       addTEvent(icp_year_month_p, {
      icp_year_month = icp_year_month_p;
      partner_idx = partner_idx_p;
      idx = idx_p;
      unlock_date = unlock_date;
      unlocked_at = unlocked_at;
      unlocked_ts = unlocked_ts
    });
    } else {
      if (partner_idx_p == 3) {
      //ignore await Oracle.incrementVerificationUnlockCount(partner_idx_p, idx_p, owner);
        addKEvent(icp_year_month_p, {
      icp_year_month = icp_year_month_p;
      partner_idx = partner_idx_p;
      idx = idx_p;
      unlock_date = unlock_date;
      unlocked_at = unlocked_at;
      unlocked_ts = unlocked_ts
    });
      };
    };
  };

    return "addVerificationUnlockList Success!";

};
    

public func addVerificationUnlockListData(owner :Text,  unlock_data : Text ): async Text {
  let authorized = canister_owner == ?owner;
    if (authorized) {
  let parsed = JSON.parse(unlock_data);
  switch (parsed) {
    case (#ok(jsonValue)) {
      switch (jsonValue) {
        case (#array(arr)) {
          for (item in arr.vals()) {
            switch (item) {
              case (#object_(_)) {
                 let icp_year_month : Text = switch (JSON.get(item, "icp_year_month")) {
                  case (? #string(t)) t;
                  case _ "";
                };
                let partner_idx_p : Nat = switch (JSON.get(item, "partner_idx")) {
                  case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                  case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 } };
                  case _ { 0 };
                };
                let idx_p : Nat = switch (JSON.get(item, "idx")) {
                  case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                  case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 } };
                  case _ { 0 };
                };
                let unlock_date : Text = switch (JSON.get(item, "unlock_date")) {
                  case (? #string(t)) t;
                  case _ "";
                };
                let unlocked_at : Text = switch (JSON.get(item, "unlocked_at")) {
                  case (? #string(t)) t;
                  case _ "";
                };
                let unlocked_ts : Nat64 = switch (JSON.get(item, "unlocked_ts")) {
                  case (? #number(#int n)) { if (n < 0) 0 : Nat64 else Nat64.fromNat(Int.abs(n)) };
                  case (? #string(t)) {
                    switch (Nat.fromText(t)) { case (?v) Nat64.fromNat(v); case null 0 : Nat64 };
                  };
                  case _ { 0 : Nat64 };
                };

                ignore addVerificationUnlockList(owner,icp_year_month, partner_idx_p, idx_p, unlock_date, unlocked_at, unlocked_ts);
              };
              case _ {};
            };
          };
        };
        case _ {};
      };
    };
    case (#err(_)) {
      return "JSON parse error";
    };
  };
    return "addVerificationUnlockListData Success!";

     }else {
        return "Not authorized: Canister owner does not match!";
     };

};

}