import Apify from 'apify';
import { korrespondentNetHandle } from '../handles/korrespoondent';
import { failedRequestHandler } from './common';

const baseUrl = 'https://ua.korrespondent.net';
const pseudoUrls = [new Apify.PseudoUrl(`${baseUrl}/[.*]`)];

Apify.main(async () => {
    const { log } = Apify.utils;
    log.setLevel(log.LEVELS.DEBUG);

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: baseUrl });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction: async ({ page }) => {
            try {
                const { url, date, title, content, tags } = await korrespondentNetHandle(page);
                await Apify.pushData({
                    url,
                    date,
                    title,
                    content,
                    tags,
                });
            } catch {
                log.error(`No news article on page '${await page.title()}'`);
            }

            await Apify.utils.enqueueLinks({
                page,
                selector: '.article__title a, .post-item__related__item a',
                pseudoUrls,
                requestQueue,
            });
        },
        handleFailedRequestFunction: failedRequestHandler,
        maxRequestRetries: 2,
        maxRequestsPerCrawl: 30000,
        maxConcurrency: 50,
    });

    await crawler.run();
});
