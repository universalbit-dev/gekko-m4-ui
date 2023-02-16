## UPDATE 2023-16-02: UI is now ported to Quasar Framework 1.22.5 ##
Gekko Gordon UI
The MIT License (MIT)
Copyright (c) 2018 Klemens Wittig

*Sidenote: This repository should work with Noejs14.


## Some Features:
- "Tickers" for all running live market-watchers in the top toolbar
- Searchable tables for datasets
- Stop running instances from within the Live-Gekko-Views
- EChart-Candlestick charts for market and backtest-graphs
- some stats for roundtrips
- Material design UI
- Enhanced information for running live-bots (differentiate between live-bot and paper-trader at a glance)
- when present: **render indicator results to market chart**
- download backtest data as excel and csv
- and more...[Quasar Project](https://v1.quasar.dev/)

## Usage

### Dev-Mode
Needed:
  - NodeJS "engines": ^14   (v14.21.2)
    "npm": "^6"             (6.14.17)
  
NodeJs 14:
```
nvm use 14
```
### Compile for replacing gekko ui with your user interface project

```
git clone https://github.com/universalbit-dev/gekko-quasar-ui.git
```

```
npm install -g @quasar/cli

```

```
cd gekko-quasar-ui
```

```
npm install --build-from-source
```

```
quasar build
```
![Alt text](https://github.com/universalbit-dev/gekko-quasar-ui/blob/master/img/quasar_ui_build.png "build")

![Alt text](https://github.com/universalbit-dev/gekko-quasar-ui/blob/master/img/quasar_build_succeded.png "succeded")

---
---

3. In your gekko-folder zip up the folder `web/vue` as backup.
4. Place everything from repo's `dist/spa-mat` into the `web/vue` folder. (index.html must be there)
5. Modify the first line in `web/routes/baseConfig.js` so that it looks like this `var UIconfig = require('../vue/statics/UiConfig');`
6. Modify the first line in `web/server.js` so that it looks like this `const config = require('./vue/statics/UiConfig');`
7. Modify ~line 87 in web -> server.js:
replace

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
7. Start Gekko with UI command (`node gekko --ui`).
8. Enjoy!

***If you changed your default connection or database-settings, please edit the file ***`<gekko-quasar-ui-folder>/src/statics/UiConfig.js`*** accordingly.***

## Guidance on strategy indicator naming conventions

To add flexibility to the way indicators are plotted you can specify on which graph the indicator should be plotted.

This is mainly for indicators that are not designed to have values similar to the coin price. For example SMA, EMA etc. are designed to be plotted against the market, and therefore no specification is needed. However, RSI always operates between 0 and 100 and therefore it would not work to plot this against the market, it needs its own graph.

Under the main market graph, there will be three separate graphs. Each of the three graphs has both a left and right y-axis. Therefore, in total you have six different ranges that you can take advantage of.

### Automatic assignment of indicators

The software will automatically assign indicators to an appropiate axis as long as the indicator is named correctly in the strategy you create. When you initialise an indicator in the strategy, you include a line similar to the following (I will use SMA as an example):

    this.addTalibIndicator('sma', 'sma', params);

The first 'sma'  in the brackets above is used in the graphing. It is important that the naming is the same as the second 'sma' if you wish to use automatic asignment to the correct graph, which in this case would be the market graph.

### Using the same indicator multiple times

In the case that you wish to use an indicator more than once, which is common with indicators like the EMA and SMA, you will need to use the following syntax:

    this.addTalibIndicator('sma__fast', 'sma', params);
    this.addTalibIndicator('sma__slow', 'sma', params);

As you can see the indicator name 'sma' must be used, but you can make the name unique by using a double underscore and adding a unique name after the double underscore. There is no particular requirement for the unique name.

### Specifying which axis to assign the indicator

You may of course want to have complete control over where an indicator gets assigned. In that case you have a couple of options.

#### Change the indicator type

You can change an indicator that is normally plotted on the market graph to be plotted on one of the three graphs below the market, or visa-versa.

To assign an indicator to the market you can use the following syntax:

    this.addTalibIndicator('ovr__rsi', 'rsi', params);

The 'ovr' before the double underscore will assign the indicator as an overlay over the market graph. Please note the part after the double underscore is irrelevant and just to make the name unique, it can be whatever you like.

To assign an indicator to the three charts below the graph, and be assigned to an axis automatically, use the following syntax:

    this.addTalibIndicator('ind__sma', 'sma', params);

### Specify exactly which axis to assign an indicator to

You can gain even more control over the assignment by specifying exactly which of the six y-axis on the graphs below the market you want a particular indicator to be assigned to.

Please note that if you go down this route it is recommended that you specify an axis for all indicators that are not overlayed on the market, otherwise you may end up with the axis scaling being inappropriate due to some indicators being automatically assigned.

To specify an axis you should use the following syntax:

    this.addTalibIndicator('topleft__rsi', 'rsi', params);

The 'topleft' will plot the indicator on the top chart (below the market chart) and on the left axis. You can gain axis to any of the other axis by using one of the following:

1. topleft
2. topright
3. midleft
4. midright
5. botleft
6. botright

## Donations

If you like the ported UI, drop me some coins for coffee ;)

***BTC: 191hR9AftcrGH2Vb29ogPBoUjFowsvAMrk***

## Screenshots

![image1](img/gekko-quasar-1.png?raw=true "Screenshot 1")
![image2](img/gekko-quasar-2.png?raw=true "Screenshot 2")
![image3](img/gekko-quasar-3.png?raw=true "Screenshot 3")
![image4](img/gekko-quasar-4.png?raw=true "Screenshot 4")
![image5](img/gekko-quasar-5.png?raw=true "Screenshot 5")
![image6](img/gekko-quasar-6.png?raw=true "Screenshot 6")
![image7](img/gekko-quasar-7.png?raw=true "Screenshot 7")
![image8](img/gekko-quasar-8.png?raw=true "Screenshot 8")
![image9](img/gekko-quasar-9.png?raw=true "Screenshot 9")

