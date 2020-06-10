// possible variants
// 40 хв. тому
// 21 год. тому
// 9 черв. 2020 р.
export const convertDate = (date: string) => {
    const minAgo = date.match(/(\d{1,2})\sхв\. тому/);
    const hrAgo = date.match(/(\d{1,2})\sгод\. тому/);

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
    } else {
        return date.replace('р.', 'н.е.');
    }
};
