export const idlFactory = ({ IDL }) => {
  const VerificationUnlockList = IDL.Record({
    'idx' : IDL.Nat,
    'unlock_date' : IDL.Text,
    'partner_idx' : IDL.Nat,
    'unlocked_at' : IDL.Text,
    'unlocked_ts' : IDL.Nat64,
    'icp_year_month' : IDL.Text,
  });
  return IDL.Service({
    'addVerificationUnlockListData' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'getKCountByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getKEventsByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockList)],
        ['query'],
      ),
    'getOracleDataRowCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'getPCountByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getPEventsByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockList)],
        ['query'],
      ),
    'getTCountByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getTEventsByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockList)],
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
