<template>
  <q-layout view="lHh Lpr fff">
    <q-header>
      <q-toolbar class="bg-blue-grey-7">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-icon name="menu"/>
        </q-btn>
        <q-toolbar-title>
          Gekko-M4
        </q-toolbar-title>
        <q-space></q-space>
        <q-tabs shrink stretch>
          <q-route-tab icon="home" default label="Home" to="/" exact></q-route-tab>
          <q-route-tab icon="cast_connected" label="Live Gekkos" to="/live-gekkos" exact>
            <q-badge color="green" floating v-if="stratrunners.length">{{stratrunners.length}}</q-badge>
          </q-route-tab>
          <q-route-tab icon="timeline" label="Debug Strategy" to="/backtest" exact></q-route-tab>
          <q-route-tab icon="storage" label="Data" to="/data" exact></q-route-tab>
          <q-route-tab icon="import_export" label="Importer" to="/data/importer" exact>
            <q-badge color="blue" floating v-if="activeImports > 0">{{activeImports}}</q-badge>
          </q-route-tab>
          <q-route-tab icon="settings" label="Config" to="/config" exact></q-route-tab>
          <q-route-tab icon="help" label="Documentation" to="/help"></q-route-tab>
        </q-tabs>
      </q-toolbar>
      <q-toolbar v-if="currentWatchers.length > 0" class="bg-blue-grey-8">
        <div v-if="currentWatchers.length > 0">
          <div class="text-h6">Prices:</div>
          <div class="text-subtitle">(from Watchers)</div>
        </div>
        <q-space></q-space>
        <div class="q-mx-xs" v-for="(w,idx) in currentWatchers" :key="'prices-' + w.id" v-if="w.events.latest.candle">
          <div class="text-h6">{{w.events.latest.candle.close}}
            <img class="crypto-icon-16"
                 :src="'statics/crypto_icons/color/' + w.config.watch.currency.toLowerCase() + '.svg'"
                 :alt="w.config.watch.currency" :title="w.config.watch.currency">
          </div>
          <div class="text-subtitle">
            <img class="crypto-icon-16 q-icon q-mr-xs"
                 :src="'statics/crypto_icons/color/' + w.config.watch.asset.toLowerCase() + '.svg'"
                 :alt="w.config.watch.asset" :title="w.config.watch.asset">
            {{w.config.watch.exchange}}
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable @click.native="openURL('https://github.com/universalbit-dev/gekko-m4')">
          <q-item-section side>
            <q-icon name="fab fa-github-square"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko-M4</q-item-label>
            <q-item-label caption>github.com/universalbit-dev/gekko-m4</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-item clickable @click.native="openURL('https://github.com/universalbit-dev/gekko-quasar-ui')">
          <q-item-section side>
            <q-icon name="fab fa-github-square"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Gekko-Quasar-UI</q-item-label>
            <q-item-label caption>github.com/universalbit-dev/gekko-quasar-ui</q-item-label>
          </q-item-section>
        </q-item>
        
        <q-separator></q-separator>
        <q-item-label header>UniversalBit Project</q-item-label>

          <q-item clickable @click.native="openURL('https://github.com/universalbit-dev')">
          <q-item-section side>
            <q-icon name="fab fa-github-square"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>UniversalBit-Dev</q-item-label>
            <q-item-label caption>github.com/universalbit-dev</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator></q-separator>

        <q-item-label header>Resources</q-item-label>
        <q-item clickable @click.native="openURL('https://v1.quasar.dev/')">
          <q-item-section side>
            <q-icon name="school"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>Quasar Framework</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer reveal>
      <q-toolbar class="bg-blue-grey-7">
        <div>
          <div class="text-h6">Gekko-UI v {{version.ui}}</div>
          <div class="text-subtitle">Running on Quasar v{{ $q.version }}</div>
        </div>
        <q-space></q-space>
        <div>
          <div class="text-h6"><em>Gekko-M4 is licensed under the MIT License</em></div>
          <div class="text-subtitle" v-if="version.gekko">Gekko v {{version.gekko}}</div>
        </div>
        <q-space></q-space>
        <q-toolbar-title>

        </q-toolbar-title>
    </q-footer>
  </q-layout>
</template>

<script>
  import {openURL} from "quasar";
  import _ from 'lodash'

  const uiPackage = require('../../package.json');

  export default {
    name: "MainLayoutPage",
    data() {
      return {
        leftDrawerOpen: true,
        version: {
          gekko: null,
          ui: uiPackage.version
        }
      };
    },
    created: async function () {
      try {
        let vResp = await this.$axios.get(`${this.$store.state.config.apiBaseUrl}info`);
        if (_.has(vResp.data, 'version')) this.version.gekko = _.get(vResp.data, 'version');
      } catch (ex) {
        console.log("Error while getting gekko's version info.", ex)
      }
    },
    computed: {
      stratrunners() {
        return _.values(this.$store.getters['gekkos/list'])
          .concat(_.values(this.$store.getters['gekkos/archive']))
          .filter(g => {
            if (g.logType === 'papertrader')
              return true;

            if (g.logType === 'tradebot')
              return true;

            return false;
          });
      },
      watchers() {
        return _.values(this.$store.getters['gekkos/list'])
          .concat(_.values(this.$store.getters['gekkos/archive']))
          .filter(g => g.logType === 'watcher')
      },
      activeImports: function () {
        return _.filter(this.$store.state.imports.imports, function (item) {
          return !item.done
        }).length;
      },
      currentWatchers: function () {
        return _.slice(this.watchers, 0, 10);
      }
    },
    methods: {
      openURL
    }
  };
</script>

<style>
</style>
