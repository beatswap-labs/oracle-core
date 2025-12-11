import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Nat64 "mo:base/Nat64";


module {
    //music info
    public type MusicWorkInfo ={
        idx : Nat;
        title : Text;
        song_thumbnail : Text;
        album_idx : Nat;
        composer : Text;
        lyricist : Text;
        arranger : Text;
        genre_idx : Nat;
        work_type : Text;
        music_publisher : Text;
        artist : Text;
        musician : Text;
        record_label : Text;
        release_date : Text;
        registration_date : Text;
        requester_principal : Text;
        unlock_total_count : Nat;
        verification_status : Text; 
        icp_neighboring_token_address : Text;
        op_neighboring_token_address : Text;
        music_file_path : Text;
        one_min_path :Text;
    };
     //normal user music info
     public type MusicWorkInfoView ={
        idx : Nat;
        title : Text;
        album_idx : Nat;
        composer : Text;
        lyricist : Text;
        arranger : Text;
        genre_idx : Nat;
        work_type : Text;
        music_publisher : Text;
        artist : Text;
        musician : Text;
        record_label : Text;
        release_date : Text;
        registration_date : Text;
        requester_principal : Text;
        unlock_total_count : Nat;
        verification_status : Text; 
        icp_neighboring_token_address : Text;
        op_neighboring_token_address : Text;
    };

    //genre
    public type GenreId={
        genre_idx : Nat;
        genre_name : Text;
    };

    //musician
    public type Requester={
        requester_principal : Text;
        requester_name : Text;
        can_approve : Bool;

    };

    public type MusicVerificationList ={
        idx :Nat; 
        requester_principal : Text;
        verification_status : Bool; 
        verification_status_updated_at : Text; 
    };

    //partners  1 : paykhan 2: ton 3: kaia
    public type Partner={
        partner_idx : Nat;
        partner_name : Text;
    };


    public type VerificationUnlockCount={
        partner_idx : Nat;
        idx : Nat;  
        unlock_count : Nat;
    };

    public type VerificationUnlockList={
        icp_year_month : Text;  //YYYYMM
        partner_idx : Nat;
        idx : Nat;  
        unlock_date : Text;
        unlocked_at : Text;
        unlocked_ts : Nat64;
    };

    public type VerificationUnlockListV2={
        icp_year_month : Text;  //YYYYMM
        partner_idx : Nat;
        idx : Nat;
        principal: Text;  
        unlock_date : Text;
        unlocked_at : Text;
        unlocked_ts : Nat64;
    };

    public type VerificationUnlockUserData={
        partner_idx : Nat;
        idx : Nat;
        principal: Text;
        unlock_date : Text;
    };

    public type VerificationRightsPosAddressList ={
        right_pos_address_idx : Nat;
        is_neighboring_pos_address : Bool;
        rights_pos_address : Text;
        rights_pos_address_mainnet : Text;
        rights_pos_address_mainnet_version : Nat;
        requester_principal : Text;
        is_used_for_verification : Bool;
        is_used_for_verification_updated_at : Text;
    };


    public type DailyRightsHolders={
        neighboring_token_address : Text;
        neighboring_holder_staked_address : Text;
        staked_amount : Text;
        verification_date : Text;
        neighboring_holder_staked_mainnet : Text;
    };


    public type UnlockedAccumulated={
        unlocked_acc : Nat64;
    };

    //user play data
    public type UserPlayData={
        partner_idx : Nat;
        user : Text;
        music_idx : Nat;
        play_at : Text;
    };
    

    //user info
    public type Member ={
        idx : Nat;
        partner_idx : Nat;
        user : Text; 
        principle : Text;
        created_at : Text;
    };

    public type MemberUnlockDate ={
        principle : Text;
        unlock_idxs : Nat;
    };

    public type Transactions = {
        method : Text;
        mType : Text;
        amount : Nat64;
        from : Text;
        to : Text;
        timestamp : Text;
        index : Nat;
    };

    public type DailyIcrcMinter ={
        minted_amount : Nat64;
        minted_at : Text;   //YYYYMMDD
    };


    public type DailyMemberSnap={
        snap_date : Text; //YYYY-MM-DD
        member_count : Nat;
    };

    public type DailyTransactionSnap={
        snap_date : Text; //YYYY-MM-DD
        transaction_count : Nat;
    };

    public type DailyRoyaltySnap={
        snap_date : Text; //YYYY-MM-DD
        total_royalty : Nat;
    };

    public type MonthlyIPLSnap={
        snap_date : Text; //YYYY-MM-DD
        snap_principal: Text;
        snap_idx : Nat;
    };


    public type MonthlyIPLSnapV2={
        snap_date : Text; //YYYY-MM-DD
        snap_principal: Text;
        snap_idx : Nat;
        last_idx : Nat;
    };


}