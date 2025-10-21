import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import T "types";
import TrieMap "mo:base/TrieMap";
import Buffer "mo:base/Buffer";

persistent actor PlayData {

    
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

    var PlayDataIdxCounter : Nat = 0;

    private func increasePlayDataIdxCounter() : Nat {
        PlayDataIdxCounter += 1;
        PlayDataIdxCounter
    };

    public query func getPlayDataRowCnt() : async Nat {
        PlayDataIdxCounter
    };




    transient var PlayDataByYmd
      : TrieMap.TrieMap<Text, Buffer.Buffer<T.UserPlayData>> =
        TrieMap.TrieMap<Text, Buffer.Buffer<T.UserPlayData>>(Text.equal, Text.hash);


    private func ensureDayBuf(ymd : Text) : Buffer.Buffer<T.UserPlayData> {
      switch (PlayDataByYmd.get(ymd)) {
        case (?b) b;
        case null {
          let nb = Buffer.Buffer<T.UserPlayData>(1024);
          PlayDataByYmd.put(ymd, nb);
          nb        
        }
      }
    };

    private func toYMD(date : Text) : Text {
      var out : Text = "";
      var count : Nat = 0;
      for (c in date.chars()) {
        if (c >= '0' and c <= '9') {
          if (count < 8) {
            out #= Text.fromChar(c);
            count += 1;
          };
        };
      };
      out
    };

    public func addUserPlayData(owner : Text , p : T.UserPlayData) : async Bool {
      let authorized = canister_owner == ?owner;
      if (not authorized) { return false; };      


      let ymd = toYMD(p.play_at);
      let buf = ensureDayBuf(ymd);
      buf.add(p);
      let count =increasePlayDataIdxCounter();
      true
    };

    public query func getUserPlayDataCountByYMD(ymd : Text) : async Nat {
      switch (PlayDataByYmd.get(ymd)) {
        case (?b) b.size();
        case null 0;
      };
    };
    
    public query func getUserPlayDataByYMD(ymd : Text) : async [T.UserPlayData] {
      switch (PlayDataByYmd.get(ymd)) {
        case (?buf) Buffer.toArray(buf);
        case null []
      }
    };


}    