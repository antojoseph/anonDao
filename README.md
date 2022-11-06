# Mina zkApp: Anaon Dao Voting


## How to setup
```sh
npm install typescript --save-dev
```

```sh
npm install
```

## How to build

```sh
npm run build && node build/src/main.js
```

## Deploy to Berkley testnet

```sh
zk config
zk deploy berkley
npm run build && node build/src/main.js berkley
```

## License

[Apache-2.0](LICENSE)
