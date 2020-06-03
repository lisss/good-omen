// import * as rm from 'typed-rest-client/RestClient';

// const makeRequest = async () => {
//     const client = new rm.RestClient(null, 'https://google-search3.p.rapidapi.com/api/v1/');

//     const res = await client.get('search');
//     console.log(res.statusCode);
// };

// req.query({
//     get_total: 'false',
//     country: 'US',
//     language: 'lang_en',
//     max_results: '2',
//     uule: 'w%2BCAIQICIbSG91c3RvbixUZXhhcyxVbml0ZWQgU3RhdGVz',
//     hl: 'us',
//     q: 'site%3A rapidapi.com %22apigeek%22',
// });

// req.headers({
//     'x-rapidapi-host': 'google-search3.p.rapidapi.com',
//     'x-rapidapi-key': 'd91d75e6dfmsha945160721f4570p1e7144jsn7f1ada7e99be',
//     useQueryString: true,
// });

// req.end(function (res) {
//     if (res.error) throw new Error(res.error);

//     console.log(res.body);
// });

export const search = () => {
    fetch(
        'https://google-search3.p.rapidapi.com/api/v1/search?get_total=false&country=US&language=lang_en&max_results=2&uule=w%252BCAIQICIbSG91c3RvbixUZXhhcyxVbml0ZWQgU3RhdGVz&hl=us&q=site%253A%20rapidapi.com%20%2522apigeek%2522',
        {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'google-search3.p.rapidapi.com',
                'x-rapidapi-key': 'd91d75e6dfmsha945160721f4570p1e7144jsn7f1ada7e99be',
                'Access-Control-Allow-Origin': '*',
                Origin: 'https://google.com',
            },
            // mode: 'no-cors',
            // credentials: 'include',
        }
    )
        .then((response) => {
            console.log(response);
        })
        .catch((err) => {
            console.log('Err:', err);
        });
};
