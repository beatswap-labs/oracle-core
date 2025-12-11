import Text "mo:base/Text";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import T "types";


persistent actor MemberCanister {

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


    //member count
    var MemberIdxCounter : Nat = 0;

    //count++
    private func increaseMemberIdxCounter() : Nat {
        MemberIdxCounter += 1;
        MemberIdxCounter
    };

    public query func getMemberRowCnt() : async Nat {
        MemberIdxCounter
    };

    //member info
    var MemberData : List.List<T.Member> = List.nil();

    public func addMember( owner : Text , m : T.Member) :async Nat {
        let authorized = canister_owner == ?owner;

        //check owner
        if (not authorized) {
            Debug.print("Only owner can add member");
            return 0;
        };

        let exists = List.find<T.Member>(MemberData, func (ml: T.Member) : Bool {
            ml.principle == m.principle
        });

        if (exists != null) {
            return 0; 
        };
        
        
        let newMember : T.Member = {
            idx = increaseMemberIdxCounter();
            partner_idx = m.partner_idx;
            user= m.user;
            principle = m.principle;
            created_at = m.created_at;
        };
        
        //
        let existing = List.find<T.Member>(MemberData, func (mem : T.Member) : Bool {
            mem.partner_idx == newMember.partner_idx and mem.user == newMember.user
        });
        if (existing != null) {
            Debug.print("Member already exists with the same partner_idx and user");
            return 0;
        };
        MemberData := List.push(newMember, MemberData);
        return 1;
    };

    public func addMembers(owner : Text, members : [T.Member]) : async Nat {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can add members");
            return 0;
        };
        var addedCount : Nat = 0;
        for (m in members.vals()) {
            let res = await addMember(owner, m);
            if (res == 1) {
                addedCount += 1;
            };
        };
        addedCount
    };

    private func sliceMembers(l : List.List<T.Member>, start : Nat, end : Nat) : List.List<T.Member> {
        func aux(current : List.List<T.Member>, i : Nat, acc : List.List<T.Member>) : List.List<T.Member> {
            switch (current) {
                case null { List.reverse(acc) };
                case (? (head, tail)) {
                    if (i >= end) {
                        List.reverse(acc)
                    } else if (i < start) {
                        aux(tail, i + 1, acc)
                    } else {
                        aux(tail, i + 1, List.push(head, acc))
                    }
                }
            }
        };
        aux(l, 0, List.nil())
    };

    public func getAllMembers(owner : Text,start : Nat , end : Nat) : async [T.Member] {
        let authorized = canister_owner == ?owner;
        //check owner
        if (not authorized) {
            Debug.print("Only owner can get all members");
            return [];
        };
        let total = List.size(MemberData);
        if (start >= total or end > total or start >= end) {
            Debug.print("Invalid start or end parameters");
            return [];
        };
        let slice = sliceMembers(MemberData, start, end);
        List.toArray(slice)
    };

    //idx search
    public query func getMemberByIdx(idx : Nat) : async ?T.Member {
        List.find<T.Member>(MemberData, func (m : T.Member) : Bool { m.idx == idx })
    };

    //principal search
    public query func getMemberByPrinciple(principle : Text) : async ?T.Member {
    List.find<T.Member>(MemberData, func (m : T.Member) : Bool { m.principle == principle })
    };
    

    public query func getMembersByPrincipleList(principle : Text) : async [T.Member] {
        List.toArray(
            List.filter<T.Member>(
                MemberData,
                func (m : T.Member) : Bool { m.principle == principle }
            )
        )
    };

    public func updatePrincipal(owner :? Text ,info : T.Member) : async Text {
        // check owner
        if (canister_owner == owner) {
        MemberData := List.map(MemberData, func (m : T.Member) : T.Member {
            if ( m.user == info.user) {
                info
            } else {
                m
            }
        });
        return "principal updated!";
        } else {
        return "Unauthorized access attempt";
        }
    };

    //partnerIdx+id search
    public query func getMemberByPartnerIdxAndUser(partner_idx : Nat, user : Text) : async ?T.Member {
    List.find<T.Member>(MemberData, func (m : T.Member) : Bool {
        m.partner_idx == partner_idx and m.user == user
    })
    };

    //partner_idx search
    public query func getMemberByPartnerIdx(owner: Text, partner_idx: Nat) : async [T.Member] {
        let authorized = canister_owner == ?owner;
        // check owner
        if (not authorized) {
            Debug.print("Only owner can get all members");
            return [];
        };

        let filtered = List.filter<T.Member>(
            MemberData,
            func (m: T.Member): Bool { m.partner_idx == partner_idx }
        );

        return List.toArray(filtered);
    };

    public query func getMemberCountByPartnerIdx(partner_idx: Nat) : async Nat {
        let filtered = List.filter<T.Member>(
            MemberData,
            func (m: T.Member): Bool { m.partner_idx == partner_idx }
        );

        return List.size(filtered);
    };





}    