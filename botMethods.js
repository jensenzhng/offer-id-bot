const cheerio = require('cheerio');
const axios = require('axios');
let logger = require('./logger.js');

module.exports = class botMethods {
    constructor() {}

    async getOfferID(link) {
        logger.log('GETTING OFFER ID');
        let res = await axios({
            method: 'GET',
            url: link,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'upgrade-insecure-requests': '1'
            }
        }).catch(err => {
            logger.log(err)
        });
        if (res === undefined) {
            logger.log('bruh')
            return undefined;
        }
        let headers = res.headers['set-cookie'];
        const $ = cheerio.load(res.data);
        if ($('script.tb-optimized').get()[0] === undefined) {
            return undefined;
        }
        const parsedRes = JSON.parse($('script.tb-optimized').get()[0].children[0].data).item.product.buyBox.products[0];
        let productObject = {
            "offerID": parsedRes.offerId,
            "seller": parsedRes.sellerDisplayName,
            'sellerID': parsedRes.sellerId,
            'productName': parsedRes.productName,
            'imageLink': parsedRes.idmlSections.interactiveImageUrl,
            'price': await this.fetchPrice(parsedRes.offerId, headers),
            'link': link,
        }
        logger.log('GOT ALL INFO!')
        console.log(productObject);
        return productObject;
    }

    async fetchPrice(offerID, headers) {
        logger.log('GETTING PRICE');

        let res = await axios({
            method: 'GET',
            url: `https://www.walmart.com/reviews/seller/test?offerId=${offerID}`,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'upgrade-insecure-requests': '1',
                'cookie': headers[0],
            }
        });
        let start = res.data.indexOf('window.__WML_REDUX_INITIAL_STATE__ = ');
        const data = JSON.parse(res.data.substring(start + 37, res.data.indexOf('</script>', start + 1) - 1));
        let price = data.itemSummary.offers[offerID].pricesInfo.priceMap.CURRENT.price + " " +
            data.itemSummary.offers[offerID].pricesInfo.priceMap.CURRENT.currencyUnit;
        logger.log(`GOT PRICE: ${price}`);
        return price;
    }

    async fetchHeaders() {
        logger.log('GETTING HEADERS');
        let res = await axios({
            method: 'GET',
            url: 'https://www.walmart.ca/ens',
        });
        console.log(res.headers['set-cookie']);
        logger.log('GOT HEADERS');
        console.log(res.headers['set-cookie'][0]);
        return res.headers['set-cookie'][0];
    }

    async getInfoFromOfferId(offerId) {
        logger.log('GETTING INFO FROM OFFERID');
        let res = await axios({
            method: 'GET',
            url: `https://www.walmart.com/reviews/seller/test?offerId=${offerId}`,
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'upgrade-insecure-requests': '1',
                'cookie': await this.fetchHeaders(),
            }
        });
        let $ = cheerio.load(res.data);
        let start = res.data.indexOf('window.__WML_REDUX_INITIAL_STATE__ = ');
        const parsedRes = JSON.parse(res.data.substring(start + 37, res.data.indexOf('</script>', start + 1) - 1)).itemSummary;
        if (parsedRes.offers[offerId] === undefined) {
            logger.log('bruh');
            return undefined;
        }
        let productObject = {
            "offerID": offerId,
            "seller": parsedRes.sellers[parsedRes.offers[offerId].sellerId].sellerDisplayName,
            'sellerID': parsedRes.offers[offerId].sellerId,
            'productName': parsedRes.products[parsedRes.primaryProduct].productAttributes.productName,
            'imageLink': parsedRes.images[parsedRes.selected.defaultImage].assetSizeUrls.DEFAULT,
            'price': parsedRes.offers[offerId].pricesInfo.priceMap.CURRENT.price + " " +
                parsedRes.offers[offerId].pricesInfo.priceMap.CURRENT.currencyUnit,
            'link': "https://walmart.com" +
                $("a.product-image-container").attr("href"),
        }
        logger.log('GOT ALL INFO!');
        console.log(productObject);
        return productObject;
    }
}