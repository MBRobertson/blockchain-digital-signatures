import React, { Component } from "react";
import { hasPersonalContracts } from './ContractManager';

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, manager: null, hash: "Waiting...", contract: null };

  componentDidMount = async () => {
    try {
      console.log(await hasPersonalContracts())

      // debugger
      // instance.events.ContractCreated((error, result) => {
      //   // Check that we are retreiving a contract we make
      //   if (result.returnValues[0].toLowerCase() === accounts[0].toLowerCase()) {
      //     const contract_address = result.returnValues[1]
      //     const contract = new web3.eth.Contract(
      //       BasicContract.abi,
      //       contract_address
      //     )
      //     this.setState({ hash: `Created contract ${contract_address}`, contract})
      //   }
      // })

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3: w3, account: ac, manager: instance, hash: "Ready." });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // createNewContract = () => {
  //   const { manager, accounts } = this.state;

  //   this.setState({ hash: "Creating contract..." }, () => {
  //     manager.methods.createContract().send({ from: accounts[0], gas: 1000000 });
  //   })
  // }

  // testContract = () => {
  //   const { contract } = this.state;

  //   this.setState({ hash: "Fetching content..." }, async () => {
  //     const content = await contract.methods.getContent().call()
  //     this.setState({ hash: `Found contract content: ${content}`})
  //   })
  // }

  // signContract = () => {

  // }

  //#region old
  // data = "sample data"

  // signData = async () => {
  //   const { accounts, contract, web3 } = this.state;

  //   const hash = web3.utils.sha3(this.data);

  //   try {
  //     console.log(accounts[0])
  //     const sig = await web3.eth.personal.sign(hash, accounts[0])
  //     // const sig = "123"
  //     console.log(sig, typeof sig)
  //     await contract.methods.set(sig).send({ from: accounts[0], gas: 10000000 })

  //     this.setState({ hash: "Sucessfully signed and saved signature!" })
  //   } catch (e) {
  //     console.log(e)
  //     this.setState({ hash: "Failed to to sign and save signature!" })
  //   }
  // }

  // validateSigngatute = async () => {
  //   const { contract, web3 } = this.state;

  //   const hash = web3.utils.sha3(this.data);

  //   const sig = await contract.methods.getSignature().call();
  //   console.log(sig)
  //   const signer = await contract.methods.getSigner().call();
  //   // const signer = "yolo"

  //   const checkSigner = await web3.eth.personal.ecRecover(hash, sig)

  //   if (signer.toLowerCase() === checkSigner.toLowerCase()) {
  //     this.setState({ hash: "Sucessfully retrieved and validated signature! (Signed by: " + signer + ")" })
  //   } else {
  //     this.setState({ hash: "Unable to validate signature!" })
  //   }
  // }

  //#endregion

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>Demo Signing</h2>
        <div>
          <button onClick={() => this.createNewContract()}>Create New Contract</button>
        </div>
        <p>
          {this.state.hash}
        </p>
        {this.state.contract ? <div>
          <button onClick={() => this.testContract()}>Test Contract</button>
        </div> : null}
      </div>
    );
  }
}

export default App;
