Feature: Make a GET request
    In order to programmatically access
    As a Web Service User
    I need to have an ability to make a GET request and check response

    Scenario: Make a GET request to Fake Online REST API
        When I make GET request to "http://jsonplaceholder.typicode.com/posts/1"
        Then the status code should be 200
        And content type should be "application/json; charset=utf-8"
        And the JSON response should be:
        """
        {
            "userId": 1,
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
        }
        """
