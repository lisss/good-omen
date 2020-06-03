const getUrl = (term: string, page: number) =>
    'https://api.serpwow.com/live/search?' +
    'api_key=FA2C2241D0A346A28A4A3A6E180C09A4&' +
    `q=${term}&` +
    'google_domain=google.com.ua&' +
    'gl=ua&hl=uk&' +
    'search_type=news&' +
    'sort_by=date&' +
    'time_period=last_month&' +
    'num=100&' +
    `page=${page}&` +
    'output=json';

export const search = (term: string) => {
    const url = getUrl(term, 1);
    const req = new Request(url);

    fetch(req)
        .then((response) => response.json())
        .then(console.log)
        .catch((err) => {
            console.log(err);
        });
};
