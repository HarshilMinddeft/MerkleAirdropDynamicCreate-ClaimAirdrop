import React, { useState } from "react";
import Hero from "./Hero";
import StarsCanvas from "./sub/StarBackground";
import Encryption from "./Encryption";
import Nav from "./sub/Nav";
const polygonAddress = "0xe71cCC68642CB29eA7b9057EB0455E98bAF38B9c";
//
const bscAddress = "0xaAD1eD2c25887b2CE8661D492b00A5C040Bd3764";
//
const sepoliaAddress = "0x799A73Ea8D4564aCD11081f72feEA503802C2a80";
//
const ArbitrumSepolia = "0xAeE432Ce2475A1439c9b36a0FF73f99bF6b18dC8";
//
const AVAX = "0xc48aEE51450Ea13245263Fdf5d5AE71F7f67C6c3";
//
const Optimism = "0x0D723C749B443597AebE45117405Ef5D2605bd36";
//
const HomePage = () => {
  const [contractAddress, setContractAddress] = useState("");

  const handleNetworkSwitch = (network) => {
    if (network === "polygon") {
      setContractAddress(polygonAddress);
    } else if (network === "bsc") {
      setContractAddress(bscAddress);
    } else if (network === "Sepolia") {
      setContractAddress(sepoliaAddress);
    } else if (network === "Arbitrum") {
      setContractAddress(ArbitrumSepolia);
    } else if (network === "AVAX") {
      setContractAddress(AVAX);
    } else if (network === "Optimism") {
      setContractAddress(Optimism);
    }
  };

  return (
    <main className="h-full w-full bg-[#030014] bg-no-repeat bg-cover">
      <div className="flex-flex-col gap-20">
        <StarsCanvas />
        <Nav onNetworkSwitch={handleNetworkSwitch} />
        <Hero />
        <Encryption />
      </div>
    </main>
  );
};

export default HomePage;
