import { NewsResult } from './types';

// possible variants
// 40 хв. тому
// 21 год. тому
// 9 черв. 2020 р.
export const convertDate = (date: string) => {
    const minAgo = date.match(/(\d{1,2})\sхв\. тому/);
    const hrAgo = date.match(/(\d{1,2})\sгод\. тому/);
    const dayAgo = date.match(/(\d{1,2})\sднів? тому/);

    const dateFormatOptions = {
        timeZone: 'Europe/Kiev',
        month: 'short',
        year: 'numeric',
        day: 'numeric',
        era: 'narrow',
    };

    const now = new Date();

    if (minAgo) {
        const minsMatched = Number(minAgo[1]);
        const mins = !isNaN(minsMatched) ? minsMatched : 0;
        now.setMinutes(now.getMinutes() - mins);
        return new Intl.DateTimeFormat('uk', dateFormatOptions).format(now);
    } else if (hrAgo) {
        const hrsMatched = Number(hrAgo[1]);
        const hrs = !isNaN(hrsMatched) ? hrsMatched : 0;
        now.setHours(now.getHours() - hrs);
        return new Intl.DateTimeFormat('uk', dateFormatOptions).format(now);
    } else if (dayAgo) {
        const daysMatched = Number(dayAgo[1]);
        const hrs = !isNaN(daysMatched) ? daysMatched : 0;
        now.setDate(now.getDate() - hrs);
        return new Intl.DateTimeFormat('uk', dateFormatOptions).format(now);
    } else {
        return date.replace('р.', 'н.е.');
    }
};

export const groupByDate = (data: NewsResult[]) => {
    const monthsMap: { [key: string]: string } = {
        'січ.': 'січень',
        'лют.': 'лютий',
        'берез.': 'березень',
        'квіт.': 'квітень',
        'трав.': 'травень',
        'черв.': 'червень',
        'лип.': 'липень',
        'серп.': 'серпень',
        'верес.': 'вересень',
        'жовт.': 'жовтень',
        'листоп.': 'листопад',
        'груд.': 'грудень',
    };

    const grouped: { [key: string]: { [key: string]: NewsResult[] } } = {};
    return data.reduce((prev, curr) => {
        const match = curr.date.match(/([^\u0000-\u007F]+\.)(\s\d{4})/);
        if (match) {
            const month = monthsMap[match[1]];
            const year = match[2].trim();
            if (prev[year]) {
                if (prev[year][month]) {
                    prev[year][month].push(curr);
                    prev[year][month].sort(
                        (a, b) => Number(a.date.split(' ')[0]) - Number(b.date.split(' ')[0])
                    );
                } else {
                    prev[year][month] = [curr];
                }
            } else {
                prev[year] = { [month]: [curr] };
            }

            return prev;
        } else {
            console.error('Oops');
            return {};
        }
    }, grouped);
};
