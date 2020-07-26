import React, { useState, useEffect } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './ContractListItem.css';
import { SignedStatus } from './SignedStatus';

import * as Contacts from '../data/ContactStore';

export const ContractListItem = ({ contract, onContractSelect }) => {
    const [title, setTitle] = useState("Fetching Info...")
    const [signed, setSigned] = useState(-2)
    const [owner, setOwner] = useState(contract.address)
  
    useEffect(() => {
      (async () => {
        setTitle(await contract.getTitle());
        setSigned(await contract.checkSigned());
        setOwner(Contacts.addressToName(await contract.getOwner()));
      })();
    }, [contract])
  
    return <div className="ContractListItem">
      <div className="column left">
        <div className="title">{title}</div>
        <div className="address">Created By: {owner}</div>
      </div>
      <div className="column right">
        <SignedStatus status={signed}/>
        <Button icon={<EyeOutlined/>} shape="round" size="small" onClick={() => {
          if (onContractSelect) onContractSelect(contract);
        }}>View</Button>
      </div>
    </div>
  }