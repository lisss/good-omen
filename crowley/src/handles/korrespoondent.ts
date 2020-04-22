import { Page } from 'puppeteer';
import { utils } from 'apify';
import { Article } from '../../types';

const tt = (t: string) => {
    const aa = 'Сьогодні'.split('');
    t.split('').forEach((x, i) => {
        console.log('##', x);
        console.log('--++++', aa[i]);
        console.log('---', x === aa[i]);
    });
};

const getCurrentDate = (rawDate: string[]) => {
    const [date, time] = rawDate;
    const intl = new Intl.DateTimeFormat('uk');
    // includes() is being used as a hack, node doesn't compare uk string properly for some reason
    if (date.toLowerCase().includes('сьогодні')) {
        const today = intl.format(new Date());
        return `${today}, ${time}`;
    } else if (date.toLowerCase().includes('вчора')) {
        const today = new Date();
        const yesterday = new Date(today);

        yesterday.setDate(yesterday.getDate() - 1);
        const d = intl.format(yesterday);
        return `${d}, ${time}`;
    } else {
        return `${date}, ${time}`;
    }
};

export const korrespondentNetHandle = async (page: Page): Promise<Article> => {
    const url = await page.url();
    const title = await page.$eval(`[class='post-item__title']`, (e) => e.textContent);
    const rawDate = await page.$eval(`[class='post-item__info']`, (e) => {
        const [, day, time] = e.textContent?.split(',')!;
        return [day, time];
    });
    const content = utils.htmlToText(
        await page.$eval(`[class='post-item__text']`, (e) => e.innerHTML)
    );

    const date = getCurrentDate(rawDate);

    return {
        url,
        title,
        date,
        content,
    };
};
