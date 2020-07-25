import React, { useState, useCallback } from 'react';
import { Button } from 'antd';
import { UserSwitchOutlined, UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

import * as Contacts from '../data/ContactStore';


import './ContactEditor.css';

export const ContactEditor = () => {
    const [hidden, setHidden] = useState(true);

    const toggleMenu = useCallback(() => {
        setHidden(!hidden)
    }, [hidden])

    return <div className="ContactEditor">
        <div className={`Contacts Card ${hidden ? 'hidden' : ''}`}>
            <div className="title">Contacts</div>
            <div className="list">
                {Object.entries(Contacts.getContacts()).map(([address, contact]) => <ContactView key={address} address={address} contact={contact}/>)}
            </div>
        </div>
        <div className="ButtonContainer">
            <Button onClick={toggleMenu} size="large" type={hidden ? "primary" : ''} shape="circle" icon={<UserSwitchOutlined/>}></Button>
        </div>
    </div>
}

export const ContactView = ({ address, contact }) => {
    return <div className="ContactView">
        <div className="pic"><UserOutlined/></div>
        <div className="details">
            <div className="name">{contact.name}</div>
            <div className="address">{address}</div>
        </div>
        <div className="actions">
            <Button size="small" shape="round" icon={<EditOutlined/>}></Button>
            <Button size="small" type="primary" shape="round" danger icon={<DeleteOutlined/>}></Button>
        </div>
    </div>
}