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

const pageCrawler = new PageCrawler(({response, $, step, data, queue, finish}) => {
    switch (step) {
        case STEP_INITIAL:
            $('a[href$="/inhaltsverzeichnis/"]').forEach((element) => {
                const href = element.href;
                data.tableOfContents = href;
                queue(href, STEP_TABLE_OF_CONTENTS, data);
            })
            break;
        case STEP_TABLE_OF_CONTENTS:
            $('.pagination:first-of-type a[href*="?page="]').forEach((element) => {
                const href = element.href;
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

const PageCrawler = (handle) => {
    this.handle = handle;

    this.queue = (uri, step = STEP_INITIAL, data = {}) => {
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
                    data: cloneDeep(data),
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