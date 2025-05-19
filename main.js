const tmi = require('tmi.js');
const fs = require('fs');
const { updateUserList, getUserPosition, removeUserFromList } = require('./lista.js');
require('./webServer.js');

// Lista de canales
const joinedChannels = ['inmalive'];

// Configuración del cliente de Twitch
const client = new tmi.Client({
    identity: {
        username: '', // Reemplaza con el nombre del bot
        password: 'oauth:' // Genera el token desde https://twitchtokengenerator.com/
    },
    channels: joinedChannels,
});

// Conectar el cliente
client.connect().then(() => {
    console.log(`Bot conectado a los canales: ${joinedChannels.join(', ')}`);
}).catch(err => {
    console.error('Error al conectar el bot:', err);
});

// Manejar mensajes
client.on('message', (channel, tags, message, self) => {
    if (self) return; // Ignorar mensajes del bot

    const username = tags.username.toLowerCase();

    // Manejar el comando !jugar
    if (message.toLowerCase().startsWith('!jugar')) {
        const position = updateUserList(tags); // Actualiza la lista de usuarios y obtiene la posición
        if (position != null){
        setTimeout(() => {
            client.say(channel, `@${username}, has sido registrado en la lista, estás en la posición ${position}.`);
        }, 1000);
        }
        return;
    }

    // Comando para verificar el rango de un usuario
    if (message.toLowerCase().startsWith('!posicion')) {
        const targetUser = message.split(' ')[1] || username; // Si no se especifica, usa el autor
        const posicion = getUserPosition(targetUser);
        if (posicion !== null) {
            client.say(channel, `@${targetUser}, estas en el puesto ${posicion}.`);
        }
        return;
    }

    // Manejar el comando !salir
    if (message.toLowerCase().startsWith('!salir')) {
        const success = removeUserFromList(username); // Eliminar al usuario de la lista
        if (success) {
            setTimeout(() => {
                client.say(channel, `@${username}, has salido de la lista.`);
            }, 1000);
        } else {
            setTimeout(() => {
                client.say(channel, `@${username}, no estabas en la lista.`);
            }, 1000);
        }
        return;
    }
});
