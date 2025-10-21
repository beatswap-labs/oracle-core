export const idlFactory = ({ IDL }) => {
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
    'addMusicWorkInfo' : IDL.Func([IDL.Opt(IDL.Text), MusicWorkInfo], [], []),
    'addPartner' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Text], []),
    'addRequesterId' : IDL.Func([IDL.Text, IDL.Text, IDL.Bool], [IDL.Text], []),
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
