import "../Styles/ConnectWallet.css";
interface ConnectWalletProps {
    accountId: string | null;
    privateKey: string | null;
    evmAddress: string | null;
    setAccountId: React.Dispatch<React.SetStateAction<string | null>>;
    setPrivateKey: React.Dispatch<React.SetStateAction<string | null>>;
    setEvmAddress: React.Dispatch<React.SetStateAction<string | null>>;
}
declare const ConnectHederaAccount: React.FC<ConnectWalletProps>;
export default ConnectHederaAccount;
