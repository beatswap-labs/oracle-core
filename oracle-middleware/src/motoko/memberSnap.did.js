export const idlFactory = ({ IDL }) => {
  const DailyMemberSnap = IDL.Record({
    'member_count' : IDL.Nat,
    'snap_date' : IDL.Text,
  });
  const DailyRoyaltySnap = IDL.Record({
    'total_royalty' : IDL.Nat,
    'snap_date' : IDL.Text,
  });
  const DailyTransactionSnap = IDL.Record({
    'transaction_count' : IDL.Nat,
    'snap_date' : IDL.Text,
  });
  return IDL.Service({
    'addDailyMemberSnap' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'addDailyRoyaltySnap' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'addDailyTransactionSnap' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat],
        [IDL.Bool],
        [],
      ),
    'getDailyMemberSnap' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(DailyMemberSnap)],
        ['query'],
      ),
    'getDailyRoyaltySnap' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(DailyRoyaltySnap)],
        ['query'],
      ),
    'getDailyTransactionSnap' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(DailyTransactionSnap)],
        ['query'],
      ),
    'getMonthlyMemberSnapsArr' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(DailyMemberSnap)],
        ['query'],
      ),
    'getMonthlyMemberSnapsWithTotal' : IDL.Func(
        [IDL.Text],
        [IDL.Record({ 'total' : IDL.Nat, 'snaps' : IDL.Vec(DailyMemberSnap) })],
        ['query'],
      ),
    'getMonthlyRoyaltySnapsArr' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(DailyRoyaltySnap)],
        ['query'],
      ),
    'getMonthlyRoyaltySnapsWithTotal' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'total' : IDL.Nat,
            'snaps' : IDL.Vec(DailyRoyaltySnap),
          }),
        ],
        ['query'],
      ),
    'getMonthlyTransactionSnapsArr' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(DailyTransactionSnap)],
        ['query'],
      ),
    'getMonthlyTransactionSnapsWithTotal' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'total' : IDL.Nat,
            'snaps' : IDL.Vec(DailyTransactionSnap),
          }),
        ],
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
