import React, { useState, useEffect } from 'react';
import { Typography, Divider, Button } from 'antd';


export const ContractView = ({ contract, exit }) => {
    const [title, setTitle] = useState("Fetching Info...")
    const [signed, setSigned] = useState(-2)
  
    useEffect(() => {
      (async () => {
        setTitle(await contract.getTitle());
        setSigned(await contract.checkSigned());
      })();
    }, [contract])

    return <div className="App-container">
        <div className="App Card">
            <Typography.Title level={2}>Manage Contract</Typography.Title>
            <Divider />
            <div className="Card-content">
                <div>
                    <p style={{ marginBottom: 30 }}>
                        <Typography.Text>{title}</Typography.Text>
                        <Typography.Text>{contract.address}</Typography.Text>
                    </p>
                    <Button onClick={exit}>Back</Button>
                </div>
            </div>
        </div>
    </div>
}