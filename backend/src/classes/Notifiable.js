class Notifiable {
    receiveNotification(message) {
        throw new Error("Method 'receiveNotification()' must be implemented.");
    }
}

module.exports = Notifiable;