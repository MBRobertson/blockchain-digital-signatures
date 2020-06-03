import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import './ContractListItem.css';
import { SignedStatus } from './SignedStatus';

export const ContractListItem = ({ contract, onContractSelect }) => {
    const [title, setTitle] = useState("Fetching Info...")
    const [signed, setSigned] = useState(-2)
  
    useEffect(() => {
      (async () => {
        setTitle(await contract.getTitle());
        setSigned(await contract.checkSigned());
      })();
    }, [contract])
  
    return <div className="ContractListItem">
      <div className="column left">
        <div className="title">{title}</div>
        <div className="address">{contract.address}</div>
      </div>
      <div className="column right">
        <SignedStatus status={signed}/>
        <Button shape="round" size="small" onClick={() => {
          if (onContractSelect) onContractSelect(contract);
        }}>View</Button>
      </div>
    </div>
  }