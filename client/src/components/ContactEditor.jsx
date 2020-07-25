import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Button, Input } from 'antd';
import { UserSwitchOutlined, UserAddOutlined, UserOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

import * as Contacts from '../data/ContactStore';


import './ContactEditor.css';

export const ContactEditor = () => {
    const [hidden, setHidden] = useState(true);
    const [contacts, setContacts] = useState({});
    const [form] = Form.useForm();

    const refresh = () => {
        setContacts(Contacts.getContacts());
    }

    useEffect(refresh, []);

    const toggleMenu = useCallback(() => {
        setHidden(!hidden)
    }, [hidden]);

    const addContact = () => {
        Modal.confirm({
            title: 'New Contact Details',
            okText: 'Create Contact',
            cancelText: 'Cancel',
            content: (
                <Form form={form} layout="vertical" name="contact_edit" initialValues={{
                    name: '',
                    address: ''
                }}>
                    <Form.Item name="name" label="Name" rules={[{required: true, message: 'Please input a name'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="address" label="Ethereum Address" rules={[{required: true, message: 'Please input an address'}]}>
                        <Input/>
                    </Form.Item>
                </Form>
            ),
            onOk: () => {
                // TODO Validate that contact doesn't already exist
                form.validateFields().then((values) => {
                    const newAddress = values.address;
                    const newName = values.name;
                    // if (newAddress !== address) Contacts.deleteContact(address)
                    Contacts.addContact(newAddress, { name: newName })
                    refresh()
                })
            }
        })
    }

    return <div className="ContactEditor">
        <div className={`Contacts Card ${hidden ? 'hidden' : ''}`}>
            <div className="title">Contacts</div>
            <div className="list">
                {Object.keys(contacts).length !== 0 ?
                    Object.entries(contacts).map(([address, contact]) => <ContactView key={address} address={address} contact={contact} refresh={refresh}/>)
                    :
                    <span>No contacts</span>
                }
            </div>
            <div className="actions">
                <Button onClick={addContact} type="primary" shape="round" size="small" icon={<UserAddOutlined/>}>Add Contact</Button>
            </div>
        </div>
        <div className="ButtonContainer">
            <Button onClick={toggleMenu} size="large" type={hidden ? "primary" : ''} shape="circle" icon={<UserSwitchOutlined/>}></Button>
        </div>
    </div>
}

export const ContactView = ({ address, contact, refresh }) => {
    const [form] = Form.useForm();

    const deleteContact = () => {
        Modal.confirm({
            title: `Are you sure you want to delete ${contact.name} from your contacts?`,
            icon: <ExclamationCircleOutlined/>,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                Contacts.deleteContact(address);
                refresh()
            }
        })
    }

    const editContact = () => {
        Modal.confirm({
            title: 'Edit Contact Details',
            okText: 'Save',
            cancelText: 'Cancel',
            content: (
                <Form className="form" form={form} layout="vertical" name="contact_edit" initialValues={{
                    name: contact.name,
                    address
                }}>
                    <Form.Item name="name" label="Name" rules={[{required: true, message: 'Please input a name'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="address" label="Ethereum Address" rules={[{required: true, message: 'Please input an address'}]}>
                        <Input/>
                    </Form.Item>
                </Form>
            ),
            onOk: () => {
                form.validateFields().then((values) => {
                    const newAddress = values.address;
                    const newName = values.name;
                    if (newAddress !== address) Contacts.deleteContact(address)
                    Contacts.addContact(newAddress, { name: newName })
                    refresh()
                })
            }
        })
    }

    return <div className="ContactView">
        <div className="pic"><UserOutlined/></div>
        <div className="details">
            <div className="name">{contact.name}</div>
            <div className="address">{address}</div>
        </div>
        <div className="actions">
            <Button onClick={editContact} size="small" shape="round" icon={<EditOutlined/>}></Button>
            <Button onClick={deleteContact} size="small" type="primary" shape="round" danger icon={<DeleteOutlined/>}></Button>
        </div>
    </div>
}