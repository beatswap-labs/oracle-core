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
    
    public func addDailyMemberSnap(owner : Text,snap_date : Text,member_count : Nat) : async Bool {
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
            false
        } else {
            
            DailyMemberSnapData := List.push({ snap_date; member_count }, DailyMemberSnapData);
            true
        }
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
            false
        } else {
            
            DailyTransactionSnapData := List.push({ snap_date; transaction_count }, DailyTransactionSnapData);
            true
        }
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
            false
        } else {
            
            DailyRoyaltySnapData := List.push({ snap_date; total_royalty }, DailyRoyaltySnapData);
            true
        }
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


