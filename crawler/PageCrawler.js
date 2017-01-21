const Crawler = require("crawler");

const crawler = new Crawler({
    maxConnections: 10
});

const cloneDeep = require('lodash/cloneDeep');

function PageCrawler(handle) {
    this.handle = handle;
    this.history = [];

    this.queue = (uri, step = 'STEP_INITIAL', _data = {}) => {
        const data = cloneDeep(_data);
        data.uri = uri;

        if (this.history.indexOf(uri) !== -1) {
            return;
        }

        this.history.push(uri);

        if (!data.crawlPath) {
            data.crawlPath = [];
        }

        data.crawlPath.push(uri);

        console.log('queue', uri);

        return crawler.queue([{
            uri: uri,
            callback: (error, response, done) => {
                if (error) {
                    console.error(error);
                    done();
                    return;
                }

                this.handle({
                    response,
                    $: response.$,
                    step,
                    data,
                    queue: this.queue,
                    finish: this.finish
                });

                done();
            }
        }]);
    }

    this.finish = (listing) => {
        console.log('Finish listing', listing.videoUrl);
    }

    this.run = (uri, step = 'STEP_INITIAL') => {
        return this.queue(uri, step, {});
    }
}

module.exports = PageCrawler