// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Assessment {
    // Struct to define a petition
    struct Petition {
        string name;       // Name of the petition
        uint256 voteCount; // Number of votes received by the petition
    }

    // Mapping to store petitions using their ID as key
    mapping(uint256 => Petition) public petitions;
    
    // Mapping to track if an address has voted
    mapping(address => bool) public voters;

    // Variables to track the number of petitions and total votes
    uint256 public petitionsCount;
    uint256 public totalVotes;
    
    // Address of the contract owner (only owner can register petitions)
    address public owner;

    // Events to log the registration of petitions and votes
    event PetitionRegistered(uint256 petitionId, string PetitionName);
    event Voted(address voter, uint256 petition);

    // Modifier to restrict certain functions to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can register petitions.");
        _; // Placeholder for function execution
    }

    // Constructor that sets the owner and registers default petitions
    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
        // Register 3 default petitions upon deployment
        registerDefaultPetitions();
    }

    // Internal function to register 3 default Petitions
    function registerDefaultPetitions() internal {
        registerPetition("End trophy hunting");
        registerPetition("Ban single-use plastics");
        registerPetition("Save the forest");
    }

    // Function to register a new petition, only callable by the contract owner
    function registerPetition(string memory _name) public onlyOwner {
        petitionsCount++; // Increment petition count
        petitions[petitionsCount] = Petition(_name, 0); // Add new petition
        emit PetitionRegistered(petitionsCount, _name); // Emit event for petition registration
    }

    // Function for a user to vote for a petition
    function vote(uint256 _petitionId) public {
        // Ensure the petition ID is valid
        require(_petitionId > 0 && _petitionId <= petitionsCount, "Invalid petition ID.");
        
        // Increment vote count for the chosen petition
        petitions[_petitionId].voteCount++;
        
        // Increment the total number of votes
        totalVotes++;
        
        // Emit event for the vote
        emit Voted(msg.sender, _petitionId);
    }

    // Function to get the number of votes for a specific petition
    function getVotes(uint256 _petitionId) public view returns (uint256) {
        // Ensure the petition ID is valid
        require(_petitionId > 0 && _petitionId <= petitionsCount, "Invalid petition ID.");
        
        // Return the vote count for the specified petition
        return petitions[_petitionId].voteCount;
    }

    // Function to get the total number of votes across all petitions
    function getTotalVotes() public view returns (uint256) {
        return totalVotes; // Return the total votes cast
    }
}
