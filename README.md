Quasar Framework 1.22.6

Some Features:

    "Tickers" for all running live market-watchers in the top toolbar
    Searchable tables for datasets
    Stop running instances from within the Live-Gekko-Views
    Material design UI
    Enhanced information for running live-bots (differentiate between live-bot and paper-trader at a glance)
    when present: render indicator results to market chart
    download backtest data as excel and csv

    NodeJS: v16.19.1 (npm v8.19.3)
##### [Support UniversalBit Project](https://github.com/universalbit-dev/universalbit-dev/tree/main/support)
---
NVM: Node Version Manager #16
```
nvm use 16
```

Compile for replacing gekko ui with your user interface project
```
git clone https://github.com/universalbit-dev/gekko-quasar-ui.git
cd gekko-quasar-ui
```
Quasar Cli @Latest
```
npm install -g @quasar/cli
```
npm (8.19.3)
```
npm i
```
Build Commands
```
quasar build
```

In your gekko-folder zip up the folder web/vue as backup. Place everything from repo's dist/spa-mat into the web/vue folder. (index.html must be there) Modify the first line in web/routes/baseConfig.js so that it looks like this 
```
var UIconfig = require('../vue/statics/UiConfig'); 
```

Modify the first line in web/server.js so that it looks like this const config = require('./vue/statics/UiConfig'); Modify ~line 87 in web -> server.js: replace
```
app
  .use(cors())
  .use(serve(WEBROOT + 'vue/dist'))
  .use(bodyParser())
  .use(require('koa-logger')())
  .use(router.routes())
  .use(router.allowedMethods());
```
with
```
app
  .use(cors())
  .use(serve(WEBROOT + 'vue'))
  .use(bodyParser())
  .use(require('koa-logger')())
  .use(router.routes())
  .use(router.allowedMethods());
```
[Static IP](https://github.com/universalbit-dev/gekko-m4/blob/master/docs/ip.md)


