import React, { useState, useCallback } from 'react';
import { Button } from 'antd';
import { UserSwitchOutlined, UserOutlined } from '@ant-design/icons'

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
                {Object.entries(Contacts.getContacts()).map(([address, contact]) => <ContactView key={address} contact={contact}/>)}
            </div>
        </div>
        <div className="ButtonContainer">
            <Button onClick={toggleMenu} size="large" type={hidden ? "primary" : ''} shape="circle" icon={<UserSwitchOutlined/>}></Button>
        </div>
    </div>
}

export const ContactView = ({ contact }) => {
    return <div className="ContactView">
        <div className="pic"><UserOutlined/></div>
        {contact.name}
    </div>
}