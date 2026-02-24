import {Routes, Route} from "react-router-dom";
import DappStructure from "./Components/DappStructure.tsx";
import CreateHederaAccount from "./Components/CreateAccount.tsx";
import ConnectHederaAccount from "./Components/ConnectWallet.tsx";
const App = () => {
  return (
     <>
        <Routes>
            <Route path="/" element={<DappStructure/>}/>
            <Route path="/CreateAccount" element={<CreateHederaAccount/>}/>
            <Route path="/ConnectWallet" element={<ConnectHederaAccount/>} />
        </Routes>
     </>

  )
 
}

export default App;