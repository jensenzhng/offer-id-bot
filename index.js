const Discord = require('discord.js');
const axios = require('axios');
const botMethods = require('./botMethods.js');
let monitor = new botMethods();
require('dotenv').config();

const guildId = ''; // put guild id here
const client = new Discord.Client();

const getApp = (guildId) => {
    const app = client.api.applications(client.user.id);
    if (guildId) {
        app.guilds(guildId);
    }
    return app;
}

client.on('ready', async() => {
    console.log('ready!');

    const commands = await getApp(guildId).commands.get();


    client.ws.on('INTERACTION_CREATE', async interaction => {
        const { name, options } = interaction.data;
        const command = name.toLowerCase();
        const args = {};

        if (options) {
            for (const option of options) {
                const { name, value } = option;
                args[name] = value;
            }
        }

        // if (command === 'ping') {
        //     let embed = new Discord.MessageEmbed()
        //         .setTitle('ping');
        //     reply(interaction, 'he')
        //     edit(interaction, embed2)
        // } else 
        if (command === 'offerid') {
            reply(interaction, '`Processing...`')
            let productObject = await monitor.getOfferID(args.productlink);
            if (productObject) {
                let embed = await createEmbed(productObject)
                edit(interaction, embed)
            } else {
                let embed = {
                    'title': 'An error occured, please try again.',
                    'color': 16734003,
                }
                edit(interaction, embed)
            }
        } else if (command === 'info') {
            reply(interaction, '`Processing...`')
            let productObject = await monitor.getInfoFromOfferId(args.offerid);
            if (productObject) {
                let embed = await createEmbed(productObject)
                edit(interaction, embed)
            } else {
                let embed = {
                    'title': 'An error occured, please try again.',
                    'color': 16734003,
                }
                edit(interaction, embed)
            }
        }
    })
})

const edit = async(interaction, embed) => {
    client.api.webhooks(client.user.id, interaction.token).messages('@original').patch({
        data: {
            content: null,
            embeds: [embed]
        }
    })
}

const createEmbed = async(productObject) => {
    let embed = {
        'title': productObject.productName,
        'url': productObject.link,
        'color': 15258703,
        'thumbnail': {
            'url': productObject.imageLink
        },
        'fields': [{
            'name': 'Offer ID',
            'value': productObject.offerID,
            'inline': true
        }, {
            'name': 'Seller',
            'value': productObject.seller,
            'inline': true
        }, {
            'name': 'Seller ID',
            'value': productObject.sellerID,
            'inline': true
        }, {
            'name': 'Offer Price',
            'value': productObject.price,
            'inline': true
        }]
    }
    return embed;
}

const reply = async(interaction, response) => {
    let data = {
        content: response
    }

    if (typeof response === 'object') {
        data = await createAPIMessage(interaction, response)
    }

    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data,
        }
    })
}

const createAPIMessage = async(interaction, content) => {
    const { data, files } = await Discord.APIMessage.create(
            client.channels.resolve(interaction.channel_id),
            content
        )
        .resolveData()
        .resolveFiles()

    return {...data, files }
}

client.login(process.env.TOKEN)