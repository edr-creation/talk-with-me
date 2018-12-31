const {ipcRenderer} = require('electron')

const messageForm = document.getElementById('message-form')
const syncDom = document.getElementById('sync-wrapper')

// database related
let remoteCouch = 'https://abed97fb-b94d-4cce-9d0f-0df678cbf273-bluemix:078e4b3e4595d8505a623533f6e34615635138b7f3a05044b2ffcf1cc0d3910d@abed97fb-b94d-4cce-9d0f-0df678cbf273-bluemix.cloudantnosqldb.appdomain.cloud/talk-with-me--messages'
let db = new PouchDB(remoteCouch)


db.changes({
    since: 'now',
    live: true
}).on('change', displayMessages)


function sync() {
    syncDom.setAttribute('data-sync-state', 'syncing')
    var opts = {live: true}
    db.sync(remoteCouch, opts, syncError)
}


function syncError() {
    syncDom.setAttribute('data-sync-state', 'error')
}


function addMessage(senderUsername, senderMessage) {
    const newMessage = {
        _id: new Date().toISOString(),
        username: senderUsername,
        content: senderMessage
    }

    db.put(newMessage, (err, result) => {
        if (!err) {
            console.log('New message added!')
        }
    })
}


messageForm.onsubmit = e => {
    e.preventDefault()

    const senderUsername = document.getElementById('message-username').value
    const senderMessage = document.getElementById('message-content').value

    addMessage(senderUsername, senderMessage)

    const notification = {
        title: 'Talk With Me: New message received !',
        body: `${senderUsername}: ${senderMessage}`
    }

    const messageNotification = new window.Notification(notification.title, notification)
    // Reinitialize the message field when the message is submited
    document.getElementById('message-content').value = null
    return false
}


function redrawMessagesUI(rows) {
    document.getElementById('messages').innerHTML = null
    rows.forEach(element => {
        document.getElementById('messages').innerHTML += `<div class="message"><p><b>${element.doc.username}:</b> ${element.doc.content}</p></div>`
    })
    document.getElementById('messages').innerHTML += '<span id="bottom"></span>'
}


function displayMessages() {
    db.allDocs({include_docs: true, descending: false, limit: 150}, (err, doc) => {
        redrawMessagesUI(doc.rows)
    })
}

displayMessages()