import BasicContract from "./contracts/BasicContract.json";
import ContractManager from "./contracts/ContractManager.json";
import PersonalContracts from "./contracts/PersonalContracts.json";

import getWeb3 from "./getWeb3";


export const web3 = getWeb3();

export const accounts = (async () => {
  let accounts = (await web3).eth.getAccounts()
  localStorage.setItem("primaryAccount", (await accounts)[0])
  return accounts
})();

let triggerFunction = (_) => undefined;
export const manager = (async () => {
  const w3 = await web3;

  const networkId = await w3.eth.net.getId();
  const deployedNetwork = ContractManager.networks[networkId];
  const instance = new w3.eth.Contract(
    ContractManager.abi,
    deployedNetwork && deployedNetwork.address
  );

  const account = (await accounts)[0];

  instance.events.PersonalContractsCreated((err, result) => {
    // Check that we are retreiving a personal contract system we own
    if (result.returnValues[0].toLowerCase() === account.toLowerCase()) {
      const contract_address = result.returnValues[1]
      triggerFunction(contract_address);
    }
  })

  return instance;
})();

export const hasPersonalContracts = async () => {
  const instance = await manager;

  const personalAddress = await instance.methods.getPersonalContracts().call();

  return parseInt(personalAddress) !== 0;
}

const createOrGetPersonalContractAddress = async () => {
  const instance = await manager;
  const account = (await accounts)[0];

  if (await hasPersonalContracts()) {
    return await instance.methods.getPersonalContracts().call();
  }

  const contract_address = new Promise((resolve) => {
    triggerFunction = (contract_address) => resolve(contract_address);
  });

  await instance.methods.createPersonalContracts(account).send({ from: account, gas: 1000000 });

  return await contract_address;
}

export const createOrGetPersonalContracts = async () => {
  const w3 = await web3;
  const address = await createOrGetPersonalContractAddress();

  const contract = new w3.eth.Contract(
    PersonalContracts.abi,
    address
  )

  return new PersonalContractsContainer(contract);

}

class ContractContainer {
  constructor(address, instance) {
    this.address = address;
    this.instance = instance;

    this.ownerCache = undefined;
    this.titleCache = undefined;
    this.contentCache = undefined;
    this.hashCache = undefined;
    this.signedCache = undefined;
    this.participantCache = undefined;

    this.getContent = this.getContent.bind(this);
    this.sign = this.sign.bind(this);
  }

  async getParticipants() {
    if (!this.participantCache) this.participantCache = await this.instance.methods.getParticipants().call();
    return this.participantCache;
  }

  async getTitle() {
    if (!this.titleCache) this.titleCache = await this.instance.methods.getTitle().call();
    return this.titleCache;
  }

  async getOwner() {
    if (!this.ownerCache) this.ownerCache = await this.instance.methods.getOwner().call();
    return this.ownerCache;
  }

  async getContent() {
    if (!this.contentCache) this.contentCache = await this.instance.methods.getContent().call()
    return this.contentCache;
  }

  async getHash() {
    if (!this.hashCache) this.hashCache = await this.instance.methods.getHash().call()
    return this.hashCache;
  }

  invalidate() {
    this.titleCache = undefined;
    this.contentCache = undefined;
    this.hashCache = undefined;
    this.signedCache = undefined;
    this.participantCache = undefined;
  }

  async addParticipant(address) {
    const curParticipants = await this.getParticipants();
    // Check that they aren't already a participant
    if (curParticipants.indexOf(address) === -1) {
      const account = (await accounts)[0]

      await this.instance.methods.addParticipant(address).send({ from: account, gas: 1000000 });

      // TODO: Better method of refreshing data
      this.invalidate();
    }
  }

  async addManyParticipants(addresses) {
    const curParticipants = await this.getParticipants();

    addresses = addresses.filter(a => !curParticipants.includes(a))
    // Check that they aren't already a participant
    if (addresses.length === 1) {
      await this.addParticipant(addresses[0]) // Use cheaper version if only one
    }
    else if (addresses.length > 0) {
      const account = (await accounts)[0]

      await this.instance.methods.addManyParticipants(addresses).send({ from: account, gas: 1000000 });

      // TODO: Better method of refreshing data
      this.invalidate();
    }
  }

  async sign() {
    const account = (await accounts)[0]
    const w3 = await web3;
    const hash = await this.getHash()

    const sig = await w3.eth.personal.sign(hash, account);

    await this.instance.methods.sign(sig).send({ from: account, gas: 1000000 })
    
    this.invalidate();
  }

  async checkSigned(signee) {
    let doCache = false;
    if (!signee) {
      if (this.signedCache) return this.signedCache;
      doCache = true;
      signee = (await accounts)[0]
    }

    const sig = await this.instance.methods.getSignature(signee).call();

    if (sig.length === 0) return 0;

    const w3 = await web3;
    const hash = await this.getHash();

    const verifySignee = await w3.eth.personal.ecRecover(hash, sig)

    const result = verifySignee.toLowerCase() === signee.toLowerCase() ? 1 : -1;
    
    if (doCache) this.signedCache = result;

    return result;
  }
}

class PersonalContractsContainer {
  constructor(instance) {
    this.instance = instance;
    this.callbacks = []

    instance.events.ContractAssigned((err, result) => {
      // const assigner = result.returnValues[0];
      const newContractAddress = result.returnValues[1];

      if (this.callbacks.length > 0) {
        this.callbacks.shift()(newContractAddress);
      }
    })

    this.getContracts.bind(this);
    this.createNewContract.bind(this);
  }

  async getContracts() {
    const w3 = await web3;
    return (await this.instance.methods.getContracts().call()).map(cAddress => {
      const instance = new w3.eth.Contract(
        BasicContract.abi,
        cAddress
      );
      return new ContractContainer(cAddress, instance)
    }
    );
  }

  async createNewContract({ name, hash }) {
    const account = (await accounts)[0];
    const managerInstance = await manager;

    const newAddress = new Promise((resolve) => {
      this.callbacks.push((address) => resolve(address))
    })

    await managerInstance.methods.createContract(name, hash).send({ from: account, gas: 1000000 })

    return await newAddress;
  }
}