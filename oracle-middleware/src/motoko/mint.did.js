export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'mintForUser' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat,
          IDL.Opt(IDL.Vec(IDL.Nat8)),
          IDL.Opt(IDL.Nat64),
        ],
        [IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
