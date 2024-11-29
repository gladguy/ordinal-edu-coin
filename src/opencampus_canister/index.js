export const openCampusApiFactory = ({ IDL }) => {
    const ApprovedCollections = IDL.Record({
        'terms': IDL.Nat,
        'chainName': IDL.Text,
        'collectionID': IDL.Nat,
        'yield': IDL.Float64,
        'collectionName': IDL.Text,
    });
    const HttpHeader = IDL.Record({ 'value': IDL.Text, 'name': IDL.Text });
    const HttpResponsePayload = IDL.Record({
        'status': IDL.Nat,
        'body': IDL.Vec(IDL.Nat8),
        'headers': IDL.Vec(HttpHeader),
    });
    const TransformArgs = IDL.Record({
        'context': IDL.Vec(IDL.Nat8),
        'response': HttpResponsePayload,
    });
    const CanisterHttpResponsePayload = IDL.Record({
        'status': IDL.Nat,
        'body': IDL.Vec(IDL.Nat8),
        'headers': IDL.Vec(HttpHeader),
    });
    return IDL.Service({
        'acceptCycles': IDL.Func([], [], []),
        'addApprovedCollection': IDL.Func([ApprovedCollections], [], []),
        'availableCycles': IDL.Func([], [IDL.Nat], ['query']),
        'getAllApprovedCollections': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, ApprovedCollections))],
            ['query'],
        ),
        'getApprovedCollectionsByChain': IDL.Func(
            [IDL.Text],
            [IDL.Vec(IDL.Tuple(IDL.Text, ApprovedCollections))],
            ['query'],
        ),
        'removeApprovedCollectionByName': IDL.Func([IDL.Text], [], []),
        'transform': IDL.Func(
            [TransformArgs],
            [CanisterHttpResponsePayload],
            ['query'],
        ),
        'updateYieldNTerms': IDL.Func(
            [IDL.Text, IDL.Float64, IDL.Nat],
            [IDL.Bool],
            [],
        ),
        'wallet_receive': IDL.Func(
            [],
            [IDL.Record({ 'accepted': IDL.Nat64 })],
            [],
        ),
    });
};