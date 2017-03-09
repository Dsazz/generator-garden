Feature: Health feature

  @health
  Scenario: I want to see good health
    Given  I am on external hosts "https://twitter.com/" with element
    Then   take screenshot
