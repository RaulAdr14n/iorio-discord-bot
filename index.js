const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let servidorEstado = {};

const servidoresPermitidos = [
    '[ESP/ENG] LATAMSQUAD #1 - latamsquad.net',
    '[BR/ESP] REALITY BRASIL | realitybrasil.org',
    '[ENG/ESP] Pro-RP Latino-America #1'
];

client.once('ready', () => {
    console.log('Bot está en línea!');
    revisarServidores();
    setInterval(revisarServidores, 60000); // Revisa cada 60 segundos
});

async function revisarServidores() {
    try {
        // Reemplaza esta URL con la URL real de la página que quieres scrapear
        const response = await axios.get('https://www.realitymod.com/prspy/');
        const html = response.data;
        const $ = cheerio.load(html);
        
        $('tr').each((index, element) => {
            const mapName = $(element).find('.data.mapname').text().trim();
            const numPlayers = $(element).find('.data.numplayers').text().trim();
            const serverName = $(element).find('.data.servername').text().trim();

            if (servidoresPermitidos.includes(serverName)) {
                if (mapName === 'The Falklands' || mapName === 'Goose Green') {
                    if (!servidorEstado[serverName] || servidorEstado[serverName] !== mapName) {
                        // Si es la primera vez o el mapa ha cambiado
                        servidorEstado[serverName] = mapName;
                        client.channels.cache.get('1067266128751120435').send(`LO' PUTO DE ${serverName} ESTÁN JUGANDO ${mapName} CON ${numPlayers} PELOTUDO ADENTRO`);
                    }
                } else {
                    // Si el servidor ya no está jugando en los mapas de interés, reseteamos el estado
                    if (servidorEstado[serverName]) {
                        delete servidorEstado[serverName];
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        client.channels.cache.get('1067266128751120435').send('Hubo un error al obtener los datos del servidor.');
    }
}

client.login('MTI2MTA1NjA1NTU1MTU5MDQ0MA.Gphh4-.2lWjiIjBdcYjTF06-WooUt6GnWUMCVgkNIT7jg');