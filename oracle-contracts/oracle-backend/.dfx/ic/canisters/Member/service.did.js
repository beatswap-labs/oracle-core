export const idlFactory = ({ IDL }) => {
  const Member = IDL.Record({
    'idx' : IDL.Nat,
    'principle' : IDL.Text,
    'partner_idx' : IDL.Nat,
    'user' : IDL.Text,
    'created_at' : IDL.Text,
  });
  return IDL.Service({
    'addMember' : IDL.Func([IDL.Text, Member], [IDL.Nat], []),
    'addMembers' : IDL.Func([IDL.Text, IDL.Vec(Member)], [IDL.Nat], []),
    'getAllMembers' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Nat],
        [IDL.Vec(Member)],
        [],
      ),
    'getMemberByIdx' : IDL.Func([IDL.Nat], [IDL.Opt(Member)], ['query']),
    'getMemberByPartnerIdxAndUser' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Opt(Member)],
        ['query'],
      ),
    'getMemberByPrinciple' : IDL.Func([IDL.Text], [IDL.Opt(Member)], ['query']),
    'getMemberRowCnt' : IDL.Func([], [IDL.Nat], ['query']),
    'setCanisterOwner' : IDL.Func([IDL.Text], [IDL.Text], []),
    'updateCanisterOwner' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
