export const idlFactory = ({ IDL }) => {
  const MusicVideoInfo = IDL.Record({
    'idx' : IDL.Nat,
    'lyricist' : IDL.Text,
    'song_thumnail' : IDL.Text,
    'song_file' : IDL.Text,
    'song_name' : IDL.Text,
    'high_mv_file' : IDL.Text,
    'group_name' : IDL.Text,
  });
  const MusicWorkInfo = IDL.Record({
    'idx' : IDL.Nat,
    'musician' : IDL.Text,
    'title' : IDL.Text,
    'registration_date' : IDL.Text,
    'lyricist' : IDL.Text,
    'record_label' : IDL.Text,
    'work_type' : IDL.Text,
    'release_date' : IDL.Text,
    'music_publisher' : IDL.Text,
    'song_thumbnail' : IDL.Text,
    'genre_idx' : IDL.Nat,
    'music_file_path' : IDL.Text,
    'op_neighboring_token_address' : IDL.Text,
    'one_min_path' : IDL.Text,
    'verification_status' : IDL.Text,
    'composer' : IDL.Text,
    'artist' : IDL.Text,
    'icp_neighboring_token_address' : IDL.Text,
    'album_idx' : IDL.Nat,
    'arranger' : IDL.Text,
    'requester_principal' : IDL.Text,
    'unlock_total_count' : IDL.Nat,
  });
  const WebDramaInfo = IDL.Record({
    'idx' : IDL.Nat,
    'episode_summary' : IDL.Text,
    'episode_member_id' : IDL.Text,
    'admin_id' : IDL.Text,
    'mv_s3_path' : IDL.Text,
    'episode_thumnail_s3' : IDL.Text,
    'see_min' : IDL.Nat,
    'episode_id' : IDL.Text,
    'episode_title' : IDL.Text,
  });
  const GenreId = IDL.Record({
    'genre_name' : IDL.Text,
    'genre_idx' : IDL.Nat,
  });
  const MusicWorkInfoView = IDL.Record({
    'idx' : IDL.Nat,
    'musician' : IDL.Text,
    'title' : IDL.Text,
    'registration_date' : IDL.Text,
    'lyricist' : IDL.Text,
    'record_label' : IDL.Text,
    'work_type' : IDL.Text,
    'release_date' : IDL.Text,
    'music_publisher' : IDL.Text,
    'genre_idx' : IDL.Nat,
    'op_neighboring_token_address' : IDL.Text,
    'verification_status' : IDL.Text,
    'composer' : IDL.Text,
    'artist' : IDL.Text,
    'icp_neighboring_token_address' : IDL.Text,
    'album_idx' : IDL.Nat,
    'arranger' : IDL.Text,
    'requester_principal' : IDL.Text,
    'unlock_total_count' : IDL.Nat,
  });
  const MusicVerificationList = IDL.Record({
    'idx' : IDL.Nat,
    'verification_status' : IDL.Bool,
    'verification_status_updated_at' : IDL.Text,
    'requester_principal' : IDL.Text,
  });
  const Partner = IDL.Record({
    'partner_idx' : IDL.Nat,
    'partner_name' : IDL.Text,
  });
  const VerificationUnlockCount = IDL.Record({
    'idx' : IDL.Nat,
    'partner_idx' : IDL.Nat,
    'unlock_count' : IDL.Nat,
  });
  return IDL.Service({
    'addDailyIcrcMinter' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64],
        [IDL.Text],
        [],
      ),
    'addGenre' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Text], []),
    'addMusicVerificationList' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Text, IDL.Bool, IDL.Text],
        [],
        [],
      ),
    'addMusicVideoInfo' : IDL.Func(
        [IDL.Opt(IDL.Text), MusicVideoInfo],
        [IDL.Text],
        [],
      ),
    'addMusicWorkInfo' : IDL.Func([IDL.Opt(IDL.Text), MusicWorkInfo], [], []),
    'addPartner' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Text], []),
    'addRequesterId' : IDL.Func([IDL.Text, IDL.Text, IDL.Bool], [IDL.Text], []),
    'addWebDramaInfo' : IDL.Func(
        [IDL.Opt(IDL.Text), WebDramaInfo],
        [IDL.Text],
        [],
      ),
    'deleteMusicWorkInfo' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Nat],
        [IDL.Text],
        [],
      ),
    'firstDataSet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getGenres' : IDL.Func([], [IDL.Vec(GenreId)], ['query']),
    'getMusicContractAddress' : IDL.Func([], [IDL.Text], ['query']),
    'getMusicInfoByIdx' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(MusicWorkInfoView)],
        ['query'],
      ),
    'getMusicInfoByPaykhanData' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'getMusicVerificationLists' : IDL.Func(
        [],
        [IDL.Vec(MusicVerificationList)],
        ['query'],
      ),
    'getMusicVideoByOwner' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(MusicVideoInfo)],
        ['query'],
      ),
    'getMusicWorkInfos' : IDL.Func([], [IDL.Vec(MusicWorkInfoView)], ['query']),
    'getMusicWorkInfosByGenre' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(MusicWorkInfoView)],
        ['query'],
      ),
    'getMusicWorkInfosByGenreOwner' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Vec(MusicWorkInfo)],
        ['query'],
      ),
    'getMusicWorkInfosByOwner' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(MusicWorkInfo)],
        ['query'],
      ),
    'getPartners' : IDL.Func([], [IDL.Vec(Partner)], ['query']),
    'getRWAContributorsCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'getRequesterIds' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'requester_name' : IDL.Text,
              'can_approve' : IDL.Bool,
            })
          ),
        ],
        ['query'],
      ),
    'getTotalVerificationUnlockCount' : IDL.Func(
        [IDL.Nat],
        [IDL.Nat],
        ['query'],
      ),
    'getTransactionsCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'getUnlockedAccumulated' : IDL.Func([], [IDL.Nat64], ['query']),
    'getVerificationUnlockCounts' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(VerificationUnlockCount)],
        ['query'],
      ),
    'getWebDramaByOwner' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(WebDramaInfo)],
        ['query'],
      ),
    'incrementMusicWorkInfoUnlockCount' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Text],
        [],
      ),
    'incrementRWAContributorsCnt' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'incrementTransactionsCnt' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'incrementUnlockedAccumulated' : IDL.Func(
        [IDL.Nat64, IDL.Text],
        [IDL.Nat64],
        [],
      ),
    'incrementVerificationUnlockCount' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text],
        [IDL.Text],
        [],
      ),
    'setCanisterOwner' : IDL.Func([IDL.Text], [IDL.Text], []),
    'updateCanisterOwner' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
    'updateGenreName' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Text], []),
    'updateMusicFilePathByOwner' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'updateMusicWorkInfo' : IDL.Func(
        [IDL.Opt(IDL.Text), MusicWorkInfo],
        [IDL.Text],
        [],
      ),
    'updateOneMinPathByOwner' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'updateRWAContributorsCnt' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
    'updateTransactionsCnt' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
    'updateUnlockedAccumulated' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [IDL.Text],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
