const { MessageEmbed } = require('discord.js')
const botMethods = require('../botMethods.js');
let monitor = new botMethods();

module.exports = {
    slash: 'both',
    testOnly: true,
    description: 'Returns the offer id along with other info given a Walmart product link.',
    minArgs: 1,
    expectedArgs: '<productlink>',
    callback: async({ args, text }) => {
        let productObject = await monitor.getOfferID(text);
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