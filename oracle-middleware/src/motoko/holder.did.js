export const idlFactory = ({ IDL }) => {
  const DailyRightsHolders = IDL.Record({
    'neighboring_holder_staked_address' : IDL.Text,
    'staked_amount' : IDL.Text,
    'neighboring_token_address' : IDL.Text,
    'verification_date' : IDL.Text,
    'neighboring_holder_staked_mainnet' : IDL.Text,
  });
  return IDL.Service({
    'addDailyRightsHoldersData' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'getDailyHoldersRowCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'getDailyRightsHolderCountByYMD' : IDL.Func(
        [IDL.Text],
        [IDL.Nat],
        ['query'],
      ),
    'getDailyRightsHoldersByYMD' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(DailyRightsHolders)],
        ['query'],
      ),
    'getDailyRightsHoldersByYMD_List' : IDL.Func(
        [IDL.Vec(IDL.Text), IDL.Text],
        [IDL.Vec(DailyRightsHolders)],
        ['query'],
      ),
    'setCanisterOwner' : IDL.Func([IDL.Text], [IDL.Text], []),
    'updateCanisterOwner' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
