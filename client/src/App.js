import React, { Component } from "react";
import { hasPersonalContracts, createOrGetPersonalContracts } from './ContractManager';
import { Spin, Divider, Typography, Button } from 'antd';
import { LoadingOutlined, FileAddOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { ContractListItem } from './components/ContractListItem';
import { ContractView } from './components/ContractView';

import { ContactEditor } from './components/ContactEditor';

import "./App.css";

const spinIcon = <LoadingOutlined style={{ fontSize: 60, color: "white" }} spin />;

class App extends Component {
  state = { hasPersonalContracts: undefined, pc: undefined, contracts: [], processing: false, selectedContract: null };

  constructor(props) {
    super(props);
    this.setup = this.setup.bind(this);
    this.createContract = this.createContract.bind(this);
  }

  componentDidMount = async () => {
    try {

      if (!(await hasPersonalContracts())) {
        this.setState({ hasPersonalContracts: false })
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
    const pc = await createOrGetPersonalContracts();
    const contracts = await pc.getContracts();
    this.setState({ hasPersonalContracts: true, pc, contracts, processing: false });
  }

  async createContract() {
    await this.state.pc.createNewContract(); // Returns new contract address
    this.setState({ contracts: await this.state.pc.getContracts() });
  }

  render() {
    if (this.state.hasPersonalContracts === undefined) {
      return <div className="App-loading"><Spin indicator={spinIcon} /></div>;
    }

    if (this.state.selectedContract)
      return <ContractView contract={this.state.selectedContract} exit={() => this.setState({selectedContract: null})}/>

    return (
      <div className="App-container">
        <div className="App Card">
          {
            this.state.hasPersonalContracts ?
              // If contracts are ready
              <div>
                <Typography.Title level={2}>Your Contracts</Typography.Title>
                <Divider />
                <div className="Card-content">
                  <div>
                    {this.state.contracts.length === 0 ? <p style={{ marginBottom: 30 }}>
                      <Typography.Text>You are currently not a participant to any contracts</Typography.Text>
                    </p> : null }
                    {this.state.contracts.map(contract => <ContractListItem 
                      contract={contract} 
                      key={contract.address} 
                      onContractSelect={(contract) => this.setState({ selectedContract: contract })}
                    />)}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginTop: 15 }}>
                    <Button type="primary" loading={this.state.processing} icon={<PlusCircleOutlined />} shape="round" onClick={() => {
                      this.createContract()
                    }}>Create New Contract</Button>
                  </div>
              </div>
              :
              // If there is no personal contracts setup
              <div>
                <Typography.Title level={2}>Welcome</Typography.Title>
                <Divider />
                <div className="Card-content">
                  <p style={{ marginBottom: 30 }}>
                    <Typography.Text>You are currently not registered to manage contracts on the blockchain</Typography.Text>
                  </p>
                  <Button loading={this.state.processing} icon={<FileAddOutlined />} size="large" shape="round" type="primary" onClick={() => {
                    this.setState({ processing: true }, () => this.setup())
                  }}>Setup Personal Contract Store</Button>
                </div>
              </div>
          }
        </div>
        <ContactEditor/>
      </div>
    );
  }
}

export default App;
