import React, { useState, useEffect } from 'react';
import { Typography, Divider, Button } from 'antd';
import { SignedStatus } from './SignedStatus';


export const ContractView = ({ contract, exit }) => {
    const [title, setTitle] = useState("Fetching Info...")
    const [content, setContent] = useState("Fetching Info...")
    const [signed, setSigned] = useState(-2)
  
    useEffect(() => {
      (async () => {
        setTitle(await contract.getTitle());
        setContent(await contract.getContent());
        setSigned(await contract.checkSigned());
      })();
    }, [contract])

    return <div className="App-container">
        <div className="App Card">
            <Typography.Title level={2}>{title}</Typography.Title>
            <Divider />
            <div className="Card-content">
                <div>
                    <SignedStatus status={signed}/>
                    <Divider plain>Address</Divider>
                    <Typography.Text>{contract.address}</Typography.Text>
                    <Divider plain>Content</Divider>
                    <Typography.Text>{content}</Typography.Text>
                    <Divider/>
                    <Button shape="round" type="primary" onClick={async () => {
                        await contract.sign();
                        setSigned(await contract.checkSigned());
                    }}>Sign</Button>
                    <Button shape="round" style={{ marginLeft: 10 }} onClick={exit}>Back</Button>
                </div>
            </div>
        </div>
    </div>
}