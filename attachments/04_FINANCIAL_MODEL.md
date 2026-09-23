# FINANCIAL OPERATING MODEL

## Three financial truths

### Customer/loan ledger
Answers: what happened to the customer's obligation?

### Corporate GL
Answers: what does Trust own, owe, earn and spend?

### Treasury
Answers: can Trust fund obligations and remain liquid?

They reconcile but are not interchangeable.

## Chart of accounts — baseline

### Assets
1000 Cash and bank
1010 Payment-provider settlement receivable
1020 Loan principal receivable
1030 Accrued interest receivable
1040 Fee receivable
1050 Other receivables
1060 Expected-loss / impairment contra-account

### Liabilities
2000 Customer funds payable where applicable
2010 Provider settlement payable
2020 Accrued expenses
2030 Borrowings/funding
2040 Taxes payable
2050 Other liabilities

### Equity
3000 Share capital
3100 Share premium
3200 Retained earnings
3300 Current-period profit/loss

### Income
4000 Interest income
4010 Fee income
4020 Other operating income
4030 Recovery income where appropriate

### Expenses
5000 Funding cost
5010 Payment processing expense
5020 Credit loss expense
5030 Collection expense
5040 Technology expense
5050 Personnel expense
5060 Compliance expense
5070 Other operating expense

Actual account mapping must be finalized by Finance and external accounting/tax advisers.

## Journal examples

### Disbursement
DR Loan principal receivable
CR Cash / provider settlement

### Interest accrual
DR Accrued interest receivable
CR Interest income

### Fee recognition
DR Fee receivable / cash as applicable
CR Fee income

### Principal repayment
DR Cash / payment clearing
CR Loan principal receivable

### Interest repayment
DR Cash / payment clearing
CR Accrued interest receivable

### Payment reversal
Reverse the original journal with a new reversal journal. Never edit the original.

### Funding reservation
Treasury reservation is a controlled commitment state; it is not automatically a GL expense.

## Payment lifecycle

INITIATED → PENDING → PROVIDER PROCESSING → SUCCEEDED / FAILED / UNKNOWN → RECONCILED.

UNKNOWN is a legitimate state.

Never:
- blindly retry an unknown disbursement
- create a second payment merely because a provider timed out
- mark a payment successful based only on an app callback
- update a balance without a ledger event.

## Reconciliation

Daily minimum:
- provider transaction file/API
- internal payment records
- ledger
- bank/settlement account
- treasury position.

Exception categories:
- missing internal
- missing external
- amount mismatch
- currency mismatch
- duplicate
- timing difference
- unknown provider state
- incorrect allocation.

## Liquidity

Track:
- available cash
- committed funding
- reserved funding
- expected collections
- scheduled disbursements
- concentration
- stress scenarios.

Kill switch if liquidity or settlement risk breaches approved thresholds.
