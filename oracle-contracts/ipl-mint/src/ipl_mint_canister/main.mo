import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text = "mo:base/Text";

persistent actor {

  // ICRC-1 Ledger Type
  public type Account = { owner : Principal; subaccount : ?Blob };

  public type MintArgs = {
    to              : Account;
    amount          : Nat;
    memo            : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferError = {
    #BadFee : { expected_fee : Nat };
    #InsufficientFunds : { balance : Nat };
    #GenericError : { error_code : Nat; message : Text };
    #TemporarilyUnavailable;
    #TooOld;
    #Duplicate : { duplicate_of : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #BadBurn : { min_burn_amount : Nat };
  };

  public type MintResult = { #Ok : Nat } or { #Err : TransferError };

  public type Ledger = actor {
    icrc1_transfer : shared (MintArgs) -> async MintResult;
    icrc1_balance_of : shared (Account) -> async Nat;
  };

  // ledger canister ID 
  transient let LEDGER_ID = "eb7hz-ryaaa-aaaae-ab2iq-cai"; // main net
  transient let ledger : Ledger = actor(LEDGER_ID);

  var canister_owner  :? Text = null;

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

  /// mint API
  public shared ({ caller }) func mintForUser(owner_id:Text, to_principal : Principal, amount : Nat, memo: ?Blob, created_at_time: ?Nat64) : async Text {
    if (canister_owner != ?owner_id) {
      return "Unauthorized access attempt";
    };

    Debug.print("Mint request by " # Principal.toText(caller));

    let toAccount : Account = { owner = to_principal; subaccount = null };

    let args : MintArgs = {
      to = toAccount;
      amount = amount;
      memo = memo;
      created_at_time = created_at_time;
    };

    let result = await ledger.icrc1_transfer(args);

    switch (result) {
      case (#Ok(idx)) {
        let msg = "Mint success, tx index = " # Nat.toText(idx);
        Debug.print(msg);
        msg
      };
      case (#Err(err)) {
        let msg = "Mint failed: " # debug_show(err);
        Debug.print(msg);
        msg
      };
    }
  };
}
