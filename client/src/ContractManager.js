import BasicContract from "./contracts/BasicContract.json";
import ContractManager from "./contracts/ContractManager.json";
import PersonalContracts from "./contracts/PersonalContracts.json";

import getWeb3 from "./getWeb3";


export const web3 = getWeb3();

export const accounts = (async () => (await web3).eth.getAccounts())();

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

    this.titleCache = undefined;
    this.contentCache = undefined;
    this.hashCache = undefined;

    this.getContent = this.getContent.bind(this);
    this.sign = this.sign.bind(this);
  }

  async getTitle() {
    if (!this.titleCache) this.titleCache = await this.instance.methods.getTitle().call();
    return this.titleCache;
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
  }

  async sign() {
    const account = (await accounts)[0]
    const w3 = await web3;
    const hash = await this.getHash()

    const sig = await w3.eth.personal.sign(hash, account);

    await this.instance.methods.sign(sig).send({ from: account, gas: 1000000 })
    
    this.invalidate();
    console.log("Sent!")
  }

  async checkSigned(signee) {
    if (!signee) {
      signee = (await accounts)[0]
    }

    this.invalidate();

    const sig = await this.instance.methods.getSignature(signee).call();

    if (sig.length === 0) return 0;

    const w3 = await web3;
    const hash = await this.getHash();

    const verifySignee = await w3.eth.personal.ecRecover(hash, sig)

    return verifySignee.toLowerCase() === signee.toLowerCase() ? 1 : -1
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

  async createNewContract() {
    const account = (await accounts)[0];
    const managerInstance = await manager;

    const newAddress = new Promise((resolve) => {
      this.callbacks.push((address) => resolve(address))
    })

    await managerInstance.methods.createContract("Sample Contract").send({ from: account, gas: 1000000 })

    return await newAddress;
  }
}