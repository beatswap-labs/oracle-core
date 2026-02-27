import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface GenreId { 'genre_name' : string, 'genre_idx' : bigint }
export interface MusicVerificationList {
  'idx' : bigint,
  'verification_status' : boolean,
  'verification_status_updated_at' : string,
  'requester_principal' : string,
}
export interface MusicVideoInfo {
  'idx' : bigint,
  'lyricist' : string,
  'song_thumnail' : string,
  'song_file' : string,
  'song_name' : string,
  'high_mv_file' : string,
  'group_name' : string,
}
export interface MusicWorkInfo {
  'idx' : bigint,
  'musician' : string,
  'title' : string,
  'registration_date' : string,
  'lyricist' : string,
  'record_label' : string,
  'work_type' : string,
  'release_date' : string,
  'music_publisher' : string,
  'song_thumbnail' : string,
  'genre_idx' : bigint,
  'music_file_path' : string,
  'op_neighboring_token_address' : string,
  'one_min_path' : string,
  'verification_status' : string,
  'composer' : string,
  'artist' : string,
  'icp_neighboring_token_address' : string,
  'album_idx' : bigint,
  'arranger' : string,
  'requester_principal' : string,
  'unlock_total_count' : bigint,
}
export interface MusicWorkInfoView {
  'idx' : bigint,
  'musician' : string,
  'title' : string,
  'registration_date' : string,
  'lyricist' : string,
  'record_label' : string,
  'work_type' : string,
  'release_date' : string,
  'music_publisher' : string,
  'genre_idx' : bigint,
  'op_neighboring_token_address' : string,
  'verification_status' : string,
  'composer' : string,
  'artist' : string,
  'icp_neighboring_token_address' : string,
  'album_idx' : bigint,
  'arranger' : string,
  'requester_principal' : string,
  'unlock_total_count' : bigint,
}
export interface Partner { 'partner_idx' : bigint, 'partner_name' : string }
export interface VerificationUnlockCount {
  'idx' : bigint,
  'partner_idx' : bigint,
  'unlock_count' : bigint,
}
export interface WebDramaInfo {
  'idx' : bigint,
  'episode_summary' : string,
  'episode_member_id' : string,
  'admin_id' : string,
  'mv_s3_path' : string,
  'episode_thumnail_s3' : string,
  'see_min' : bigint,
  'episode_id' : string,
  'episode_title' : string,
}
export interface _SERVICE {
  'addDailyIcrcMinter' : ActorMethod<[string, string, bigint], string>,
  'addGenre' : ActorMethod<[string, bigint, string], string>,
  'addMusicVerificationList' : ActorMethod<
    [string, bigint, string, boolean, string],
    undefined
  >,
  'addMusicVideoInfo' : ActorMethod<[[] | [string], MusicVideoInfo], string>,
  'addMusicWorkInfo' : ActorMethod<[[] | [string], MusicWorkInfo], undefined>,
  'addPartner' : ActorMethod<[string, bigint, string], string>,
  'addRequesterId' : ActorMethod<[string, string, boolean], string>,
  'addWebDramaInfo' : ActorMethod<[[] | [string], WebDramaInfo], string>,
  'deleteMusicWorkInfo' : ActorMethod<[[] | [string], bigint], string>,
  'firstDataSet' : ActorMethod<[string], string>,
  'getGenres' : ActorMethod<[], Array<GenreId>>,
  'getMusicContractAddress' : ActorMethod<[], string>,
  'getMusicInfoByIdx' : ActorMethod<[bigint], [] | [MusicWorkInfoView]>,
  'getMusicInfoByPaykhanData' : ActorMethod<[string, string], string>,
  'getMusicVerificationLists' : ActorMethod<[], Array<MusicVerificationList>>,
  'getMusicVideoByOwner' : ActorMethod<[string], Array<MusicVideoInfo>>,
  'getMusicWorkInfos' : ActorMethod<[], Array<MusicWorkInfoView>>,
  'getMusicWorkInfosByGenre' : ActorMethod<[bigint], Array<MusicWorkInfoView>>,
  'getMusicWorkInfosByGenreOwner' : ActorMethod<
    [bigint, string],
    Array<MusicWorkInfo>
  >,
  'getMusicWorkInfosByOwner' : ActorMethod<[string], Array<MusicWorkInfo>>,
  'getPartners' : ActorMethod<[], Array<Partner>>,
  'getRWAContributorsCnt' : ActorMethod<[], bigint>,
  'getRequesterIds' : ActorMethod<
    [],
    Array<{ 'requester_name' : string, 'can_approve' : boolean }>
  >,
  'getTotalVerificationUnlockCount' : ActorMethod<[bigint], bigint>,
  'getTransactionsCnt' : ActorMethod<[], bigint>,
  'getUnlockedAccumulated' : ActorMethod<[], bigint>,
  'getVerificationUnlockCounts' : ActorMethod<
    [bigint],
    Array<VerificationUnlockCount>
  >,
  'getWebDramaByOwner' : ActorMethod<[string], Array<WebDramaInfo>>,
  'incrementMusicWorkInfoUnlockCount' : ActorMethod<[bigint, string], string>,
  'incrementRWAContributorsCnt' : ActorMethod<[string], bigint>,
  'incrementTransactionsCnt' : ActorMethod<[string], bigint>,
  'incrementUnlockedAccumulated' : ActorMethod<[bigint, string], bigint>,
  'incrementVerificationUnlockCount' : ActorMethod<
    [bigint, bigint, string],
    string
  >,
  'setCanisterOwner' : ActorMethod<[string], string>,
  'updateCanisterOwner' : ActorMethod<[[] | [string], [] | [string]], string>,
  'updateGenreName' : ActorMethod<[string, bigint, string], string>,
  'updateMusicFilePathByOwner' : ActorMethod<[string, string], string>,
  'updateMusicWorkInfo' : ActorMethod<[[] | [string], MusicWorkInfo], string>,
  'updateOneMinPathByOwner' : ActorMethod<[string, string], string>,
  'updateRWAContributorsCnt' : ActorMethod<[string, bigint], string>,
  'updateTransactionsCnt' : ActorMethod<[string, bigint], string>,
  'updateUnlockedAccumulated' : ActorMethod<[string, bigint], string>,
  'whoami' : ActorMethod<[], Principal>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
