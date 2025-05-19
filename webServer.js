const express = require('express');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');

const filePath = 'userList.json';
const limitsPath = 'gameLimits.json';
let backupStack = []; // Pila de copias de seguridad

// Crear una aplicación de Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware para manejar datos JSON en solicitudes POST
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Servir una página HTML para mostrar los datos
app.get('/', (req, res) => {
    const gameLimits = loadGameLimits(); // Cargar límites actuales

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Gente Guapa</title>
            <link rel="icon" href="/images/favicon.ico" type="image/x-icon">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background-color: #f2f2f2; }
                button { padding: 5px 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
                button:hover { background-color: #45a049; }
                .danger { background-color: #ff4d4d; }
                .danger:hover { background-color: #ff1a1a; }
                .highlight { background-color: #f7d07a; }
                .play { background-color: #007BFF; color: white; }
                .play:hover { background-color: #0056b3; }
                .config { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                .config h3 { margin: 0; margin-bottom: 10px; }
                .config label { display: block; margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <h1>Gente Guapa</h1>
            <div class="config">
                <h3>Configurar límites de partidas</h3>
                <form id="limits-form">
                    <label>
                        Mod:
                        <input type="number" name="mod" min="1" value="${gameLimits.mod || 1}">
                    </label>
                    <label>
                        VIP:
                        <input type="number" name="vip" min="1" value="${gameLimits.vip || 1}">
                    </label>
                    <label>
                        Sub:
                        <input type="number" name="sub" min="1" value="${gameLimits.sub || 1}">
                    </label>
                    <label>
                        Nada:
                        <input type="number" name="nada" min="1" value="${gameLimits.nada || 1}">
                    </label>
                    <button type="button" onclick="saveLimits()">Guardar Configuración</button>
                </form>
            </div>
            <div>
                <button onclick="resetList()" class="danger">Resetear Lista</button>
                <button onclick="undoChange()">Deshacer Último Cambio</button>
                <button onclick="decreaseGames()" class="play">Jugar</button>
            </div>
            <table id="user-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Usuario</th>
                        <th>Rango</th>
                        <th>Partidas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="5">Cargando...</td>
                    </tr>
                </tbody>
            </table>
            <script>
                const ws = new WebSocket('ws://' + window.location.host);

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    const tbody = document.querySelector('#user-table tbody');
                    tbody.innerHTML = '';

                    if (data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5">No hay usuarios en la lista.</td></tr>';
                    } else {
                        data.forEach((user, index) => {
                            const row = document.createElement('tr');
                            row.innerHTML = \`
                                <td>\${index + 1}</td>
                                <td>\${user.username}</td>
                                <td>\${user.rank}</td>
                                <td>\${user.gamesAllowed}</td>
                                <td>
                                    <button onclick="highlightRow(this)">Añadir al equipo</button>
                                    <button class="danger" onclick="removeUser('\${user.username}')">Eliminar</button>
                                </td>
                            \`;
                            tbody.appendChild(row);
                        });
                    }
                };

                function saveLimits() {
                    const form = document.getElementById('limits-form');
                    const formData = new FormData(form);
                    const limits = {};
                    formData.forEach((value, key) => {
                        limits[key] = parseInt(value, 10);
                    });

                    fetch('/save-limits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(limits),
                    }).then(response => {
                        if (response.ok) {
                            alert('Configuración guardada.');
                        } else {
                            alert('Error al guardar la configuración.');
                        }
                    });
                }

                // Otras funciones como removeUser, resetList, undoChange, etc., permanecen iguales
                function removeUser(username) {
                    fetch('/remove-user', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username }),
                    }).then(response => {
                        if (response.ok) {
                            console.log(\`Usuario \${username} eliminado.\`);
                        } else {
                            console.error('Error al eliminar el usuario.');
                        }
                    });
                }

                function resetList() {
                    fetch('/reset-list', { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                console.log('Lista reseteada.');
                            } else {
                                console.error('Error al resetear la lista.');
                            }
                        });
                }

                function undoChange() {
                    fetch('/undo-change', { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                console.log('Último cambio deshecho.');
                            } else {
                                console.error('Error al deshacer el cambio.');
                            }
                        });
                }

                // Función para resaltar la fila
                function highlightRow(button) {
                    const row = button.closest('tr'); // Obtener la fila más cercana
                    row.classList.toggle('highlight'); // Alternar el resalto
                }

                // Función para disminuir las partidas de las filas resaltadas
                function decreaseGames() {
                    const highlightedRows = document.querySelectorAll('.highlight');
                    const usernames = Array.from(highlightedRows).map(row => 
                        row.cells[1].textContent // Obtener el nombre de usuario de la fila resaltada
                    );

                    fetch('/decrease-games', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usernames }),
                    }).then(response => {
                        if (response.ok) {
                            console.log('Partidas disminuidas para los jugadores resaltados.');
                        } else {
                            console.error('Error al disminuir las partidas.');
                        }
                    });
                }
            </script>
        </body>
        </html>
    `;
    res.send(html);
});

// Cargar los límites desde el archivo
function loadGameLimits() {
    if (fs.existsSync(limitsPath)) {
        const rawData = fs.readFileSync(limitsPath);
        return JSON.parse(rawData);
    }
    return { mod: 1, vip: 1, sub: 1, nada: 1 }; // Valores predeterminados
}

// Guardar los límites en el archivo
function saveGameLimits(limits) {
    fs.writeFileSync(limitsPath, JSON.stringify(limits, null, 2));
}

// API para guardar los límites
app.post('/save-limits', (req, res) => {
    const limits = req.body;
    if (!limits || typeof limits !== 'object') {
        return res.status(400).send('Datos inválidos.');
    }

    saveGameLimits(limits);
    res.status(200).send('Límites guardados.');
});

// Leer los datos desde el archivo JSON
function getUserList() {
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }
    return {};
}

// Guardar los datos en el archivo JSON
function saveUserList(userList) {
    fs.writeFileSync(filePath, JSON.stringify(userList, null, 2));
}

// API para disminuir las partidas
app.post('/decrease-games', (req, res) => {
    const { usernames } = req.body;
    if (!usernames || !Array.isArray(usernames)) {
        return res.status(400).send('Faltan los nombres de usuario.');
    }

    const userList = getUserList();
    backupStack.push({ ...userList }); // Guardar copia en la pila

    usernames.forEach(username => {
        if (userList[username] && userList[username].gamesAllowed > 1) {
            userList[username].gamesAllowed--; // Disminuir partidas
        }
        else {
            delete userList[username];
        }
    });

    saveUserList(userList); // Guardar la lista actualizada
    broadcastUpdate(); // Actualizar los clientes
    res.status(200).send('Partidas disminuidas.');
});

// API para eliminar un usuario de la lista
app.post('/remove-user', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send('Falta el nombre de usuario.');
    }

    const userList = getUserList();

    if (userList[username]) {
        backupStack.push({ ...userList }); // Guardar copia en la pila
        delete userList[username]; // Eliminar el usuario
        saveUserList(userList);   // Guardar la lista actualizada
        broadcastUpdate();        // Actualizar los clientes
        res.status(200).send('Usuario eliminado.');
    } else {
        res.status(404).send('Usuario no encontrado.');
    }
});

// API para resetear la lista
app.post('/reset-list', (req, res) => {
    const userList = getUserList();
    if (Object.keys(userList).length > 0) {
        backupStack.push(userList); // Guardar el estado actual en la pila
    }
    saveUserList({});           // Vaciar la lista
    broadcastUpdate();          // Actualizar los clientes
    res.status(200).send('Lista reseteada.');
});

// API para deshacer el último cambio
app.post('/undo-change', (req, res) => {
    if (backupStack.length === 0) {
        return res.status(400).send('No hay cambios para deshacer.');
    }

    const previousState = backupStack.pop(); // Recuperar el último estado de la pila
    saveUserList(previousState);            // Restaurar el estado
    broadcastUpdate();                      // Actualizar los clientes
    res.status(200).send('Cambio deshecho.');
});

// Leer y enviar los datos de `userList.json` a todos los clientes conectados
function broadcastUpdate() {
    const userList = getUserList();
    const formattedData = Object.keys(userList).map((username, index) => ({
        username,
        rank: userList[username].rank,
        gamesAllowed: userList[username].gamesAllowed,
    }));

    const jsonData = JSON.stringify(formattedData);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonData);
        }
    });
}

// Detectar cambios en el archivo y actualizar los clientes
fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
        broadcastUpdate();
    }
});

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado');
    broadcastUpdate(); // Enviar datos iniciales al cliente
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor web iniciado en http://localhost:${PORT}`);
});
