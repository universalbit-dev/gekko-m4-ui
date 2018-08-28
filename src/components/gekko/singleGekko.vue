<template>
  <q-page padding>
    <div v-if="!data">
      <h2 class="text-negative">ERROR: Unknown Gekko instance</h2>
      <p>Gekko doesn't know what watcher this is!</p>
    </div>
    <template v-if="data">
      <q-alert v-if="isArchived" class="q-pb-sm" type="warning" icon="warning">
        This is an archived Gekko. It's currently not running anymore.
      </q-alert>
      <q-alert v-if="data.errorMessage" class="q-pb-sm" type="negative" icon="error">
        <p>This Gekko crashed with the following error-message: <br> <br>{{ data.errorMessage }}</p>
      </q-alert>
      <h3>Gekko {{type.toUpperCase()}}</h3>
      <div class="row">
        <div class="col-2">
          <strong>Exchange:</strong>
        </div>
        <div class="col-10">{{data.config.watch.exchange}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>Currency</strong>
        </div>
        <div class="col-10">{{data.config.watch.currency}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>Asset:</strong>
        </div>
        <div class="col-10">{{data.config.watch.asset}}</div>
      </div>
      <div class="row">
        <div class="col-2">
          <strong>Type:</strong>
        </div>
        <div class="col-10"><em>{{type}}</em></div>
      </div>

      <h3>Runtime</h3>
      <div class="row" v-if="isLoading">
        <div class="col-2 text-center">
          <q-spinner-bars size="36" color="tertiary"/>
        </div>
      </div>
      <div class="row" v-if="!isLoading && initialEvents.candle">
        <div class="col-2">
          <strong>Watching since:</strong>
        </div>
        <div class="col-10">{{fmt(initialEvents.candle.start)}}</div>
      </div>
      <div class="row" v-if="!isLoading && latestEvents.candle">
        <div class="col-2">
          <strong>Received data until:</strong>
        </div>
        <div class="col-10">{{fmt(latestEvents.candle.start)}}</div>
      </div>
      <div class="row" v-if="!isLoading && data.events.initial.candle">
        <div class="col-2">
          <strong>Data spanning:</strong>
        </div>
        <div class="col-10">{{dataSpanning}}</div>
      </div>

      <template v-if="isStratrunner">
        <div class="row" v-if="!isLoading && trades.length">
          <div class="col-2">
            <strong>Amount of trades:</strong>
          </div>
          <div class="col-10">{{trades.length}}</div>
        </div>
        <div class="row" v-if="!isLoading && config.tradingAdvisor">
          <div class="col-2">
            <strong>Candle size:</strong>
          </div>
          <div class="col-10">{{config.tradingAdvisor.candleSize || 'n/a'}}</div>
        </div>
        <div class="row" v-if="!isLoading && config.tradingAdvisor">
          <div class="col-2">
            <strong>History size:</strong>
          </div>
          <div class="col-10">{{config.tradingAdvisor.historySize || 'n/a'}}</div>
        </div>
      </template>
      <q-alert v-if="warmupRemaining" class="q-pa-md" type="warning" icon="warning">
        <p>This stratrunner is still warming up for the next <br>
          {{ warmupRemaining.replace(',', ' and ') }} <br>
          , it will not trade until it is warmed up.</p>
      </q-alert>

      <template v-if="isStratrunner">
        <h3>Strategy</h3>
        <div class="row">
          <div class="col-2">
            <strong>Name:</strong>
          </div>
          <div class="col-10">{{ stratName }}</div>
        </div>
        <div class="row">
          <div class="col-2">
            <strong>Parameters:</strong>
          </div>
          <div class="col-10">
            <pre>{{ stratParams }}</pre>
          </div>
        </div>
      </template>

      <template v-if="isStratrunner">
        <h3>Profit report</h3>
        <div class="row">
          <div class="col-12">
            <p>
              <em v-if="isArchived && !report">
                This Gekko never executed a trade.
              </em>
              <em v-if="!isArchived && !report">
                Waiting for at least one trade.
              </em>
            </p>
          </div>
        </div>
        <template v-if="report">
          <div class="row">
            <div class="col-2">
              <strong>Start balance:</strong>
            </div>
            <div class="col-10"> {{ round(report.startBalance) }}</div>
          </div>
          <div class="row">
            <div class="col-2">
              <strong>Current balance:</strong>
            </div>
            <div class="col-10"> {{ round(report.balance) }}</div>
          </div>
          <div class="row">
            <div class="col-2">
              <strong>Market:</strong>
            </div>
            <div class="col-10"> {{ round(report.market / 100 * report.startPrice) }} {{ config.watch.currency }}
              ({{ round(report.market) }} %)
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              <strong>Profit:</strong>
            </div>
            <div class="col-10"> {{ round(report.profit) }} {{ config.watch.currency }}
              ({{ round(report.relativeProfit) }} %)
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              <strong>Alpha:</strong>
            </div>
            <div class="col-10"> {{ round(report.alpha) }} {{ config.watch.currency }}</div>
          </div>
        </template>
      </template>

      <q-alert v-if="isStratrunner && !watcher && !isArchived" class="q-pa-md" type="warning" icon="warning">
        <p>WARNING: stale Gekko, not attached to a watcher, please report an
          <a href="https://github.com/askmike/gekko/issues">issue</a> here.</p>
      </q-alert>

      <div class="row">
        <div class="col-12 text-center">
          <q-btn
            color="orange"
            icon="stop"
            @click.native="stopGekko"
            label="Stop Gekko"
            :disabled="isArchived"
          />
          <q-btn
            color="negative"
            icon="delete"
            @click.native="deleteGekko"
            label="Delete Gekko"
            :disabled="!isArchived"
          />
          <p v-if="isStratrunner && watcher && !isArchived" class="q-pa-md"><em>This Gekko gets market data from
            <router-link :to="'/live-gekkos/' + watcher.id">this</router-link>
            market watcher.</em></p>
        </div>

      </div>

      <div class="row" v-if="!isLoading">
        <div class="col-12">
          <q-spinner-bars v-if="candleFetch === 'fetching'" color="tertiary" size="48"/>
          <echart v-if="candleFetch === 'fetched'" :candles="candles" :trades="trades" height="500"/>
        </div>
      </div>
      <div v-if="isStratrunner" class="row">
        <roundtrips class="col-12" :roundtrips="roundtrips"/>
      </div>
    </template>

  </q-page>
</template>

<script>
  import Vue from 'vue';
  import moment from "moment";
  import humanizeDuration from "humanize-duration";

  import _ from "lodash";

  import echart from '../global/chart'
  import roundtrips from '../backtester/result/roundtripTable'

  export default {
    created: function () {
      if (!this.isLoading) {
        this.getCandles();
      }
    },
    components: {
      echart,
      roundtrips
    },
    data: () => {
      return {
        candleFetch: "idle",
        candles: [],
      };
    },
    computed: {
      id() {
        return this.$route.params.id;
      },
      gekkos() {
        return this.$store.getters['gekkos/list'];
      },
      archivedGekkos() {
        return this.$store.getters['gekkos/archive'];
      },
      watchers() {
        return _.values(this.$store.getters['gekkos/list'])
          .concat(_.values(this.$store.getters['gekkos/archive']))
          .filter(g => g.logType === 'watcher')
      },
      data: function () {
        if (!this.gekkos)
          return false;
        if (_.has(this.gekkos, this.id))
          return this.gekkos[this.id];
        if (_.has(this.archivedGekkos, this.id))
          return this.archivedGekkos[this.id];

        return false;
      },
      config: function () {
        return _.get(this, 'data.config');
      },
      latestEvents: function () {
        return _.get(this, 'data.events.latest');
      },
      initialEvents: function () {
        return _.get(this, 'data.events.initial');
      },
      trades: function () {
        return _.get(this, 'data.events.tradeCompleted') || [];
      },
      roundtrips: function () {
        return _.get(this, 'data.events.roundtrip') || [];
      },
      isLive: function () {
        return _.has(this.gekkos, this.id);
      },
      type: function () {
        return this.data.logType;
      },
      isStratrunner: function () {
        return this.type !== 'watcher';
      },
      isArchived: function () {
        return this.data.stopped;
      },
      warmupRemaining: function () {
        if (!this.isStratrunner) {
          return false;
        }

        if (this.isArchived) {
          return false;
        }

        if (this.initialEvents.stratWarmupCompleted) {
          return false;
        }

        if (!this.initialEvents.candle) {
          return false;
        }

        const historySize = _.get(this.config, 'tradingAdvisor.historySize');

        if (!historySize) {
          return false;
        }

        const warmupTime = _.get(this.config, 'tradingAdvisor.candleSize') * historySize;

        return humanizeDuration(
          moment(this.initialEvents.candle.start).add(warmupTime, 'm').diff(moment()),
          {largest: 2}
        );
      },
      report: function () {
        return _.get(this.latestEvents, 'performanceReport');
      },
      stratName: function () {
        if (this.data)
          return this.data.config.tradingAdvisor.method;
      },
      stratParams: function () {
        if (!this.data)
          return 'Loading...';

        let stratParams = Vue.util.extend({}, this.data.config[this.stratName]);
        delete stratParams.__empty;

        if (_.isEmpty(stratParams))
          return 'No parameters'

        return JSON.stringify(stratParams, null, 4);
      },
      isLoading: function () {
        if (!this.data)
          return true;
        if (!_.get(this.data, 'events.initial.candle'))
          return true;
        if (!_.get(this.data, 'events.latest.candle'))
          return true;

        return false;
      },
      watcher: function () {
        if (!this.isStratrunner) {
          return false;
        }

        let watch = Vue.util.extend({}, this.data.config.watch);
        return _.find(this.gekkos, g => {
          if (g.id === this.id)
            return false;

          return _.isEqual(watch, g.config.watch);
        });
      },
      hasLeechers: function () {
        if (this.isStratrunner) {
          return false;
        }

        let watch = Vue.util.extend({}, this.data.config.watch);

        return _.find(this.gekkos, g => {
          if (g.id === this.id)
            return false;

          return _.isEqual(watch, g.config.watch);
        });
      },
      dataSpanning: function () {
        return humanizeDuration(moment(this.latestEvents.candle.start).diff(moment(this.initialEvents.candle.start))) || ''
      }
    },
    watch: {
      'data.events.latest.candle.start': function () {
        this.getCandles()
      },
      data: function (val, prev) {
        let complete = val && val.events.initial.candle && val.events.latest.candle;

        if (!complete) return;

        if (this.candleFetch !== 'fetched') this.getCandles();
      }
    },
    methods: {
      humanizeDuration: n => humanizeDuration(n),
      moment: mom => moment.utc(mom),
      fmt: mom => moment.utc(mom).format("YYYY-MM-DD HH:mm"),
      getCandles: async function () {
        if (this.isLoading) {
          return;
        }

        if (this.candleFetch === 'fetching') {
          return;
        }

        this.candleFetch = 'fetching';

        let to = this.data.events.latest.candle.start;
        let from = this.data.events.initial.candle.start;
        let candleSize = 1;

        if (this.type !== 'watcher') {
          candleSize = this.data.config.tradingAdvisor.candleSize;
        }

        let config = {
          watch: this.data.config.watch,
          daterange: {
            to, from
          },
          candleSize
        };

        // We timeout because of 2 reasons:
        // - In case we get a batch of candles we only fetch once
        // - This way we give the db (mostly sqlite) some time to write
        //   the result before we query it.
        try {
          let resp = await this.$axios
            .post(`${this.$store.state.config.apiBaseUrl}getCandles`, config);
          this.candleFetch = 'fetched';
          if (!_.isArray(resp.data)) return console.log("No data retrieved!");
          this.candles = resp.data.map(c => {
            c.start = moment.unix(c.start).utc().format();
            return c;
          });
        }
        catch (ex) {
          console.log("Error on getting candle Data", ex);
          return;
        }

      },
      stopGekko() {
        if (this.hasLeechers) {
          return this.$q.dialog({
            title: 'Dependant Gekkos found',
            message: 'This Gekko is fetching market data für multiple stratrunners. Stop these first!',
            type: 'warning'
          })
        }

        this.$q.dialog({
          title: 'Stop Gekko',
          message: 'Are you sure you wand to stop this Gekko?',
          ok: 'Yes',
          cancel: 'No'
        }).then(async () => {
          try {
            let stopRes = await this.$axios.post(`${this.$store.state.config.apiBaseUrl}stopGekko`, {id: this.data.id})
            this.$q.notify('Gekko has been stopped.')
          }
          catch (ex) {
            this.$q.notify('Error - could not stop Gekko.');
            console.log("Error stopping gekko", ex);
          }
        }).catch(() => {
          return;
        })
      },
      deleteGekko() {
        if (!this.isArchived) {
          return this.$q.dialog({
            title: 'Still running!',
            message: 'This Gekko is still running. Stop it first!',
            type: 'warning'
          })
        }

        this.$q.dialog({
          title: 'Delete Gekko',
          message: 'Are you sure you wand to delete this Gekko?',
          ok: 'Yes',
          cancel: 'No'
        }).then(async () => {
          try {
            let deleteRes = await this.$axios.post(`${this.$store.state.config.apiBaseUrl}deleteGekko`, {id: this.data.id})
            this.$q.notify('Gekko has been deleted. Redirecting...')
            this.$router.push({path: '/live-gekkos/'});
          }
          catch (ex) {
            this.$q.notify('Error - could not delete Gekko.');
            console.log("Error deleteing gekko", ex);
          }
        }).catch(() => {
          return;
        })
      }
    }
  };
</script>