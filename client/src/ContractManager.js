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

export const createOrGetPersonalContracts = async () => {
  const instance = await manager;
  const account = (await accounts)[0];

  if (await hasPersonalContracts()) {
    return await instance.methods.getPersonalContracts().call();
  }

  const contract_address = new Promise((resolve) => {
    triggerFunction = (contract_address) => resolve(contract_address);
  });

  await instance.methods.createContract().send({ from: account, gas: 1000000 });

  return await contract_address;
}