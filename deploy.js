const { Wallet, ContractFactory, ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();
// import {ethers} from 'ethers';
const { compile } = require("solc");
// const{ Web3 } = require("web3");

class SolScript {
  compileContract = (sourceCode) => {
    const input = {
      language: "Solidity",
      sources: {
        "Contract.sol": {
          content: sourceCode,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };
    // Compile the contract
    const output = JSON.parse(compile(JSON.stringify(input)));
    // Error handling
    if (output.errors) {
      output.errors.forEach((err) => {
        console.log(err.formattedMessage);
      });
      throw new Error("Compilation errors occurred");
    }

    // Extract ABI and Bytecode
    const contractName = Object.keys(output.contracts["Contract.sol"])[0];
    const contractABI = output.contracts["Contract.sol"][contractName].abi;
    const contractBytecode =
      output.contracts["Contract.sol"][contractName].evm.bytecode.object;

    return { abi: contractABI, bytecode: contractBytecode };
  };
  deployContract = async (
    privateKey,
    providerUrl,
    contractABI,
    contractBytecode
  ) => {
    try {
      const provider = new ethers.JsonRpcProvider(providerUrl);
      const wallet = new Wallet(privateKey, provider);

      // Create a contract factory using the ABI and bytecode
      const contractFactory = new ContractFactory(
        contractABI,
        contractBytecode,
        wallet
      );

      // Deploy the contract
      const contract = await contractFactory.deploy();
     
      await contract.getAddress();
      // Wait for the transaction to be mined
      return contract.getAddress();
    } catch (error) {
      console.error("Error deploying contract:", error);
    }
  };
  estimateGas = async (
    privateKey,
    providerUrl,
    contractABI,
    contractBytecode
  ) => {
    try {
      const provider = new ethers.JsonRpcProvider(providerUrl);
      const wallet = new Wallet(privateKey, provider);

      // Create a contract factory using the ABI and bytecode
      const contractFactory = new ContractFactory(
        contractABI,
        contractBytecode,
        wallet
      );

      // Deploy the contract
      // const contract = await contractFactory.deploy();
      const deployTransaction  = await contractFactory.getDeployTransaction();
      const gasEstimate =  await provider.getFeeData(deployTransaction);
      return ethers.formatUnits(gasEstimate.gasPrice, 'ether');
    } catch (error) {
      console.error("Error deploying contract:", error);
    }
  };

  verifyContract = async (methodName, contractAddress) => {
    const API_KEY = process.env.BSCSCAN_API_KEY;
    const CONTRACT_ADDRESS = contractAddress; // Replace with your deployed contract address
    const SOURCE_CODE = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    contract ChildContract {
      uint public value;
  
      constructor() {

      }
  
      event MessageSent(address indexed sender, address indexed recipient, string message);
  
      // Function to send 0 Ether with a message
      function ${methodName}(address _recipient, string memory _message) public {
          // Emit an event to log the message and transaction
          emit MessageSent(msg.sender, _recipient, _message);
          
          // Transfer 0 Ether (effectively does nothing with regards to Ether)
          payable(_recipient).transfer(0);
      }
  }
  `; // Replace with your actual contract source code
    const CONTRACT_NAME = "ChildContract"; // Replace with your contract name
    const COMPILER_VERSION = "v0.8.28+commit.7893614a"; // Replace with your Solidity compiler version
    const OPTIMIZATION = 0; // Set to 1 if you used optimization during compilation
    // const CONSTRUCTOR_ARGUMENTS = "0x0000000000000000000000000000000000000000000000000000000000000000"; // Replace with constructor arguments in hex format, if any
    const SETTINGS = {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    };
    try {
      const response = await axios.post(
        "https://api-testnet.bscscan.com/api",
        null,
        {
          params: {
            module: "contract",
            action: "verifysourcecode",
            apiKey: API_KEY,
            contractAddress: CONTRACT_ADDRESS,
            sourceCode: SOURCE_CODE,
            contractName: CONTRACT_NAME,
            compilerVersion: COMPILER_VERSION,
            optimizationUsed: OPTIMIZATION,
            // constructorArguments: CONSTRUCTOR_ARGUMENTS,
            settings: JSON.stringify(SETTINGS),
          },
        }
      );

      console.log("Verification Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error verifying contract:",
        error.response ? error.response.data : error.message
      );
    }
  };

  handleDeploy = async (methodName, walletPk) => {
    const sourceCode = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    contract ChildContract {
      uint public value;
  
      constructor() {
        
      }
  
      event MessageSent(address indexed sender, address indexed recipient, string message);
  
      // Function to send 0 Ether with a message
      function ${methodName}(address _recipient, string memory _message) public {
          // Emit an event to log the message and transaction
          emit MessageSent(msg.sender, _recipient, _message);
          
          // Transfer 0 Ether (effectively does nothing with regards to Ether)
          payable(_recipient).transfer(0);
      }
  }
  `;
    console.log("source code");
    const infura_key = process.env.INFURA_KEY;
    try {
      // Step 1: Compile the Solidity contract
      const { abi, bytecode } = this.compileContract(sourceCode);

      // Step 2: Deploy the contract
      const privateKey = walletPk; // Replace with your private key
      const providerUrl =
        `https://bsc-testnet.infura.io/v3/${infura_key}`; // Or another provider URL
      const deployedAddress = await this.deployContract(
        privateKey,
        providerUrl,
        abi,
        bytecode
      );
      console.log("Deployed Contract Address:", deployedAddress);
      // Step 3: Verify the contract
      return { methodName, deployedAddress, abi, apiKey: process.env.BSCSCAN_API_KEY };
    } catch (error) {
      console.error("Error during deployment:", error);
    }
  };
  handleEstimateGas = async (methodName, walletPk) => {
    const sourceCode = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    contract ChildContract {
      uint public value;
  
      constructor() {
        
      }
  
      event MessageSent(address indexed sender, address indexed recipient, string message);
  
      // Function to send 0 Ether with a message
      function ${methodName}(address _recipient, string memory _message) public {
          // Emit an event to log the message and transaction
          emit MessageSent(msg.sender, _recipient, _message);
          
          // Transfer 0 Ether (effectively does nothing with regards to Ether)
          payable(_recipient).transfer(0);
      }
  }
  `;
    try {
      // Step 1: Compile the Solidity contract
      const { abi, bytecode } = this.compileContract(sourceCode);
      const infura_key = process.env.INFURA_KEY;
      // Step 2: Deploy the contract
      const privateKey =
        walletPk; // Replace with your private key
      const providerUrl =
        `https://bsc-testnet.infura.io/v3/${infura_key}`; // Or another provider URL
      const gasEstimate = await this.estimateGas(
        privateKey,
        providerUrl,
        abi,
        bytecode
      );
      console.log("Gas:", gasEstimate);
      // return the estimated gas
      return { gas: gasEstimate };
    } catch (error) {
      console.error("Error during deployment:", error);
    }
  };
}
module.exports = { SolScript };
