pragma solidity >=0.4.21 <0.7.0;

contract BasicContract {
  address owner;
  address[] participants;
  mapping(address => bool) permissions;
  string content;
  mapping(address => string) signatures;
  string title;

  constructor(address creator, string memory t) public {
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
    }
  }

  function sign(string memory signature) public {
    // Check they are allowed to sign the contract
    if (permissions[msg.sender]) {
      // TODO: Validate using ECRecover

      signatures[msg.sender] = signature;
    }
  }

  function getSignature(address signee) public view returns (string memory) {
    return signatures[signee];
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


  function createContract(string memory title) public {
    BasicContract newContract = new BasicContract(msg.sender, title);

    // Automatically assign the contract to the creators personal contracts
    PersonalContracts pContracts = getOrCreatePersonalContracts(msg.sender);
    pContracts.addContract(newContract);
  }
}