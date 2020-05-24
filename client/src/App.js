import React, { Component } from "react";
import { hasPersonalContracts, createOrGetPersonalContracts } from './ContractManager';

import "./App.css";

class App extends Component {
  state = { hasPersonalContracts: undefined, pc: undefined };

  constructor(props) {
    super(props);
    this.setup = this.setup.bind(this);
  }

  componentDidMount = async () => {
    try {

      if (!(await hasPersonalContracts())) {
        this.setState({ hasPersonalContracts: false})
      } else {
        this.setup();
      }

      this.setState({ hasPersonalContracts: await hasPersonalContracts() });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  async setup() {
    this.setState({ hasPersonalContracts: true, pc: await createOrGetPersonalContracts() });
  }

  render() {
    if (this.state.hasPersonalContracts === undefined) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>Demo Signing</h2>
        {
          this.state.hasPersonalContracts ?
          // If contracts are ready
          <div>
            <p>Ready!</p>
          </div>
          :
          // If there is no personal contracts setup
          <div>
          <p>You do not currently have a contract store on the blockchain!</p>
          <button onClick={() => this.setup()}>Setup Personal Contract Store</button>
        </div>
        }
      </div>
    );
  }
}

export default App;
