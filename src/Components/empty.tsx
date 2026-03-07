import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Client,
  AccountId,
  PrivateKey,
  ContractCallQuery,
  ContractFunctionParameters,
  ContractExecuteTransaction,
} from "@hashgraph/sdk";
import { toast } from "react-toastify";
import "../Styles/TodoApp.css";

type Status = "Active" | "Completed" | "Expired";

const CONTRACT_ID = "0.0.8078086";

interface TodoAppProps {
  accountId: string | null;
  privateKey: string | null;
  evmAddress: string | null;
}

interface TodoItem {
  id: number;
  title: string;
  description: string;
  status: Status;
  owner: string;
}

const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

  // -------------------- Hedera Client --------------------
  const createClient = () => {
    if (!accountId || !privateKey) throw new Error("Wallet not connected");
    const client =
      import.meta.env.VITE_NETWORK === "mainnet"
        ? Client.forMainnet()
        : Client.forTestnet();
    client.setOperator(
      AccountId.fromString(accountId),
      PrivateKey.fromStringECDSA(privateKey)
    );
    return client;
  };

 
  const fetchTodos = async () => {
  if (!accountId || !privateKey || !evmAddress) return;

  try {
    const client = createClient();

    // 1. Get total todos
    const totalTx = await new ContractCallQuery()
      .setContractId(CONTRACT_ID)
      .setGas(100_000)
      .setFunction("getTotalTodos")
      .execute(client);

    const totalTodos = Number(totalTx.getUint256(0));
    const allTodos: TodoItem[] = [];

    // 2. Loop through and fetch details
    for (let i = 1; i <= totalTodos; i++) {
      const todoRes = await new ContractCallQuery()
        .setContractId(CONTRACT_ID)
        .setGas(400_000) 
        .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
        .execute(client);

      const title = todoRes.getString(0);
      const description = todoRes.getString(1);
      const statusIndex = Number(todoRes.getUint8(4)); 
      
      // The "0x00...7a647f" address from your screenshot
      const rawOwnerAddress = todoRes.getAddress(5); 

      // ✅ Normalize to "0.0.8021119" format
      const ownerAccountId = AccountId.fromSolidityAddress(rawOwnerAddress).toString();
      console.log("ownerAccountID", ownerAccountId)
      const statusMap: Record<number, Status> = {
        0: "Active",
        1: "Completed",
        2: "Expired"
      };

      allTodos.push({ 
        id: i, 
        title, 
        description, 
        status: statusMap[statusIndex] || "Expired", 
        owner: ownerAccountId, 
      });
    }

    // 3. Compare with YOUR normalized Account ID
    // accountId is the "0.0.xxxx" string passed as a prop
    const myNormalizedId = AccountId.fromString(accountId).toString();
    console.log("normalized evm", myNormalizedId)
    const userTodos = allTodos.filter(todo => todo.owner === myNormalizedId);

    setTodos(userTodos);
  } catch (err) {
    console.error("Fetch Error:", err);
    toast.error("Failed to sync with blockchain");
  }
};




  // -------------------- Add Todo --------------------
  const addTodo = async () => {
    if (!todoTitle || !accountId || !privateKey) {
      toast.error("Please enter a task");
      return;
    }

    try {
      const client = createClient();
      const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

      const tx = await new ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(500_000)
        .setFunction(
          "addTodo",
          new ContractFunctionParameters()
            .addString(todoTitle)
            .addString("")
            .addUint256(dueDate)
        )
        .execute(client);

      await tx.getReceipt(client);
      toast.success("Todo added!");
      setTodoTitle("");
      fetchTodos();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add todo");
    }
  };

 
const updateTodoStatus = async (todoId: number, newStatus: Status) => {
  if (!accountId || !privateKey || !evmAddress) {
    toast.error("Wallet not connected");
    return;
  }

  try {
    const client = createClient();
    
    // Map string status back to Solidity Enum integers
    // Active = 0, Completed = 1, Expired = 2
    const statusValue = newStatus === "Active" ? 0 : 1;

    toast.info(`Updating status to ${newStatus}...`, { autoClose: 2000 });

    const tx = await new ContractExecuteTransaction()
      .setContractId(CONTRACT_ID)
      .setGas(500_000)
      .setFunction(
        "updateStatus", 
        new ContractFunctionParameters()
          .addUint256(todoId)
          .addUint8(statusValue) // Passing the enum as uint8
      )
      .execute(client);

    const receipt = await tx.getReceipt(client);
    
    if (receipt.status.toString() === "SUCCESS") {
      toast.success(
        newStatus === "Active" 
          ? "Task reactivated (+1 week extension)!" 
          : "Task completed!"
      );
      fetchTodos(); // Refresh the list
    } else {
      throw new Error("Transaction failed");
    }

  } catch (err: any) {
    console.error("Update Error:", err);
    // Handle the specific revert message from your contract
    if (err.message.includes("Expired")) {
      toast.error("Cannot modify an expired task.");
    } else {
      toast.error("Failed to update status");
    }
  }
};
  // -------------------- Polling --------------------
  useEffect(() => {
    if (!accountId || !privateKey || !evmAddress) return;
    fetchTodos();
    const intervalId = setInterval(fetchTodos, 5000);
    return () => clearInterval(intervalId);
  }, [accountId, privateKey, evmAddress]);

  // -------------------- Filtered Todos --------------------
  const filteredTodos = todos.filter(t =>
    activeFilter === "All" ? true : t.status === activeFilter
  );

  return (
    <div className="todo-container">
      <Link to="/">home</Link>
      <h2 className="header-title">Todo List</h2>

      {/* Input Section */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Add a new task..."
          value={todoTitle}
          onChange={e => setTodoTitle(e.target.value)}
          className="main-input"
        />
        <button onClick={addTodo} className="add-btn">
          +
        </button>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
        {["All", "Active", "Completed"].map(tab => (
          <button
            key={tab}
            className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
            onClick={() => setActiveFilter(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Todo List / Empty State */}
      <div className="content-area">
        {filteredTodos.length > 0 ? (
          <div className="todo-list">
            {filteredTodos.map(todo => (
              <div key={todo.id} className="todo-card">
                <div className="todo-info">
                  <p className="todo-text">{todo.title}</p>
                  <span className={`status-badge ${todo.status.toLowerCase()}`}>
                    {todo.status}
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={todo.status === "Completed"}
                  disabled={todo.status === "Expired" || !evmAddress}
                  onChange={() =>
                    updateTodoStatus(
                      todo.id,
                      todo.status === "Completed" ? "Active" : "Completed"
                    )
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="check-icon-circle">
              <span className="checkmark">✓</span>
            </div>
            <p>Your todo list is empty. Add a task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;