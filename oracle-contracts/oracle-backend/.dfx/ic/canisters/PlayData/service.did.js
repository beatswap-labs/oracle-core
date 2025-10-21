export const idlFactory = ({ IDL }) => {
  const UserPlayData = IDL.Record({
    'partner_idx' : IDL.Nat,
    'user' : IDL.Text,
    'play_at' : IDL.Text,
    'music_idx' : IDL.Nat,
  });
  return IDL.Service({
    'addUserPlayData' : IDL.Func([IDL.Text, UserPlayData], [IDL.Bool], []),
    'getPlayDataRowCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'getUserPlayDataByYMD' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(UserPlayData)],
        ['query'],
      ),
    'getUserPlayDataCountByYMD' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'setCanisterOwner' : IDL.Func([IDL.Text], [IDL.Text], []),
    'updateCanisterOwner' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
