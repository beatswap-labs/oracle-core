import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import List "mo:base/List";
import JSON "mo:json";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Int "mo:base/Int";
import T "types";
import Nat64 "mo:base/Nat64";

persistent actor Oracle {


  //unlockCount for partner
  var VerificationUnlockCountDataP : List.List<T.VerificationUnlockCount> = List.nil();
  var VerificationUnlockCountDataT : List.List<T.VerificationUnlockCount> = List.nil();
  var VerificationUnlockCountDataK : List.List<T.VerificationUnlockCount> = List.nil();

  
  //unlockCount ++
  public func incrementVerificationUnlockCount(partner_idx : Nat, idx_p : Nat, owner : Text) : async Text {
    let authorized = canister_owner == ?owner;
    
    if (not authorized) {
      return "Unauthorized access attempt";
    };


    if (partner_idx == 1) {
       VerificationUnlockCountDataP := List.map(VerificationUnlockCountDataP, func (m : T.VerificationUnlockCount) : T.VerificationUnlockCount {
                        if (m.idx == idx_p) {
                          { m with unlock_count = m.unlock_count + 1 }
                        } else {
                          m
                        }
                      });
      return "Paykhan unlock count incremented";
    } else if (partner_idx == 2) {
        VerificationUnlockCountDataT := List.map(VerificationUnlockCountDataT, func (m : T.VerificationUnlockCount) : T.VerificationUnlockCount {
                        if (m.idx == idx_p) {
                          { m with unlock_count = m.unlock_count + 1 }
                        } else {
                          m
                        }
                      });
      return "Tune unlock count incremented";
    } else if (partner_idx == 3) {
      VerificationUnlockCountDataK := List.map(VerificationUnlockCountDataK, func (m : T.VerificationUnlockCount) : T.VerificationUnlockCount {
                        if (m.idx == idx_p) {
                          { m with unlock_count = m.unlock_count + 1 }
                        } else {
                          m
                        }
                      });
      return "Kaia unlock count incremented";
    } else {
      return "Invalid partner index";
    }
  };

  //total unlock Data
  var unlockedAccumulatedData : T.UnlockedAccumulated = { unlocked_acc = 0 : Nat64 };

  public func updateUnlockedAccumulated(owner : Text ,newCount : Nat64 ) : async Text {
    let authorized = canister_owner == ?owner;
    if (authorized) {
      unlockedAccumulatedData := { unlocked_acc = newCount };
      return "Unlocked accumulated count updated";
    } else {
      return "Unauthorized access attempt";
    }
  };
  
  public query func getUnlockedAccumulated() : async Nat64 {
    return unlockedAccumulatedData.unlocked_acc;
  };

  public func incrementUnlockedAccumulated(by : Nat64,owner :Text) : async Nat64 {

    let authorized = canister_owner == ?owner;
    if (authorized) {
    unlockedAccumulatedData := { unlocked_acc = unlockedAccumulatedData.unlocked_acc + by };
    return unlockedAccumulatedData.unlocked_acc;
    }else{
      return 0;
    }
  };

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


  public query (message) func whoami() : async Principal {
    let caller : Principal = message.caller;
    //Debug.print("Caller: " # Principal.toText(caller));
    return caller;
  };

  //music info data
  var MusicWorkInfoData : List.List<T.MusicWorkInfo> = List.nil();
  var MusicVideoInfoData : List.List<T.MusicVideoInfo> = List.nil();
  var WebDramaInfoData : List.List<T.WebDramaInfo> = List.nil();


  //music unlock increase
  public func incrementMusicWorkInfoUnlockCount(idx_p : Nat, owner : Text) : async Text {
    let authorized = canister_owner == ?owner;
    if (not authorized) {
      return "Unauthorized access attempt";
    };

    MusicWorkInfoData := List.map(MusicWorkInfoData, func (m : T.MusicWorkInfo) : T.MusicWorkInfo {
      if (m.idx == idx_p) {
        { m with unlock_total_count = m.unlock_total_count + 1 }
      } else {
        m
      }
    });
    return "Music work info unlock count incremented";
  };
  
  



  public func addMusicWorkInfo(owner :? Text ,info : T.MusicWorkInfo) : async () {
    //check owner
  if (canister_owner == owner) { // owner must be wrapped to match optional type
    var replaced = false;
    MusicWorkInfoData := List.map(MusicWorkInfoData, func (mw : T.MusicWorkInfo) : T.MusicWorkInfo {
      if (mw.idx == info.idx) {
        replaced := true;
        info
      } else {
        mw
      }
    });
    if (not replaced) {
      VerificationUnlockCountDataP := List.push({partner_idx = 1; idx = info.idx; unlock_count = 0}, VerificationUnlockCountDataP);
      VerificationUnlockCountDataT := List.push({partner_idx = 2; idx = info.idx; unlock_count = 0}, VerificationUnlockCountDataT);
      VerificationUnlockCountDataK := List.push({partner_idx = 3; idx = info.idx; unlock_count = 0}, VerificationUnlockCountDataK);

      MusicWorkInfoData := List.push(info, MusicWorkInfoData);
    };
  }else{

  }
  };

  public func addMusicVideoInfo(owner : ?Text, info : T.MusicVideoInfo) : async Text {
    if (canister_owner != owner) {
      return "Unauthorized access attempt";
    };

    var replaced = false;
    MusicVideoInfoData := List.map(MusicVideoInfoData, func (mv : T.MusicVideoInfo) : T.MusicVideoInfo {
      if (mv.idx == info.idx) {
        replaced := true;
        info
      } else {
        mv
      }
    });

    if (not replaced) {
      MusicVideoInfoData := List.push(info, MusicVideoInfoData);
      return "Music video info added";
    } else {
      return "Music video info updated";
    }
  };

  public func addWebDramaInfo(owner : ?Text, info : T.WebDramaInfo) : async Text {
    if (canister_owner != owner) {
      return "Unauthorized access attempt";
    };

    var replaced = false;
    WebDramaInfoData := List.map(WebDramaInfoData, func (wd : T.WebDramaInfo) : T.WebDramaInfo {
      if (wd.idx == info.idx) {
        replaced := true;
        info
      } else {
        wd
      }
    });

    if (not replaced) {
      WebDramaInfoData := List.push(info, WebDramaInfoData);
      return "Web drama info added";
    } else {
      return "Web drama info updated";
    }
  };
  


 // update music info
  public func updateMusicWorkInfo(owner :? Text ,info : T.MusicWorkInfo) : async Text {
    // check owner
    if (canister_owner == owner) {
      MusicWorkInfoData := List.map(MusicWorkInfoData, func (mw : T.MusicWorkInfo) : T.MusicWorkInfo {
        if (mw.idx == info.idx) {
          info
        } else {
          mw
        }
      });
      return "Music work info updated";
    } else {
      return "Unauthorized access attempt";
    }
  };

  // delete music
  public func deleteMusicWorkInfo(owner :? Text ,idx : Nat) : async Text {
    // check owner
    if (canister_owner == owner) {
      MusicWorkInfoData := List.filter<T.MusicWorkInfo>(MusicWorkInfoData, func (mw : T.MusicWorkInfo) : Bool {
        mw.idx != idx
      });
      return "Music work info deleted";
    } else {
      return "Unauthorized access attempt";
    }
  };


   public query func getMusicWorkInfos() : async [T.MusicWorkInfoView] {
    // let transformed = List.map(MusicWorkInfoData, func (mw : T.MusicWorkInfo) : T.MusicWorkInfo {
    //   { mw with title = Text.replace(mw.title, #text "_", " ") }
    // });
    let filtered = List.filter<T.MusicWorkInfoView>(MusicWorkInfoData, func (mw : T.MusicWorkInfoView) : Bool {
      mw.verification_status == "show"
    });
    return List.toArray(filtered);
  };

  public query func getMusicVideoByOwner(owner : Text) : async [T.MusicVideoInfo] {
    //check owner
    if (canister_owner == ?owner) {
    return List.toArray(MusicVideoInfoData);
    }else{
      return [];
    }
  };

  public query func getWebDramaByOwner(owner : Text) : async [T.WebDramaInfo] {
    //check owner
    if (canister_owner == ?owner) {
    return List.toArray(WebDramaInfoData);
    }else{
      return [];
    }
  };

   public query func getMusicWorkInfosByOwner(owner : Text) : async [T.MusicWorkInfo] {
    //check owner
    if (canister_owner == ?owner) {
    let filtered = List.filter<T.MusicWorkInfo>(MusicWorkInfoData, func (mw : T.MusicWorkInfo) : Bool {
      mw.verification_status == "show"
    });
    return List.toArray(filtered);
    }else{
      return [];
    }
  };



  // search genre
  public query func getMusicWorkInfosByGenre(genre : Nat) : async [T.MusicWorkInfoView] {
    let filtered = List.filter<T.MusicWorkInfoView>(MusicWorkInfoData, func (mw : T.MusicWorkInfoView) : Bool {
      mw.genre_idx == genre
    });
    return List.toArray(filtered);
  };


 // genre filter
  public query func getMusicWorkInfosByGenreOwner(genre : Nat, owner : Text) : async [T.MusicWorkInfo] {
    //check owner
    if (canister_owner == ?owner) {
      let filtered = List.filter<T.MusicWorkInfo>(MusicWorkInfoData, func (mw : T.MusicWorkInfo) : Bool {
        mw.genre_idx == genre
        
      });
      return List.toArray(filtered);
    } else {
      return [];
    }
  };

  public query func getMusicContractAddress() : async Text {
    // MusicWorkInfoData Json parse [{"idx":1, "contract":"0x..."}, ...]
    let infos = List.toArray(MusicWorkInfoData);
    var json : Text = "[";
    var first : Bool = true;
    var i = 0;
    let len = infos.size();
    while (i < len) {
      let info = infos[i];
      let item = "{ \"idx\": " # Nat.toText(info.idx) # ", \"contract\": \"" # info.op_neighboring_token_address # "\" }";
      if (first) {
        json := json # item;
        first := false;
      } else {
        json := json # "," # item;
      };
      i += 1;
    };
    json := json # "]";
    return json;
    };


var genreData : List.List<T.GenreId> = List.nil();

// add genre
public func addGenre(owner : Text, genre_idx : Nat, genre_name : Text) : async Text {
  if (canister_owner == ?owner) {
    genreData := List.push({genre_idx = genre_idx; genre_name = genre_name}, genreData);
    return "Genre added successfully";
  } else {
    return "Unauthorized access attempt";
  }
};

public query func getGenres() : async [T.GenreId] {
return List.toArray(genreData);
};

// update genre
public func updateGenreName(owner : Text, genre_idx_target : Nat, new_name : Text) : async Text {
  if (canister_owner == ?owner) {
    genreData := List.map(genreData, func (g : T.GenreId) : T.GenreId {
      if (g.genre_idx == genre_idx_target) {
        { genre_idx = g.genre_idx; genre_name = new_name }
      } else {
        g
      }
    });
    return "Genre name updated";
  } else {
    return "Unauthorized access attempt";
  }
};

var requesterIdData : List.List<T.Requester> = List.nil();

public query func getRequesterIds() : async [{ requester_name : Text; can_approve : Bool }] {
  let projected = List.map(requesterIdData, func (r : T.Requester) : { requester_name : Text; can_approve : Bool } {
    { requester_name = r.requester_name; can_approve = r.can_approve }
  });
  return List.toArray(projected);
};


public func addRequesterId(requester_principal_p : Text,requester_name_p : Text,can_approve_p : Bool) : async Text {
requesterIdData := List.push({requester_principal = requester_principal_p; requester_name = requester_name_p; can_approve = can_approve_p}, requesterIdData);
return "Requester added successfully";
};


var Partner : List.List<T.Partner> = List.nil();

public query func getPartners() : async [T.Partner] {
return List.toArray(Partner);
};


// add partner
public func addPartner(owner :Text,partner_idx_p : Nat, partner_name_p : Text) : async Text {
  if (canister_owner == ?owner) {
    Partner := List.push({partner_idx = partner_idx_p; partner_name = partner_name_p}, Partner);
    return "Partner added successfully";
  } else {
    return "Unauthorized access attempt";
  }
};


public query func getVerificationUnlockCounts(partner_idx : Nat) : async [T.VerificationUnlockCount] {
  if (partner_idx == 1) {
    return List.toArray(VerificationUnlockCountDataP);
  } else if (partner_idx == 2) {
    return List.toArray(VerificationUnlockCountDataT);
  } else if (partner_idx == 3) {
    return List.toArray(VerificationUnlockCountDataK);
  } else {
    return [];
  }
};

public query func getTotalVerificationUnlockCount(partner_idx : Nat) : async Nat {
  if (partner_idx == 1) {
    let total = List.foldLeft<T.VerificationUnlockCount, Nat>(VerificationUnlockCountDataP, 0, func (acc : Nat, v : T.VerificationUnlockCount) : Nat {
      acc + v.unlock_count
    });
    return total;
  } else if (partner_idx == 2) {
    let total = List.foldLeft<T.VerificationUnlockCount, Nat>(VerificationUnlockCountDataT, 0, func (acc : Nat, v : T.VerificationUnlockCount) : Nat {
      acc + v.unlock_count
    });
    return total;
  } else if (partner_idx == 3) {
    let total = List.foldLeft<T.VerificationUnlockCount, Nat>(VerificationUnlockCountDataK, 0, func (acc : Nat, v : T.VerificationUnlockCount) : Nat {
      acc + v.unlock_count
    });
    return total;
  } else {
    return 0;
  }
};

var MusicVerificationListData : List.List<T.MusicVerificationList> = List.nil();

public query func getMusicVerificationLists() : async [T.MusicVerificationList] {
return List.toArray(MusicVerificationListData);
};

public func addMusicVerificationList(owner:Text,idx_p : Nat, requester_principal_p : Text, verification_status_p : Bool, verification_status_updated_at_p : Text) : async () {
  //check owner
  if (canister_owner == ?owner) {
    MusicVerificationListData := List.push(
      {
        idx = idx_p;
        requester_principal = requester_principal_p;
        verification_status = verification_status_p;
        verification_status_updated_at = verification_status_updated_at_p;
      },
      MusicVerificationListData
    );
  }
};

// initialize data
public func firstDataSet(owner : Text) : async Text {

  //check owner
  if (canister_owner == ?owner) {
    
  //add partner
  Partner := List.push({partner_idx = 1; partner_name = "Paykhan"}, Partner);
  Partner := List.push({partner_idx = 2; partner_name = "Tune"}, Partner);
  Partner := List.push({partner_idx = 3; partner_name = "Kaia"}, Partner);

  //add genre
  genreData := List.push({genre_idx = 1; genre_name = "K-POP"}, genreData);
  genreData := List.push({genre_idx = 2; genre_name = "R&B"}, genreData);
  genreData := List.push({genre_idx = 3; genre_name = "TROT"}, genreData);
  genreData := List.push({genre_idx = 4; genre_name = "CITY-POP"}, genreData);
  genreData := List.push({genre_idx = 5; genre_name = "BALLAD"}, genreData);
  genreData := List.push({genre_idx = 6; genre_name = "JAZZ"}, genreData);
  genreData := List.push({genre_idx = 7; genre_name = "HIP HOP"}, genreData);
  genreData := List.push({genre_idx = 8; genre_name = "INDY"}, genreData);
  genreData := List.push({genre_idx = 9; genre_name = "ROCK"}, genreData);
  genreData := List.push({genre_idx = 10; genre_name = "CCM"}, genreData);

  genreData := List.push({genre_idx = 11; genre_name = "Alternatvie pop"}, genreData);
  genreData := List.push({genre_idx = 12; genre_name = "Chillwave/R&B"}, genreData);
  genreData := List.push({genre_idx = 13; genre_name = "HOUSE"}, genreData);
  genreData := List.push({genre_idx = 14; genre_name = "EDM"}, genreData);
  genreData := List.push({genre_idx = 15; genre_name = "BAND"}, genreData);
  genreData := List.push({genre_idx = 16; genre_name = "Tropical House"}, genreData);
  genreData := List.push({genre_idx = 17; genre_name = "Medium"}, genreData);
  genreData := List.push({genre_idx = 18; genre_name = "POP"}, genreData);
  genreData := List.push({genre_idx = 19; genre_name = "Chill"}, genreData);

  genreData := List.push({genre_idx = 20; genre_name = "Alternative R&B"}, genreData);
  genreData := List.push({genre_idx = 21; genre_name = "JAZZ POP"}, genreData);
  genreData := List.push({genre_idx = 22; genre_name = "Modern Rock"}, genreData);
  genreData := List.push({genre_idx = 23; genre_name = "Disco Pop"}, genreData);
  genreData := List.push({genre_idx = 24; genre_name = "Neo Soul"}, genreData);
  genreData := List.push({genre_idx = 25; genre_name = "CAROL"}, genreData);
  genreData := List.push({genre_idx = 26; genre_name = "Slap House"}, genreData);
  genreData := List.push({genre_idx = 27; genre_name = "Crossover"}, genreData);
  genreData := List.push({genre_idx = 28; genre_name = "Dream POP"}, genreData);
  genreData := List.push({genre_idx = 29; genre_name = "Alternative Rock"}, genreData);

  genreData := List.push({genre_idx = 30; genre_name = "ACOUSTIC"}, genreData);
  genreData := List.push({genre_idx = 31; genre_name = "Synth pop"}, genreData);
  genreData := List.push({genre_idx = 32; genre_name = "Electronic K-POP"}, genreData);
  genreData := List.push({genre_idx = 33; genre_name = "RETRO"}, genreData);
  genreData := List.push({genre_idx = 34; genre_name = "SOUL"}, genreData);
  genreData := List.push({genre_idx = 35; genre_name = "Rock Ballad"}, genreData);
  genreData := List.push({genre_idx = 36; genre_name = "DANCEHALL"}, genreData);
  genreData := List.push({genre_idx = 37; genre_name = "Latin POP"}, genreData);
  genreData := List.push({genre_idx = 38; genre_name = "Trapsoul"}, genreData);
  genreData := List.push({genre_idx = 39; genre_name = "REGGEATON"}, genreData);

  genreData := List.push({genre_idx = 40; genre_name = "Trap SOUL"}, genreData);
  genreData := List.push({genre_idx = 41; genre_name = "Acoustic Country"}, genreData);
  genreData := List.push({genre_idx = 42; genre_name = "Emo Hip-Hop"}, genreData);
  genreData := List.push({genre_idx = 43; genre_name = "K-pop Dance"}, genreData);
  genreData := List.push({genre_idx = 44; genre_name = "Dance-punk"}, genreData);
  genreData := List.push({genre_idx = 45; genre_name = "Baile Funk"}, genreData);
  genreData := List.push({genre_idx = 46; genre_name = "UK Garage (UKG)"}, genreData);
  

  return "Icp info data initialized!";

  }else{
    return "Unauthorized access attempt";
  }

};

public func getMusicInfoByPaykhanData(owner : Text,data : Text) : async Text{
  //check owner
  if (canister_owner != ?owner) {
    return "Unauthorized access attempt";
  };


    let decoded_text : Text = data;
    let parsed =  JSON.parse(decoded_text);
     switch (parsed) {
    case (#ok(jsonValue)) {
      //Debug.print("parsed is ok: " # JSON.stringify(jsonValue, null));

      let getAsArrayValue = JSON.get(jsonValue, "");

      switch (getAsArrayValue) {
        case (?json) {
          switch (json) {
            case (#array(arr)) {
              for (item in arr.vals()) {
                switch (item) {
                  case (#object_(obj)) {
                    let idx : Nat = switch (JSON.get(item, "idx")) {
                       case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                       case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 }; }; case _ { 0 }; 
                    };
                    let title = switch (JSON.get(item, "title")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let song_thumbnail = switch (JSON.get(item, "song_thumbnail")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let album_idx :Nat = switch (JSON.get(item, "album_idx")) {
                      case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                      case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 }; }; case _ { 0 }; 
                    };
                    let composer = switch (JSON.get(item, "composer")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };  
                    let lyricist = switch (JSON.get(item, "lyricist")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let arranger = switch (JSON.get(item, "arranger")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let genre_idx :Nat = switch (JSON.get(item, "genre_idx")) {
                      case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                      case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 }; }; case _ { 0 }; 
                    };
                    let work_type = switch (JSON.get(item, "work_type")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let music_publisher = switch (JSON.get(item, "music_publisher")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let artist = switch (JSON.get(item, "artist")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let musician = switch (JSON.get(item, "musician")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let record_label = switch (JSON.get(item, "record_label")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let release_date = switch (JSON.get(item, "release_date")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let registration_date = switch (JSON.get(item, "registration_date")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let requester_principal = switch (JSON.get(item, "requester_principal")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let unlock_total_count :Nat = switch (JSON.get(item, "unlock_total_count")) {
                      case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                      case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 }; }; case _ { 0 }; 
                    };
                    let verification_status = switch (JSON.get(item, "verification_status")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let icp_neighboring_token_address = switch (JSON.get(item, "icp_neighboring_token_address")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let op_neighboring_token_address = switch (JSON.get(item, "op_neighboring_token_address")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let music_file_path = switch (JSON.get(item, "music_file_path")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };
                    let one_min_path = switch (JSON.get(item, "one_min_path")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };


                    let musicWorkInfo : T.MusicWorkInfo = {
                      idx = idx;
                      title = title;
                      song_thumbnail = song_thumbnail;
                      album_idx = album_idx;
                      composer = composer;
                      lyricist = lyricist;
                      arranger = arranger;
                      genre_idx = genre_idx;
                      work_type = work_type;
                      music_publisher = music_publisher;
                      artist = artist;
                      musician = musician;
                      record_label = record_label;
                      release_date = release_date;
                      registration_date = registration_date;
                      requester_principal = requester_principal;
                      unlock_total_count = unlock_total_count;
                      verification_status = verification_status;
                      icp_neighboring_token_address = icp_neighboring_token_address;
                      op_neighboring_token_address = op_neighboring_token_address;
                      music_file_path = music_file_path;
                      one_min_path = one_min_path  ;
                    };

            
                    VerificationUnlockCountDataP := List.push({partner_idx = 1; idx = idx; unlock_count = unlock_total_count}, VerificationUnlockCountDataP);
                    VerificationUnlockCountDataT := List.push({partner_idx = 2; idx = idx; unlock_count = unlock_total_count}, VerificationUnlockCountDataT);
                    VerificationUnlockCountDataK := List.push({partner_idx = 3; idx = idx; unlock_count = unlock_total_count}, VerificationUnlockCountDataK);


                    // prevent duplicates 
                    MusicWorkInfoData := List.filter<T.MusicWorkInfo>(
                      MusicWorkInfoData,
                      func (mw : T.MusicWorkInfo) : Bool { mw.idx != idx }
                    );
                    MusicWorkInfoData := List.push(musicWorkInfo, MusicWorkInfoData);
                    
                  };
                  case _ {};
                }
              }
            };
            case _ {
              Debug.print("jsonValue is not array");
            };
          }
        };
        case null {
          Debug.print("jsonValue is null");
        };
      }
    };
    case (#err(e)) {
      //Debug.print("parsed error: " # e);
    };
  };
    return decoded_text;
};

  //update music file path
  public func updateMusicFilePathByOwner(owner : Text,data : Text) : async Text{
    //check owner
    if (canister_owner != ?owner) {
      return "Unauthorized access attempt";
    };

    let decoded_text : Text = data;
    let parsed =  JSON.parse(decoded_text);
     switch (parsed) {
    case (#ok(jsonValue)) {
      //Debug.print("parsed is ok: " # JSON.stringify(jsonValue, null));

      let getAsArrayValue = JSON.get(jsonValue, "");

      switch (getAsArrayValue) {
        case (?json) {
          switch (json) {
            case (#array(arr)) {
              for (item in arr.vals()) {
                switch (item) {
                  case (#object_(obj)) {
                    let idx : Nat = switch (JSON.get(item, "idx")) {
                       case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                       case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 }; }; case _ { 0 }; 
                    };
                    let music_file_path = switch (JSON.get(item, "music_file_path")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };

                    MusicWorkInfoData := List.map(MusicWorkInfoData, func (m : T.MusicWorkInfo) : T.MusicWorkInfo {
                      if (m.idx == idx) {
                        { m with music_file_path = music_file_path }
                      } else {
                        m
                      }
                    });

                  };
                  case _ {};
                }
              }
            };
            case _ {
              Debug.print("jsonValue is not array");
            };
          }
        };
        case null {
          Debug.print("jsonValue is null");
        };
      }
    };
    case (#err(e)) {
      //Debug.print("parsed error: " # e);
    };
  };
    return decoded_text;
  };

 public func updateOneMinPathByOwner(owner : Text,data : Text) : async Text{
    //check owner
    if (canister_owner != ?owner) {
      return "Unauthorized access attempt";
    };

    let decoded_text : Text = data;
    let parsed =  JSON.parse(decoded_text);
     switch (parsed) {
    case (#ok(jsonValue)) {
      //Debug.print("parsed is ok: " # JSON.stringify(jsonValue, null));

      let getAsArrayValue = JSON.get(jsonValue, "");

      switch (getAsArrayValue) {
        case (?json) {
          switch (json) {
            case (#array(arr)) {
              for (item in arr.vals()) {
                switch (item) {
                  case (#object_(obj)) {
                    let idx : Nat = switch (JSON.get(item, "idx")) {
                       case (? #number(#int n)) { if (n < 0) 0 else Int.abs(n) };
                       case (? #string(t)) { switch (Nat.fromText(t)) { case (?v) v; case null 0 }; }; case _ { 0 }; 
                    };
                    let one_min_path = switch (JSON.get(item, "one_min_path")) {
                      case (? #string(t)) { t };
                      case _ { "" };
                    };

                    MusicWorkInfoData := List.map(MusicWorkInfoData, func (m : T.MusicWorkInfo) : T.MusicWorkInfo {
                      if (m.idx == idx) {
                        { m with one_min_path = one_min_path }
                      } else {
                        m
                      }
                    });

                  };
                  case _ {};
                }
              }
            };
            case _ {
              Debug.print("jsonValue is not array");
            };
          }
        };
        case null {
          Debug.print("jsonValue is null");
        };
      }
    };
    case (#err(e)) {
      //Debug.print("parsed error: " # e);
    };
  };
    return decoded_text;
  };


public query func getMusicInfoByIdx(idx : Nat) : async ?T.MusicWorkInfoView {
  let musicInfo = List.find<T.MusicWorkInfoView>(MusicWorkInfoData, func (m : T.MusicWorkInfoView) : Bool {
    m.idx == idx
  });
  return musicInfo;
};

public func updateRWAContributorsCnt(owner : Text, newCount : Nat) : async Text {
  let authorized = canister_owner == ?owner;
  if (authorized) {
    rwaContributorsCnt := newCount;
    return "RWA Contributors count updated";
  } else {
    return "Unauthorized access attempt";
  }
};


private var rwaContributorsCnt : Nat = 0; 

public func incrementRWAContributorsCnt( owner : Text) : async Nat {
  let authorized = canister_owner == ?owner;
  if (authorized) {
    rwaContributorsCnt := rwaContributorsCnt + 1;
    return rwaContributorsCnt;
  } else {
    return 0;
  }
};

public query func getRWAContributorsCnt() : async Nat {
  return rwaContributorsCnt;
};

//total transaction count update
public func updateTransactionsCnt(owner : Text, newCount : Nat) : async Text {
  let authorized = canister_owner == ?owner;
  if (authorized) {
    transactionsCnt := newCount;
    return "Transactions count updated";
  } else {
    return "Unauthorized access attempt";
  }
};

private var transactionsCnt : Nat = 0;

public func incrementTransactionsCnt( owner : Text) : async Nat {
  let authorized = canister_owner == ?owner;
  if (authorized) {
    transactionsCnt := transactionsCnt + 1;
    return transactionsCnt;
  } else {
    return 0;
  }
};

public query func getTransactionsCnt() : async Nat {
  return transactionsCnt;
};

var DailyIcrcMinterData : List.List<T.DailyIcrcMinter> = List.nil();

public func addDailyIcrcMinter(owner : Text, minted_at : Text, minted_amount : Nat64) : async Text {
  let authorized = canister_owner == ?owner;
  if (not authorized) {
    return "Unauthorized access attempt";
  };

  let newEntry : T.DailyIcrcMinter = {
    minted_at = minted_at;
    minted_amount = minted_amount;
    
  };
  DailyIcrcMinterData := List.push(newEntry, DailyIcrcMinterData);
  return "Daily ICRC Minter added successfully";
};  


};
