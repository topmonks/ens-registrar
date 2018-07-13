<template>
  <div id="app">
    <md-field class="md-box md-elevation-1">
      <md-input type="text" name="lookupDomain" id="lookupDomain" v-model="lookupDomain" :disabled="looking" @keyup.enter="lookup"/>
    </md-field>

    <div style="min-height: 3em">
      <div v-if="found">
        {{ found }}
      </div>
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import ENS from "ethjs-ens";
import HttpProvider from "ethjs-provider-http";
import EthFilter from "ethjs-filter";

export default {
  name: 'app',
  data() {
    return {
      looking: false,
      lookupDomain: '',
      found: null,
      error: null,
      logs: [],
    };
  },
  methods: {
    lookup() {
      this.looking = true;
      this.$ens.lookup(this.lookupDomain).then(address => {
        this.found = address;
        this.looking = false;
        this.error = null;
      }).catch(reason => {
        this.found = null;
        this.looking = false;
        this.error = reason;
      });
    }
  },
  async created() {
    const registryAddress = "0x6fa62640fb2369b81a84fedd297fa4fd12e3005f";
    // For MetaMask or Mist compatibility:
    // let provider = (typeof window.web3 !== 'undefined') ? web3.currentProvider : new HttpProvider('https://ropsten.infura.io');
    const provider = new HttpProvider("http://127.0.0.1:8545");
    this.$ens = new ENS({ provider, registryAddress });

  },
}
</script>

<style>
#app {
  padding-top: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.md-box {
  padding: 10px;
  width: 80%;
  padding-left: 1em;
  padding-right: 1em;
}
.md-box {
  background-color: white;
  --md-theme-default-primary: transparent;
}
#app div {
  padding-top: 0.5em;
}
.error {
  color: red;
}
</style>
