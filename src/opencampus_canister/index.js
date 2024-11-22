export const openCampusApiFactory = ({ IDL }) => {
    const ApprovedCollection = IDL.Record({
        'terms': IDL.Nat,
        'collectionID': IDL.Nat,
        'yield': IDL.Float64,
        'collectionName': IDL.Text,
    });
    return IDL.Service({
        'acceptCycles': IDL.Func([], [], []),
        'addApproved_Collections': IDL.Func([ApprovedCollection], [IDL.Bool], []),
        'availableCycles': IDL.Func([], [IDL.Nat], ['query']),
        'getApproved_Collections': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, ApprovedCollection))],
            ['query'],
        ),
        'removeApproved_Collections': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'resetSupply': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'updateYieldNTerms': IDL.Func(
            [IDL.Float64, IDL.Nat, IDL.Nat],
            [IDL.Bool],
            [],
        ),
    });

};