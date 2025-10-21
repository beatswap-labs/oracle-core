export const idlFactory = ({ IDL }) => {
  const MemberUnlockDate = IDL.Record({
    'principle' : IDL.Text,
    'unlock_idxs' : IDL.Nat,
  });
  return IDL.Service({
    'addMemberUnlock' : IDL.Func(
        [IDL.Text, IDL.Text, MemberUnlockDate],
        [IDL.Nat],
        [],
      ),
    'getAllMemberUnlockKeys' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getMemberUnlockByKey' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(MemberUnlockDate)],
        ['query'],
      ),
    'getMemberUnlockCountByKey' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getUserUnlockRowCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'setCanisterOwner' : IDL.Func([IDL.Text], [IDL.Text], []),
    'updateCanisterOwner' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
