# P2P Borrowing and Lending Protocol for Ordinals

This project is a peer-to-peer (P2P) borrowing and lending protocol that allows Borrowers to borrow Edu-Coin using their Ethereum NFTs as collateral. The protocol is built on a decentralized platform using smart contracts to ensure security and automation throughout the process. The entire DApp is powered by the [Open Campus blockchain](https://www.opencampus.xyz/), ensuring robust and scalable infrastructure.

## Smart Contracts

### Ordinals Bridged NFT
This contract handles the bridging of Ordinals to mint them as Open Campus NFTs.

- **Contract Address:** [0xDB8971813D745fe0a9C71C2b7f73fb6407027FA2](https://opencampus-codex.blockscout.com/address/0xDB8971813D745fe0a9C71C2b7f73fb6407027FA2?tab=contract)
  
### Registration
This contract manages Borrower registration within the protocol.

- **Contract Address:** [0x5B78CE843E7Be6c3897D1bfb6fBF1474344bCdC2](https://opencampus-codex.blockscout.com/address/0x5B78CE843E7Be6c3897D1bfb6fBF1474344bCdC2?tab=contract)

### Loan Ledger
This contract records and manages the loan requests, NFT collateral, and loan repayments.

- **Contract Address:** [0xB1ad3119D8713Bf109ff73A60feC2f1Fd2f55536](https://opencampus-codex.blockscout.com/address/0xB1ad3119D8713Bf109ff73A60feC2f1Fd2f55536?tab=contract)

## How It Works

1. **Bridge Ordinals**: Borrowers can bridge their Ordinals to mint them as Open Campus NFTs using the [Ordinals Bridged NFT Contract](https://opencampus-codex.blockscout.com/address/0xDB8971813D745fe0a9C71C2b7f73fb6407027FA2?tab=contract).

2. **Register**: Borrowers must register on the platform using the [Registration Contract](https://opencampus-codex.blockscout.com/address/0x5B78CE843E7Be6c3897D1bfb6fBF1474344bCdC2?tab=contract).

3. **Create Borrow Request**: After minting their NFTs, Borrowers can create a borrow request by locking their NFTs as collateral through the [Loan Ledger Contract](https://opencampus-codex.blockscout.com/address/0xB1ad3119D8713Bf109ff73A60feC2f1Fd2f55536?tab=contract).

4. **Lending**: Lenders can view and accept borrow requests, providing Edu-Coin loans to the borrower.

5. **Loan Repayment**: Borrowers repay the loan, and upon successful repayment, their NFTs are released from the smart contract.

6. **Collateral Management**: If the borrower fails to repay the loan, the NFTs are automatically transferred to the lender as compensation.

## Demo

Check out the demo of the protocol: [opencampus-ordinalfinance.web.app](https://opencampus-ordinalfinance.web.app)

## Powered By

This DApp is powered by the [Open Campus blockchain](https://www.opencampus.xyz/), providing a reliable and scalable infrastructure for all transactions.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

```mermaid
graph TD
    Borrower -->|Bridge Ordinals| OrdinalsBridgedNFT
    Borrower -->|Mint as Open Campus NFT| OpenCampusNFT
    Borrower -->|Create Borrow Request| LoanLedger
    Lender -->|View Borrow Requests| LoanLedger
    Lender -->|Accept Borrow Request| LoanLedger
    LoanLedger -->|Lock NFT| SmartContract
    SmartContract -->|If Loan Repaid| Borrower
    SmartContract -->|If Loan Unpaid| Lender
    SmartContract -->|Powered By| OpenCampusBlockchain


### How it Works

- **Borrower Actions:** Borrowers can bridge their Ordinals, mint them as Open Campus NFTs, and create borrow requests using the Loan Ledger.
- **Lender Actions:** Lenders can view and accept borrow requests, which locks the NFT as collateral.
- **Smart Contract Actions:** The smart contract manages the collateral, releasing it back to the Borrower if the loan is repaid or transferring it to the lender if not.
- **Infrastructure:** The entire DApp is powered by the Open Campus Blockchain.

### GitHub Integration

Copy the simplified Mermaid code into your `README.md` file on GitHub, and it should render correctly, illustrating the protocol's workflow.
