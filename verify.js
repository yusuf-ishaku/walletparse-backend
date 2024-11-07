const {SolScript} = require('./deploy');

const solScript = new SolScript();

// solScript.verifyContract("aphylaxis", "0xE1820398694706Bf0228ff1f2f2fC4D1fc8A38d9");
solScript.handleDeploy('eroditus', "0x18d7218092e685e699a6fee247f9ea0ea29700fdd31138e946357044bf4757dc");
// estimateGas = async (
//     privateKey,
//     providerUrl,
//     contractABI,
//     contractBytecode
//   ) => {
//     try {
//       const provider = new ethers.JsonRpcProvider(providerUrl);
//       const wallet = new Wallet(privateKey, provider);

//       // Create a contract factory using the ABI and bytecode
//       const contractFactory = new ContractFactory(
//         contractABI,
//         contractBytecode,
//         wallet
//       );

//       // Deploy the contract
//       // const contract = await contractFactory.deploy();
//       const deployTransaction  = await contractFactory.getDeployTransaction();
//       const gasEstimate =  await provider.getFeeData(deployTransaction);
//       console.log('Gas Estimate in Ether:', ethers.formatUnits(gasEstimate.gasPrice, 'ether'));
//       console.log('regular gas estimate', gasEstimate);
//       // console.log("Deployment Hash:", contract.deploymentTransaction().hash);
//       // await contract.getAddress();
//       // Wait for the transaction to be mined
//       // return contract.getAddress();
//       return gasEstimate.toString();
//     } catch (error) {
//       console.error("Error deploying contract:", error);
//     }
//   };
