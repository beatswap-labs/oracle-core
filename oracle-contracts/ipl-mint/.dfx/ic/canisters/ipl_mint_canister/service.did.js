export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'mintForUser' : IDL.Func(
        [
          IDL.Text,
          IDL.Principal,
          IDL.Nat,
          IDL.Opt(IDL.Vec(IDL.Nat8)),
          IDL.Opt(IDL.Nat64),
        ],
        [IDL.Text],
        [],
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
