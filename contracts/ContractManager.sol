pragma solidity >=0.4.21 <0.7.0;

contract BasicContract {
  ContractManager manager;
  address owner;
  address[] participants;
  mapping(address => bool) permissions;
  string content;
  mapping(address => string) signatures;
  string title;

  constructor(address creator, string memory t, ContractManager caller) public {
    manager = caller;
    owner = creator;
    content = "Hello";
    title = t;
    permissions[owner] = true;
    participants.push(owner);
  }

  function addParticipant(address participant) public {
    // Make sure not to readd  the same person
    if (msg.sender == owner && !permissions[participant]) {
      permissions[participant] = true;
      participants.push(participant);
      manager.addParticipant(participant, this);
    }
  }

  function addManyParticipants(address[] memory newParticipants) public {
    // TODO Implement similar checking to above
    for (uint i = 0; i < newParticipants.length; i++) {
      addParticipant(newParticipants[i]);
    }
  }

  function sign(string memory signature) public {
    // Check they are allowed to sign the contract
    if (permissions[msg.sender]) {
      // TODO: Validate using ECRecover

      signatures[msg.sender] = signature;
    }
  }

  function setContent(string memory newContent) public {
    content = newContent;
  }

  function getSignature(address signee) public view returns (string memory) {
    return signatures[signee];
  }

  function getParticipants() public view returns (address[] memory) {
    return participants;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function getContent() public view returns (string memory) {
    return content;
  }

  function getTitle() public view returns (string memory) {
    return title;
  }

  function getHash() public view returns (bytes32) {
    return keccak256(abi.encodePacked(content));
  }

}

contract PersonalContracts {
  address owner;
  BasicContract[] contracts;

  event ContractAssigned(address creator, address location);

  function addContract(BasicContract c) public {
    contracts.push(c);
    emit ContractAssigned(msg.sender, address(c));
  }

  function getContracts() public view returns(BasicContract[] memory) {
      return contracts;
  }

  constructor() public {
    owner = msg.sender;
  }
}

contract ContractManager {
  mapping(address => PersonalContracts) personalContracts;

  function getPersonalContracts() public view returns (address) {
    return address(personalContracts[msg.sender]);
  }

  event PersonalContractsCreated(address owner, address location);

  function createPersonalContracts(address owner) public {
    PersonalContracts pContracts = new PersonalContracts();
    personalContracts[owner] = pContracts;
    emit PersonalContractsCreated(owner, address(pContracts));
  }

  function getOrCreatePersonalContracts(address owner) private returns (PersonalContracts) {
    if (address(personalContracts[owner]) == address(0)) {
      createPersonalContracts(owner);
    }

    return personalContracts[owner];
  }


  function addParticipant(address newParticipant, BasicContract contractAddress) public {
    // TODO: Ensure permission to do this?
    PersonalContracts pContract = getOrCreatePersonalContracts(newParticipant);
    pContract.addContract(contractAddress);
  }


  function createContract(string memory title, string memory content) public {
    BasicContract newContract = new BasicContract(msg.sender, title, this);
    newContract.setContent(content);

    // Automatically assign the contract to the creators personal contracts
    PersonalContracts pContracts = getOrCreatePersonalContracts(msg.sender);
    pContracts.addContract(newContract);
  }

  function createContractWithParticipants(string memory title, string memory content, address[] memory participants) public {
    BasicContract newContract = new BasicContract(msg.sender, title, this);
    newContract.setContent(content);

    // Automatically assign the contract to the creators personal contracts
    PersonalContracts pContracts = getOrCreatePersonalContracts(msg.sender);
    pContracts.addContract(newContract);

    newContract.addManyParticipants(participants);
  }
}