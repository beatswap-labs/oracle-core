import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import T "types";
import TrieMap "mo:base/TrieMap"; 
import Buffer "mo:base/Buffer";   
import Iter "mo:base/Iter";



persistent actor UserUnlockCanister {


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


    
   var UserUnlockIdxCounter : Nat = 0;

    private func increaseUserUnlockIdxCounter() : Nat {
        UserUnlockIdxCounter += 1;
        UserUnlockIdxCounter
    };

    public query func getUserUnlockRowCnt() : async Nat {
        UserUnlockIdxCounter
    };


    transient var MemberUnlockByKey : TrieMap.TrieMap<Text, Buffer.Buffer<T.MemberUnlockDate>> =
      TrieMap.TrieMap<Text, Buffer.Buffer<T.MemberUnlockDate>>(Text.equal, Text.hash);

    private func ensureMemberBuf(key : Text) : Buffer.Buffer<T.MemberUnlockDate> {
        switch (MemberUnlockByKey.get(key)) {
            case (?buf) buf;
            case null {
                let buf = Buffer.Buffer<T.MemberUnlockDate>(100);
                MemberUnlockByKey.put(key, buf);
                buf
            }
        }
    };

    public func addMemberUnlock(owner : Text, key : Text, mu : T.MemberUnlockDate) :async Nat {
        let authorized = canister_owner == ?owner;

        if (not authorized) {
            Debug.print("Only owner can add member unlock data");
            return 0;
        };
        
        let buf = ensureMemberBuf(key);
        buf.add({
            principle = mu.principle;
            unlock_idxs = increaseUserUnlockIdxCounter(); 
        });
        buf.size()
    };

    public query func getMemberUnlockByKey(key : Text) : async [T.MemberUnlockDate] {
        switch (MemberUnlockByKey.get(key)) {
            case (?buf) Buffer.toArray(buf);
            case null [];
        }
    };

    public query func getMemberUnlockCountByKey(key : Text) : async Nat {
        switch (MemberUnlockByKey.get(key)) {
            case (?buf) buf.size();
            case null 0;
        }
    };

    public query func getAllMemberUnlockKeys() : async [Text] {
      Iter.toArray(MemberUnlockByKey.keys())   // ← Iter<Text> → [Text]
    };

}