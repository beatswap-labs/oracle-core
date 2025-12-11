import Text "mo:base/Text";
import Nat "mo:base/Nat";
import List "mo:base/List";
import JSON "mo:json";
import Int "mo:base/Int";
import T "types";
import Nat64 "mo:base/Nat64";
import TrieMap "mo:base/TrieMap";



persistent actor OracleData2 {

  
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

 

var OracleDataIdxCounter : Nat = 0;

private func increaseOracleDataIdxCounter() : Nat {
    OracleDataIdxCounter += 1;
    OracleDataIdxCounter
};

public query func getOracleDataRowCnt2() : async Nat {
    OracleDataIdxCounter
};
  
  transient var VerificationUnlockListDataP_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>>(Text.equal, Text.hash);


  transient var VerificationUnlockListDataV2P_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockListV2>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockListV2>>(Text.equal, Text.hash);

  transient var VerificationUnlockListData_byUser
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockUserData>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockUserData>>(Text.equal, Text.hash);

  private func addUserEvent(principal : Text, ev : T.VerificationUnlockUserData){
      let cur = switch (VerificationUnlockListData_byUser.get(principal)) {
        case (?xs) xs;
        case null List.nil<T.VerificationUnlockUserData>();
    };
    VerificationUnlockListData_byUser.put(principal, List.push(ev, cur));
  };


  private func addPEvent(ym : Text, ev : T.VerificationUnlockList){
    let cur = switch (VerificationUnlockListDataP_byYm.get(ym)) {
      case (?xs) xs;
      case null List.nil<T.VerificationUnlockList>();
    };
    VerificationUnlockListDataP_byYm.put(ym, List.push(ev, cur));
    ignore increaseOracleDataIdxCounter();
  };

  private func addPEventV2(ym : Text, ev : T.VerificationUnlockListV2){
    let cur = switch (VerificationUnlockListDataV2P_byYm.get(ym)) {
      case (?xs) xs;
      case null List.nil<T.VerificationUnlockListV2>();
    };
    VerificationUnlockListDataV2P_byYm.put(ym, List.push(ev, cur));
    ignore increaseOracleDataIdxCounter();
  };

  
  public query func getPEventsByYm(ym : Text) : async [T.VerificationUnlockList] {
    switch (VerificationUnlockListDataP_byYm.get(ym)) {
      case (?xs) List.toArray(xs);
      case null [];
    }
  };

  public query func getPEventsV2ByYm(ym : Text) : async [T.VerificationUnlockListV2] {
    switch (VerificationUnlockListDataV2P_byYm.get(ym)) {
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

  public query func getPCountV2ByYm(ym : Text) : async Nat {
    switch (VerificationUnlockListDataV2P_byYm.get(ym)) {
      case (?xs) List.size(xs);
      case null 0;
    }
  };


  transient var VerificationUnlockListDataT_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>>(Text.equal, Text.hash);

  transient var VerificationUnlockListDataV2T_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockListV2>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockListV2>>(Text.equal, Text.hash);

  private func addTEvent(ym : Text, ev : T.VerificationUnlockList) {
    let cur = switch (VerificationUnlockListDataT_byYm.get(ym)) {
      case (?xs) xs;
      case null List.nil<T.VerificationUnlockList>();
    };
    VerificationUnlockListDataT_byYm.put(ym, List.push(ev, cur));
    ignore increaseOracleDataIdxCounter();
  };

  private func addTEventV2(ym : Text, ev : T.VerificationUnlockListV2) {
    let cur = switch (VerificationUnlockListDataV2T_byYm.get(ym)) {
      case (?xs) xs;
      case null List.nil<T.VerificationUnlockListV2>();
    };
    VerificationUnlockListDataV2T_byYm.put(ym, List.push(ev, cur));
    ignore increaseOracleDataIdxCounter();
  };

  public query func getTEventsByYm(ym : Text) : async [T.VerificationUnlockList] {
    switch (VerificationUnlockListDataT_byYm.get(ym)) {
      case (?xs) List.toArray(xs);
      case null [];
    }
  };  

  public query func getTEventsV2ByYm(ym : Text) : async [T.VerificationUnlockListV2] {
    switch (VerificationUnlockListDataV2T_byYm.get(ym)) {
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

  public query func getTCountV2ByYm(ym : Text) : async Nat {
    switch (VerificationUnlockListDataV2T_byYm.get(ym)) {
      case (?xs) List.size(xs);
      case null 0;
    }
  };  


  public query func getCountByUser(principal : Text) : async Nat {
    switch (VerificationUnlockListData_byUser.get(principal)) {
      case (?xs) List.size(xs);
      case null 0;
    }
  };  

  public query func getEventsByUser(principal : Text) : async [T.VerificationUnlockUserData] {
    switch (VerificationUnlockListData_byUser.get(principal)) {
      case (?xs) List.toArray(xs);
      case null [];
    }
  }; 

  transient var VerificationUnlockListDataK_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockList>>(Text.equal, Text.hash);

  transient var VerificationUnlockListDataV2K_byYm
    : TrieMap.TrieMap<Text, List.List<T.VerificationUnlockListV2>> =
      TrieMap.TrieMap<Text, List.List<T.VerificationUnlockListV2>>(Text.equal, Text.hash);

    private func addKEvent(ym : Text, ev : T.VerificationUnlockList) {
      let cur = switch (VerificationUnlockListDataK_byYm.get(ym)) {
        case (?xs) xs;
        case null List.nil<T.VerificationUnlockList>();
      };
      VerificationUnlockListDataK_byYm.put(ym, List.push(ev, cur));
      ignore increaseOracleDataIdxCounter();
    };

    private func addKEventV2(ym : Text, ev : T.VerificationUnlockListV2) {
      let cur = switch (VerificationUnlockListDataV2K_byYm.get(ym)) {
        case (?xs) xs;
        case null List.nil<T.VerificationUnlockListV2>();
      };
      VerificationUnlockListDataV2K_byYm.put(ym, List.push(ev, cur));
      ignore increaseOracleDataIdxCounter();
    };

    public query func getKEventsByYm(ym : Text) : async [T.VerificationUnlockList] {
      switch (VerificationUnlockListDataK_byYm.get(ym)) {
        case (?xs) List.toArray(xs);
        case null [];
      }
    };

    public query func getKEventsV2ByYm(ym : Text) : async [T.VerificationUnlockListV2] {
      switch (VerificationUnlockListDataV2K_byYm.get(ym)) {
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

    public query func getKCountV2ByYm(ym : Text) : async Nat {
      switch (VerificationUnlockListDataV2K_byYm.get(ym)) {
        case (?xs) List.size(xs);
        case null 0;
      }
    };


private func addVerificationUnlockList(owner :Text, icp_year_month_p : Text, partner_idx_p : Nat, idx_p : Nat, unlock_date : Text, unlocked_at : Text, unlocked_ts : Nat64): async Text{

  let authorized = canister_owner == ?owner;
    if (authorized) {
      if (partner_idx_p == 1) {

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
    } else {
        return "Not authorized: Canister owner does not match!";
    };

};

private func addVerificationUnlockListV2(owner :Text, icp_year_month_p : Text, partner_idx_p : Nat, idx_p : Nat, principal_p: Text, unlock_date : Text, unlocked_at : Text, unlocked_ts : Nat64): async Text{
  let authorized = canister_owner == ?owner;
    if (authorized) {
        if (partner_idx_p == 1) {
            addPEventV2(icp_year_month_p, {
              icp_year_month = icp_year_month_p;
              partner_idx = partner_idx_p;
              idx = idx_p;
              principal= principal_p;
              unlock_date = unlock_date;
              unlocked_at = unlocked_at;
              unlocked_ts = unlocked_ts
            });
            addUserEvent(principal_p, {
              partner_idx = partner_idx_p;
              idx = idx_p;
              principal= principal_p;
              unlock_date = unlock_date;
            });
        } else {
          if (partner_idx_p == 2) {
            addTEventV2(icp_year_month_p, {
              icp_year_month = icp_year_month_p;
              partner_idx = partner_idx_p;
              idx = idx_p;
              principal= principal_p;
              unlock_date = unlock_date;
              unlocked_at = unlocked_at;
              unlocked_ts = unlocked_ts
            });
            addUserEvent(principal_p, {
              partner_idx = partner_idx_p;
              idx = idx_p;
              principal= principal_p;
              unlock_date = unlock_date;
            });
          } else {
            if (partner_idx_p == 3) {
              addKEventV2(icp_year_month_p, {
                icp_year_month = icp_year_month_p;
                partner_idx = partner_idx_p;
                idx = idx_p;
                principal= principal_p;
                unlock_date = unlock_date;
                unlocked_at = unlocked_at;
                unlocked_ts = unlocked_ts
              });
              addUserEvent(principal_p, {
              partner_idx = partner_idx_p;
              idx = idx_p;
              principal= principal_p;
              unlock_date = unlock_date;
              });
            };
          };
        };

          return "addVerificationUnlockListV2 Success!";
    } else {
        return "Not authorized: Canister owner does not match!";
    };

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

public func addVerificationUnlockListDataV2(owner :Text,  unlock_data : Text ): async Text {
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
                let principal_p : Text = switch (JSON.get(item, "principal")) {
                  case (? #string(t)) t;
                  case _ "";
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

                ignore addVerificationUnlockListV2(owner,icp_year_month, partner_idx_p, idx_p, principal_p,unlock_date, unlocked_at, unlocked_ts);
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