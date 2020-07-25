import React, { useState, useCallback } from 'react';
import { Button } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons'


import './ContactEditor.css';

export const ContactEditor = () => {
    const [hidden, setHidden] = useState(true);

    const toggleMenu = useCallback(() => {
        setHidden(!hidden)
    }, [hidden])

    return <div className="ContactEditor">
        <div class={`Contacts Card ${hidden ? 'hidden' : ''}`}>Blah</div>
        <div class="ButtonContainer">
            <Button onClick={toggleMenu} size="large" type={hidden ? "primary" : ''} shape="circle" icon={<UserSwitchOutlined/>}></Button>
        </div>
    </div>
}