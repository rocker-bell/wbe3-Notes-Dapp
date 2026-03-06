// import { useState, useEffect, useCallback } from "react";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// const TodoApp = () => {
//   const [accountId, setAccountId] = useState<string>("");
//   const [privateKey, setPrivateKey] = useState<string>("");

//   const [todoTitle, setTodoTitle] = useState("");
//   const [todoDescription, setTodoDescription] = useState("");
//   const [showModal, setShowModal] = useState(false);

//   const [todos, setTodos] = useState<
//     { title: string; description: string; status: Status }[]
//   >([]);

//   // ✅ Load wallet from localStorage safely
//   useEffect(() => {
//     const savedId = localStorage.getItem("hedera_account_id");
//     const savedKey = localStorage.getItem("hedera_private_key");

//     if (savedId && savedKey) {
//       setAccountId(savedId);
//       setPrivateKey(savedKey);
//     } else {
//       toast.error("Wallet not connected");
//     }
//   }, []);

//   // ✅ Safe Hedera client creator
//   const createClient = useCallback((): Client | null => {
//     try {
//       if (!accountId || !privateKey) return null;

//       const parsedAccountId = AccountId.fromString(accountId);
//       const parsedPrivateKey = PrivateKey.fromStringECDSA(privateKey);

//       const client =
//         import.meta.env.VITE_NETWORK === "mainnet"
//           ? Client.forMainnet()
//           : Client.forTestnet();

//       client.setOperator(parsedAccountId, parsedPrivateKey);

//       return client;
//     } catch (err) {
//       console.error("Client creation error:", err);
//       toast.error("Invalid wallet credentials");
//       return null;
//     }
//   }, [accountId, privateKey]);

//   // ---------------- FETCH TODOS ----------------
//   const fetchTodos = useCallback(async () => {
//     const client = createClient();
//     if (!client) return;

//     try {
//       const totalTodosTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(100000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       // 👇 safer conversion
//       const totalTodos = Number(
//         totalTodosTx.getUint256(0).toString()
//       );

//       const allTodos: {
//         title: string;
//         description: string;
//         status: Status;
//       }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200000)
//           .setFunction(
//             "getTodo",
//             new ContractFunctionParameters().addUint256(i)
//           )
//           .execute(client);

//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);

//         const statusIndex = Number(
//           todoRes.getUint256(3).toString()
//         );

//         const status: Status =
//           statusIndex === 0
//             ? "Active"
//             : statusIndex === 1
//             ? "Completed"
//             : "Expired";

//         allTodos.push({ title, description, status });
//       }

//       setTodos(allTodos);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       toast.error("Failed to fetch todos");
//     }
//   }, [createClient]);

//   // Auto-fetch when wallet loads
//   useEffect(() => {
//     if (accountId && privateKey) {
//       fetchTodos();
//     }
//   }, [accountId, privateKey, fetchTodos]);

//   // ---------------- ADD TODO ----------------
//   const AddTodo = async () => {
//     if (!todoTitle.trim()) {
//       toast.error("Title is required");
//       return;
//     }

//     const client = createClient();
//     if (!client) return;

//     try {
//       const dueDate = Math.floor(Date.now() / 1000) + 86400;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString(todoDescription)
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       toast.success("Todo added!");

//       setTodoTitle("");
//       setTodoDescription("");
//       setShowModal(false);

//       fetchTodos();
//     } catch (err) {
//       console.error("Add error:", err);
//       toast.error("Failed to add todo");
//     }
//   };

//   return (
//     <div className="TodoAppcontainer" >
//       <button onClick={() => setShowModal(true)} className="btn">
//         Add Todo
//       </button>

//       {showModal && (
//         <div className="modal-backdrop">
//           <div className="modal">
//             <h3>Add Todo</h3>

//             <input
//               type="text"
//               placeholder="Title"
//               value={todoTitle}
//               onChange={(e) => setTodoTitle(e.target.value)}
//               className="input"
//             />

//             <textarea
//               placeholder="Description"
//               value={todoDescription}
//               onChange={(e) => setTodoDescription(e.target.value)}
//               className="textarea"
//             />

//             <div className="button-group">
//               <button onClick={AddTodo} className="btn">
//                 Add
//               </button>

//               <button
//                 onClick={() => setShowModal(false)}
//                 className="btn disconnect"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {todos.length > 0 && (
//         <div className="todo-list">
//           <h3>Todo List</h3>

//           {todos.map((todo, idx) => (
//             <div key={idx} className="todo-item">
//               <p><strong>Title:</strong> {todo.title}</p>
//               <p><strong>Description:</strong> {todo.description}</p>
//               <p><strong>Status:</strong> {todo.status}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TodoApp;

// import { useState, useEffect } from "react";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/ConnectWallet.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
// }

// const TodoApp = ({ accountId, privateKey }: TodoAppProps) => {
//   const [todos, setTodos] = useState<{ title: string; description: string; status: Status }[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [todoDescription, setTodoDescription] = useState("");
//   const [todoStatus, setTodoStatus] = useState<Status>("Active");
//   const [showModal, setShowModal] = useState(false);

//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client = import.meta.env.VITE_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

    

//   const fetchTodos = async () => {
//     if (!accountId || !privateKey) return;

//     try {
//       const client = createClient();
//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(100_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: { title: string; description: string; status: Status }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200_000)
//           .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//           .execute(client);

//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);
//         const statusIndex = Number(todoRes.getUint256(3));
//         const status: Status = statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//         allTodos.push({ title, description, status });
//       }

