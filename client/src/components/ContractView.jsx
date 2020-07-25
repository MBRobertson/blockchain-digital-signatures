import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Divider, Button } from 'antd';
import { SignedStatus } from './SignedStatus';
import { PlusCircleOutlined } from '@ant-design/icons';
import * as Contacts from '../data/ContactStore';

export const ContractView = ({ contract, exit }) => {
    const [title, setTitle] = useState("Fetching Info...")
    // const [owner, setOwner] = useState("Fetching Info...")
    const [content, setContent] = useState("Fetching Info...")
    const [signed, setSigned] = useState(-2)
    const [participants, setParticipants] = useState([]);
    const [addingParticipant, setAddingParticipant] = useState(false);

    useEffect(() => {
        (async () => setTitle(await contract.getTitle()))();
        (async () => setContent(await contract.getContent()))();
        (async () => setSigned(await contract.checkSigned()))();
        (async () => setParticipants(await contract.getParticipants()))();
        // (async () => setOwner(Contacts.addressToName(await contract.getOwner())))();
    }, [contract]);

    const addParticipant = useCallback(async (address) => {
        setAddingParticipant(true);
        await contract.addParticipant(address);
        // TODO better detect completion
        setParticipants(await contract.getParticipants());
        setAddingParticipant(false);
        console.log("Participant added")
    }, [contract])

    return <div className="App-container">
        <div className="App Card">
            <Typography.Title level={2}>{title}</Typography.Title>
            <Divider />
            <div className="Card-content">
                <div>
                    <SignedStatus status={signed} />
                    <Divider plain>Address</Divider>
                    <Typography.Text>{contract.address}</Typography.Text>
                    <Divider plain>Content</Divider>
                    <Typography.Text>{content}</Typography.Text>
                    <Divider plain>Participants</Divider>
                    <Typography.Text>{JSON.stringify(participants.map(Contacts.addressToName))}</Typography.Text>
                    <div style={{ textAlign: "right", marginTop: 15 }}>
                        <Button loading={addingParticipant} icon={<PlusCircleOutlined />} shape="round" type="secondary" onClick={() => {
                            addParticipant("0xa5d844e32288304184efdd8ed45896b4d7ca853a");
                        }}>Add Participant</Button>
                        <Divider />
                        <Button shape="round" type="primary" onClick={async () => {
                            await contract.sign();
                            setSigned(await contract.checkSigned());
                        }}>Sign</Button>
                        <Button shape="round" style={{ marginLeft: 10 }} onClick={exit}>Back</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}