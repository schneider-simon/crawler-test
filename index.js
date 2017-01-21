const PageCrawler = require('./crawler/PageCrawler')
const url = require('url');

const STEP_INITIAL = 'STEP_INITIAL'
const STEP_TABLE_OF_CONTENTS = 'STEP_TABLE_OF_CONTENTS'
const STEP_TOPIC = 'STEP_TOPIC'
const STEP_VIDEO = 'STEP_VIDEO'

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

            $('a[href*="?p="]').each((key, element) => {
                const href = url.resolve(data.uri, $(element).attr('href'));
                data.pageName = $(element).text();
                data.pageHref = href;

                queue(href, STEP_TOPIC, data);
            });
            break;
        case STEP_TOPIC:
            $('a[href*="?v="]').each((key, element) => {
                const href = url.resolve(data.uri, $(element).attr('href'));

                data.title = $(element).text();
                data.videoUrl = href;

                queue(href, STEP_VIDEO, data);
            });
            break;
        case STEP_VIDEO:
            data.pageHtml = $('.page-text').html();
            data.pageText = $('.page-text').text();

            finish(data);

            break;
        default:
            console.error(`Unknown step ${ step }.`);
    }
});

pageCrawler.run('https://oberprima.com/nachhilfevideos/');
//pageCrawler.run('https://oberprima.com/mathematik/ableitung/?p=1638', STEP_TOPIC);