export const idlFactory = ({ IDL }) => {
  const VerificationUnlockUserData = IDL.Record({
    'idx' : IDL.Nat,
    'principal' : IDL.Text,
    'unlock_date' : IDL.Text,
    'partner_idx' : IDL.Nat,
  });
  const VerificationUnlockList = IDL.Record({
    'idx' : IDL.Nat,
    'unlock_date' : IDL.Text,
    'partner_idx' : IDL.Nat,
    'unlocked_at' : IDL.Text,
    'unlocked_ts' : IDL.Nat64,
    'icp_year_month' : IDL.Text,
  });
  const VerificationUnlockListV2 = IDL.Record({
    'idx' : IDL.Nat,
    'principal' : IDL.Text,
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
    'addVerificationUnlockListDataV2' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'getCountByUser' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getEventsByUser' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockUserData)],
        ['query'],
      ),
    'getKCountByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getKCountV2ByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getKEventsByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockList)],
        ['query'],
      ),
    'getKEventsV2ByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockListV2)],
        ['query'],
      ),
    'getOracleDataRowCnt2' : IDL.Func([], [IDL.Nat], ['query']),
    'getPCountByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getPCountV2ByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getPEventsByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockList)],
        ['query'],
      ),
    'getPEventsV2ByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockListV2)],
        ['query'],
      ),
    'getTCountByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getTCountV2ByYm' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getTEventsByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockList)],
        ['query'],
      ),
    'getTEventsV2ByYm' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(VerificationUnlockListV2)],
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
