import T "types";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool"; 



persistent actor DailyMemberSnap{
  
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



    //Member Snapshot Data
    var DailyMemberSnapData : List.List<T.DailyMemberSnap> = List.nil();


    //Transaction Snapshot Data
    var DailyTransactionSnapData : List.List<T.DailyTransactionSnap> = List.nil();


    //Royalty Snapshot Data
    var DailyRoyaltySnapData : List.List<T.DailyRoyaltySnap> = List.nil();

    //IPL Snapshot
    var MonthlyIPLSnapData : List.List<T.MonthlyIPLSnap> = List.nil();

    //IPL Snapshot
    var MonthlyIPLSnapDataV2 : List.List<T.MonthlyIPLSnapV2> = List.nil();

    var snap_lastindex : Nat = 0;

    public func setSnapLastIndex(owner: Text, newIndex : Nat) : async Bool {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can set snap last index");
            return false;
        };
        snap_lastindex := newIndex;
        true
    };

    public query func getSnapLastIndex() : async Nat {
        snap_lastindex
    };

    public func addDailyMemberSnap(owner : Text, snap_date : Text, member_count : Nat) : async Bool {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can add daily member snap data");
            return false;
        };
      

        //check date
        let existing = List.find<T.DailyMemberSnap>(DailyMemberSnapData, func (dms : T.DailyMemberSnap) : Bool {
            dms.snap_date == snap_date
        });
        if (existing != null) {
            DailyMemberSnapData := List.map<T.DailyMemberSnap, T.DailyMemberSnap>(
                DailyMemberSnapData,
                func(dms: T.DailyMemberSnap): T.DailyMemberSnap {
                    if (dms.snap_date == snap_date) {
                        { snap_date = dms.snap_date; member_count = member_count };
                    } else {
                        dms
                    }
                }
            );
            Debug.print("Updated existing daily member snap");
            true
        } else {
            // 없으면 새로 추가
            DailyMemberSnapData := List.push({ snap_date; member_count }, DailyMemberSnapData);
            Debug.print("Added new daily member snap");
            true
        };
    };

    //daily transaction snapshot
    public func addDailyTransactionSnap(owner : Text,snap_date : Text, transaction_count : Nat) : async Bool {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can add daily member snap data");
            return false;
        };
        let existing = List.find<T.DailyTransactionSnap>(DailyTransactionSnapData, func (dms : T.DailyTransactionSnap) : Bool {
            dms.snap_date == snap_date
        });
        //check owner
        if (existing != null) {
            DailyTransactionSnapData := List.map<T.DailyTransactionSnap, T.DailyTransactionSnap>(
                DailyTransactionSnapData,
                func(dms: T.DailyTransactionSnap): T.DailyTransactionSnap {
                    if (dms.snap_date == snap_date) {
                        { snap_date = dms.snap_date; transaction_count = transaction_count };
                    } else {
                        dms
                    }
                }
            );
            Debug.print("Updated existing daily transaction snap");
            true
        } else {
            // 없으면 새로 추가
            DailyTransactionSnapData := List.push({ snap_date; transaction_count }, DailyTransactionSnapData);
            Debug.print("Added new daily transaction snap");
            true
        };
    };

    //daily royalty snapshot
    public func addDailyRoyaltySnap(owner : Text,snap_date : Text,total_royalty : Nat) : async Bool {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can add daily member snap data");
            return false;
        };
        //check date
        let existing = List.find<T.DailyRoyaltySnap>(DailyRoyaltySnapData, func (dms : T.DailyRoyaltySnap) : Bool {
            dms.snap_date == snap_date
        });
        if (existing != null) {
            DailyRoyaltySnapData := List.map<T.DailyRoyaltySnap, T.DailyRoyaltySnap>(
                DailyRoyaltySnapData,
                func(dms: T.DailyRoyaltySnap): T.DailyRoyaltySnap {
                    if (dms.snap_date == snap_date) {
                        { snap_date = dms.snap_date; total_royalty = total_royalty };
                    } else {
                        dms
                    }
                }
            );
            Debug.print("Updated existing daily royalty snap");
            true
        } else {
            // 없으면 새로 추가
            DailyRoyaltySnapData := List.push({ snap_date; total_royalty }, DailyRoyaltySnapData);
            Debug.print("Added new daily royalty snap");
            true
        };
    };
    
    //monthly IPL snapshot
    public func addMonthlyIPLSnap(owner : Text, snap_date : Text, snap_principal: Text, snap_idx: Nat) : async Bool {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can add monthly IPL snap data");
            return false;
        };
        //check month
        let existing = List.find<T.MonthlyIPLSnap>(MonthlyIPLSnapData, func (mipl : T.MonthlyIPLSnap) : Bool {
            mipl.snap_date == snap_date and mipl.snap_principal == snap_principal
        });
        if (existing != null) {
            MonthlyIPLSnapData := List.map<T.MonthlyIPLSnap, T.MonthlyIPLSnap>(
                MonthlyIPLSnapData,
                func(mipl: T.MonthlyIPLSnap): T.MonthlyIPLSnap {
                    if (mipl.snap_date == snap_date and mipl.snap_principal == snap_principal) {
                        { snap_date = mipl.snap_date; snap_principal = mipl.snap_principal; snap_idx = snap_idx; };
                    } else {
                        mipl
                    }
                }

            );
            Debug.print("Updated existing daily royalty snap");
            true
        } else {
            // 없으면 새로 추가
            MonthlyIPLSnapData := List.push({ snap_date; snap_principal; snap_idx;}, MonthlyIPLSnapData);
            Debug.print("Added new daily royalty snap");
            true
        };
    };

    
    public query func getDailyMemberSnap(snap_date : Text) : async ?T.DailyMemberSnap {
        List.find<T.DailyMemberSnap>(DailyMemberSnapData, func (dms : T.DailyMemberSnap) : Bool {
            dms.snap_date == snap_date
        })
    };

    public query func getDailyTransactionSnap(snap_date : Text) : async ?T.DailyTransactionSnap {
        List.find<T.DailyTransactionSnap>(DailyTransactionSnapData, func (dms : T.DailyTransactionSnap) : Bool {
            dms.snap_date == snap_date
        })
    };

    public query func getDailyRoyaltySnap(snap_date : Text) : async ?T.DailyRoyaltySnap {
        List.find<T.DailyRoyaltySnap>(DailyRoyaltySnapData, func (dms : T.DailyRoyaltySnap) : Bool {
            dms.snap_date == snap_date
        })
    };

    //prefix comparison
    func startsWith(txt : Text, prefix : Text) : Bool {
      if (Text.size(prefix) > Text.size(txt)) return false;
      var tIter = txt.chars();
      for (pc in prefix.chars()) {
        switch (tIter.next()) {
          case (?tc) { if (tc != pc) return false };
          case null return false;
        }
      };
      true
    };

     public query func getMonthlyMemberSnapsArr(month : Text) : async [T.DailyMemberSnap] {
      let filtered = List.filter<T.DailyMemberSnap>(
        DailyMemberSnapData,
        func (dms : T.DailyMemberSnap) : Bool {
          startsWith(dms.snap_date, month)
        }
      );
      List.toArray(filtered)
    };

    public query func getMonthlyTransactionSnapsArr(month : Text) : async [T.DailyTransactionSnap] {
      let filtered = List.filter<T.DailyTransactionSnap>(
        DailyTransactionSnapData,
        func (dms : T.DailyTransactionSnap) : Bool {
          startsWith(dms.snap_date, month)
        }
      );
      List.toArray(filtered)
    };

    public query func getMonthlyRoyaltySnapsArr(month : Text) : async [T.DailyRoyaltySnap] {
      let filtered = List.filter<T.DailyRoyaltySnap>(
        DailyRoyaltySnapData,
        func (dms : T.DailyRoyaltySnap) : Bool {
          startsWith(dms.snap_date, month)
        }
      );
      List.toArray(filtered)
    };

    public query func getMonthlyIPLSnapsArr(snap_principal : Text) : async [T.MonthlyIPLSnap] {
      let filtered = List.filter<T.MonthlyIPLSnap>(
        MonthlyIPLSnapData,
        func (mipl : T.MonthlyIPLSnap) : Bool {
          mipl.snap_principal == snap_principal
        }
      );
      List.toArray(filtered)
    };

    public query func getMonthlyIPLSnapsArrV2(snap_principal : Text) : async [T.MonthlyIPLSnapV2] {
      let filtered = List.filter<T.MonthlyIPLSnapV2>(
        MonthlyIPLSnapDataV2,
        func (mipl : T.MonthlyIPLSnapV2) : Bool {
          mipl.snap_principal == snap_principal
        }
      );
      List.toArray(filtered)
    };

    // monthly member total
    public query func getMonthlyMemberSnapsWithTotal(month : Text)
      : async { snaps : [T.DailyMemberSnap]; total : Nat } {

      let filtered = List.filter<T.DailyMemberSnap>(
        DailyMemberSnapData,
        func (dms : T.DailyMemberSnap) : Bool {
          startsWith(dms.snap_date, month)
        }
      );

      let total = List.foldLeft<T.DailyMemberSnap, Nat>(
        filtered,
        0,
        func (acc : Nat, d : T.DailyMemberSnap) : Nat { acc + d.member_count }
      );

      {
        snaps = List.toArray(filtered);
        total
      }
    };

    // monthly transaction total
    public query func getMonthlyTransactionSnapsWithTotal(month : Text)
      : async { snaps : [T.DailyTransactionSnap]; total : Nat } {

      let filtered = List.filter<T.DailyTransactionSnap>(
        DailyTransactionSnapData,
        func (dms : T.DailyTransactionSnap) : Bool {
          startsWith(dms.snap_date, month)
        }
      );

      let total = List.foldLeft<T.DailyTransactionSnap, Nat>(
        filtered,
        0,
        func (acc : Nat, d : T.DailyTransactionSnap) : Nat { acc + d.transaction_count }
      );

      {
        snaps = List.toArray(filtered);
        total
      }
    };

    // monthly royalty total
    public query func getMonthlyRoyaltySnapsWithTotal(month : Text)
      : async { snaps : [T.DailyRoyaltySnap]; total : Nat } {

      let filtered = List.filter<T.DailyRoyaltySnap>(
        DailyRoyaltySnapData,
        func (dms : T.DailyRoyaltySnap) : Bool {
          startsWith(dms.snap_date, month)
        }
      );

      let total = List.foldLeft<T.DailyRoyaltySnap, Nat>(
        filtered,
        0,
        func (acc : Nat, d : T.DailyRoyaltySnap) : Nat { acc + d.total_royalty }
      );

      {
        snaps = List.toArray(filtered);
        total
      }
    };

}


