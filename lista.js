const fs = require('fs');

/**
 * Obtiene la posición del usuario en la lista.
 * @param {String} username - Nombre del usuario.
 * @returns {Number|null} - Posición del usuario (1-indexed) o null si no está en la lista.
 */
function getUserRank(username) {
    const filePath = 'userList.json';
    let userList = {};

    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        userList = JSON.parse(rawData);
    }

    const sortedUsers = Object.keys(userList);

    username = username.toLowerCase();
    const position = sortedUsers.indexOf(username);
    return position !== -1 ? position + 1 : null;
}

/**
 * Obtiene los datos del usuario, incluyendo rol y partidas restantes.
 * @param {String} targetUser - Nombre del usuario.
 * @returns {Object|null} - Datos del usuario (rol y partidas permitidas) o null si no está.
 */
function getUserPosition(targetUser) {
    const filePath = 'userList.json';
    let userList = {};

    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        userList = JSON.parse(rawData);
    }

    const sortedUsers = Object.keys(userList);
    targetUser = targetUser.toLowerCase();
    const position = sortedUsers.indexOf(targetUser);

    return position !== -1 ? position + 1 : null;
}

/**
 * Añade un usuario nuevo y guarda la lista ordenada por rango y nombre.
 * @param {Object} tags - Metadatos del usuario desde Twitch.
 * @returns {Number|null} - Posición del usuario en la lista (1-indexed) o null si ya existía.
 */
function updateUserList(tags) {
    const userFilePath = 'userList.json';
    const gameLimitsPath = 'gameLimits.json';

    let userList = {};
    let gameLimits = {};

    if (fs.existsSync(userFilePath)) {
        const rawData = fs.readFileSync(userFilePath);
        userList = JSON.parse(rawData);
    }

    if (fs.existsSync(gameLimitsPath)) {
        const rawLimits = fs.readFileSync(gameLimitsPath);
        gameLimits = JSON.parse(rawLimits);
    } else {
        throw new Error(`El archivo ${gameLimitsPath} no existe.`);
    }

    const username = tags.username.toLowerCase();

    if (userList[username]) {
        console.log(`Usuario ${username} ya está en la lista. Comando ignorado.`);
        return null;
    }

    let rank = 'nada';
    if (tags.subscriber) {
        rank = 'sub';
    } else if (tags.mod) {
        rank = 'mod';
    } else if (tags.vip) {
        rank = 'vip';
    }

    const gamesAllowed = gameLimits[rank] || gameLimits['default'];
    userList[username] = { rank, gamesAllowed };

    // Ordenar la lista por prioridad de rango y alfabéticamente
    const RANK_PRIORITY = { sub: 1, mod: 2, vip: 3, nada: 4 };

    const sortedEntries = Object.entries(userList).sort((a, b) => {
        const rankA = RANK_PRIORITY[a[1].rank] || 99;
        const rankB = RANK_PRIORITY[b[1].rank] || 99;
        if (rankA !== rankB) return rankA - rankB;
        return a[0].localeCompare(b[0]);
    });

    const orderedUserList = {};
    for (const [key, value] of sortedEntries) {
        orderedUserList[key] = value;
    }

    fs.writeFileSync(userFilePath, JSON.stringify(orderedUserList, null, 2));

    return Object.keys(orderedUserList).indexOf(username) + 1;
}

/**
 * Elimina un usuario de la lista.
 * @param {String} username - Nombre del usuario a eliminar.
 * @returns {Boolean} - Verdadero si el usuario fue eliminado, falso si no existía.
 */
function removeUserFromList(username) {
    const filePath = 'userList.json';
    if (!fs.existsSync(filePath)) {
        return false;
    }

    const rawData = fs.readFileSync(filePath);
    const userList = JSON.parse(rawData);

    username = username.toLowerCase();

    if (userList[username]) {
        delete userList[username];
        fs.writeFileSync(filePath, JSON.stringify(userList, null, 2));
        return true;
    } else {
        return false;
    }
}

module.exports = {
    updateUserList,
    getUserRank,
    getUserPosition,
    removeUserFromList,
};
