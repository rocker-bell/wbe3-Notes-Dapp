// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {

    enum Status { Active, Completed, Expired }

    struct Todo {
        string title;
        string description;
        uint256 dueDate; // UNIX timestamp
        Status status;
    }

    mapping(uint256 => Todo) public todos;
    uint256 public todoCount;

    event TodoAdded(uint256 todoId, string title, string description, uint256 dueDate);
    event TodoStatusChanged(uint256 todoId, Status status);

    // -------------------- Add Todo --------------------
    function addTodo(
        string memory _title,
        string memory _description,
        uint256 _dueDate
    ) public {
        todoCount++;
        todos[todoCount] = Todo({
            title: _title,
            description: _description,
            dueDate: _dueDate,
            status: Status.Active
        });
        emit TodoAdded(todoCount, _title, _description, _dueDate);
    }

    // -------------------- Update Status --------------------
    function updateStatus(uint256 _todoId, Status _newStatus, uint256 extraTime) public {
        require(_todoId > 0 && _todoId <= todoCount, "Todo does not exist");

        Todo storage todo = todos[_todoId];

        // Auto-expire if past due date
        if (todo.status == Status.Active && todo.dueDate < block.timestamp) {
            todo.status = Status.Expired;
            emit TodoStatusChanged(_todoId, Status.Expired);
            return; // cannot update expired todos
        }

        require(todo.status != Status.Expired, "Cannot update expired todo");

        // If reverting Completed → Active, extend dueDate
        if (todo.status == Status.Completed && _newStatus == Status.Active) {
            todo.status = Status.Active;
            todo.dueDate = block.timestamp + extraTime; // extraTime in seconds
            emit TodoStatusChanged(_todoId, Status.Active);
            return;
        }

        // Normal Active → Completed
        if (todo.status == Status.Active && _newStatus == Status.Completed) {
            todo.status = Status.Completed;
            emit TodoStatusChanged(_todoId, Status.Completed);
            return;
        }
    }

    // -------------------- Get Todo --------------------
    function getTodo(uint256 _todoId) public view returns (
        string memory title,
        string memory description,
        uint256 dueDate,
        Status status
    ) {
        require(_todoId > 0 && _todoId <= todoCount, "Todo does not exist");
        Todo memory todo = todos[_todoId];

        // Expired status check for frontend
        Status currentStatus = todo.status;
        if (todo.status == Status.Active && todo.dueDate < block.timestamp) {
            currentStatus = Status.Expired;
        }

        return (todo.title, todo.description, todo.dueDate, currentStatus);
    }

    function getTotalTodos() public view returns (uint256) {
        return todoCount;
    }

    function getStatusAsString(Status _status) public pure returns (string memory) {
        if (_status == Status.Active) return "Active";
        if (_status == Status.Completed) return "Completed";
        return "Expired";
    }
}