var url =
    'http://newsapi.org/v2/everything?' +
    'q=Apple&' +
    'from=2020-06-03&' +
    'sortBy=popularity&' +
    'apiKey=a9ccb217c71745e4a6584a2e0609cfcc';

var req = new Request(url);

fetch(req).then(function (response) {
    console.log(response.json());
});
