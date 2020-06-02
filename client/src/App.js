import React, { Component, useState, useEffect } from "react";
import { hasPersonalContracts, createOrGetPersonalContracts } from './ContractManager';
import { Spin, Divider, Typography, Button } from 'antd';
import { LoadingOutlined, FileAddOutlined, PlusCircleOutlined } from '@ant-design/icons';

import "./App.css";

const spinIcon = <LoadingOutlined style={{ fontSize: 60, color: "white" }} spin />;

const ContractDisplay = ({ contract }) => {
  const [title, setTitle] = useState("Fetching Info...")
  const [signed, setSigned] = useState(-2)

  useEffect(() => {
    (async () => {
      setTitle(await contract.getTitle());
      setSigned(await contract.checkSigned());
    })();
  }, [contract])

  return <div className="ContractDisplay">
    <div className="column left">
      <div>{title}</div>
      <div>{contract.address}</div>
    </div>
    <div className="column right">
      <div>{(() => {
        switch(signed) {
          case -2:
            return "Checking..."
          case -1:
            return "Signed (Invalid)"
          case 0:
            return "Not Signed"
          case 1:
            return "Signed (Validated)"
          default:
            return "Unexpected Signature"
      }})()}</div>
      <Button shape="round" size="small" onClick={async () => {
        await contract.sign()
        setSigned(await contract.checkSigned());
      }}>Sign</Button>
    </div>
  </div>
}

class App extends Component {
  state = { hasPersonalContracts: undefined, pc: undefined, contracts: [], processing: false };

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
                    {this.state.contracts.map(contract => <ContractDisplay contract={contract} key={contract.address} />)}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginTop: 15 }}>
                    <Button loading={this.state.processing} icon={<PlusCircleOutlined />} shape="round" type="secondary" onClick={() => {
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
      </div>
    );
  }
}

export default App;
