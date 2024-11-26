export const openCampusApiFactory = ({ IDL }) => {
    const ApprovedCollections = IDL.Record({
        'terms': IDL.Nat,
        'chainName': IDL.Text,
        'collectionID': IDL.Nat,
        'yield': IDL.Float64,
        'collectionName': IDL.Text,
    });
    const ApprovedCollection = IDL.Record({
        'terms': IDL.Nat,
        'collectionID': IDL.Nat,
        'yield': IDL.Float64,
        'collectionName': IDL.Text,
    });
    const WithdrawRequest = IDL.Record({
        'transaction_id': IDL.Text,
        'fee_rate': IDL.Nat,
        'timestamp': IDL.Nat64,
        'bitcoinAddress': IDL.Text,
        'priority': IDL.Text,
        'asset_id': IDL.Text,
        'calculated_fee': IDL.Nat,
    });
    const EthereumAddress = IDL.Text;
    const TransactionDetail = IDL.Record({
        'transaction': IDL.Text,
        'fee_rate': IDL.Nat,
        'timestamp': IDL.Nat64,
        'bitcoinAddress': IDL.Text,
        'asset_id': IDL.Text,
    });
    const AddressPair = IDL.Record({
        'bitcoinAddress': IDL.Text,
        'ethereumAddress': IDL.Text,
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
        'addApprovedCollections': IDL.Func([IDL.Text], [IDL.Bool], []),
        'addApproved_Collections': IDL.Func([ApprovedCollection], [IDL.Bool], []),
        'addTransaction': IDL.Func([IDL.Text, IDL.Text], [], ['oneway']),
        'addUserSupply': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        'addWithDrawAssetsRequest': IDL.Func([WithdrawRequest], [IDL.Bool], []),
        'allowInscriptions': IDL.Func([EthereumAddress, IDL.Text], [IDL.Bool], []),
        'availableCycles': IDL.Func([], [IDL.Nat], ['query']),
        'copyApprovedCollectionsToChainTable': IDL.Func([], [], ['oneway']),
        'deleteAllowInscriptions': IDL.Func(
            [EthereumAddress, IDL.Text],
            [IDL.Bool],
            [],
        ),
        'deleteTransactionByKey': IDL.Func([IDL.Text], [IDL.Bool], []),
        'getAllApprovedCollections': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, ApprovedCollections))],
            ['query'],
        ),
        'getAllTransactionHistory': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(TransactionDetail)))],
            [],
        ),
        'getAllowInscriptions': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(EthereumAddress, IDL.Vec(IDL.Text)))],
            ['query'],
        ),
        'getApprovedCollections': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text))],
            ['query'],
        ),
        'getApprovedCollectionsByChain': IDL.Func(
            [IDL.Text],
            [IDL.Vec(IDL.Tuple(IDL.Text, ApprovedCollections))],
            ['query'],
        ),
        'getApproved_Collections': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, ApprovedCollection))],
            ['query'],
        ),
        'getTransactionByKey': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Text)],
            ['query'],
        ),
        'getTransactionHistory': IDL.Func(
            [IDL.Text],
            [IDL.Vec(TransactionDetail)],
            [],
        ),
        'getUserSupply': IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
        'getWithDrawAssetsRequest': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Nat, WithdrawRequest))],
            ['query'],
        ),
        'getWithDrawStatus': IDL.Func([IDL.Text], [IDL.Bool], []),
        'get_collections': IDL.Func([], [IDL.Text], []),
        'removeAllowInscriptions': IDL.Func([EthereumAddress], [IDL.Bool], []),
        'removeApprovedCollectionByName': IDL.Func([IDL.Text], [], []),
        'removeApprovedCollections': IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
        'removeApproved_Collections': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'removeWithDrawAssetsRequest': IDL.Func(
            [TransactionDetail],
            [IDL.Bool],
            [],
        ),
        'resetSupply': IDL.Func([IDL.Nat], [IDL.Bool], []),
        'retrieve': IDL.Func([IDL.Text], [IDL.Opt(IDL.Nat)], ['query']),
        'retrieveByBitcoinAddress': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Text)],
            ['query'],
        ),
        'retrieveByEthereumAddress': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Text)],
            ['query'],
        ),
        'retrieveById': IDL.Func([IDL.Nat], [IDL.Opt(AddressPair)], ['query']),
        'set_collections': IDL.Func([IDL.Text], [IDL.Bool], []),
        'storeAddress': IDL.Func([AddressPair], [IDL.Nat], []),
        'transform': IDL.Func(
            [TransformArgs],
            [CanisterHttpResponsePayload],
            ['query'],
        ),
        'updateYieldNTerms': IDL.Func(
            [IDL.Float64, IDL.Nat, IDL.Nat],
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