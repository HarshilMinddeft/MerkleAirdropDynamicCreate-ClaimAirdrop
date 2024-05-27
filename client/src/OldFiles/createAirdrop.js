import React, { useState } from "react";
import axios from "axios";
// import * as XLSX from "xlsx";
import "./App.css";
import Navbar from "../Navbar";
import MerkleTree from "merkletreejs";
import { ethers } from "ethers";
import "./UserAirdrop.css";
import MerkleDistributorFactoryArtifact from "../artifacts/contracts/MerkleDistributorFactory.sol/MerkleDistributorFactory.json";

const UserAirdropdata = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [contractAddress, setcontractAddress] = useState("");
  const [totalClaimAmount, setTotalClaimAmount] = useState(0);

  const testing = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const merkleDistributorContract = new ethers.ContractFactory(
        MerkleDistributorFactoryArtifact.abi,
        MerkleDistributorFactoryArtifact.bytecode,
        signer
      );
      const distributor = await merkleDistributorContract.deploy();
      const distributorAddress = distributor.address;
      // setContractAddress(distributorAddress);
      console.log("ContractAddress :=>", distributorAddress);
    } catch (error) {
      console.error("Error deploying contract:", error);
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
      } else {
        setExcelFile(null);
        setErr("Please select CSV or Excel files");
      }
    } else {
      console.log("Select Your file");
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (excelFile) {
      if (!token || token.trim() === "" || !token.startsWith("0x")) {
        setErr("Field is empty or your address is invalid");
        return;
      }
      try {
        const formData = new FormData();
        formData.append("file", excelFile);
        formData.append("token", token);
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

        console.log("Response Data:", response.data);
        const addresses = response.data.addresses;
        const claimAmounts = response.data.claimAmounts;
        console.log("Addresses:", addresses);
        console.log("Claim Amounts:", claimAmounts);

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
        console.log(sum);
        setTotalClaimAmount(sum.toString());

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

        // const Amount = "200000000000000";

        const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
          sortPairs: true,
        });
        // Deploy the Merkle distributor contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const merkleDistributorContract = new ethers.ContractFactory(
          MerkleDistributorFactoryArtifact.abi,
          MerkleDistributorFactoryArtifact.bytecode,
          signer
        );
        const distributor = await merkleDistributorContract.deploy();
        const distributorAddress = distributor.address;
        // setcontractAddress(distributorAddress);
        console.log("ContractAddress :=>", distributorAddress);
/////////////////////////////////////////////////////////////////////////////////////////////////////
        const tokenContract = new ethers.Contract(
          token,
          ["function approve(address spender, uint256 amount)"],
          signer
        );
        const approvalTx = await tokenContract.approve(distributorAddress, sum);
        await approvalTx.wait();
        
        const transfertokens = new ethers.Contract(
          token,
          ["function transfer(address to, uint256 amount)"],
          signer
        );
        const transferTx = await transfertokens.transfer(
          distributorAddress,
          sum
        );
        await transferTx.wait();
////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log("Merkle Root:", tree.getHexRoot());
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  // const signer = provider.getSigner();
  // const tokenContract = new ethers.Contract(token, ["function approve(address spender, uint256 amount)"], signer);
  // const approvalTx = await tokenContract.approve(contractAddress, ethers.constants.MaxUint256);
  // await approvalTx.wait();

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  // const deployContract = async () => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const walletAddress = await signer.getAddress();

  //     const contractFactory = new ethers.ContractFactory(
  //       MerkleDistributorFactoryArtifact.abi,
  //       MerkleDistributorFactoryArtifact.bytecode,
  //       signer
  //     );

  //     const merkleDistributorContract = await contractFactory.deploy(
  //       token,
  //       walletAddress
  //     );

  //     await merkleDistributorContract.deployed();
  //     const distributorAddress = merkleDistributorContract.address;
  //     console.log(
  //       "Merkle Distributor Contract Address:",
  //       merkleDistributorContract.address
  //     );
  //     setcontractAddress(distributorAddress);
  //   } catch (error) {
  //     console.error("Error deploying contract:", error);
  //   }
  // };

  const handleContractAddressSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/uploadCA", {
        contractAddress: contractAddress,
      });
      console.log("Contract address uploaded:", response.data);
    } catch (error) {
      console.error("Error uploading contract address:", error);
      // Handle error
    }
  };

  return (
    <div>
      <Navbar />
      <div className="fil">
        <center>
          <h4 className="her">Upload Airdrop File</h4>
          <button onClick={testing}>Testing</button>
          <form className="" onSubmit={handleFileSubmit}>
            <div className="space">
              <input
                className="btn block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                type="file"
                required
                onChange={handelFile}
              />
            </div>

            <p>{err}</p>
            <div className="space1">
              <button type="submit" className="btn btn-primary">
                Upload
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleContractAddressSubmit}
              >
                SubmitContractAddress
              </button>
            </div>
            {/* <button
              type="button"
              className="btn btn-primary"
              onClick={deployContract}
            >
              DeployContract
            </button> */}
            <input
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="text"
              placeholder="Enter Token Address"
              value={token}
              onChange={handleTokenChange}
            />
          </form>
          <div>
            <h4>Tokens will be transferred</h4>
            <p color="red">AirdropAddress: {contractAddress}</p>
            <p>Total tokens to send {totalClaimAmount}</p>
          </div>
        </center>
      </div>
    </div>
  );
};

export default UserAirdropdata;
