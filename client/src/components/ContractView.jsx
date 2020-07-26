import React, { useState, useEffect, useCallback } from 'react';
import { message, Typography, Divider, Button } from 'antd';
import { SignedStatus } from './SignedStatus';
import { PlusCircleOutlined } from '@ant-design/icons';
import * as Contacts from '../data/ContactStore';

import { ContactEditor, ContactView } from './ContactEditor';

import './ContractView.css';

export const ContractView = ({ contract, exit }) => {
    const [title, setTitle] = useState("Fetching Info...")
    // const [owner, setOwner] = useState("Fetching Info...")
    const [content, setContent] = useState("Fetching Info...")
    const [signed, setSigned] = useState(-2)
    const [participants, setParticipants] = useState([]);
    const [addingParticipant, setAddingParticipant] = useState(false);

    const refreshSig = useCallback(() => {
        (async () => setSigned(await contract.checkSigned()))();
        (async () => setParticipants(await contract.getParticipants()))();
    }, [contract]);

    useEffect(() => {
        (async () => setTitle(await contract.getTitle()))();
        (async () => setContent(await contract.getContent()))();
        refreshSig()
        // (async () => setOwner(Contacts.addressToName(await contract.getOwner())))();
    }, [contract, refreshSig]);

    const addParticipant = useCallback(async (address) => {
        setAddingParticipant(true);
        await contract.addParticipant(address);
        // TODO better detect completion
        setParticipants(await contract.getParticipants());
        setAddingParticipant(false);
        message.success(`Added participant ${Contacts.addressToName(address)}`)
        refreshSig()
    }, [contract, refreshSig])

    return <div className="App-container">
        <div className="App Card">
            <Typography.Title level={2}>{title}</Typography.Title>
            <Divider />
            <div className="Card-content">
                <div>
                    {/* <Divider plain>Address</Divider> */}
                    <Typography.Text>{contract.address}</Typography.Text>
                    <Divider plain>Content Hash</Divider>
                    <Typography.Text>{content}</Typography.Text>
                    <Divider plain>Participants</Divider>
                    <div class="participants">
                        {
                            participants.map(address => {
                                const data = { name: Contacts.addressToName(address) }
                                return <SignedContactView address={address} key={address} contact={data} contract={contract}/>
                            })
                        }
                    </div>
                    <div style={{ textAlign: "right", marginTop: 15 }}>
                        <Button loading={addingParticipant} icon={<PlusCircleOutlined />} shape="round" type="secondary" onClick={() => {
                            addParticipant("0xa5d844e32288304184efdd8ed45896b4d7ca853a");
                        }}>Add Participants</Button>
                        <Divider />
                        <Button shape="round" type="primary" onClick={async () => {
                            await contract.sign();
                            const signed = await contract.checkSigned();
                            setSigned(signed);
                            if (signed === 1) message.success("Successfully signed contract")
                            else message.warn("Unable to validate signature")
                            refreshSig()
                        }}>Sign</Button>
                        <Button shape="round" style={{ marginLeft: 10 }} onClick={exit}>Back</Button>
                    </div>
                </div>
            </div>
        </div>
        <ContactEditor/>
    </div>
}

const SignedContactView = ({ address, contact, contract }) => {
    const [signed, setSigned] = useState(-2)

    useEffect(() => {
        (async () => setSigned(await contract.checkSigned(address)))();
    }, [address, contract])

    return <div className="SignedContactView">
        <ContactView address={address} key={address} contact={contact} contract={contract}/>
        <SignedStatus status={signed} />
    </div>
}