import { Routes, Route } from "react-router-dom";
import UserClaim from "./ClaimAirdrop";
import Navbar from "./Navbar";
import UserAirdropdata from "./UserAirdropdata";
import HomePage from "./components/HomePage";

// import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/userClaim" element={<UserClaim />} />
      <Route path="/navbar" element={<Navbar />} />
      <Route path="/userAirdropData" element={<UserAirdropdata />} />
    </Routes>
  );
}

export default App;
