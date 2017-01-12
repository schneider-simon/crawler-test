const Crawler = require("crawler");
const url = require('url');
const cloneDeep = require('lodash/cloneDeep');

const c = new Crawler({
    maxConnections: 10
});


const STEP_INITIAL = 'STEP_INITIAL'
const STEP_TABLE_OF_CONTENTS = 'STEP_TABLE_OF_CONTENTS'
const STEP_TOPIC = 'STEP_TOPIC'
const STEP_VIDEO = 'STEP_VIDEO'


function PageCrawler(handle) {
    this.handle = handle;
    this.history = [];

    this.queue = (uri, step = STEP_INITIAL, _data = {}) => {
        const data = cloneDeep(_data);
        data.uri = uri;

        if(this.history.indexOf(uri) !== -1){
            return;
        }

        this.history.push(uri);

        if(!data.crawlPath){
            data.crawlPath = [];
        }

        data.crawlPath.push(uri);

        console.log('queue', uri);

        return c.queue([{
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
        console.log({listing});
    }

    this.run = (uri) => {
        return this.queue(uri, STEP_INITIAL, {});
    }
}


const pageCrawler = new PageCrawler(({response, $, step, data, queue, finish}) => {
    switch (step) {
        case STEP_INITIAL:
            $('a[href$="/inhaltsverzeichnis/"]').each((key, element) => {
                const href = url.resolve(data.uri, $(element).attr('href'));
                data.tableOfContents = href;
                queue(href, STEP_TABLE_OF_CONTENTS, data);
            })
            break;
        case STEP_TABLE_OF_CONTENTS:
            $('.pagination:first-of-type a[href*="?page="]').each((key, element) => {
                const href = url.resolve(data.uri, $(element).attr('href'));
                data.tableOfContents = href;
                queue(href, STEP_TABLE_OF_CONTENTS, data);
            })
            break;
        case STEP_TOPIC:
            break;
        case STEP_VIDEO:
            break;
        default:
            console.error(`Unknown step ${ step }.`);
    }
});

pageCrawler.run('https://oberprima.com/nachhilfevideos/');