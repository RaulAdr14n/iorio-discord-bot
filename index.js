const token = process.env.DISCORD_TOKEN;
const idCanal = '1067266128751120435';
const puppeteer = require('puppeteer');
const { Client, GatewayIntentBits } = require('discord.js');

// Configura tu bot de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const servidoresPermitidos = [
    '[ESP/ENG] LATAMSQUAD #1 - latamsquad.net',
    '[BR/ESP] REALITY BRASIL | realitybrasil.org',
    '[ENG/ESP] Pro-RP Latino-America #1'
];

const mapasDeseados = ['Goose Green', 'The Falklands'];

let ultimoMapa = {};

// Función para verificar el estado de los servidores
async function verificarServidores() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.realitymod.com/prspy/');

    // Espera hasta que el tbody específico esté presente
    await page.waitForSelector('tbody[aria-live="polite"]');

    try {
        // Extrae los datos
        const servidores = await page.$$eval('tbody[aria-live="polite"] tr', filas => {
            return filas.map(fila => {
                const serverNameElement = fila.querySelector('.data.servername .wrapper');
                const numPlayersElement = fila.querySelector('.data.numplayers .wrapper');
                const mapNameElement = fila.querySelector('.data.mapname .wrapper');

                if (serverNameElement && numPlayersElement && mapNameElement) {
                    const serverName = serverNameElement.innerText.trim();
                    const numPlayers = numPlayersElement.innerText.trim();
                    const mapName = mapNameElement.innerText.trim();
                    return { serverName, numPlayers, mapName };
                } else {
                    return null;
                }
            }).filter(servidor => servidor !== null); // Filtra elementos nulos
        });

        // Filtrar los servidores permitidos y mapas deseados
        servidores.forEach(servidor => {
            if (servidoresPermitidos.includes(servidor.serverName) && mapasDeseados.includes(servidor.mapName)) {
                if (ultimoMapa[servidor.serverName] !== servidor.mapName) {
                    const canal = client.channels.cache.get(idCanal);
                    canal.send(`🚨 Están jugando en ${servidor.serverName}: ${servidor.mapName} con ${servidor.numPlayers} jugadores.`);
                    ultimoMapa[servidor.serverName] = servidor.mapName;
                }
            } else if (ultimoMapa[servidor.serverName]) {
                delete ultimoMapa[servidor.serverName];
            }
        });

    } catch (error) {
        console.error('Error al extraer datos:', error);
    }

    await browser.close();
}

// Verificar los servidores cada 1 minuto
setInterval(verificarServidores, 60000);

// Conectar el bot a Discord
client.once('ready', () => {
    console.log('Bot conectado a Discord');
    verificarServidores(); // Ejecutar inmediatamente al iniciar
});

client.login(token);

