Feature: User Management API (reqres.in)
  As an API consumer
  I want to validate all CRUD operations
  So that backend contracts are verified

  @smoke @api
  Scenario: GET all users returns paginated list
    When I send GET request to "/api/users?page=1"
    Then response status should be 200
    And response should have field "data" as array
    And response should have field "total" as number
    And each user should have "id", "email", "first_name", "last_name"

  @smoke @api
  Scenario: POST create new user and verify response
    When I send POST request to "/api/users" with body:
      """
      {
        "name": "OSTTRA Trader",
        "job": "Automation Engineer"
      }
      """
    Then response status should be 201
    And response should have field "id"
    And response should have field "createdAt"

  @regression @api
  Scenario: Full CRUD chain — create, read, update, delete
    When I create user with name "Test User" and job "QA"
    Then user should be created with status 201
    And I store created user "id"
    When I send GET request to "/api/users/2"
    Then response status should be 200
    When I update stored user name to "Updated User"
    Then response status should be 200
    And response field "name" should equal "Updated User"

  @regression @api
  Scenario: Login API returns auth token
    When I send POST request to "/api/login" with body:
      """
      { "email": "eve.holt@reqres.in", "password": "cityslicka" }
      """
    Then response status should be 200
    And response should have field "token"
    And I store the "token" for subsequent requests

  @api
  Scenario: Negative — login with missing password returns 400
    When I send POST request to "/api/login" with body:
      """
      { "email": "eve.holt@reqres.in" }
      """
    Then response status should be 400
    And response field "error" should equal "Missing password"