"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

interface UserData {
  user: string[];
  snsId: string[];
  amountGranted: string[];
  stake: string[];
  proofHash: string[];
  preprocess_entries_part1: string[];
  preprocess_entries_part2: string[];
  proof_entries_part1: string[];
  proof_entries_part2: string[];
  public_inputs: string[];
}

interface ProcessedUserData {
  fileName: string;
  user: string;
  snsId: string;
  amountGranted: string;
  stake: boolean;
  proofHash: string;
  proof: {
    proof_part1: string[];
    proof_part2: string[];
  };
  preprocessed: {
    preprocessedPart1: string[];
    preprocessedPart2: string[];
  };
  publicInputs: string[];
  index: number;
}

// Contract constants
const AIRDROP_CONTRACT_ADDRESS = "0x7eeF9b56387f27655f316B119B14113aA4eB3b90";

// Airdrop contract ABI in JSON format
const AIRDROP_ABI = [
  {
    "inputs": [
      { "internalType": "address[]", "name": "users", "type": "address[]" },
      { "internalType": "bytes32[]", "name": "snsIds", "type": "bytes32[]" },
      {
        "components": [
          { "internalType": "uint128[]", "name": "proof_part1", "type": "uint128[]" },
          { "internalType": "uint256[]", "name": "proof_part2", "type": "uint256[]" }
        ],
        "internalType": "struct Airdrop.Proof[]",
        "name": "proofs",
        "type": "tuple[]"
      },
      {
        "components": [
          { "internalType": "uint128[]", "name": "preprocessedPart1", "type": "uint128[]" },
          { "internalType": "uint256[]", "name": "preprocessedPart2", "type": "uint256[]" }
        ],
        "internalType": "struct Airdrop.Preprocessed[]",
        "name": "preprocessed",
        "type": "tuple[]"
      },
      {
        "components": [
          { "internalType": "uint256[]", "name": "publicInputs", "type": "uint256[]" }
        ],
        "internalType": "struct Airdrop.PublicInputs[]",
        "name": "publicInputs",
        "type": "tuple[]"
      },
      { "internalType": "uint256[]", "name": "amountsGranted", "type": "uint256[]" },
      { "internalType": "bytes32[]", "name": "proofHashes", "type": "bytes32[]" },
      { "internalType": "bool[]", "name": "stakes", "type": "bool[]" }
    ],
    "name": "inputWinnerList",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEligibleUsersCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const AdminPage: React.FC = () => {
  const [winnersFile, setWinnersFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/zip") {
      setWinnersFile(file);
    } else {
      alert("Please select a valid ZIP file");
    }
  };

  const processZipFile = async (file: File): Promise<ProcessedUserData[]> => {
    setProcessingStatus("Validating ZIP file format...");
    
    // Basic ZIP file validation
    if (!file.name.toLowerCase().endsWith('.zip')) {
      throw new Error('File must be a ZIP archive');
    }
    
    if (file.size === 0) {
      throw new Error('ZIP file appears to be empty');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('ZIP file is too large (maximum 50MB)');
    }
    
    setProcessingStatus("Loading ZIP processing library...");
    
    // Import JSZip dynamically
    const jszipModule = await import('jszip');
    const JSZip = jszipModule.default;
    
    setProcessingStatus("Extracting ZIP file...");
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Get all JSON files in the ZIP
    const files = Object.keys(zipContent.files);
    console.log("All files in ZIP:", files);
    
    // Filter for user JSON files - be more specific about the pattern
    const jsonFiles = files.filter(name => {
      const isNotDir = !zipContent.files[name].dir;
      const isJsonFile = name.endsWith('.json');
      const matchesPattern = /^(.*\/)?user\d+\.json$/.test(name);
      
      console.log(`File: ${name}, isNotDir: ${isNotDir}, isJson: ${isJsonFile}, matchesPattern: ${matchesPattern}`);
      
      return isNotDir && isJsonFile && matchesPattern;
    });
    
    console.log("Filtered JSON files:", jsonFiles);
    
    // Get just the filenames without path for counting
    const userFileNumbers = jsonFiles.map(fullPath => {
      const fileName = fullPath.split('/').pop() || fullPath;
      const match = fileName.match(/user(\d+)\.json$/);
      return match ? parseInt(match[1]) : 0;
    }).filter(num => num > 0);
    
    console.log("User file numbers found:", userFileNumbers);
    
    // Check for duplicates
    const uniqueNumbers = Array.from(new Set(userFileNumbers));
    if (uniqueNumbers.length !== userFileNumbers.length) {
      throw new Error(`Duplicate user files found. Expected unique files user1.json to user30.json`);
    }
    
    // Validate we have exactly 30 user JSON files
    if (jsonFiles.length !== 30) {
      throw new Error(`Expected 30 user JSON files (user1.json to user30.json), but found ${jsonFiles.length}. Files: ${jsonFiles.join(', ')}`);
    }
    
    // Sort files to ensure correct order
    jsonFiles.sort((a, b) => {
      const fileNameA = a.split('/').pop() || a;
      const fileNameB = b.split('/').pop() || b;
      const numA = parseInt(fileNameA.match(/user(\d+)\.json$/)?.[1] || '0');
      const numB = parseInt(fileNameB.match(/user(\d+)\.json$/)?.[1] || '0');
      return numA - numB;
    });
    
    console.log(`Found ${jsonFiles.length} user JSON files in the archive`);
    setProcessingStatus(`Found ${jsonFiles.length} user files. Processing...`);
    
    const processedData: ProcessedUserData[] = [];
    
    // Process each JSON file
    for (let i = 0; i < jsonFiles.length; i++) {
      const jsonFileName = jsonFiles[i];
      setProcessingStatus(`Processing ${jsonFileName} (${i + 1}/${jsonFiles.length})`);
      
      try {
        // Extract the JSON file content
        const jsonContent = await zipContent.files[jsonFileName].async('text');
        
        // Parse JSON
        let userData: UserData;
        try {
          userData = JSON.parse(jsonContent);
        } catch (jsonError) {
          throw new Error(`Invalid JSON in ${jsonFileName}: ${jsonError}`);
        }
        
        // Validate required fields exist
        const requiredFields = ['user', 'snsId', 'amountGranted', 'stake', 'proofHash', 
                               'preprocess_entries_part1', 'preprocess_entries_part2',
                               'proof_entries_part1', 'proof_entries_part2', 'public_inputs'];
        
        const missingFields = requiredFields.filter(field => !(field in userData));
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields in ${jsonFileName}: ${missingFields.join(', ')}`);
        }
        
        // Validate array lengths
        if (userData.proof_entries_part1.length !== 38) {
          throw new Error(`Invalid proof_entries_part1 length in ${jsonFileName}: expected 38, got ${userData.proof_entries_part1.length}`);
        }
        
        if (userData.proof_entries_part2.length !== 42) {
          throw new Error(`Invalid proof_entries_part2 length in ${jsonFileName}: expected 42, got ${userData.proof_entries_part2.length}`);
        }
        
        if (userData.preprocess_entries_part1.length !== 4) {
          throw new Error(`Invalid preprocess_entries_part1 length in ${jsonFileName}: expected 4, got ${userData.preprocess_entries_part1.length}`);
        }
        
        if (userData.preprocess_entries_part2.length !== 4) {
          throw new Error(`Invalid preprocess_entries_part2 length in ${jsonFileName}: expected 4, got ${userData.preprocess_entries_part2.length}`);
        }
        
        if (userData.public_inputs.length < 127) {
          throw new Error(`Invalid public_inputs length in ${jsonFileName}: expected at least 127, got ${userData.public_inputs.length}`);
        }
        
        // Helper function to ensure hex format
        const ensureHexFormat = (value: string): string => {
          if (!value.startsWith('0x')) {
            return '0x' + value;
          }
          return value;
        };

        // Helper function to validate address format
        const validateAddress = (address: string): string => {
          const addr = ensureHexFormat(address);
          if (addr.length !== 42) {
            throw new Error(`Invalid address length: ${addr} (expected 42 characters)`);
          }
          return addr;
        };

        // Helper function to validate bytes32 format
        const validateBytes32 = (value: string): string => {
          const val = ensureHexFormat(value);
          if (val.length !== 66) {
            throw new Error(`Invalid bytes32 length: ${val} (expected 66 characters)`);
          }
          return val;
        };

        // Helper function to pad shorter values to bytes32
        const padToBytes32 = (value: string): string => {
          const val = ensureHexFormat(value);
          // Remove 0x prefix, pad to 64 characters, then add 0x back
          const hexValue = val.slice(2);
          const paddedHex = hexValue.padStart(64, '0');
          return '0x' + paddedHex;
        };

        // Process the data with proper validation and formatting
        const processedUser: ProcessedUserData = {
          fileName: jsonFileName,
          user: validateAddress(userData.user[0]),
          snsId: padToBytes32(userData.snsId[0]), // Allow shorter SNS IDs and pad them
          amountGranted: userData.amountGranted[0].toString(),
          stake: userData.stake[0].toLowerCase() === 'true',
          proofHash: validateBytes32(userData.proofHash[0]),
          proof: {
            proof_part1: userData.proof_entries_part1.map((val: string) => ensureHexFormat(val)),
            proof_part2: userData.proof_entries_part2.map((val: string) => ensureHexFormat(val))
          },
          preprocessed: {
            preprocessedPart1: userData.preprocess_entries_part1.map((val: string) => ensureHexFormat(val)),
            preprocessedPart2: userData.preprocess_entries_part2.map((val: string) => ensureHexFormat(val))
          },
          publicInputs: userData.public_inputs.slice(0, 127).map((val: string) => ensureHexFormat(val)),
          index: i
        };

        console.log(`Processed user ${i + 1}:`, {
          user: processedUser.user,
          originalSnsId: userData.snsId[0],
          paddedSnsId: processedUser.snsId,
          amountGranted: processedUser.amountGranted,
          proofHashLength: processedUser.proofHash.length,
          proofPart1Length: processedUser.proof.proof_part1.length,
          proofPart2Length: processedUser.proof.proof_part2.length
        });
        
        processedData.push(processedUser);
        
      } catch (nestedError) {
        throw new Error(`Error processing ${jsonFileName}: ${nestedError}`);
      }
    }
    
    setProcessingStatus("Validating all processed data...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("ZIP file processing complete:", {
      totalEntries: processedData.length,
      fileSize: file.size,
      fileName: file.name,
      sample: processedData[0] // Log first entry as sample
    });
    
    return processedData;
  };


  const callInputWinnerListContract = async (processedData: ProcessedUserData[]) => {
    // Calculate batch size based on data complexity
    // Each user has large proof arrays, so we'll use smaller batches
    const BATCH_SIZE = 5; // Process 5 users at a time to stay under size limit
    
    if (processedData.length > BATCH_SIZE) {
      setProcessingStatus(`Processing ${processedData.length} users in batches of ${BATCH_SIZE}...`);
      
      const results = [];
      for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
        const batch = processedData.slice(i, i + BATCH_SIZE);
        setProcessingStatus(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(processedData.length/BATCH_SIZE)} (${batch.length} users)...`);
        
        const batchResult = await processSingleBatch(batch, i/BATCH_SIZE + 1, Math.ceil(processedData.length/BATCH_SIZE));
        results.push(batchResult);
        
        // Small delay between batches to avoid overwhelming the network
        if (i + BATCH_SIZE < processedData.length) {
          setProcessingStatus(`Waiting before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Combine results
      return {
        transactionHashes: results.map(r => r.transactionHash),
        blockNumbers: results.map(r => r.blockNumber),
        totalEligibleUsers: results[results.length - 1].totalEligibleUsers,
        batchCount: results.length
      };
    } else {
      return await processSingleBatch(processedData, 1, 1);
    }
  };

  const processSingleBatch = async (batchData: ProcessedUserData[], batchNumber: number, totalBatches: number) => {
    // Check if MetaMask is available
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to interact with the contract.');
    }

    setProcessingStatus(`Batch ${batchNumber}/${totalBatches}: Connecting to MetaMask...`);
    
    // Import ethers dynamically
    const ethersModule = await import('ethers');
    const ethers = ethersModule;
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and check network
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    setProcessingStatus(`Batch ${batchNumber}/${totalBatches}: Validating network connection...`);
    
    // Check if connected to Sepolia network (Chain ID: 11155111)
    const network = await provider.getNetwork();
    const sepoliaChainId = BigInt(11155111);
    
    if (network.chainId !== sepoliaChainId) {
      // Try to switch to Sepolia network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xAA36A7' }], // Sepolia chain ID in hex
        });
      } catch (switchError: unknown) {
        // If the network doesn't exist, add it
        if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xAA36A7',
                chainName: 'Sepolia test network',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } else {
          throw new Error(`Please switch to Sepolia network. Current network: ${network.name} (Chain ID: ${network.chainId})`);
        }
      }
      
      // Refresh the provider after network switch
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newNetwork = await newProvider.getNetwork();
      
      if (newNetwork.chainId !== sepoliaChainId) {
        throw new Error(`Network switch failed. Please manually switch to Sepolia network in MetaMask.`);
      }
    }
    
    const signer = await provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AIRDROP_ABI, signer);
    
    console.log("Contract instance created:", {
      address: AIRDROP_CONTRACT_ADDRESS,
      hasInputWinnerList: typeof contract.inputWinnerList === 'function',
      contractMethods: Object.keys(contract).filter(key => typeof contract[key] === 'function')
    });
    
    setProcessingStatus(`Batch ${batchNumber}/${totalBatches}: Preparing contract data...`);
    
    // Prepare arrays for contract call
    const users: string[] = [];
    const snsIds: string[] = [];
    const proofs: Array<{proof_part1: string[], proof_part2: string[]}> = [];
    const preprocessedArray: Array<{preprocessedPart1: string[], preprocessedPart2: string[]}> = [];
    const publicInputs: Array<{publicInputs: string[]}> = [];
    const amountsGranted: string[] = [];
    const proofHashes: string[] = [];
    const stakes: boolean[] = [];
    
    // Fill arrays from batch data
    for (const userData of batchData) {
      users.push(userData.user);
      snsIds.push(userData.snsId);
      // Use object format matching the ABI struct definitions
      proofs.push({
        proof_part1: userData.proof.proof_part1,
        proof_part2: userData.proof.proof_part2
      });
      preprocessedArray.push({
        preprocessedPart1: userData.preprocessed.preprocessedPart1,
        preprocessedPart2: userData.preprocessed.preprocessedPart2
      });
      publicInputs.push({
        publicInputs: userData.publicInputs
      });
      amountsGranted.push(userData.amountGranted);
      proofHashes.push(userData.proofHash);
      stakes.push(userData.stake);
    }
    
    // Validate all data before contract call
    console.log("Validating contract parameters...");
    
    // Validate users array
    if (users.some(user => !user || user.length !== 42)) {
      throw new Error("Invalid user addresses found");
    }
    
    // Validate snsIds array
    if (snsIds.some(snsId => !snsId || snsId.length !== 66)) {
      throw new Error("Invalid SNS IDs found");
    }
    
    // Validate proofHashes array
    if (proofHashes.some(hash => !hash || hash.length !== 66)) {
      throw new Error("Invalid proof hashes found");
    }

    console.log("Contract call data prepared:", {
      usersCount: users.length,
      contractAddress: AIRDROP_CONTRACT_ADDRESS,
      sampleUser: users[0],
      sampleAmount: amountsGranted[0],
      sampleSnsId: snsIds[0],
      sampleProofHash: proofHashes[0],
      sampleProofPart1Length: proofs[0].proof_part1.length,
      sampleProofPart2Length: proofs[0].proof_part2.length
    });
    
    setProcessingStatus(`Batch ${batchNumber}/${totalBatches}: Calling inputWinnerList contract function...`);
    
    // Estimate gas
    try {
      const gasEstimate = await contract.inputWinnerList.estimateGas(
        users, snsIds, proofs, preprocessedArray, publicInputs, amountsGranted, proofHashes, stakes
      );
      console.log("Estimated gas:", gasEstimate.toString());
    } catch (gasError) {
      console.warn("Gas estimation failed:", gasError);
    }
    
    // Call the contract function
    const tx = await contract.inputWinnerList(
      users, snsIds, proofs, preprocessedArray, publicInputs, amountsGranted, proofHashes, stakes
    );
    
    setProcessingStatus(`Batch ${batchNumber}/${totalBatches}: Transaction submitted. Waiting for confirmation...`);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // Verify the winners were added
    setProcessingStatus(`Batch ${batchNumber}/${totalBatches}: Verifying winners were added...`);
    const newCount = await contract.getEligibleUsersCount();
    
    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      totalEligibleUsers: newCount.toString()
    };
  };

  const handleInputWinnersList = async () => {
    if (!winnersFile) {
      alert("Please select a ZIP file first");
      return;
    }

    setIsLoading(true);
    setProcessingStatus("Starting to process ZIP file...");
    
    try {
      console.log("Processing winners list from file:", winnersFile.name);
      
      // Process the ZIP file
      const processedData = await processZipFile(winnersFile);
      
      setProcessingStatus("ZIP processing completed. Preparing blockchain transaction...");
      
      console.log("Successfully processed ZIP file:", {
        totalEntries: processedData.length,
        sample: processedData[0] // Log first entry as sample
      });
      
      // Call the smart contract
      const contractResult = await callInputWinnerListContract(processedData);
      
      setProcessingStatus("Successfully completed!");
      
      let message: string;
      if ('batchCount' in contractResult) {
        // Multiple batches
        message = `Winners list submitted successfully in ${contractResult.batchCount} batches!
        
Processed: ${processedData.length} users
Transaction Hashes: ${contractResult.transactionHashes.join(', ')}
Block Numbers: ${contractResult.blockNumbers.join(', ')}
Total Eligible Users: ${contractResult.totalEligibleUsers}`;
      } else {
        // Single batch
        message = `Winners list submitted successfully!
        
Processed: ${processedData.length} users
Transaction Hash: ${contractResult.transactionHash}
Block Number: ${contractResult.blockNumber}
Total Eligible Users: ${contractResult.totalEligibleUsers}`;
      }
      
      alert(message);
      
    } catch (error) {
      console.error("Error processing winners list:", error);
      setProcessingStatus(`Error: ${error}`);
      alert(`Error processing winners list: ${error}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProcessingStatus(""), 5000); // Clear status after 5 seconds
    }
  };

  const handleRewardAll = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reward all winners? This action cannot be undone."
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    setProcessingStatus("Starting reward distribution...");
    
    try {
      // Check if MetaMask is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to interact with the contract.');
      }

      setProcessingStatus("Connecting to MetaMask...");
      
      // Import ethers dynamically
      const ethersModule = await import('ethers');
      const ethers = ethersModule;
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and check network
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      setProcessingStatus("Validating network connection...");
      
      // Check if connected to Sepolia network (Chain ID: 11155111)
      const network = await provider.getNetwork();
      const sepoliaChainId = BigInt(11155111);
      
      if (network.chainId !== sepoliaChainId) {
        // Try to switch to Sepolia network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xAA36A7' }], // Sepolia chain ID in hex
          });
        } catch (switchError: unknown) {
          // If the network doesn't exist, add it
          if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xAA36A7',
                  chainName: 'Sepolia test network',
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          } else {
            throw new Error(`Please switch to Sepolia network. Current network: ${network.name} (Chain ID: ${network.chainId})`);
          }
        }
        
        // Refresh the provider after network switch
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newNetwork = await newProvider.getNetwork();
        
        if (newNetwork.chainId !== sepoliaChainId) {
          throw new Error(`Network switch failed. Please manually switch to Sepolia network in MetaMask.`);
        }
      }
      
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AIRDROP_ABI, signer);
      
      console.log("Contract instance created for rewardAll:", {
        address: AIRDROP_CONTRACT_ADDRESS,
        hasRewardAll: typeof contract.rewardAll === 'function'
      });
      
      setProcessingStatus("Getting eligible users count...");
      
      // Get current eligible users count
      const eligibleCount = await contract.getEligibleUsersCount();
      console.log("Eligible users count:", eligibleCount.toString());
      
      if (eligibleCount.toString() === '0') {
        throw new Error('No eligible users found. Please add winners to the list first.');
      }
      
      setProcessingStatus("Estimating gas for reward distribution...");
      
      // Estimate gas for the rewardAll function
      try {
        const gasEstimate = await contract.rewardAll.estimateGas();
        console.log("Estimated gas for rewardAll:", gasEstimate.toString());
      } catch (gasError) {
        console.warn("Gas estimation failed:", gasError);
        // Continue anyway, as gas estimation might fail but the transaction could still work
      }
      
      setProcessingStatus("Calling rewardAll function...");
      
      // Call the rewardAll function
      const tx = await contract.rewardAll();
      
      setProcessingStatus("Transaction submitted. Waiting for confirmation...");
      console.log("RewardAll transaction hash:", tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("RewardAll transaction confirmed:", receipt);
      
      setProcessingStatus("Verifying reward distribution...");
      
      // Verify the transaction was successful by checking the contract again
      await contract.getEligibleUsersCount();
      
      setProcessingStatus("Successfully completed!");
      
      const message = `All rewards have been distributed successfully!

Eligible Users: ${eligibleCount.toString()}
Transaction Hash: ${tx.hash}
Block Number: ${receipt.blockNumber}
Gas Used: ${receipt.gasUsed.toString()}`;
      
      alert(message);
      
    } catch (error) {
      console.error("Error distributing rewards:", error);
      setProcessingStatus(`Error: ${error}`);
      alert(`Error distributing rewards: ${error}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProcessingStatus(""), 5000); // Clear status after 5 seconds
    }
  };

  // Prevent hydration issues by not rendering until client-side
  if (!isClient) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 overflow-x-hidden">
          <div className="w-full grid-background flex justify-center">
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-hero-title-70">Loading...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="w-full grid-background flex justify-center">
          {/* Desktop Layout */}
          <div className="hidden desktop:flex relative w-full min-h-[900px] items-center justify-center">
            <div className="flex flex-col items-center gap-y-[60px] max-w-[1200px] w-full px-[40px]">
              {/* Title */}
              <div className="text-hero-title-70">ADMIN PANEL</div>
              
              {/* Main Content */}
              <div className="flex flex-col gap-y-[40px] w-full max-w-[800px]">
                {/* Winners List Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    border: "1px solid var(--line, #00477A)",
                    background: "#FFF",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      padding: "24px 32px",
                      alignItems: "center",
                      alignSelf: "stretch",
                      borderBottom: "1px solid var(--line, #00477A)",
                      color: "var(--text, #002139)",
                      fontFamily: "IBM Plex Mono",
                      fontSize: "24px",
                      fontStyle: "normal",
                      fontWeight: 600,
                      lineHeight: "normal",
                      background: "#F8FCFF",
                    }}
                  >
                    Input Winners List
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      display: "flex",
                      padding: "32px",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "24px",
                      alignSelf: "stretch",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--text, #002139)",
                        fontFamily: "IBM Plex Mono",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "24px",
                      }}
                    >
                      Upload a ZIP file containing the winners list. The file should include winner addresses or related data.
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                          id="winnersZipUpload"
                        />
                        <label
                          htmlFor="winnersZipUpload"
                          style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            border: "1px solid var(--line, #00477A)",
                            background: "#008BEE",
                            color: "#FFF",
                            fontFamily: "IBM Plex Mono",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLLabelElement).style.background = "#0077CC";
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLLabelElement).style.background = "#008BEE";
                          }}
                        >
                          Choose ZIP File
                        </label>
                        {winnersFile && (
                          <div
                            style={{
                              color: "var(--text, #002139)",
                              fontFamily: "IBM Plex Mono",
                              fontSize: "14px",
                              fontWeight: 400,
                            }}
                          >
                            Selected: {winnersFile.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleInputWinnersList}
                      disabled={!winnersFile || isLoading}
                      style={{
                        display: "flex",
                        padding: "16px 32px",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "stretch",
                        border: "1px solid var(--line, #00477A)",
                        background: isLoading || !winnersFile ? "#CCCCCC" : "#008BEE",
                        color: "#FFF",
                        fontFamily: "IBM Plex Mono",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "normal",
                        cursor: isLoading || !winnersFile ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading && winnersFile) {
                          (e.target as HTMLButtonElement).style.background = "#0077CC";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading && winnersFile) {
                          (e.target as HTMLButtonElement).style.background = "#008BEE";
                        }
                      }}
                    >
                      {isLoading ? "Submitting..." : "Input Winners List"}
                    </button>
                  </div>
                </div>

                {/* Reward All Section */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    border: "1px solid var(--line, #00477A)",
                    background: "#FFF",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      padding: "24px 32px",
                      alignItems: "center",
                      alignSelf: "stretch",
                      borderBottom: "1px solid var(--line, #00477A)",
                      color: "var(--text, #002139)",
                      fontFamily: "IBM Plex Mono",
                      fontSize: "24px",
                      fontStyle: "normal",
                      fontWeight: 600,
                      lineHeight: "normal",
                      background: "#FFF8F8",
                    }}
                  >
                    Distribute Rewards
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      display: "flex",
                      padding: "32px",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "24px",
                      alignSelf: "stretch",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--text, #002139)",
                        fontFamily: "IBM Plex Mono",
                        fontSize: "16px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "24px",
                      }}
                    >
                      This will distribute rewards to all eligible winners. Please ensure the winners list has been properly submitted before proceeding. <strong>This action cannot be undone.</strong>
                    </div>

                    <button
                      onClick={handleRewardAll}
                      disabled={isLoading}
                      style={{
                        display: "flex",
                        padding: "16px 32px",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "stretch",
                        border: "1px solid #CC0000",
                        background: isLoading ? "#CCCCCC" : "#FF6B6B",
                        color: "#FFF",
                        fontFamily: "IBM Plex Mono",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "normal",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          (e.target as HTMLButtonElement).style.background = "#FF5252";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          (e.target as HTMLButtonElement).style.background = "#FF6B6B";
                        }
                      }}
                    >
                      {isLoading ? "Processing..." : "Reward All"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="desktop:hidden flex flex-col w-full min-h-[600px] px-4 py-8">
            {/* Mobile Title */}
            <div className="text-hero-title-70 mb-8 text-center">ADMIN</div>
            
            {/* Mobile Winners List Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "18px",
                  fontWeight: 600,
                  background: "#F8FCFF",
                }}
              >
                Input Winners List
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    color: "var(--text, #002139)",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  Upload a ZIP file containing the winners list.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="winnersZipUploadMobile"
                  />
                  <label
                    htmlFor="winnersZipUploadMobile"
                    style={{
                      display: "inline-block",
                      padding: "10px 20px",
                      border: "1px solid var(--line, #00477A)",
                      background: "#008BEE",
                      color: "#FFF",
                      fontFamily: "IBM Plex Mono",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Choose ZIP File
                  </label>
                  {winnersFile && (
                    <div
                      style={{
                        color: "var(--text, #002139)",
                        fontFamily: "IBM Plex Mono",
                        fontSize: "12px",
                        fontWeight: 400,
                        wordBreak: "break-all",
                      }}
                    >
                      Selected: {winnersFile.name}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleInputWinnersList}
                  disabled={!winnersFile || isLoading}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid var(--line, #00477A)",
                    background: isLoading || !winnersFile ? "#CCCCCC" : "#008BEE",
                    color: "#FFF",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: isLoading || !winnersFile ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "Submitting..." : "Input Winners List"}
                </button>
              </div>
            </div>

            {/* Mobile Reward All Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "18px",
                  fontWeight: 600,
                  background: "#FFF8F8",
                }}
              >
                Distribute Rewards
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    color: "var(--text, #002139)",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  Distribute rewards to all winners. <strong>Cannot be undone.</strong>
                </div>

                <button
                  onClick={handleRewardAll}
                  disabled={isLoading}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #CC0000",
                    background: isLoading ? "#CCCCCC" : "#FF6B6B",
                    color: "#FFF",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "Processing..." : "Reward All"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {(isLoading || processingStatus) && (
          <div className="w-full flex justify-center py-8">
            <div
              style={{
                padding: "20px 40px",
                border: processingStatus.startsWith("Error:") ? "1px solid #CC0000" : "1px solid #FFC107",
                background: processingStatus.startsWith("Error:") ? "#FFF8F8" : "#FFF8E1",
                color: "var(--text, #002139)",
                fontFamily: "IBM Plex Mono",
                fontSize: "16px",
                textAlign: "center",
                maxWidth: "600px",
              }}
            >
              {processingStatus || "Processing... Please wait."}
            </div>
          </div>
        )}

        <Footer />
      </main>
    </>
  );
};

export default AdminPage;