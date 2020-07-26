import React, { useState, useEffect, useCallback } from 'react';
import { message, Typography, Divider, Button, Popover } from 'antd';
import { SignedStatus } from './SignedStatus';
import { PlusCircleOutlined } from '@ant-design/icons';
import * as Contacts from '../data/ContactStore';

import { ContactEditor, ContactView } from './ContactEditor';

import './ContractView.css';

export const ContractView = ({ contract, exit }) => {
    const [title, setTitle] = useState("Fetching Info...")
    // const [owner, setOwner] = useState("Fetching Info...")
    const [content, setContent] = useState("Fetching Info...")
    // const [signed, setSigned] = useState(-2)
    const [participants, setParticipants] = useState([]);
    const [addingParticipant, setAddingParticipant] = useState(false);

    const refreshSig = useCallback(() => {
        // (async () => setSigned(await contract.checkSigned()))();
        setParticipants([]);
        (async () => setParticipants(await contract.getParticipants()))();
    }, [contract]);

    useEffect(() => {
        (async () => setTitle(await contract.getTitle()))();
        (async () => setContent(await contract.getContent()))();
        refreshSig()
        // (async () => setOwner(Contacts.addressToName(await contract.getOwner())))();
    }, [contract, refreshSig]);

    const addParticipants = useCallback(async (addresses) => {
        setAddingParticipant(true);
        await contract.addManyParticipants(addresses);
        // TODO better detect completion
        setParticipants(await contract.getParticipants());
        setAddingParticipant(false);
        message.success(`Added ${addresses.length} participants`)
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
                    <div className="participants">
                        {
                            participants.map(address => {
                                const data = { name: Contacts.addressToName(address) }
                                return <SignedContactView address={address} key={address} contact={data} contract={contract}/>
                            })
                        }
                    </div>
                    <div style={{ textAlign: "right", marginTop: 15 }}>
                        <ParticipantSelector 
                            currentParticipants={participants} 
                            loading={addingParticipant}
                            onSubmit={addParticipants}
                        />
                        {/* <Button loading={addingParticipant} icon={<PlusCircleOutlined />} shape="round" type="secondary" onClick={() => {
                            addParticipant("0xa5d844e32288304184efdd8ed45896b4d7ca853a");
                        }}>Add Participants</Button> */}
                        <Divider />
                        <Button shape="round" type="primary" onClick={async () => {
                            await contract.sign();
                            const signed = await contract.checkSigned();
                            // setSigned(signed);
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

const ParticipantSelector = ({ onSubmit, currentParticipants, loading }) => {
    const [visible, setVisible] = useState(false);
    const [available, setAvailable] = useState([]);

    useEffect(() => {
        let available = Object.keys(Contacts.getContacts())

        available = available.filter(address => !currentParticipants.map(a => a.toLowerCase()).includes(address.toLowerCase()))

        setAvailable(available.map(a => [a, false]))
    }, [currentParticipants])

    const toggle = useCallback((address) => {
        let avail = [...available];
        const index = available.findIndex(a => a[0] === address)
        avail[index][1] = !avail[index][1];
        setAvailable(avail);
    }, [available])

    const submit = useCallback(() => {
        const addresses = available.filter(a => a[1]).map(a => a[0])
        setVisible(false)
        if (onSubmit)
            onSubmit(addresses);
    }, [available, onSubmit])

    return <Popover 
        content={<div className="ParticipantSelectPopover">
            {available.length > 0 && !loading ?
            <><div className="title">Select Participants</div>
            <div className="contacts">
                {available.map(([address, selected]) => {
                    const contact = Contacts.getContacts()[address]
                    return <ContactView key={address} selected={selected} contact={contact} address={address} onClick={() => toggle(address)}/>
                })}
            </div>
            <div className="confirm">
                <Button onClick={submit} disabled={available.filter(a => a[1]).length === 0} size="small" type="primary" shape="round">
                    Confirm
                </Button>
            </div></>
            : <div className="title">No contacts found (that are not already participants)</div>}
        </div>}
        visible={visible} 
        onVisibleChange={setVisible} 
        trigger="click"
        placement="topRight"
        >
        <Button loading={loading} icon={<PlusCircleOutlined />} shape="round" type="secondary">
            Add Participants
        </Button>
    </Popover>
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