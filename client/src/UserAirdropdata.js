import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Stars from "./assets/Planets.mp4";
import "./App.css";
// import Navbar from "./Navbar";
import MerkleTree from "merkletreejs";
import { ethers } from "ethers";
// import "./UserAirdrop.css";
import MerkleDistributorFactoryArtifact from "./artifacts/contracts/MerkleDistributorFactory.sol/MerkleDistributorFactory.json";
// import StarsCanvas from "./components/sub/StarBackground";
import Nav from "./components/sub/Nav";
import Loader from "./components/sub/Loder/Loader";
const FactAddress = "0x8a06D20532294c4c9A24A966f55aCC38cD3EbAD3";
//
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
const UserAirdropdata = () => {
  let lastInsertedId = "";
  const [contractAddress, setContractAddress] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [totalClaimAmount, setTotalClaimAmount] = useState(0);
  const [userAirdrops, setUserAirdrops] = useState([]);
  const [distributorAddress, setDistributorAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  // const [contractAddress, setcontractAddress] = useState();

  // const [lastInsertedId, setLastInsertedId] = useState("");
  // const testing = async () => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const merkleDistributorFactoryContract = new ethers.ContractFactory(
  //       MerkleDistributorFactoryArtifact.abi,
  //       MerkleDistributorFactoryArtifact.bytecode,
  //       signer
  //     );
  //     const factory = await merkleDistributorFactoryContract.deploy();
  //     const factoryAddress = factory.address;
  //     console.log("Factory Contract Address:", factoryAddress);
  //     setcontractAddress(factoryAddress);
  //   } catch (error) {
  //     console.error("Error deploying factory contract:", error);
  //   }
  // };
  useEffect(() => {
    getUserAddressFirst();
  }, []);

  //
  const getUserAddressFirst = async () => {
    try {
      if (window.ethereum == null) {
        throw new Error("Metamask not installed");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let selectedAccount = accounts[0];
      if (!selectedAccount) {
        throw new Error("No ethereum account awailable");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log("Signer Address:", address);
      setUserAddress(address);
    } catch (error) {
      console.log(error.message);
    }
  };

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

  const handleTransactionRejected = async () => {
    try {
      await axios.post("http://localhost:3001/api/transactionRejected", {
        lastInsertedId,
      });
      console.log("HANDEL ID ID", lastInsertedId);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting user data:", error);
    }
  };

  const handelFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = [
        "application/vnd.ms-excel",
        "application/vnd.openxlmformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      if (fileType.includes(selectedFile.type)) {
        setExcelFile(selectedFile);
        readExcel(selectedFile);
      } else {
        setExcelFile(null);
        setErr("Please select CSV or Excel files");
      }
    } else {
      console.log("Select Your file");
    }
  };
  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      const formattedData = rows.map((row) => ({
        address: formatAddress(row.address),
        claimAmount: row.claimAmount.slice(0, -18),
      }));

      setParsedData(formattedData);
      console.log("DATA Of CSV", rows);
    };
    reader.readAsArrayBuffer(file);
  };

  // Function to format the address correctly
  const formatAddress = (address) => {
    if (!address) return "";
    // Check if the address is already in the correct format
    if (address.startsWith("0x")) return address;
    // Assuming the address is a number in exponential notation, convert it to hex
    const hexAddress = Number(address).toString(16);
    // Pad the hex address with zeroes to ensure it has 40 characters
    return "0x" + "0".repeat(40 - hexAddress.length) + hexAddress;
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    let distAddress;

    if (excelFile) {
      if (!token || token.trim() === "" || !token.startsWith("0x")) {
        setErr("Field is empty or your address is invalid");
        return;
      }
      try {
        const formData = new FormData();
        formData.append("file", excelFile);
        formData.append("userAddress", userAddress);
        formData.append("token", token);
        formData.append("distributorAddress", distributorAddress);
        formData.append("contractAddress", contractAddress);
        const response = await axios.post(
          "http://localhost:3001/api/uploadAll",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        lastInsertedId = response.data._id;
        console.log("ID", lastInsertedId);
        // console.log("Response Data:", response.data);
        const addresses = response.data.addresses;
        const claimAmounts = response.data.claimAmounts;
        // console.log("Addresses:", addresses);
        // console.log("Claim Amounts:", claimAmounts);
        // console.log("distributorAddress=>HFS", distributorAddress);
        console.log("Response Data:", response.data);

        if (!Array.isArray(addresses) || !Array.isArray(claimAmounts)) {
          console.error("Addresses or claimAmounts is not an array");
          return;
        }

        if (addresses.length !== claimAmounts.length) {
          console.error("Addresses and claimAmounts have different lengths");
          return;
        }
        const sum = claimAmounts.reduce(
          (acc, amount) => acc.add(ethers.BigNumber.from(amount)),
          ethers.BigNumber.from(0)
        );
        // console.log(sum);
        setTotalClaimAmount(sum.toString().slice(0, -18));

        const leaves = addresses.map((address, index) => {
          console.log("Address:", address);
          console.log("Claim Amount:", claimAmounts[index]);
          const addressBytes = ethers.utils.arrayify(address);
          const claimAmount = ethers.BigNumber.from(claimAmounts[index]);
          const leafData = ethers.utils.solidityKeccak256(
            ["address", "uint256"],
            [addressBytes, claimAmount]
          );
          return leafData;
        });

        const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
          sortPairs: true,
        });

        //////////////////////////////////////////////////////////////////////////////////
        // Approval of user for tokens
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(
            token,
            ["function approve(address spender, uint256 amount)"],
            signer
          );
          const approvalTx = await tokenContract.approve(contractAddress, sum);
          setIsLoading(true);
          await approvalTx.wait();
          console.log("Approval transaction successful!");
          toast.success("Token Approval Success");
          setIsLoading(true);
        } catch (error) {
          console.error("Error approving transaction:", error);
          toast.error("Transection rejected");
          handleTransactionRejected();
          setIsLoading(true);
          return;
        }
        try {
          // Deploy the Merkle distributor contract
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const merkleDistributorFactoryContract = new ethers.Contract(
            contractAddress,
            MerkleDistributorFactoryArtifact.abi,
            signer
          );
          const transaction =
            await merkleDistributorFactoryContract.createMerkleDistributor(
              token,
              tree.getHexRoot(),
              sum
            );
          const receipt = await transaction.wait();
          toast("Airdrop Created Success");
          // Listen for the MerkleDistributorDeployed event

          const event = receipt.events.find(
            (event) => event.event === "MerkleDistributorDeployed"
          );
          if (event) {
            distAddress = event.args.distributor;
            console.log("CreatedDistributor ", distAddress);
            setDistributorAddress(distAddress);
          } else {
            console.error(
              "MerkleDistributorDeployed event not found in transaction receipt"
            );
          }
        } catch (error) {
          console.error("Error creating contract:", error);
          handleTransactionRejected();
          setIsLoading(false);
          return;
        }

        console.log("Merkle Root:", tree.getHexRoot());
      } catch (error) {
        console.error("Error uploading file:", error);
        setIsLoading(false);
      }
    }
    console.log("FilesubmitDistAddress", distAddress);
    if (distAddress) {
      setTimeout(() => handleContractAddressSubmit(distAddress), 1000);
    }
    setIsLoading(false);
  };

  const fetchAllAirdrops = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const merkleDistributorFactoryContract = new ethers.Contract(
        contractAddress,
        MerkleDistributorFactoryArtifact.abi,
        signer
      );
      const allAirdrops =
        await merkleDistributorFactoryContract.getAllDeployedContracts();
      console.log("All Airdrops:", allAirdrops);
      setUserAirdrops(allAirdrops);
    } catch (error) {
      console.error("Error fetching all airdrops:", error);
    }
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  const handleContractAddressSubmit = async (distAddress) => {
    try {
      const response = await axios.post("http://localhost:3001/api/uploadCA", {
        distributorAddress: distAddress,
      });
      console.log("Distributor address uploaded:", response.data);
    } catch (error) {
      console.error("Error uploading contract address:", error);
    }
  };

  // const handleDeleteRow = (index) => {
  //   const newData = [...parsedData];
  //   newData.splice(index, 1);
  //   setParsedData(newData);
  // };

  ///////////////////////////////////////////

  return (
    <div>
      <Nav onNetworkSwitch={handleNetworkSwitch} />

      <video autoPlay muted loop className="bg-vid">
        <source src={Stars} type="video/mp4"></source>
      </video>
      <div className="loder">{isLoading && <Loader />}</div>
      {/* <Navbar /> */}

      {/* <StarsCanvas /> */}

      <div className="fil">
        <center>
          <div>
            <ToastContainer position="top-left" autoClose={2000} />
          </div>

          <p className="text-cyan-50">Contract Address: {contractAddress}</p>
        </center>
        <center>
          {/* <h4 className="her">Token Airdrop</h4> */}
          {/* <div className="space4">
            <button onClick={testing} type="button" className="btn btn-primary">
              Deploy factory
            </button>
          </div> */}

          <form className="form" onSubmit={handleFileSubmit}>
            <div className="space">
              <input
                className="btn block  w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                type="file"
                required
                onChange={handelFile}
              />
            </div>
            <input
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="text"
              placeholder="Enter Token Address"
              value={token}
              onChange={handleTokenChange}
            />
            <p>{err}</p>
            <div className="space1">
              <button
                type="submit"
                className="btn btn-primary focus:ring focus:outline-none w-60"
              >
                Create Airdop
              </button>
              {/* <div className="space2">
                <button
                  type="button"
                  className="btn btn-primary focus:ring focus:outline-none"
                  onClick={handleContractAddressSubmit}
                >
                  SubmitDistributoraddress
                </button>
              </div> */}
            </div>
          </form>
        </center>
        <center>
          <div>
            <p className="space3 text-cyan-50">
              Total Airdrop Tokens : {totalClaimAmount}{" "}
            </p>
          </div>
          <div>
            <button
              onClick={fetchAllAirdrops}
              type="button"
              className="btn btn-primary"
            >
              see created Airdrops
            </button>
            <div>
              <h5 className="space3 text-cyan-50">Created Airdrops:</h5>
              <ul className="distributoradd">
                {userAirdrops.map((airdrop, index) => (
                  <li key={index}>{airdrop},</li>
                ))}
              </ul>
            </div>
          </div>
        </center>
        <center>
          <h5 className="space3 font-semibold text-cyan-50">Airdrop data</h5>
          <div className=" tablecolour transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-violet-800 duration-300">
            <table className="border-3 rounded-2xl w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className=" text-gray-900 text-1.5xl uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {parsedData.length > 0 &&
                    Object.keys(parsedData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-transparent border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    {Object.values(row).map((val) => (
                      <td
                        className="px-6 py-3 font-primary font-normal text-2xl  text-white whitespace-nowrap dark:text-white"
                        key={val}
                      >
                        {val.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* {parsedData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-transparent border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    {Object.values(row).map((val, columnIndex) => (
                      <td
                        className="px-6 py-3 font-primary font-medium text-2xl text-white whitespace-nowrap dark:text-white"
                        key={columnIndex}
                      >
                        {val.toString()}
                      </td>
                    ))}
                    <td className="px-6 py-3 font-primary font-medium text-2xl text-white whitespace-nowrap dark:text-white">
                      <button onClick={() => handleDeleteRow(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))} */}
              </tbody>
            </table>
          </div>
        </center>
      </div>
    </div>
  );
};

export default UserAirdropdata;
