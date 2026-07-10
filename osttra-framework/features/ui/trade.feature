Feature: Account & Transaction Management (ParaBank)
  As a bank customer
  I want to manage my accounts and transactions
  So that I can track my financial activity

  Background:
    Given user is on the Account Overview page
  @smoke @ui
  Scenario: View all accounts on dashboard
    Then user should see account list table
    And table should have columns "Account", "Balance", "Available Amount"
    And at least 1 account should be visible

  @smoke @ui
  Scenario: Transfer funds between accounts
    When user navigates to "Transfer Funds"
    And user enters amount "100"
    And user selects "from" account from dropdown
    And user selects "to" account from dropdown
    And user clicks "Transfer" button
    Then success message "Transfer Complete!" should appear

  @regression @ui
  Scenario: View transaction history with date filter
    When user navigates to "Find Transactions"
    And user enters date range from "01-01-2024" to "31-12-2024"
    And user clicks "Find Transactions" button
    Then transaction table should load
    And each row should have "Date", "Description", "Debit", "Credit" columns

  @regression @ui
  Scenario Outline: Open new account with different types
    When user navigates to "Open New Account"
    And user selects account type "<type>"
    And user clicks "Open New Account" button
    Then new account confirmation should display

    Examples:
      | type     |
      | CHECKING |
      | SAVINGS  |

  @smoke @ui
  Scenario: Verify account details in new tab
    When user clicks on first account in the table
    Then account activity page should open
    And account number should be visible
    And transaction history table should be displayed