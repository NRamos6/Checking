import { useState, useEffect } from "react";
import { ethers } from "ethers";
import votingSystemABI from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function VotingPage() {
  // State variables for storing wallet, account, contract, petitions, and total votes
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [votingContract, setVotingContract] = useState(undefined);
  const [petitions, setPetitions] = useState([]); // Store Petitions
  const [totalVotes, setTotalVotes] = useState(undefined); // Store total votes

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const votingABI = votingSystemABI.abi; // Import ABI of the voting contract

  // Step 1: Initialize and get the connected wallet and account
  const getWallet = async () => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      console.log("MetaMask detected");
      setEthWallet(window.ethereum); // Set the ethWallet state to MetaMask provider
    } else {
      console.log("MetaMask is not installed");
      alert("Please install MetaMask to interact with this application."); // Alert if MetaMask is not installed
      return;
    }

    // If MetaMask is installed, get the accounts
    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts); // Handle the connected account
    }
  };

  // Step 2: Handle account changes
  const handleAccount = (account) => {
    if (account && account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]); // Set the connected account in state
    } else {
      console.log("No account found");
    }
  };

  // Step 3: Connect the account to MetaMask
  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts); // Handle the connected account
    getVotingContract(); // Once account is connected, get the contract instance
  };

  // Step 4: Get the contract instance from the Ethereum provider
  const getVotingContract = () => {
    if (!ethWallet || !account) {
      console.log("Cannot get contract: ethWallet or account is not set");
      return;
    }

    console.log("Setting up contract...");
    const provider = new ethers.providers.Web3Provider(ethWallet); // Create a Web3 provider
    const signer = provider.getSigner(); // Get the signer (user's account)

    try {
      // Initialize the contract with the ABI, address, and signer
      const contract = new ethers.Contract(contractAddress, votingABI, signer);
      console.log("Contract set:", contract);
      setVotingContract(contract); // Set the contract instance in state
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  };

  // Step 5: Fetch the list of petitions from the smart contract
  const fetchPetitions = async () => {
    if (votingContract) {
      console.log("votingContract is defined"); // Check if the contract is set
      try {
        const petitionsCount = await votingContract.PetitionsCount(); // Get the number of Petitions
        console.log("Petitions Count:", petitionsCount.toString()); // Log the petition count
        let loadedPetitions = [];
        for (let i = 1; i <= petitionsCount; i++) {
          const petition = await votingContract.petitions(i); // Get each petition
          console.log("Petition:", petition); // Log each petition details
          loadedPetitions.push(petition); // Add petition to the list
        }
        setPetitions(loadedPetitions); // Set the list of Petitions in state
      } catch (error) {
        console.error("Error fetching Petitions:", error); // Handle any errors
      }
    } else {
      console.log("votingContract is undefined"); // If contract is not set
    }
  };

  // Step 6: Fetch the total number of votes from the smart contract
  const fetchTotalVotes = async () => {
    if (votingContract) {
      try {
        const totalVotes = await votingContract.getTotalVotes(); // Get the total votes
        setTotalVotes(totalVotes.toNumber()); // Set the total votes in state
      } catch (error) {
        console.error("Error fetching total Petition votes:", error); // Handle errors
      }
    }
  };

  //Function to choose a vote for a petition
  const voteForPetition = async (petitionId) => {
    if (votingContract && account) {
      try {
        const tx = await votingContract.vote(petitionId); // Call vote function on the contract
        await tx.wait(); // Wait for the transaction to be mined
        fetchPetitions(); // Fetch updated list of petitions
        fetchTotalVotes(); // Fetch updated total votes
      } catch (error) {
        console.error("Error voting:", error); // Handle errors
      }
    }
  };

  // Step 8: Render UI based on user state (whether connected to MetaMask or not)
  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this Voting System.</p>; // Prompt user to install MetaMask if not detected
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>; // If no account, show button to connect
    }

    return (
      <div>
        <h3>Choose a Petition and click your vote</h3>
        <div>
          {petitions.map((petition, index) => (
            <div key={index}>
              <p>
                {petition.name}: {petition.voteCount.toString()} votes
              </p>
              <button onClick={() => voteForPetition(index + 1)}>
                Vote for {petition.name}
              </button>
            </div>
          ))}
        </div>
        <p>Total Votes: {totalVotes}</p> {/* Display total votes */}
      </div>
    );
  };

  // Step 9: Use useEffect hooks to initialize and fetch data on mount
  useEffect(() => {
    console.log("Checking wallet...");
    getWallet(); // Initialize wallet connection when component mounts
  }, []); // Runs only once when the component is mounted

  useEffect(() => {
    if (account) {
      getVotingContract(); // Get contract once the account is available
    }
  }, [account]); // Runs when account changes

  useEffect(() => {
    if (votingContract && account) {
      fetchPetitions(); // Fetch petitions and total votes once contract and account are set
      fetchTotalVotes();
    }
  }, [votingContract, account]); // Runs when votingContract or account changes

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Nature Petition System!</h1>
        <p>Owner: {account}</p>
      </header>
      {initUser()} {/* Render the UI based on user state */}
      <style jsx>{`

      `}</style>
    </main>
  );
}