//       setTodos(allTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Wallet not connected or title missing");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters().addString(todoTitle).addString(todoDescription).addUint256(dueDate)
//         )
//         .execute(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       setTodoDescription("");
//       setShowModal(false);
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   useEffect(() => {
//     if (accountId && privateKey) fetchTodos();
//   }, [accountId, privateKey]);

//   return (
//     <div className="TodoAppcontainer">
//       <button onClick={() => setShowModal(true)} className="btn">
//         Add Todo
//       </button>

//       {showModal && (
//         <div className="modal-backdrop">
//           <div className="modal">
//             <h3>Add Todo</h3>
//             <input
//               type="text"
//               placeholder="Title"
//               value={todoTitle}
//               onChange={(e) => setTodoTitle(e.target.value)}
//               className="input"
//             />
//             <textarea
//               placeholder="Description"
//               value={todoDescription}
//               onChange={(e) => setTodoDescription(e.target.value)}
//               className="textarea"
//             />
//             <div className="button-group">
//               <button onClick={addTodo} className="btn">Add</button>
//               <button onClick={() => setShowModal(false)} className="btn disconnect">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {todos.length > 0 && (
//         <div className="todo-list">
//           <h3>Todo List</h3>
//           {todos.map((todo, idx) => (
//             <div key={idx} className="todo-item">
//               <p><strong>Title:</strong> {todo.title}</p>
//               <p><strong>Description:</strong> {todo.description}</p>
//               <p><strong>Status:</strong> {todo.status}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TodoApp;


// import { useState, useEffect } from "react";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/ConnectWallet.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
// }

// const TodoApp = ({ accountId, privateKey }: TodoAppProps) => {
//   const [todos, setTodos] = useState<{ title: string; description: string; status: Status }[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [todoDescription, setTodoDescription] = useState("");
//   const [todoStatus, setTodoStatus] = useState<Status>("Active");
//   const [showModal, setShowModal] = useState(false);

//   // -------------------- Create Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client = import.meta.env.VITE_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

//   // -------------------- Fetch Todos --------------------
//   const fetchTodos = async () => {
//     if (!accountId || !privateKey) return;

//     try {
//       const client = createClient();

//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(100_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: { title: string; description: string; status: Status }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200_000)
//           .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//           .execute(client);

//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);

//         // ✅ Correct status index — adjust based on your contract
//         const statusIndex = Number(todoRes.getUint256(2));
//         const status: Status =
//           statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//         allTodos.push({ title, description, status });
//       }

//       setTodos(allTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Wallet not connected or title missing");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString(todoDescription)
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       setTodoDescription("");
//       setTodoStatus("Active");
//       setShowModal(false);

//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Fetch todos on wallet connect --------------------
//   useEffect(() => {
//     if (accountId && privateKey) fetchTodos();
//   }, [accountId, privateKey]);

//   // -------------------- Render --------------------
//   return (
//     <div className="TodoAppcontainer">
//       <button onClick={() => setShowModal(true)} className="btn">
//         Add Todo
//       </button>

//       {showModal && (
//         <div className="modal-backdrop">
//           <div className="modal">
//             <h3>Add Todo</h3>
//             <input
//               type="text"
//               placeholder="Title"
//               value={todoTitle}
//               onChange={(e) => setTodoTitle(e.target.value)}
//               className="input"
//             />
//             <textarea
//               placeholder="Description"
//               value={todoDescription}
//               onChange={(e) => setTodoDescription(e.target.value)}
//               className="textarea"
//             />
//             <select
//               value={todoStatus}
//               onChange={(e) => setTodoStatus(e.target.value as Status)}
//               className="select"
//             >
//               <option value="Active">Active</option>
//               <option value="Completed">Completed</option>
//               <option value="Expired">Expired</option>
//             </select>
//             <div className="button-group">
//               <button onClick={addTodo} className="btn">Add</button>
//               <button onClick={() => setShowModal(false)} className="btn disconnect">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {todos.length > 0 && (
//         <div className="todo-list">
//           <h3>Todo List</h3>
//           {todos.map((todo, idx) => (
//             <div key={idx} className="todo-item">
//               <p><strong>Title:</strong> {todo.title}</p>
//               <p><strong>Description:</strong> {todo.description}</p>
//               <p><strong>Status:</strong> {todo.status}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {todos.length === 0 && <p>No todos found.</p>}
//     </div>
//   );
// };

// export default TodoApp;

// import { useState, useEffect } from "react";
// import {Link} from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
// }

// const TodoApp = ({ accountId, privateKey }: TodoAppProps) => {
//   const [todos, setTodos] = useState<{ title: string; description: string; status: Status }[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

//   // -------------------- Create Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client = import.meta.env.VITE_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

//   // -------------------- Fetch Todos --------------------
//   // const fetchTodos = async () => {
//   //   if (!accountId || !privateKey) return;

//   //   try {
//   //     const client = createClient();

//   //     const totalTx = await new ContractCallQuery()
//   //       .setContractId(CONTRACT_ID)
//   //       .setGas(500_000)
//   //       .setFunction("getTotalTodos")
//   //       .execute(client);

//   //     const totalTodos = Number(totalTx.getUint256(0));
//   //     const allTodos: { title: string; description: string; status: Status }[] = [];

//   //     for (let i = 1; i <= totalTodos; i++) {
//   //       const todoRes = await new ContractCallQuery()
//   //         .setContractId(CONTRACT_ID)
//   //         .setGas(200_000)
//   //         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//   //         .execute(client);

//   //       const title = todoRes.getString(0);
//   //       const description = todoRes.getString(1);
//   //       const statusIndex = Number(todoRes.getUint256(2));
//   //       const status: Status =
//   //         statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//   //       allTodos.push({ title, description, status });
//   //     }

//   //     setTodos(allTodos);
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error("Failed to fetch todos");
//   //   }
//   // };

//   const fetchTodos = async () => {
//   if (!accountId || !privateKey) return;

//   try {
//     const client = createClient();

//     const totalTx = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(500_000)
//       .setFunction("getTotalTodos")
//       .execute(client);

//     const totalTodos = Number(totalTx.getUint256(0));
//     const allTodos: { title: string; description: string; status: Status }[] = [];

//     for (let i = 1; i <= totalTodos; i++) {
//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//         .execute(client);

//       const title = todoRes.getString(0);
//       const description = todoRes.getString(1);
//       const statusIndex = Number(todoRes.getUint256(3)); // <-- index 3, not 2
//       const status: Status =
//         statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//       allTodos.push({ title, description, status });
//     }

//     setTodos(allTodos);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to fetch todos");
//   }
// };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Please enter a task");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString("") // Keeping description empty for the quick-add UI
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   useEffect(() => {
//     if (accountId && privateKey) fetchTodos();
//   }, [accountId, privateKey]);

//   // Filter logic
//   const filteredTodos = todos.filter(t => 
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   return (
//     <div className="todo-container">

//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       {/* Input Section */}
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={(e) => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">+</button>
//       </div>

//       {/* Tabs Section */}
//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map((tab) => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* List / Empty State */}
//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map((todo, idx) => (
//               <div key={idx} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;


// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// // TodoApp.tsx
// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null; // ✅ add this
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<{ title: string; description: string; status: Status }[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

//   // -------------------- Create Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client = import.meta.env.VITE_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

//   // -------------------- Fetch Todos --------------------
//   // const fetchTodos = async () => {
//   //   if (!accountId || !privateKey) return;

//   //   try {
//   //     const client = createClient();

//   //     const totalTx = await new ContractCallQuery()
//   //       .setContractId(CONTRACT_ID)
//   //       .setGas(500_000)
//   //       .setFunction("getTotalTodos")
//   //       .execute(client);

//   //     const totalTodos = Number(totalTx.getUint256(0));
//   //     const allTodos: { title: string; description: string; status: Status }[] = [];

//   //     for (let i = 1; i <= totalTodos; i++) {
//   //       const todoRes = await new ContractCallQuery()
//   //         .setContractId(CONTRACT_ID)
//   //         .setGas(200_000)
//   //         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//   //         .execute(client);

//   //       const title = todoRes.getString(0);
//   //       const description = todoRes.getString(1);
//   //       const statusIndex = Number(todoRes.getUint256(3)); // <-- correct index
//   //       const status: Status =
//   //         statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//   //       allTodos.push({ title, description, status });
//   //     }

//   //     setTodos(allTodos);
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error("Failed to fetch todos");
//   //   }
//   // };

//   // -------------------- Fetch Todos (only for current wallet) --------------------
// // const fetchTodos = async () => {
// //   if (!accountId || !privateKey || !evmAddress) return;

// //   try {
// //     const client = createClient();

// //     const totalTx = await new ContractCallQuery()
// //       .setContractId(CONTRACT_ID)
// //       .setGas(500_000)
// //       .setFunction("getTotalTodos")
// //       .execute(client);

// //     const totalTodos = Number(totalTx.getUint256(0));
// //     const userTodos: { title: string; description: string; status: Status }[] = [];

// //     for (let i = 1; i <= totalTodos; i++) {
// //       const todoRes = await new ContractCallQuery()
// //         .setContractId(CONTRACT_ID)
// //         .setGas(200_000)
// //         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
// //         .execute(client);

// //       const owner = todoRes.getAddress(4); // EVM address of todo creator
// //       if (owner.toLowerCase() !== evmAddress.toLowerCase()) continue; // only include todos for this wallet

// //       const title = todoRes.getString(0);
// //       const description = todoRes.getString(1);
// //       const statusIndex = Number(todoRes.getUint256(3));
// //       const status: Status =
// //         statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

// //       userTodos.push({ title, description, status });
// //     }

// //     setTodos(userTodos);
// //   } catch (err) {
// //     console.error(err);
// //     toast.error("Failed to fetch todos");
// //   }
// // };

// const fetchTodos = async () => {
//   if (!accountId || !privateKey || !evmAddress) return;

//   try {
//     const client = createClient();

//     const totalTx = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(500_000)
//       .setFunction("getTotalTodos")
//       .execute(client);

//     const totalTodos = Number(totalTx.getUint256(0));
//     const allTodos: { title: string; description: string; status: Status; owner: string }[] = [];

//     for (let i = 1; i <= totalTodos; i++) {
//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//         .execute(client);

//       const title = todoRes.getString(0);
//       const description = todoRes.getString(1);
//       const statusIndex = Number(todoRes.getUint256(3));
//       const owner = todoRes.getAddress(5); // EVM address of creator
//       const status: Status =
//         statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//       allTodos.push({ title, description, status, owner });
//     }

//     // filter **after fetching all todos**
//     const userTodos = allTodos.filter(todo => todo.owner.toLowerCase() === evmAddress.toLowerCase());

//     setTodos(userTodos);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to fetch todos");
//   }
// };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Please enter a task");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString("") // description empty for quick-add
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };



// const updateTodoStatus = async (todoIndex: number, newStatus: Status) => {
//   if (!accountId || !privateKey || !evmAddress) {
//     toast.error("Wallet not connected");
//     return;
//   }

//   const client = createClient();
//   const todoId = todoIndex + 1; // convert UI index to 1-based

//   try {
//     // fetch todo to verify owner
//     const todoRes = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(200_000)
//       .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//       .execute(client);

//     const owner = todoRes.getAddress(4); // EVM address of the todo creator
//     console.log("owner", owner)
//     console.log("evm address", evmAddress)
//     // ✅ Compare with global evmAddress instead of accountId
//     if (owner.toLowerCase() !== evmAddress.toLowerCase()) {
//       toast.error("You are not the owner of this todo");
//       return;
//     }

//     // execute status update
//     const tx = await new ContractExecuteTransaction()
//       .setContractId(CONTRACT_ID)
//       .setGas(300_000)
//       .setFunction(
//         "updateStatus",
//         new ContractFunctionParameters()
//           .addUint256(todoId)
//           .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
//       )
//       .execute(client);

//     await tx.getReceipt(client);

//     toast.success(`Todo marked as ${newStatus}`);
//     fetchTodos();
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to update todo status");
//   }
// };

//   // -------------------- Polling / Hot reload --------------------
//   useEffect(() => {
//     if (!accountId || !privateKey) return;

//     fetchTodos(); // initial fetch

//     const intervalId = setInterval(() => {
//       fetchTodos(); // poll every 5 seconds
//     }, 5000);

//     return () => clearInterval(intervalId);
//   }, [accountId, privateKey]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t =>
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   return (
//     <div className="todo-container">

//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       {/* Input Section */}
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={(e) => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">+</button>
//       </div>

//       {/* Tabs Section */}
//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map((tab) => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* List / Empty State */}
//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map((todo, idx) => (
//               <div key={idx} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//                 {/* <input type="checkbox" name="" id="" /> */}
//                 <input
//     type="checkbox"
//     className="checkbox"
//     checked={todo.status === "Completed"}
//     disabled={todo.status === "Expired" || !evmAddress} // cannot complete expired
//     onChange={() =>
//       updateTodoStatus(idx, todo.status === "Completed" ? "Active" : "Completed")
//     }
//   />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;

// workksksks

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null;
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<
//     { title: string; description: string; status: Status; owner: string }[]
//   >([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

//   // -------------------- Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client =
//       import.meta.env.VITE_NETWORK === "mainnet"
//         ? Client.forMainnet()
//         : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

//   // -------------------- Fetch Todos --------------------
//   const fetchTodos = async () => {
//     if (!accountId || !privateKey || !evmAddress) return;

//     try {
//       const client = createClient();

//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: { title: string; description: string; status: Status; owner: string }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200_000)
//           .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//           .execute(client);


//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);
//         const statusIndex = Number(todoRes.getUint256(3));
//         const owner = todoRes.getAddress(4);
//         const status: Status =
//           statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//         allTodos.push({ title, description, status, owner });
//           console.log("OWNER FROM CONTRACT:", owner);
// console.log("USER EVM ADDRESS:", evmAddress);
//       }

//       // Filter after fetching all todos
    
//       const userTodos = allTodos.filter(todo => todo.owner.toLowerCase() === evmAddress.toLowerCase());
//       setTodos(userTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Please enter a task");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString("") // description
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       await tx.getReceipt(client); // ✅ wait for confirmation

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos(); // fetch after confirmed
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Update Todo Status --------------------
//   const updateTodoStatus = async (todoIndex: number, newStatus: Status) => {
//     if (!accountId || !privateKey || !evmAddress) {
//       toast.error("Wallet not connected");
//       return;
//     }

//     try {
//       const client = createClient();
//       const todoId = todoIndex + 1; // UI index to 1-based

//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       const owner = todoRes.getAddress(4);
//       if (owner.toLowerCase() !== evmAddress.toLowerCase()) {
//         toast.error("You are not the owner of this todo");
//         return;
//       }

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction(
//           "updateStatus",
//           new ContractFunctionParameters()
//             .addUint256(todoId)
//             .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
//         )
//         .execute(client);

//       await tx.getReceipt(client);
//       toast.success(`Todo marked as ${newStatus}`);
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update todo status");
//     }
//   };

//   // -------------------- Polling --------------------
//   useEffect(() => {
//     if (!accountId || !privateKey) return;

//     fetchTodos(); // initial fetch
//     const intervalId = setInterval(fetchTodos, 5000);
//     return () => clearInterval(intervalId);
//   }, [accountId, privateKey, evmAddress]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t =>
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   return (
//     <div className="todo-container">
//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       {/* Input Section */}
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={(e) => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">+</button>
//       </div>

//       {/* Tabs Section */}
//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map(tab => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Todo List / Empty State */}
//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map((todo, idx) => (
//               <div key={idx} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="checkbox"
//                   checked={todo.status === "Completed"}
//                   disabled={todo.status === "Expired" || !evmAddress}
//                   onChange={() =>
//                     updateTodoStatus(idx, todo.status === "Completed" ? "Active" : "Completed")
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;

// close

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null;
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<
//     { title: string; description: string; status: Status; owner: string }[]
//   >([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

//   // -------------------- Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client =
//       import.meta.env.VITE_NETWORK === "mainnet"
//         ? Client.forMainnet()
//         : Client.forTestnet();
//     client.setOperator(
//       AccountId.fromString(accountId),
//       PrivateKey.fromStringECDSA(privateKey)
//     );
//     return client;
//   };

//   // -------------------- Fetch Todos --------------------
//   const fetchTodos = async () => {
//     if (!accountId || !privateKey || !evmAddress) return;

//     try {
//       const client = createClient();

//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: { title: string; description: string; status: Status; owner: string }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200_000)
//           .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//           .execute(client);

//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);
//         const statusIndex = Number(todoRes.getUint256(3));
//         let owner = todoRes.getAddress(4);

//         // ---------------- Normalize owner ----------------
//         owner = owner.startsWith("0x") ? owner.toLowerCase() : "0x" + owner.toLowerCase();

//         const status: Status =
//           statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//         allTodos.push({ title, description, status, owner });

//         console.log("OWNER FROM CONTRACT:", owner);
//         console.log("USER EVM ADDRESS:", evmAddress);
//       }

//       // Filter only todos created by the connected account
//       const normalizedEvm = evmAddress.toLowerCase();
//       const userTodos = allTodos.filter(todo => todo.owner === normalizedEvm);

//       setTodos(userTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Please enter a task");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters().addString(todoTitle).addString("").addUint256(dueDate)
//         )
//         .execute(client);

//       await tx.getReceipt(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Update Todo Status --------------------
//   const updateTodoStatus = async (todoIndex: number, newStatus: Status) => {
//     if (!accountId || !privateKey || !evmAddress) {
//       toast.error("Wallet not connected");
//       return;
//     }

//     try {
//       const client = createClient();
//       const todoId = todoIndex + 1;

//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       let owner = todoRes.getAddress(4);
//       owner = owner.startsWith("0x") ? owner.toLowerCase() : "0x" + owner.toLowerCase();

//       // if (owner !== evmAddress.toLowerCase()) {
//       //   toast.error("You are not the owner of this todo");
//       //   return;
//       // }

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction(
//           "updateStatus",
//           new ContractFunctionParameters()
//             .addUint256(todoId)
//             .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
//         )
//         .execute(client);

//       await tx.getReceipt(client);
//       toast.success(`Todo marked as ${newStatus}`);
//       fetchTodos();
//     // } catch (err) {
//     //   console.error(err);
//     //   toast.error("Failed to update todo status");
//     // }
//       }
//     catch (err: any) {
//   console.error("Full error:", err);
//   console.error("Receipt status:", err?.receipt?.status);
//   toast.error("Failed to update todo status");
// }
//   };

//   // -------------------- Polling --------------------
//   useEffect(() => {
//     if (!accountId || !privateKey) return;

//     fetchTodos();
//     const intervalId = setInterval(fetchTodos, 5000);
//     return () => clearInterval(intervalId);
//   }, [accountId, privateKey, evmAddress]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t =>
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   return (
//     <div className="todo-container">
//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       {/* Input Section */}
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={e => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">
//           +
//         </button>
//       </div>

//       {/* Tabs Section */}
//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map(tab => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Todo List / Empty State */}
//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map((todo, idx) => (
//               <div key={idx} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="checkbox"
//                   checked={todo.status === "Completed"}
//                   disabled={todo.status === "Expired" || !evmAddress}
//                   onChange={() =>
//                     updateTodoStatus(idx, todo.status === "Completed" ? "Active" : "Completed")
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;

// test 

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractExecuteTransaction,
//   ContractFunctionParameters,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";
// const TODOADDED_TOPIC = "0x047c1201ec21e0a52925e5d50993a0e2a6be472a687c0422d9ee9ff00f04867f"; // TodoAdded event signature

// interface Todo {
//   todoId: number;
//   title: string;
//   description: string;
//   dueDate: number;
//   status: Status;
//   owner: string;
// }

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null;
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<Todo[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

//   // -------------------- Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client =
//       import.meta.env.VITE_NETWORK === "mainnet"
//         ? Client.forMainnet()
//         : Client.forTestnet();
//     client.setOperator(
//       AccountId.fromString(accountId),
//       PrivateKey.fromStringECDSA(privateKey)
//     );
//     return client;
//   };

//   // -------------------- Fetch Todos via Hashscan --------------------
//   const fetchTodos = async () => {
//     if (!evmAddress) return;

//     try {
//       // Hashscan Mirror API
//       const mirrorUrl =
//         import.meta.env.VITE_NETWORK === "mainnet"
//           ? "https://api.hashscan.io/api/v1"
//           : "https://testnet.hashscan.io/api/v1";

//       const res = await fetch(
//         `${mirrorUrl}/contracts/${CONTRACT_ID}/results/logs?topic0=${TODOADDED_TOPIC}&limit=100`
//       );

//       if (!res.ok) throw new Error("Failed to fetch logs from Hashscan");

//       const data = await res.json();

//       const userTodos: Todo[] = data.logs
//         .map((log: any) => {
//           // Extract raw data
//           const hex = log.data as string;

//           // todoId (uint256) - first 32 bytes
//           const todoId = parseInt(hex.slice(0, 64), 16);

//           // dueDate (uint256) - last 32 bytes (simplified, adjust if needed)
//           const dueDate = parseInt(hex.slice(-64), 16);

//           // owner/accountId from last 20 bytes
//           const owner = "0x" + hex.slice(-40).toLowerCase();

//           // For title & description, use parsed if available
//           const title = log.parsed?.title || "Unknown";
//           const description = log.parsed?.description || "";

//           return { todoId, title, description, dueDate, status: "Active" as Status, owner };
//         })
//         .filter((todo: Todo) => todo.owner === evmAddress.toLowerCase());

//       setTodos(userTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos from Hashscan");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Please enter a task");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString("")
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       await tx.getReceipt(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Update Todo Status using real todoId --------------------
//   // const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//   //   if (!accountId || !privateKey || !evmAddress) {
//   //     toast.error("Wallet not connected");
//   //     return;
//   //   }

//   //   try {
//   //     const client = createClient();

//   //     const todoRes = await new ContractExecuteTransaction()
//   //       .setContractId(CONTRACT_ID)
//   //       .setGas(200_000)
//   //       .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//   //       .execute(client);

//   //     // Get owner from contract response (SDK still works here)
//   //     const owner = todoRes.decodeAddress(0); // adjust index if needed

//   //     if (owner.toLowerCase() !== evmAddress.toLowerCase()) {
//   //       toast.error("You are not the owner of this todo");
//   //       return;
//   //     }

//   //     const tx = await new ContractExecuteTransaction()
//   //       .setContractId(CONTRACT_ID)
//   //       .setGas(300_000)
//   //       .setFunction(
//   //         "updateStatus",
//   //         new ContractFunctionParameters()
//   //           .addUint256(todoId)
//   //           .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
//   //       )
//   //       .execute(client);

//   //     await tx.getReceipt(client);
//   //     toast.success(`Todo marked as ${newStatus}`);
//   //     fetchTodos();
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error("Failed to update todo status");
//   //   }
//   // };


//   const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//   const client = createClient();

//   const tx = await new ContractExecuteTransaction()
//     .setContractId(CONTRACT_ID)
//     .setGas(300_000)
//     .setFunction(
//       "updateStatus",
//       new ContractFunctionParameters()
//         .addUint256(todoId)
//         .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
//     )
//     .execute(client);

//   await tx.getReceipt(client);
//   toast.success(`Todo marked as ${newStatus}`);
//   fetchTodos();; // refresh from logs
// };

//   // -------------------- Polling --------------------
//   useEffect(() => {
//     if (!accountId || !privateKey) return;

//     fetchTodos();
//     const intervalId = setInterval(fetchTodos, 5000);
//     return () => clearInterval(intervalId);
//   }, [accountId, privateKey, evmAddress]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t =>
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   return (
//     <div className="todo-container">
//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       {/* Input Section */}
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={e => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">
//           +
//         </button>
//       </div>

//       {/* Tabs Section */}
//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map(tab => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Todo List / Empty State */}
//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map(todo => (
//               <div key={todo.todoId} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="checkbox"
//                   checked={todo.status === "Completed"}
//                   disabled={todo.status === "Expired" || !evmAddress}
//                   onChange={() =>
//                     updateTodoStatus(
//                       todo.todoId,
//                       todo.status === "Completed" ? "Active" : "Completed"
//                     )
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;



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


const CONTRACT_ID = "0.0.8028090";
// const CONTRACT_ID = "0.0.8078086";

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

  // -------------------- Fetch Todos --------------------
  const fetchTodos = async () => {
    if (!accountId || !privateKey || !evmAddress) return;

    try {
      const client = createClient();

      // Get total todos
      const totalTx = await new ContractCallQuery()
        .setContractId(CONTRACT_ID)
        .setGas(500_000)
        .setFunction("getTotalTodos")
        .execute(client);

      const totalTodos = Number(totalTx.getUint256(0));
      const allTodos: TodoItem[] = [];

      for (let i = 1; i <= totalTodos; i++) {
        const todoRes = await new ContractCallQuery()
          .setContractId(CONTRACT_ID)
          .setGas(200_000)
          .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
          .execute(client);

        const title = todoRes.getString(0);
        const description = todoRes.getString(1);
        const statusIndex = Number(todoRes.getUint256(3));
        let owner = todoRes.getAddress(4);

        owner = owner.startsWith("0x") ? owner.toLowerCase() : "0x" + owner.toLowerCase();

        const status: Status =
          statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

        allTodos.push({ id: i, title, description, status, owner });
      }

      // Only show todos owned by connected user
      const normalizedEvm = evmAddress.toLowerCase();
      const userTodos = allTodos.filter(todo => todo.owner === normalizedEvm);
      
      setTodos(userTodos);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch todos");
    }
  };

//  const fetchTodos = async () => {
//   if (!accountId || !privateKey || !evmAddress) return;

//   try {
//     const client = createClient();

//     // 1️⃣ Get total todos
//     const totalTx = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(500_000)
//       .setFunction("getTotalTodos")
//       .execute(client);

//     const totalTodos = Number(totalTx.getUint256(0));
//     const allTodos: TodoItem[] = [];

//     // Normalize connected wallet once
//     const normalizedWallet = evmAddress.toLowerCase();

//     for (let i = 1; i <= totalTodos; i++) {
//       // 2️⃣ Fetch each todo
//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//         .execute(client);

//       const title = todoRes.getString(0);
//       const description = todoRes.getString(1);
//       const statusIndex = Number(todoRes.getUint256(3));

//       // 3️⃣ Get owner — Hedera quirk may return 0x0 if SDK can't decode
//       // 3️⃣ Get owner — Grab the 32-byte slot at index 4
// const slotBytes = todoRes.getBytes32(4); 

// // Addresses are the last 20 bytes of the 32-byte slot
// const addressBytes = slotBytes.slice(-20);

// const owner = "0x" + Array.from(addressBytes)
//   .map(b => b.toString(16).padStart(2, '0'))
//   .join('')
//   .toLowerCase();

// console.log("Extracted Owner:", owner);

//       // 4️⃣ Determine status
//       const status: Status =
//         statusIndex === 0 ? "Active" :
//         statusIndex === 1 ? "Completed" : "Expired";

//       allTodos.push({ id: i, title, description, status, owner });
//     }

//     // 5️⃣ Only show todos owned by the connected wallet
//     const userTodos = allTodos.filter(todo => todo.owner === normalizedWallet);

//     console.log("Connected EVM:", normalizedWallet);
//     console.log("All Todos:", allTodos);

//     setTodos(userTodos);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to fetch todos");
//   }
// };

// const fetchTodos = async () => {
//   if (!accountId || !privateKey || !evmAddress) return;

//   try {
//     const client = createClient();

//     const totalTx = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(500_000)
//       .setFunction("getTotalTodos")
//       .execute(client);

//     const totalTodos = Number(totalTx.getUint256(0));
//     const allTodos: TodoItem[] = [];

//     for (let i = 1; i <= totalTodos; i++) {
//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//         .execute(client);

//       const title = todoRes.getString(0);
//       const description = todoRes.getString(1);
//       const statusIndex = Number(todoRes.getUint256(3));
//       let owner = todoRes.getAddress(4); // may return 0x000...000

//       owner = owner.toLowerCase();

//       const now = Math.floor(Date.now() / 1000);
//       const status: Status = statusIndex === 1
//         ? "Completed"
//         : statusIndex === 2
//         ? "Expired"
//         : "Active";

//       allTodos.push({ id: i, title, description, status, owner });
//     }

//     console.log("All Todos:", allTodos);
//     setTodos(allTodos);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to fetch todos dynamically");
//   }
// };

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

  // -------------------- Update Todo Status --------------------
  const updateTodoStatus = async (todoId: number, newStatus: Status) => {
    console.log("todoId", todoId)
    if (!accountId || !privateKey || !evmAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const client = createClient();

      // Get owner for this todo from contract
      const todoRes = await new ContractCallQuery()
        .setContractId(CONTRACT_ID)
        .setGas(200_000)
        .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
        .execute(client);

      let owner = todoRes.getAddress(4);
      owner = owner.startsWith("0x") ? owner.toLowerCase() : "0x" + owner.toLowerCase();

      // ✅ Check ownership
      if (owner !== evmAddress.toLowerCase()) {
        toast.error("You are not the owner of this todo");
        return;
      }

      // Execute updateStatus
      const tx = await new ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(300_000)
        .setFunction(
          "updateStatus",
          new ContractFunctionParameters()
            .addUint256(todoId)
            .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
        )
        .execute(client);

      await tx.getReceipt(client);
      toast.success(`Todo marked as ${newStatus}`);
      fetchTodos();
    } catch (err: any) {
      console.error("Full error:", err);
      console.error("Receipt status:", err?.receipt?.status);
      toast.error("Failed to update todo status");
    }
  };

//   const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//     console.log("todoId", todoId)
//   if (!accountId || !privateKey || !evmAddress) {
//     toast.error("Wallet not connected");
//     return;
//   }

//   try {
//     const client = createClient();

//     // Fetch full todo
//     const todoRes = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(200_000)
//       .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//       .execute(client);

//     const dueDate = Number(todoRes.getUint256(2));
//     const statusIndex = Number(todoRes.getUint256(3));
//     let owner = todoRes.getAddress(4);

//     owner = owner.startsWith("0x")
//       ? owner.toLowerCase()
//       : "0x" + owner.toLowerCase();

//     const now = Math.floor(Date.now() / 1000);

//     // 🔒 Ownership check
//     if (owner !== evmAddress.toLowerCase()) {
//       toast.error("You are not the owner of this todo");
//       return;
//     }

//     // ⏰ Expiration check (frontend protection)
//     if (statusIndex === 0 && dueDate < now) {
//       toast.error("This todo has expired");
//       return;
//     }

//     // 🚫 Prevent redundant updates
//     const newStatusIndex =
//       newStatus === "Active" ? 0 :
//       newStatus === "Completed" ? 1 : 2;

//     if (statusIndex === newStatusIndex) {
//       return;
//     }

//     // Execute transaction
//     const tx = await new ContractExecuteTransaction()
//       .setContractId(CONTRACT_ID)
//       .setGas(300_000)
//       .setFunction(
//         "completeTodo",
//         new ContractFunctionParameters()
//           .addUint256(todoId)
//           .addUint256(newStatusIndex)
//       )
//       .execute(client);

//     const receipt = await tx.getReceipt(client);

//     if (receipt.status.toString() !== "SUCCESS") {
//       throw new Error("Transaction failed");
//     }

//     toast.success(`Todo marked as ${newStatus}`);
//     fetchTodos();

//   } catch (err) {
//     console.error("Full error:", err);
//     toast.error("Failed to update todo status");
//   }
// };

// const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//   console.log("todoId", todoId);

//   if (!accountId || !privateKey || !evmAddress) {
//     toast.error("Wallet not connected");
//     return;
//   }

//   try {
//     const client = createClient();

//     // Fetch full todo
//     const todoRes = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(200_000)
//       .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//       .execute(client);

//     const dueDate = Number(todoRes.getUint256(2));
//     const statusIndex = Number(todoRes.getUint256(3));
//     const now = Math.floor(Date.now() / 1000);

//     // 🔒 Expiration check
//     if (statusIndex === 0 && dueDate < now) {
//       toast.error("This todo has expired");
//       return;
//     }

//     // 🚫 Prevent redundant updates
//     if ((statusIndex === 1 && newStatus === "Completed") || (statusIndex === 0 && newStatus === "Active")) {
//       return;
//     }

//     // Only Completed can be marked via contract
//     if (newStatus === "Completed") {
//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction("completeTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       const receipt = await tx.getReceipt(client);
//       if (receipt.status.toString() !== "SUCCESS") {
//         throw new Error("Transaction failed");
//       }

//       toast.success("Todo marked as Completed!");
//     } else {
//       // Frontend only: Active todos remain Active
//       toast.info("Cannot revert Completed or Expired todos back to Active.");
//     }

//     // Refresh todos
//     fetchTodos();

//   } catch (err) {
//     console.error("Full error:", err);
//     toast.error("Failed to update todo status");
//   }
// };

// const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//   if (!accountId || !privateKey || !evmAddress) {
//     toast.error("Wallet not connected");
//     return;
//   }

//   try {
//     const client = createClient();

//     // Fetch todo from contract
//     const todoRes = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(200_000)
//       .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//       .execute(client);

//     const statusIndex = Number(todoRes.getUint256(3));
//     const dueDate = Number(todoRes.getUint256(2));
//     const now = Math.floor(Date.now() / 1000);

//     // Compute current status dynamically
//     const currentStatus: Status =
//       statusIndex === 0
//         ? dueDate < now
//           ? "Expired"
//           : "Active"
//         : statusIndex === 1
//         ? "Completed"
//         : "Expired";

//     // ❌ Prevent updating expired todos
//     if (currentStatus === "Expired") {
//       toast.error("Cannot update an expired todo.");
//       return;
//     }

//     // 🚫 Prevent redundant updates
//     if ((currentStatus === "Active" && newStatus === "Active") || (currentStatus === "Completed" && newStatus === "Completed")) {
//       return;
//     }

//     // ✅ Only Active → Completed is allowed on contract
//     if (currentStatus === "Active" && newStatus === "Completed") {
//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction("completeTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       const receipt = await tx.getReceipt(client);
//       if (receipt.status.toString() !== "SUCCESS") {
//         throw new Error("Transaction failed");
//       }

//       toast.success("Todo marked as Completed!");
//       fetchTodos();
//     } else {
//       toast.info("Cannot revert Completed or Expired todos back to Active.");
//     }

//   } catch (err: any) {
//     console.error("Full error:", err);
//     // Optional: display the actual revert message if available
//     if (err?.status) {
//       toast.error(`Transaction failed: ${err.status}`);
//     } else {
//       toast.error("Failed to update todo status");
//     }
//   }
// };

// const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//   if (!accountId || !privateKey || !evmAddress) {
//     toast.error("Wallet not connected");
//     return;
//   }

//   try {
//     const client = createClient();

//     // 1️⃣ Fetch the todo from the contract
//     const todoRes = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(200_000)
//       .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//       .execute(client);

//     const statusIndex = Number(todoRes.getUint256(3));
//     const owner = todoRes.getAddress(4).toLowerCase();

//     // 2️⃣ Only the owner can update
//     if (owner !== evmAddress.toLowerCase()) {
//       toast.error("You are not the owner of this todo");
//       return;
//     }

//     // 3️⃣ Map contract status
//     const contractStatus: Status =
//       statusIndex === 0 ? "Active" :
//       statusIndex === 1 ? "Completed" :
//       "Expired";

//     // 4️⃣ Cannot update expired todos
//     if (contractStatus === "Expired") {
//       toast.error("Cannot update an expired todo.");
//       return;
//     }

//     // 5️⃣ Prevent redundant updates
//     if ((contractStatus === "Active" && newStatus === "Active") ||
//         (contractStatus === "Completed" && newStatus === "Completed")) {
//       return;
//     }

//     // 6️⃣ Only allow Active → Completed
//     if (contractStatus === "Active" && newStatus === "Completed") {
//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction("completeTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       const receipt = await tx.getReceipt(client);
//       if (receipt.status.toString() !== "SUCCESS") {
//         throw new Error("Transaction failed");
//       }

//       toast.success("Todo marked as Completed!");
//     } else {
//       // Cannot revert Completed → Active
//       toast.info("Cannot revert Completed or Expired todos back to Active.");
//     }

//     // 7️⃣ Refresh todos after update
//     fetchTodos();

//   } catch (err: any) {
//     console.error("Full error:", err);
//     toast.error("Failed to update todo status");
//   }
// };
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

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null;
// }

// interface TodoItem {
//   id: number; // real todoId from contract
//   title: string;
//   description: string;
//   status: Status;
//   owner: string;
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<TodoItem[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");

//   // -------------------- Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client =
//       import.meta.env.VITE_NETWORK === "mainnet"
//         ? Client.forMainnet()
//         : Client.forTestnet();
//     client.setOperator(
//       AccountId.fromString(accountId),
//       PrivateKey.fromStringECDSA(privateKey)
//     );
//     return client;
//   };

//   // -------------------- Fetch Todos --------------------
//   const fetchTodos = async () => {
//     if (!accountId || !privateKey || !evmAddress) return;

//     try {
//       const client = createClient();

//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: TodoItem[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//   try {
//     const todoRes = await new ContractCallQuery()
//       .setContractId(CONTRACT_ID)
//       .setGas(200_000)
//       .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//       .execute(client);

//     // Decode each field safely
//     const todoId = Number(todoRes.getUint256(0));      // real todoId
//     const title = todoRes.getString(1) || "";
//     const description = todoRes.getString(2) || "";
//     const statusIndex = Number(todoRes.getUint256(3) ?? 0);
//     let owner = todoRes.getAddress(4) || "";

//     owner = owner.startsWith("0x") ? owner.toLowerCase() : "0x" + owner.toLowerCase();

//     const status: Status =
//       statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//     allTodos.push({ id: todoId, title, description, status, owner });
//   } catch (err) {
//     console.warn(`Skipping todoId ${i} due to empty or invalid data.`);
//     continue; // skip invalid / empty todos
//   }
// }
//       // -------------------- Filter only connected user --------------------
//       const normalizedEvm = evmAddress.toLowerCase();
//       const userTodos = allTodos.filter(todo => todo.owner === normalizedEvm);

//       setTodos(userTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !accountId || !privateKey) {
//       toast.error("Please enter a task");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters()
//             .addString(todoTitle)
//             .addString("")
//             .addUint256(dueDate)
//         )
//         .execute(client);

//       await tx.getReceipt(client);
//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Update Todo Status --------------------
//   const updateTodoStatus = async (todoId: number, newStatus: Status) => {
//     if (!accountId || !privateKey || !evmAddress) {
//       toast.error("Wallet not connected");
//       return;
//     }

//     try {
//       const client = createClient();

//       // Fetch owner for this todoId
//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       let owner = todoRes.getAddress(4);
//       owner = owner.startsWith("0x") ? owner.toLowerCase() : "0x" + owner.toLowerCase();

//       if (owner !== evmAddress.toLowerCase()) {
//         toast.error("You are not the owner of this todo");
//         return;
//       }

//       // Execute updateStatus
//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction(
//           "updateStatus",
//           new ContractFunctionParameters()
//             .addUint256(todoId)
//             .addUint256(newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2)
//         )
//         .execute(client);

//       await tx.getReceipt(client);
//       toast.success(`Todo marked as ${newStatus}`);
//       fetchTodos();
//     } catch (err: any) {
//       console.error("Full error:", err);
//       console.error("Receipt status:", err?.receipt?.status);
//       toast.error("Failed to update todo status");
//     }
//   };

//   // -------------------- Polling --------------------
//   useEffect(() => {
//     if (!accountId || !privateKey || !evmAddress) return;
//     fetchTodos();
//     const intervalId = setInterval(fetchTodos, 5000);
//     return () => clearInterval(intervalId);
//   }, [accountId, privateKey, evmAddress]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t =>
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   return (
//     <div className="todo-container">
//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       {/* Input Section */}
//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={e => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">
//           +
//         </button>
//       </div>

//       {/* Tabs Section */}
//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map(tab => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Todo List / Empty State */}
//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map(todo => (
//               <div key={todo.id} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="checkbox"
//                   checked={todo.status === "Completed"}
//                   disabled={todo.status === "Expired" || !evmAddress}
//                   onChange={() =>
//                     updateTodoStatus(
//                       todo.id,
//                       todo.status === "Completed" ? "Active" : "Completed"
//                     )
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";

// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null;
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<{ title: string; description: string; status: Status }[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");
//   const [isWalletReady, setIsWalletReady] = useState(false);

//   // -------------------- Create Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client =
//       import.meta.env.VITE_NETWORK === "mainnet"
//         ? Client.forMainnet()
//         : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

//   // -------------------- Wallet readiness --------------------
//   useEffect(() => {
//     if (accountId && privateKey && evmAddress) {
//       setIsWalletReady(true);
//     }
//   }, [accountId, privateKey, evmAddress]);

//   // -------------------- Fetch Todos --------------------
//   const fetchTodos = async () => {
//     if (!isWalletReady) return;

//     try {
//       const client = createClient();
//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: { title: string; description: string; status: Status }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200_000)
//           .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//           .execute(client);

//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);
//         const statusIndex = Number(todoRes.getUint256(3));
//         const status: Status =
//           statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//         allTodos.push({ title, description, status });
//       }

//       setTodos(allTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !isWalletReady) {
//       toast.error("Please enter a task and ensure wallet is connected");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction(
//           "addTodo",
//           new ContractFunctionParameters().addString(todoTitle).addString("").addUint256(dueDate)
//         )
//         .execute(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Update Todo Status --------------------
//   const updateTodoStatus = async (todoIndex: number, newStatus: Status) => {
//     if (!isWalletReady) {
//       toast.error("Wallet not connected");
//       return;
//     }

//     const client = createClient();
//     const todoId = todoIndex + 1; // UI index to 1-based

//     try {
//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       const owner = todoRes.getAddress(4); // EVM address on chain

//       if (owner.toLowerCase() !== evmAddress!.toLowerCase()) {
//         toast.error("You are not the owner of this todo");
//         return;
//       }

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction(
//           "updateStatus",
//           new ContractFunctionParameters().addUint256(todoId).addUint256(
//             newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2
//           )
//         )
//         .execute(client);

//       await tx.getReceipt(client);

//       toast.success(`Todo marked as ${newStatus}`);
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update todo status");
//     }
//   };

//   // -------------------- Polling / Hot reload --------------------
//   useEffect(() => {
//     if (!isWalletReady) return;

//     fetchTodos();
//     const intervalId = setInterval(fetchTodos, 5000);

//     return () => clearInterval(intervalId);
//   }, [isWalletReady]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t =>
//     activeFilter === "All" ? true : t.status === activeFilter
//   );

//   // -------------------- Render --------------------
//   if (!isWalletReady) {
//     return <div className="todo-container">Loading wallet info...</div>;
//   }

//   return (
//     <div className="todo-container">
//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       <div className="input-group">
//         <input
//           type="text"
//           placeholder="Add a new task..."
//           value={todoTitle}
//           onChange={e => setTodoTitle(e.target.value)}
//           className="main-input"
//         />
//         <button onClick={addTodo} className="add-btn">+</button>
//       </div>

//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map(tab => (
//           <button
//             key={tab}
//             className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`}
//             onClick={() => setActiveFilter(tab as any)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map((todo, idx) => (
//               <div key={idx} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>
//                     {todo.status}
//                   </span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="checkbox"
//                   checked={todo.status === "Completed"}
//                   disabled={todo.status === "Expired"}
//                   onChange={() =>
//                     updateTodoStatus(idx, todo.status === "Completed" ? "Active" : "Completed")
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle">
//               <span className="checkmark">✓</span>
//             </div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;


// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCallQuery,
//   ContractFunctionParameters,
//   ContractExecuteTransaction,
// } from "@hashgraph/sdk";
// import { toast } from "react-toastify";
// import "../Styles/TodoApp.css";

// type Status = "Active" | "Completed" | "Expired";
// const CONTRACT_ID = "0.0.8028090";

// interface TodoAppProps {
//   accountId: string | null;
//   privateKey: string | null;
//   evmAddress: string | null;
// }

// const TodoApp = ({ accountId, privateKey, evmAddress }: TodoAppProps) => {
//   const [todos, setTodos] = useState<{ title: string; description: string; status: Status }[]>([]);
//   const [todoTitle, setTodoTitle] = useState("");
//   const [activeFilter, setActiveFilter] = useState<Status | "All">("All");
//   const [isWalletReady, setIsWalletReady] = useState(false);

//   // -------------------- Hedera Client --------------------
//   const createClient = () => {
//     if (!accountId || !privateKey) throw new Error("Wallet not connected");
//     const client = import.meta.env.VITE_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
//     client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey));
//     return client;
//   };

//   // -------------------- Wallet Ready --------------------
//   useEffect(() => {
//     if (accountId && privateKey && evmAddress) setIsWalletReady(true);
//     else setIsWalletReady(false);
//   }, [accountId, privateKey, evmAddress]);

//   // -------------------- Fetch Todos --------------------
//   const fetchTodos = async () => {
//     if (!isWalletReady) return;

//     try {
//       const client = createClient();
//       const totalTx = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction("getTotalTodos")
//         .execute(client);

//       const totalTodos = Number(totalTx.getUint256(0));
//       const allTodos: { title: string; description: string; status: Status }[] = [];

//       for (let i = 1; i <= totalTodos; i++) {
//         const todoRes = await new ContractCallQuery()
//           .setContractId(CONTRACT_ID)
//           .setGas(200_000)
//           .setFunction("getTodo", new ContractFunctionParameters().addUint256(i))
//           .execute(client);

//         const title = todoRes.getString(0);
//         const description = todoRes.getString(1);
//         const statusIndex = Number(todoRes.getUint256(3));
//         const status: Status = statusIndex === 0 ? "Active" : statusIndex === 1 ? "Completed" : "Expired";

//         allTodos.push({ title, description, status });
//       }

//       setTodos(allTodos);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch todos");
//     }
//   };

//   // -------------------- Add Todo --------------------
//   const addTodo = async () => {
//     if (!todoTitle || !isWalletReady) {
//       toast.error("Enter a task and ensure wallet is connected");
//       return;
//     }

//     try {
//       const client = createClient();
//       const dueDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

//       await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(500_000)
//         .setFunction("addTodo", new ContractFunctionParameters().addString(todoTitle).addString("").addUint256(dueDate))
//         .execute(client);

//       toast.success("Todo added!");
//       setTodoTitle("");
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add todo");
//     }
//   };

//   // -------------------- Update Status --------------------
//   const updateTodoStatus = async (todoIndex: number, newStatus: Status) => {
//     if (!isWalletReady) return;

//     try {
//       const client = createClient();
//       const todoId = todoIndex + 1;

//       const todoRes = await new ContractCallQuery()
//         .setContractId(CONTRACT_ID)
//         .setGas(200_000)
//         .setFunction("getTodo", new ContractFunctionParameters().addUint256(todoId))
//         .execute(client);

//       const owner = todoRes.getAddress(4);

//       if (owner.toLowerCase() !== evmAddress!.toLowerCase()) {
//         toast.error("You are not the owner of this todo");
//         return;
//       }

//       const tx = await new ContractExecuteTransaction()
//         .setContractId(CONTRACT_ID)
//         .setGas(300_000)
//         .setFunction(
//           "updateStatus",
//           new ContractFunctionParameters().addUint256(todoId).addUint256(
//             newStatus === "Active" ? 0 : newStatus === "Completed" ? 1 : 2
//           )
//         )
//         .execute(client);

//       await tx.getReceipt(client);
//       toast.success(`Todo marked as ${newStatus}`);
//       fetchTodos();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update todo status");
//     }
//   };

//   // -------------------- Poll Todos --------------------
//   useEffect(() => {
//     if (!isWalletReady) return;

//     fetchTodos();
//     const interval = setInterval(fetchTodos, 5000);
//     return () => clearInterval(interval);
//   }, [isWalletReady]);

//   // -------------------- Filtered Todos --------------------
//   const filteredTodos = todos.filter(t => activeFilter === "All" ? true : t.status === activeFilter);

//   // -------------------- Render --------------------
//   if (!isWalletReady) return <div className="todo-container">Loading wallet info...</div>;

//   return (
//     <div className="todo-container">
//       <Link to="/">home</Link>
//       <h2 className="header-title">Todo List</h2>

//       <div className="input-group">
//         <input type="text" className="main-input" placeholder="Add a new task..." value={todoTitle} onChange={e => setTodoTitle(e.target.value)} />
//         <button className="add-btn" onClick={addTodo}>+</button>
//       </div>

//       <div className="tabs-container">
//         {["All", "Active", "Completed"].map(tab => (
//           <button key={tab} className={`tab-item ${activeFilter === tab ? "active-tab" : ""}`} onClick={() => setActiveFilter(tab as any)}>
//             {tab}
//           </button>
//         ))}
//       </div>

//       <div className="content-area">
//         {filteredTodos.length > 0 ? (
//           <div className="todo-list">
//             {filteredTodos.map((todo, idx) => (
//               <div key={idx} className="todo-card">
//                 <div className="todo-info">
//                   <p className="todo-text">{todo.title}</p>
//                   <span className={`status-badge ${todo.status.toLowerCase()}`}>{todo.status}</span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="checkbox"
//                   checked={todo.status === "Completed"}
//                   disabled={todo.status === "Expired"}
//                   onChange={() => updateTodoStatus(idx, todo.status === "Completed" ? "Active" : "Completed")}
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="check-icon-circle"><span className="checkmark">✓</span></div>
//             <p>Your todo list is empty. Add a task to get started!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;