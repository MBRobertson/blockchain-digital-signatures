import React, { Component, useCallback } from "react";
import { hasPersonalContracts, createOrGetPersonalContracts } from './ContractManager';
import { Spin, Divider, Typography, Button, Modal, Form, Input } from 'antd';
import { LoadingOutlined, FileAddOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';

import {useDropzone} from 'react-dropzone'
import CryptoJS from 'crypto-js';

import { ContractListItem } from './components/ContractListItem';
import { ContractView } from './components/ContractView';

import { ContactEditor } from './components/ContactEditor';

import "./App.css";

const spinIcon = <LoadingOutlined style={{ fontSize: 60, color: "white" }} spin />;

class App extends Component {
  state = { hasPersonalContracts: undefined, pc: undefined, contracts: [], processing: false, selectedContract: null, modal: false };

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

  async createContract(contractData) {
    this.setState({ processing: false, modal: false })
    await this.state.pc.createNewContract(contractData); // Returns new contract address
    this.setState({ contracts: await this.state.pc.getContracts() });
  }

  render() {
    if (this.state.hasPersonalContracts === undefined) {
      return <div className="App-loading"><Spin indicator={spinIcon} /></div>;
    }

    if (this.state.selectedContract)
      return <ContractView contract={this.state.selectedContract} exit={() => this.setState({ selectedContract: null })} />

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
                    </p> : null}
                    {this.state.contracts.map(contract => <ContractListItem
                      contract={contract}
                      key={contract.address}
                      onContractSelect={(contract) => this.setState({ selectedContract: contract })}
                    />)}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginTop: 15 }}>
                  <Button type="primary" loading={this.state.processing} icon={<PlusCircleOutlined />} shape="round" onClick={() => {
                    this.setState({ processing: true, modal: true })
                  }}>Create New Contract</Button>
                  <NewContractModal visible={this.state.modal} onConfirm={this.createContract.bind(this)} onCancel={() => this.setState({ processing: false, modal: false })} />
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
        <ContactEditor />
      </div>
    );
  }
}

const NewContractModal = ({ visible, onConfirm, onCancel }) => {
  const [form] = Form.useForm()

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const wa = CryptoJS.lib.WordArray.create(reader.result);
      const hash = CryptoJS.SHA256(wa)
      form.setFieldsValue({ hash: hash.toString() });
    }
    reader.readAsArrayBuffer(acceptedFiles[0])
  }, [form])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, maxFiles: 1, multiple: false})

  const onOk = useCallback(() => {
    form.validateFields().then(data => {
      if (onConfirm) onConfirm(data)
    })
  }, [onConfirm, form])

  const onExit = useCallback(() => {
    form.resetFields()
    onCancel()
  }, [form, onCancel])

  return <Modal
    title="Enter New Contract Details"
    visible={visible}
    onOk={onOk}
    onCancel={onExit}
    okText="Create New Contract"
  >
    <Form
      form={form}
      name="newContract"
    >
      <Form.Item
        label="Contract Name"
        name="name"
        rules={[{ required: true, message: 'Please input a contract name' }]}
      >
        <Input placeholder="eg. My Contract" />
      </Form.Item>
      <Form.Item 
        name="hash"
        label="Contract File"
        rules={[{ required: true, message: 'Please input a contract file' }]}
        >
        <Input disabled placeholder="Upload file below to compute hash" />
      </Form.Item>
      <div {...getRootProps({ className: `filedropzone ${isDragActive ? 'dragging' : ''}`})}>
        <input {...getInputProps()}/>
        <UploadOutlined className="icon" />
        {isDragActive ? <div className="instruction">Drop file to compute hash!</div> : <div className="instruction">Click here or Drag a file to compute hash</div>}
      </div>
      {/* TODO: Input for initial participants */}
    </Form>

  </Modal>
}

export default App;
