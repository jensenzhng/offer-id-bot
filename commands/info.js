const { MessageEmbed } = require('discord.js')
const botMethods = require('../botMethods.js');
let monitor = new botMethods();

module.exports = {
    slash: 'both',
    testOnly: true,
    description: 'Returns info about a product given the offer ID.',
    minArgs: 1,
    expectedArgs: '<offerid>',
    callback: async({ args, text }) => {
        let productObject = await monitor.getInfoFromOfferId(text);
        let embed = new MessageEmbed()
            .setThumbnail(productObject.imageLink)
            .setColor('GREEN')
            .setTitle(productObject.productName)
            .setURL(productObject.link)
            .addField('Offer ID', productObject.offerID, true)
            .addField('Seller', productObject.seller, true)
            .addField('Seller ID', productObject.sellerID, true)
            .addField('Offer Price', productObject.price, true)
            .setTimestamp();
        return embed;
    }
}