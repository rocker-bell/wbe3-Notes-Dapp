// import { useState, useRef } from "react";
// import { ethers } from "ethers";

// const CreateAccount = () => {
//   const [wallet, setWallet] = useState<any>(null);
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const wrapWallet = (w: ethers.Wallet) => ({
//     instance: w,
//     address: w.address,
//     privateKey: w.privateKey,
//     mnemonic: w.mnemonic?.phrase || "",
//   });

//   const generateWallet = async () => {
//     const newWallet = ethers.Wallet.createRandom();
//     setWallet(wrapWallet(newWallet));
//   };

//   const downloadWallet = async () => {
//     if (!wallet || !password) {
//       alert("Need wallet and password.");
//       return;
//     }

//     setLoading(true);
//     const encrypted = await wallet.instance.encrypt(password);

//     const blob = new Blob([encrypted], { type: "application/json" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "wallet.json";
//     a.click();

//     URL.revokeObjectURL(url);
//     setLoading(false);
//   };

//   const handleRestore = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file || !password) {
//       alert("Select wallet + enter password");
//       return;
//     }

//     setLoading(true);

//     const reader = new FileReader();

//     reader.onload = async (evt) => {
//       try {
//         const content = evt.target?.result as string;
//         const w = await ethers.Wallet.fromEncryptedJson(
//           content,
//           password
//         );
//         setWallet(wrapWallet(w));
//       } catch (err) {
//         alert("Wrong password or corrupted file.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     reader.readAsText(file);
//   };

//   return (
//     <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
//       <h2>🧪 Ethereum Wallet</h2>

//       <button onClick={generateWallet}>
//         🔐 Generate Wallet
//       </button>

//       <br />
//       <br />

//       {wallet && (
//         <>
//           <p><strong>Address:</strong> {wallet.address}</p>
//           <p><strong>Private Key:</strong> {wallet.privateKey}</p>
//           <p><strong>Mnemonic:</strong> {wallet.mnemonic}</p>
//         </>
//       )}

//       <div style={{ marginTop: 20 }}>
//         <input
//           type="password"
//           placeholder="Encryption password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <br />
//         <br />

//         <button
//           onClick={downloadWallet}
//           disabled={!wallet || loading}
//         >
//           📥 Save Wallet
//         </button>

//         <br />
//         <br />

//         <button
//           onClick={() => fileInputRef.current?.click()}
//           disabled={!password || loading}
//         >
//           🔄 Restore Wallet
//         </button>

//         <input
//           type="file"
//           ref={fileInputRef}
//           style={{ display: "none" }}
//           onChange={handleRestore}
//         />
//       </div>
//     </div>
//   );
// };

// export default CreateAccount;


// import { useState } from "react";
// import {
//   Client,
//   PrivateKey,
//   AccountCreateTransaction,
//   Hbar
// } from "@hashgraph/sdk";

// const CreateHederaAccount = () => {
//   const [accountId, setAccountId] = useState("");
//   const [privateKey, setPrivateKey] = useState("");
//   const [loading, setLoading] = useState(false);

//   const createAccount = async () => {
//     try {
//       setLoading(true);

//       // Generate new key pair (ED25519 native Hedera)
//       const newKey = PrivateKey.generateED25519();

//       // Setup client
//       const client =
//         import.meta.env.VITE_NETWORK === "mainnet"
//           ? Client.forMainnet()
//           : Client.forTestnet();

//       client.setOperator(
//         import.meta.env.VITE_OPERATOR_ID,
//         import.meta.env.VITE_OPERATOR_KEY
//       );

//       const tx = new AccountCreateTransaction()
//         .setKey(newKey.publicKey)
//         .setInitialBalance(new Hbar(5));

//       const response = await tx.execute(client);
//       const receipt = await response.getReceipt(client);

//       const newAccountId = receipt.accountId?.toString() || "";

//       setAccountId(newAccountId);
//       setPrivateKey(newKey.toString());

//     } catch (err) {
//       console.error(err);
//       alert("Account creation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Create Hedera Account</h2>

//       <button onClick={createAccount} disabled={loading}>
//         {loading ? "Creating..." : "Create Account"}
//       </button>

//       {accountId && (
//         <>
//           <p><strong>Account ID:</strong> {accountId}</p>
//           <p><strong>Private Key:</strong> {privateKey}</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default CreateHederaAccount;

// works

// import { useState } from "react";
// import { Client, AccountBalanceQuery, PrivateKey, AccountId } from "@hashgraph/sdk";

// const cardStyle: React.CSSProperties = {
//   border: "1px solid #ccc",
//   borderRadius: "12px",
//   padding: "20px",
//   margin: "20px auto",
//   maxWidth: "500px",
//   backgroundColor: "#f9f9f9",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
// };

// const inputStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "8px 12px",
//   margin: "8px 0",
//   borderRadius: "6px",
//   border: "1px solid #ccc"
// };

// const buttonStyle: React.CSSProperties = {
//   padding: "10px 16px",
//   borderRadius: "6px",
//   border: "none",
//   cursor: "pointer",
//   backgroundColor: "#4CAF50",
//   color: "white",
//   fontWeight: 500,
//   marginTop: "10px"
// };

// const ConnectHederaAccount = () => {
//   const [accountId, setAccountId] = useState("");
//   const [balance, setBalance] = useState("");
//   const [loading, setLoading] = useState(false);

//   const connectAccount = async () => {
//     try {
//       setLoading(true);

//       // Validate user account ID
//       const parsedAccountId = AccountId.fromString(accountId);

//       // Setup client using funded operator from .env
//       const client =
//         import.meta.env.VITE_NETWORK === "mainnet"
//           ? Client.forMainnet()
//           : Client.forTestnet();

//       client.setOperator(
//         import.meta.env.VITE_OPERATOR_ID,
//         PrivateKey.fromStringED25519(import.meta.env.VITE_OPERATOR_KEY)
//       );

//       // Query balance
//       const balanceQuery = new AccountBalanceQuery().setAccountId(parsedAccountId);
//       const accountBalance = await balanceQuery.execute(client);

//       setBalance(accountBalance.hbars.toString());
//     } catch (err) {
//       console.error(err);
//       alert("Invalid Account ID or query failed. Make sure your operator is funded.");
//       setBalance("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={cardStyle}>
//       <h2>Connect Hedera Account</h2>

//       <input
//         style={inputStyle}
//         type="text"
//         placeholder="Account ID (0.0.x)"
//         value={accountId}
//         onChange={(e) => setAccountId(e.target.value)}
//       />

//       <button style={buttonStyle} onClick={connectAccount} disabled={loading}>
//         {loading ? "Connecting..." : "Check Balance"}
//       </button>

//       {balance && <p style={{ marginTop: 10 }}><strong>Balance:</strong> {balance} HBAR</p>}
//     </div>
//   );
// };

// export default ConnectHederaAccount;


// import { useState } from "react";
// import {
//   Client,
//   AccountBalanceQuery,
//   PrivateKey,
//   AccountId,
//   AccountCreateTransaction,
//   Hbar
// } from "@hashgraph/sdk";

// const cardStyle: React.CSSProperties = {
//   border: "1px solid #ccc",
//   borderRadius: "12px",
//   padding: "20px",
//   margin: "20px auto",
//   maxWidth: "500px",
//   backgroundColor: "#f9f9f9",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
// };

// const inputStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "8px 12px",
//   margin: "8px 0",
//   borderRadius: "6px",
//   border: "1px solid #ccc"
// };

// const buttonStyle: React.CSSProperties = {
//   padding: "10px 16px",
//   borderRadius: "6px",
//   border: "none",
//   cursor: "pointer",
//   backgroundColor: "#4CAF50",
//   color: "white",
//   fontWeight: 500,
//   marginTop: "10px"
// };

// const HederaWalletManager = () => {
//   // Create Account
//   const [newAccountId, setNewAccountId] = useState("");
//   const [newPrivateKey, setNewPrivateKey] = useState("");
//   const [creating, setCreating] = useState(false);

//   // Connect Account
//   const [accountId, setAccountId] = useState("");
//   const [balance, setBalance] = useState("");
//   const [connecting, setConnecting] = useState(false);

//   const createAccount = async () => {
//     try {
//       setCreating(true);

//       // Generate new ED25519 key pair
      
//       // Setup client
//      const client =
//   import.meta.env.VITE_NETWORK === "mainnet"
//     ? Client.forMainnet()
//     : Client.forTestnet();

// client.setOperator(
//   import.meta.env.VITE_OPERATOR_ID.trim(),
//   PrivateKey.fromStringECDSA(import.meta.env.VITE_OPERATOR_KEY.trim())
// );

// // const newKey = PrivateKey.generateED25519();
// const newKey = PrivateKey.generateECDSA();

// const tx = new AccountCreateTransaction()
//   .setKey(newKey.publicKey)
//   .setInitialBalance(new Hbar(5));

// const response = await tx.execute(client);
// const receipt = await response.getReceipt(client);

//       setNewAccountId(receipt.accountId?.toString() || "");
//       setNewPrivateKey(newKey.toString());
//     } catch (err) {
//       console.error(err);
//       alert("Account creation failed");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const connectAccount = async () => {
//     try {
//       setConnecting(true);

//       const parsedAccountId = AccountId.fromString(accountId);

//       const client =
//         import.meta.env.VITE_NETWORK === "mainnet"
//           ? Client.forMainnet()
//           : Client.forTestnet();

//       client.setOperator(
//         import.meta.env.VITE_OPERATOR_ID,
//         PrivateKey.fromStringECDSA(import.meta.env.VITE_OPERATOR_KEY)
//       );

//       const balanceQuery = new AccountBalanceQuery().setAccountId(parsedAccountId);
//       const accountBalance = await balanceQuery.execute(client);

//       setBalance(accountBalance.hbars.toString());
//     } catch (err) {
//       console.error(err);
//       alert("Invalid Account ID or query failed. Make sure your operator is funded.");
//       setBalance("");
//     } finally {
//       setConnecting(false);
//     }
//   };

//   return (
//     <div>
//       {/* Create Account Card */}
//       <div style={cardStyle}>
//         <h2>Create Hedera Account</h2>
//         <button style={buttonStyle} onClick={createAccount} disabled={creating}>
//           {creating ? "Creating..." : "Create Account"}
//         </button>
//         {newAccountId && (
//           <>
//             <p><strong>Account ID:</strong> {newAccountId}</p>
//             <p><strong>Private Key:</strong> {newPrivateKey}</p>
//           </>
//         )}
//       </div>

//       {/* Connect Account Card */}
//       <div style={cardStyle}>
//         <h2>Connect Hedera Account</h2>
//         <input
//           style={inputStyle}
//           type="text"
//           placeholder="Account ID (0.0.x)"
//           value={accountId}
//           onChange={(e) => setAccountId(e.target.value)}
//         />
//         <button style={buttonStyle} onClick={connectAccount} disabled={connecting}>
//           {connecting ? "Connecting..." : "Check Balance"}
//         </button>
//         {balance && <p style={{ marginTop: 10 }}><strong>Balance:</strong> {balance} HBAR</p>}
//       </div>
//     </div>
//   );
// };

// export default HederaWalletManager;


import { useState } from "react";
import {
  Client,
  AccountBalanceQuery,
  PrivateKey,
  AccountId,
  AccountCreateTransaction,
  Hbar
} from "@hashgraph/sdk";

// --- Styles ---
const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px auto",
  maxWidth: "500px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#4CAF50",
  color: "white",
  fontWeight: 500,
  marginTop: "10px"
};

// --- Browser-safe random hex generator ---
function generateHexPrivateKey(): string {
  const array = new Uint8Array(32); // 256-bit
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
}

// --- Main Component ---
const HederaWalletManager = () => {
  // Create Account
  const [newAccountId, setNewAccountId] = useState("");
  const [newPrivateKey, setNewPrivateKey] = useState("");
  const [creating, setCreating] = useState(false);

  // Connect Account
  const [accountId, setAccountId] = useState("");
  const [balance, setBalance] = useState("");
  const [connecting, setConnecting] = useState(false);

  // --- Create Hedera Account ---
  const createAccount = async () => {
    try {
      setCreating(true);

      // Setup client
      const client =
        import.meta.env.VITE_NETWORK === "mainnet"
          ? Client.forMainnet()
          : Client.forTestnet();

      client.setOperator(
        import.meta.env.VITE_OPERATOR_ID.trim(),
        PrivateKey.fromStringECDSA(import.meta.env.VITE_OPERATOR_KEY.trim())
      );

      // Generate browser-safe ECDSA private key
      const hexKey = generateHexPrivateKey();
      const newKey = PrivateKey.fromStringECDSA(hexKey);

      // Create account with initial 5 HBAR
      const tx = new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setInitialBalance(new Hbar(5));

      const response = await tx.execute(client);
      const receipt = await response.getReceipt(client);

      setNewAccountId(receipt.accountId?.toString() || "");
      setNewPrivateKey(newKey.toString());
    } catch (err) {
      console.error(err);
      alert("Account creation failed. Check console for details.");
    } finally {
      setCreating(false);
    }
  };

  // --- Connect Hedera Account & check balance ---
  const connectAccount = async () => {
    try {
      setConnecting(true);

      const parsedAccountId = AccountId.fromString(accountId);
      const parsedPrivateKey = PrivateKey.fromStringECDSA(newPrivateKey);

      const client =
        import.meta.env.VITE_NETWORK === "mainnet"
          ? Client.forMainnet()
          : Client.forTestnet();

      client.setOperator(parsedAccountId, parsedPrivateKey);

      const balanceQuery = new AccountBalanceQuery().setAccountId(parsedAccountId);
      const accountBalance = await balanceQuery.execute(client);

      setBalance(accountBalance.hbars.toString());
    } catch (err) {
      console.error(err);
      alert("Invalid Account ID or Private Key");
      setBalance("");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div>
      {/* --- Create Account Card --- */}
      <div style={cardStyle}>
        <h2>Create Hedera Account</h2>
        <button style={buttonStyle} onClick={createAccount} disabled={creating}>
          {creating ? "Creating..." : "Create Account"}
        </button>
        {newAccountId && (
          <>
            <p><strong>Account ID:</strong> {newAccountId}</p>
            <p><strong>Private Key:</strong> {newPrivateKey}</p>
          </>
        )}
      </div>

      {/* --- Connect Account Card --- */}
      <div style={cardStyle}>
        <h2>Connect Hedera Account</h2>
        <input
          style={inputStyle}
          type="text"
          placeholder="Account ID (0.0.x)"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
        <input
          style={inputStyle}
          type="text"
          placeholder="Private Key (hex)"
          value={newPrivateKey}
          onChange={(e) => setNewPrivateKey(e.target.value)}
        />
        <button style={buttonStyle} onClick={connectAccount} disabled={connecting}>
          {connecting ? "Connecting..." : "Check Balance"}
        </button>
        {balance && <p style={{ marginTop: 10 }}><strong>Balance:</strong> {balance} HBAR</p>}
      </div>
    </div>
  );
};

export default HederaWalletManager;