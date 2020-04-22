### Documentation reference

-   [Apify SDK](https://sdk.apify.com/)
-   [Apify Actor documentation](https://docs.apify.com/actor)
-   [Apify CLI](https://docs.apify.com/cli)

### Usage

#### Requirements

-   [NodeJS](https://nodejs.org/en/) ^10.17.0 || ^12.3.0 (`Apify` requires such version ranges). You may want to use [nvm](https://github.com/nvm-sh/nvm)
-   [yarn](https://classic.yarnpkg.com/en/)

#### Install dependencies

```
$ yarn
```

#### Run crawler

-   pravda.com.ua

```
yarn scrape:pravda
```

-   rozetka.com.ua

```
yarn scrape:rozetka
```

It will store the data in `./apify_storage/datasets/default` directory
Refer the [source code](./src) for implementation and configuration
