import React, { useEffect } from "react";
import { Select, Option } from "@material-tailwind/react";
import "./Nav.css";

const networks = {
  // Hardhat: {
  //   chainId: `0x${Number(31337).toString(16)}`,
  //   chainName: "Local Hardhat",
  //   nativeCurrency: {
  //     name: "Eth",
  //     symbol: "Eth Hardhat",
  //     decimals: 18,
  //   },
  //   rpcUrls: ["http://127.0.0.1:8545/"],
  //   // blockExplorerUrls: [""],
  // },
  bsc: {
    chainId: `0x${Number(97).toString(16)}`,
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: {
      name: "Test Binance Chain Native Token",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://public.stackup.sh/api/v1/node/bsc-testnet"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
  polygon: {
    chainId: `0x${Number(80002).toString(16)}`,
    chainName: "Polygon Amoy Testnet",
    nativeCurrency: {
      name: "Polygon Amoy Testnet",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    // blockExplorerUrls: [""],
  },
  Sepolia: {
    chainId: `0x${Number(11155111).toString(16)}`,
    chainName: "Sepolia",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "SepoliaETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc2.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  AVAX: {
    chainId: `0x${Number(43113).toString(16)}`,
    chainName: "Avalanche Fuji",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://cchain.explorer.avax-test.network"],
  },

  Arbitrum: {
    chainId: `0x${Number(421614).toString(16)}`,
    chainName: "ArbitrumSepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arbitrum-sepolia.blockpi.network/v1/rpc/public "],
    blockExplorerUrls: ["https://sepolia-explorer.arbitrum.io"],
  },
  Optimism: {
    chainId: `0x${Number(11155420).toString(16)}`,
    chainName: "Optimism Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://optimism-sepolia.drpc.org "],
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io/"],
  },
};

const changeNetwork = async ({ networkName }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
};

const Nav = ({ onNetworkSwitch }) => {
  const handleNetworkSwitch = async (networkName) => {
    await changeNetwork({ networkName });
    // Call and passed prop function to update the contract address
    onNetworkSwitch(networkName);
  };

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", networkChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", networkChanged);
      }
    };
  }, []);
  return (
    <div className=" borderRadius w-full h-[65px] fixed shadow-lg shadow-[#2A0E61]/50 bg-[#03001470] backdrop-blur-md z-50">
      <div className="w-full h-full flex flex-row items-center justify-between m-auto">
        <a href="/" className="h-auto  w-auto flex ml-4 flex-row items-center">
          <img
            src="/logoD.webp"
            alt="logo"
            width={40}
            height={50}
            className="cursor-pointer animate-pulse"
          />
          {/* <span className="font-bold ml-[10px] hidden md:block text-gray-300">
            Airdrop
          </span> */}
        </a>
        <div className="leftnav">
          <div className="w-[300px] px-[10px] h-full flex flex-row items-center justify-between ml-5">
            <div className=" flex items-center justify-between w-full h-auto border border-[#7042f861] bg-[#0300145e] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200">
              <a
                href="/userClaim"
                className=" focus:ring focus:outline-none btn btn-primary cursor-pointer font-bold ml-[10px] hidden md:block text-gray-300 no-underline"
              >
                Claim
              </a>
              <a
                href="/userAirdropData"
                className=" btn btn-primary focus:ring focus:outline-none cursor-pointer font-bold ml-[10px] hidden md:block text-gray-300 no-underline"
              >
                Create
              </a>
            </div>
          </div>
        </div>
        {/* <main className="flex flex-row mr-10">
          <div className="mt-1 flex flex-row ">
            <button
              onClick={() => handleNetworkSwitch("Sepolia")}
              className=" h-9 w-15 mr-2 mt-2 mb-2 bg-warning border-warning btn btn-primary submit-button focus:ring focus:outline-none"
            >
              Sepolia
            </button>
            <button
              onClick={() => handleNetworkSwitch("bsc")}
              className="h-9 w-20 mt-2 mb-2 bg-warning  btn-primary  border-warning btn submit-button focus:ring focus:outline-none"
            >
              BSC
            </button>
            <button
              onClick={() => handleNetworkSwitch("polygon")}
              className="h-9 w-15 mt-2 mb-2 ml-2 bg-warning btn btn-primary  border-warning btn submit-button focus:ring focus:outline-none"
            >
              Polygon
            </button>
            {/* <button
              onClick={() => handleNetworkSwitch("AVAX")}
              className="h-9 w-15 mt-2 mb-2 ml-2 bg-warning btn btn-primary  border-warning btn submit-button focus:ring focus:outline-none"
            >
              Avax
            </button>
          </div>
        </main> */}
        <h6 className="selectchain">Select chain</h6>
        <div className=" flex boxw mr-10 flex-col gap-6">
          <Select className="w-20px pb-9 optionsmenu">
            <Option>
              <button
                onClick={() => handleNetworkSwitch("polygon")}
                className=" bg-warning btn btn-primary border-warning btn submit-button focus:ring focus:outline-none"
              >
                Polygon
              </button>
            </Option>
            <Option>
              <button
                onClick={() => handleNetworkSwitch("bsc")}
                className="bg-warning btn btn-primary  border-warning btn submit-button focus:ring focus:outline-none"
              >
                BSC
              </button>
            </Option>
            <Option>
              <button
                onClick={() => handleNetworkSwitch("Sepolia")}
                className=" bg-warning border-warning btn btn-primary submit-button focus:ring focus:outline-none"
              >
                Sepolia
              </button>
            </Option>
            <Option>
              <button
                onClick={() => handleNetworkSwitch("Arbitrum")}
                className=" bg-warning border-warning btn btn-primary submit-button focus:ring focus:outline-none"
              >
                Arbitrum
              </button>
            </Option>
            <Option>
              <button
                onClick={() => handleNetworkSwitch("AVAX")}
                className="bg-warning border-warning btn btn-primary submit-button focus:ring focus:outline-none"
              >
                AVAX
              </button>
            </Option>
            <Option>
              <button
                onClick={() => handleNetworkSwitch("Optimism")}
                className="bg-warning border-warning btn btn-primary submit-button focus:ring focus:outline-none"
              >
                Optimism
              </button>
            </Option>
          </Select>
        </div>
      </div>
    </div>
  );
};
export default Nav;
