// import { useState } from "react";
// import { ethers } from "ethers";

// const ConnectWallet = () => {
//   const [mnemonic, setMnemonic] = useState("");
//   const [privateKey, setPrivateKey] = useState("");
//   const [address, setAddress] = useState("");

//   const handleVerify = () => {
//     try {
//       let wallet;

//       if (mnemonic.trim()) {
//         wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
//       } else if (privateKey.trim()) {
//         wallet = new ethers.Wallet(privateKey.trim());
//       } else {
//         alert("Enter mnemonic or private key");
//         return;
//       }

//       setAddress(wallet.address);
//     } catch (err) {
//       alert("Invalid mnemonic or private key");
//       setAddress("");
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Connect Wallet</h2>

//       <textarea
//         placeholder="Enter mnemonic"
//         value={mnemonic}
//         onChange={(e) => setMnemonic(e.target.value)}
//         rows={3}
//         style={{ width: "100%" }}
//       />

//       <br /><br />

//       <input
//         type="text"
//         placeholder="OR Enter private key"
//         value={privateKey}
//         onChange={(e) => setPrivateKey(e.target.value)}
//         style={{ width: "100%" }}
//       />

//       <br /><br />

//       <button onClick={handleVerify}>
//         Verify & Connect
//       </button>

//       {address && (
//         <p><strong>Wallet Address:</strong> {address}</p>
//       )}
//     </div>
//   );
// };

// export default ConnectWallet;



import { useState } from "react";
import {
  Client,
  AccountBalanceQuery,
  PrivateKey,
  AccountId
} from "@hashgraph/sdk";

const ConnectHederaAccount = () => {
  const [accountId, setAccountId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const connectAccount = async () => {
    try {
      setLoading(true);

      // Validate inputs
      const parsedAccountId = AccountId.fromString(accountId);
      const parsedPrivateKey = PrivateKey.fromStringECDSA(privateKey);

      const client =
        import.meta.env.VITE_NETWORK === "mainnet"
          ? Client.forMainnet()
          : Client.forTestnet();

      client.setOperator(parsedAccountId, parsedPrivateKey);

      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(parsedAccountId);

      const accountBalance = await balanceQuery.execute(client);

      setBalance(accountBalance.hbars.toString());

    } catch (err) {
      console.error(err);
      alert("Invalid Account ID or Private Key");
      setBalance("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Connect Hedera Account</h2>

      <input
        type="text"
        placeholder="Account ID (0.0.x)"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        style={{ width: "100%" }}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Private Key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        style={{ width: "100%" }}
      />

      <br /><br />

      <button onClick={connectAccount} disabled={loading}>
        {loading ? "Connecting..." : "Connect"}
      </button>

      {balance && (
        <p><strong>Balance:</strong> {balance}</p>
      )}
    </div>
  );
};

export default ConnectHederaAccount;