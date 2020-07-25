const DEFUALT_CONTACTS = {
    "0x0bbd91c075433599094fb973e55235d239d22f8b": {
        name: "John Doe"
    },
    "0xa5d844e32288304184efdd8ed45896b4d7ca853a": {
        name: "Jane Sue"
    }
}

export const getContacts = () => {
    let contacts = JSON.parse(window.localStorage.getItem("contacts"))
    if (contacts === null) {
        contacts = DEFUALT_CONTACTS
        window.localStorage.setItem("contacts", JSON.stringify(contacts))
    }
    return contacts
}

export const addContact = (address, data) => {
    let contacts = getContacts();
    delete contacts[address.toLowerCase()];
    window.localStorage.setItem("contacts", JSON.stringify(contacts))
}

export const deleteContact = (address) => {
    let contacts = getContacts();
    delete contacts[address.toLowerCase()];
    window.localStorage.setItem("contacts", JSON.stringify(contacts))
}

export const addressToName = (address) => {
    let contacts = getContacts()
    if (contacts[address.toLowerCase()] && contacts[address.toLowerCase()].name) {
        return contacts[address.toLowerCase()].name
    } else {
        return address
    }
}