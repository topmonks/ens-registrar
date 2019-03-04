import React, { Component } from 'react';
import './App.css';
import xMark from './images/x-mark.png';
import metamask from './images/download-metamask-dark.png';
import logoFF from './images/browser-ff.png';
import logoChrome from './images/browser-chrome.png';

import FlashMessage from './flash-message';
import Ens from './lib/ens.js';
import copyToClipboard from './lib/copy.js';
import parseTransactionFromError from './lib/parseError';
import TopmonksRegistrar from './lib/TopmonksRegistrar.js';
import config from './lib/config.js';
import 'font-awesome/css/font-awesome.min.css';

import { hash as namehash } from "eth-ens-namehash";

const log = (toLog) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(toLog);
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unsupportedBrowser: false,
      ethereumEnabled: false,
      minimumLength: 1,
      networkType: null,

      isValid: false,
      message: null, // object
      subdomain: '',
      ethCallInProgress: false,
      ethCallSuccess: false,
      ethCallFinished: false,
      accounts: [],
      selectedAccount: '',

      availability: {
        availabilityChecked: false,
        isCheckingAvailability: false,
        isAvailable: false,
        availabilityCheckFailed: false,
        getEnsOwnerFailed: false
      }
    };

    // web3.eth.net.getId() returns "numeric id" of network
    // while web3.eth.net.getNetwork() returns "name", such as "main" or "ropsten"
    config.web3.eth.net.getId().then(networkId => {
      console.log("network id is:", networkId);

      // TopMonksRegistrar by se mozna mel prejmenovat proste na Registrar. Pokud chceme, aby se to dalo
      // vyuzit i na jine domeny nez topmonks.eth
      try {
        const topmonksRegistrar = new TopmonksRegistrar(config, networkId);
        const ens = new Ens(config, networkId);

        this.contracts = {
          ens,
          topmonksRegistrar
        };
      }
      catch (ex) {
        alert("TopMonks Registrar is not deployed to network: " + networkId);
      }
    });
  }

  contracts = {
    ens: null,
    topmonksRegistrar: null
  }

  componentDidMount = () => {
    // using the new API of MetaMask which protects user's privacy
    // by explicitly calling enable()
    // see https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    if (window.ethereum) {

      // Detect to which eth network we are currently connected
      config.web3.eth.net
        .getNetworkType()
        .then(network => {
          this.setState({ networkType: network });
        });

      // namespace window.ethereum exists but is not yet enabled
      this.setState({
        ethereumEnabled: false
      });

      window.ethereum.enable().then(accounts => {
        config.web3.defaultAccount = accounts[0];
        this.setState({
          accounts,
          selectedAccount: accounts[0],
          ethereumEnabled: true
        });

        // Check who is the owner
        // for some stupid reason the async/await seems not be supported
        // and on Ganache v6.1.8 the owner seems to be always 0x000...000
        var ethOwner, topmonksOwner
        this.contracts.ens.contract.methods.owner(namehash("eth")).call().then(v => {
          ethOwner = v;
          console.log('ethOwner', ethOwner);
        }).catch(err => {
          console.error('Getting owner of domain eth failed', err);
          this._setAvailabilityState({
            getEnsOwnerFailed: true
          });
        });
        this.contracts.ens.contract.methods.owner(namehash("topmonks.eth")).call().then(v => {
          topmonksOwner = v;
          console.log('topmonksOwner', topmonksOwner);
        }).catch(err => {
          console.error('Getting owner of domain topmonks.eth failed', err);
        });
      });
    } else {
      this.setState({ unsupportedBrowser: true });
    }
  }

  registerSubdomain = async (event) => {
    event.preventDefault();
    event.persist();

    if (this.checkValidity(this.state.subdomain) === false) {
      console.log('domain name is not valid');
      return;
    }

    let domain = `${this.state.subdomain}.topmonks.eth`;
    this.setState({
      ethCallInProgress: true,
      ethCallFinished: false,
      message: {
        text: `Registering domain ${domain}. This may take some time, please be patient.`,
        type: 'warning',
        txLink: null,
      }
    });

    const isAvailable = await this.checkAvailability();

    if (!isAvailable) {
      // domain is not available.
      // message is already displayed by checkAvailability() method
      event.target.reset();
      return;
    }

    try {
      const receipt = await this.contracts.topmonksRegistrar.register(this.state.subdomain, this.state.selectedAccount);
      this.setState({
        ethCallInProgress: false,
        ethCallFinished: true,
        ethCallSuccess: true,
        message: {
          text: `Domain ${domain} has been successfully associated with your address. ${receipt.transactionHash}`,
          type: 'success',
          txLink: null,
        }
      });
      event.target.reset();
    } catch (error) {
      // oh boy, the error contains stringified tx receipt, prepended with some error message
      // I need to parse the object from it, to get the transactionHash
      log(error);

      let txLink;

      // If the error message contained transaction receipt
      // then try to parse it and show link to etherscan.io
      const txObj = parseTransactionFromError(error);

      if (txObj) {
        const tx = txObj.transactionHash;
        const etherscanLink = this.state.networkType === 'main'
          ? 'https://etherscan.io/'
          : `https://${this.state.networkType}.etherscan.io/`;
        txLink = `${etherscanLink}tx/${tx}`;
      }

      this.setState({
        ethCallInProgress: false,
        ethCallFinished: true,
        message: {
          text: `We are sorry, the registration of your domain failed. Try to check your MetaMask.`,
          type: 'danger',
          txLink,
        }
      });

      // Check availability again. Has the domain been taken by someone else in the meantime?
      this.checkAvailability();
    }
  }

  setAccount = (event) => {
    this.setState({ selectedAccount: event.target.value });
  }

  checkAvailability = async () => {
    let domain = `${this.state.subdomain}.topmonks.eth`;
    let state = {
      isCheckingAvailability: true,
      availabilityChecked: false,
      availabilityCheckFailed: false
    };
    this._setAvailabilityState(state);

    // handle error
    const isAvailable = await this.contracts.ens.isFree(domain).catch((err) => {
      console.error('Checking domain availability failed with err:', err);
      state = {
        isCheckingAvailability: false,
        availabilityCheckFailed: true
      }
      this._setAvailabilityState(state);
    });

    state = {
      isAvailable,
      isCheckingAvailability: false,
      availabilityChecked: true
    }
    this._setAvailabilityState(state);

    return isAvailable;
  }

  _setAvailabilityState = (newState) => {
    const oldState = this.state.availability;
    const targetState = Object.assign({}, oldState, newState);
    this.setState({ availability: targetState });
  }

  copyAccountAddress = () => {
    copyToClipboard(this.state.selectedAccount);
  }

  checkValidity = (subdomain) => {
    const isValid = !!subdomain && subdomain.trim().length >= this.state.minimumLength;
    this.setState({ isValid });
    return isValid;
  }

  resetForm = () => {
    this.setState({
      subdomain: '',
      availability: {
        availabilityChecked: false
      },
      message: null,
      ethCallInProgress: false,
      ethCallFinished: false,
      ethCallSuccess: false,
    });
  }

  handleChange = (event) => {
    this.setState({
      subdomain: event.target.value,
      // todo: Need to test this, it might reset the whole state sub object
      availability: {
        availabilityChecked: false
      },
      ethCallFinished: false,
      ethCallSuccess: false,
    });
    this.checkValidity(event.target.value);
  }

  render() {
    let disabled = this.state.ethCallInProgress === true || this.state.ethCallSuccess;

    const callSuccess = this.state.ethCallFinished && this.state.ethCallSuccess
    const callInProgress = this.state.ethCallInProgress

    return (
      <div className="container">
        <div className="logo-wrapper">
          <svg className='logo' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 500'>
            <circle cx='360.568' cy='80.675' r='5.555' />
            <circle cx='362.045' cy='64.723' r='5.555' />
            <path d='M390.094,131c-10.079,4-20.025,4-29.714,0C360.38,146,390.094,146,390.094,131z'
            />
            <path d='M339.968,131c-9.688,4-19.635,4-29.714,0C310.254,146,339.968,146,339.968,131z'
            />
            <path d='M350.303,336c16.02,0,13.733,4.057,41.293,9.913c76.48,14.469,103.932-65.401,77.467-97.012 c-5.772-6.894-11.678-10.951-17.443-13.073c-0.475-3.76-4.796-35.565-16.835-50.931c-15.628-15.66-29.374-19.7-30.268-19.952 c2.412-4.831,4.636-8.943,5.836-11.48c10.231,0.218,29.575-26.368,5.278-45.93c0-60.128-49.307-74.41-65.844-74.458 c-16.02,0.048-65.633,14.333-65.633,74.461c-24.297,19.563-4.783,46.153,5.448,45.935c1.2,2.537,3.444,6.657,5.856,11.488 c-0.894,0.252-14.63,4.308-30.258,19.968c-12.039,15.366-16.356,47.203-16.83,50.963c-5.765,2.121-11.668,6.242-17.44,13.137 c-26.465,31.611,1.035,111.353,77.515,96.884c27.561-5.857,25.15-9.913,41.342-9.913H350.303z M422.663,191.82 c7.218,9.8,11.528,25.712,13.174,42.788c-1.061,0.201-2.09,0.453-3.116,0.752c-3.725-3.132-11.427-9.133-17.633-10.792 c4.071-7.287,5.323-11.906,5.323-11.906c-2.154,4.045-4.531,7.892-7.085,11.553c-0.027-0.003-0.054-0.009-0.08-0.012 c-8.613-1.034-23.456,6.39-27.384,17.053c-1.342,3.643-1.223,7.713-0.224,11.823c-29.836,23.451-64.013,33.25-71.421,35.18 c-4.704-4.209-7.863-8.468-10.536-12.915c85.164-21.508,105.486-76.45,109.378-90.644 C416.213,186.558,419.511,188.894,422.663,191.82z M423.762,239.314c-6.079,3.605-10.947,8.457-13.868,12.536 c-3.454,4.823-6.177,7.571-9.216,12.039c-3.2-3.934-8.536-11.39-6.545-18.671c1.942-7.104,11.278-13.146,17.225-12.919 C416.38,232.492,421.061,236.506,423.762,239.314z M298.283,265.44c-2.253-4.269-4.728-8.766-8.182-13.59 c-2.921-4.079-7.789-8.931-13.868-12.536c2.701-2.809,7.382-6.823,12.404-7.015c5.947-0.228,15.283,5.815,17.225,12.919 C307.853,252.5,301.483,261.506,298.283,265.44z M292.482,143.067c-9.416-3.432-14.321-17.719-2.179-27.708 c3.862,2.534,7.171,7.158,7.171,7.158c-6.976-36.819,13.554-74.957,52.524-74.988c38.97,0.031,59.5,38.169,52.524,74.988 c0,0,3.309-4.624,7.171-7.158c12.142,9.989,7.238,24.276-2.179,27.708c-2.525-2.153-3.895-3.456-5.905-6.122 c-2.796,22.153-18.168,55.15-51.611,55.182c-33.443-0.031-48.815-33.029-51.611-55.182 C296.377,139.611,295.007,140.914,292.482,143.067z M277.268,191.82c11.039-10.249,23.748-13.285,25.807-13.721 c9.24,13.375,23.975,26.642,46.712,26.679c23.254-0.037,37.683-13.304,46.923-26.679c1.1,0.233,5.288,1.21,10.633,3.635 c-19.605,56.6-76.434,74.87-96.201,79.791c3.151-7.066,5.042-14.693,2.989-20.268c-2.047-5.557-7.062-10.231-12.613-13.29 c-0.076-3.106-0.038-12.408,2.794-18.922c-5.889,6.478-8.752,12.444-9.891,15.979c-2.779-0.782-5.44-1.089-7.678-0.821 c-6.439,0.773-15.379,7.706-19.483,11.157c-1.026-0.299-2.071-0.552-3.132-0.752C265.772,217.532,270.049,201.62,277.268,191.82 z M406.566,331.849c-29.18,0-36.109-11.849-56.262-11.849h-0.517c-20.412,0-27.13,11.849-56.31,11.849 c-51.311-0.285-72.33-54.485-47.042-77.624c12.919-10.335,29.197-4.029,39.015,11.215c9.818,15.244,24.546,40.187,56.068,38.723 c-8.226-3.435-14.604-6.765-19.685-10.113c29.596-10.702,50.532-23.826,65.255-36.402c1.978,5.13,5.005,10.102,7.946,14.136 c-5.802,8.395-12.52,12.188-30.435,20.628c24.804-2.067,33.762-10.334,48.406-26.87c12.022-13.575,27.659-21.654,40.578-11.319 C478.872,277.363,457.877,331.564,406.566,331.849z'
            />
            <circle cx='337.95' cy='64.723' r='5.555' />
            <circle cx='340.952' cy='97.14' r='5.555' />
            <circle cx='359.043' cy='97.14' r='5.555' />
            <circle cx='339.427' cy='80.675' r='5.555' />
            <g>
              <path d='M88.449,403.818v61.388H70.844v-61.388H54.268v-14.862h50.757v14.862H88.449z'
              />
              <path d='M175.375,398.33c7.202,6.974,11.889,17.034,11.889,28.808c0,10.175-3.659,20.578-11.889,28.58 c-7.088,6.859-16.691,11.203-29.494,11.203c-14.29,0-24.006-5.716-29.723-11.203c-7.316-6.859-11.889-17.147-11.889-28.351 c0-10.975,4.915-22.064,11.774-28.923c5.145-5.144,14.633-11.203,29.837-11.203C157.77,387.241,167.715,390.9,175.375,398.33z M129.076,409.99c-3.315,3.201-6.744,8.803-6.744,17.262c0,6.974,2.287,12.575,6.974,17.147 c4.915,4.687,10.402,6.288,16.347,6.288c7.774,0,13.261-2.859,16.918-6.516c2.972-2.858,6.631-8.231,6.631-17.034 c0-7.887-3.201-13.718-6.631-17.147c-3.772-3.658-9.831-6.516-16.805-6.516C139.136,403.474,133.192,405.875,129.076,409.99z'
              />
              <path d='M222.906,388.956c6.631,0,13.947,0.915,20.006,6.288c6.516,5.715,7.43,13.261,7.43,18.519 c0,9.602-3.658,14.975-6.515,17.948c-6.059,6.173-14.062,6.744-19.434,6.744h-10.746v26.75h-17.605v-76.25H222.906z M213.646,424.052h6.287c2.401,0,6.631-0.115,9.488-2.859c1.6-1.6,2.858-4.23,2.858-7.544c0-3.201-1.143-5.831-2.858-7.431 c-2.629-2.515-6.402-2.858-9.831-2.858h-5.944V424.052z'
              />
              <path d='M250.374,465.206l12.231-76.25h14.633l18.977,45.613l18.977-45.613h14.633l12.232,76.25h-17.605 l-6.059-45.498l-19.091,45.498h-6.173l-19.091-45.498l-6.059,45.498H250.374z'
              />
              <path d='M416.806,398.33c7.202,6.974,11.889,17.034,11.889,28.808c0,10.175-3.658,20.578-11.889,28.58 c-7.088,6.859-16.691,11.203-29.494,11.203c-14.29,0-24.006-5.716-29.723-11.203c-7.316-6.859-11.889-17.147-11.889-28.351 c0-10.975,4.915-22.064,11.774-28.923c5.145-5.144,14.633-11.203,29.837-11.203C399.201,387.241,409.146,390.9,416.806,398.33z M370.507,409.99c-3.315,3.201-6.744,8.803-6.744,17.262c0,6.974,2.287,12.575,6.974,17.147 c4.915,4.687,10.403,6.288,16.347,6.288c7.774,0,13.261-2.859,16.918-6.516c2.972-2.858,6.631-8.231,6.631-17.034 c0-7.887-3.201-13.718-6.631-17.147c-3.772-3.658-9.831-6.516-16.805-6.516C380.567,403.474,374.623,405.875,370.507,409.99z'
              />
              <path d='M437.472,465.206v-76.25h15.318l41.383,49.157v-49.157h17.605v76.25H496.46l-41.383-49.385v49.385 H437.472z'
              />
              <path d='M542.264,420.736l26.064-31.78h21.492l-30.865,36.124l33.267,40.126h-22.635l-27.321-33.838 v33.838H524.66v-76.25h17.605V420.736z'
              />
              <path d='M634.871,407.59c-5.715-5.144-10.631-5.487-12.803-5.487c-2.4,0-5.373,0.343-7.431,2.629 c-1.143,1.143-1.943,2.858-1.943,4.801c0,1.829,0.571,3.201,1.715,4.231c1.829,1.715,4.458,2.4,9.602,4.343l5.716,2.172 c3.315,1.257,7.431,2.972,10.403,5.831c4.459,4.23,5.602,9.717,5.602,14.175c0,7.888-2.744,14.747-6.744,18.862 c-6.745,7.088-16.577,7.774-21.606,7.774c-5.487,0-10.288-0.8-15.09-3.201c-3.887-1.943-8.346-5.487-11.203-8.345l9.146-12.575 c1.943,1.944,5.03,4.572,7.087,5.831c2.972,1.828,6.059,2.743,9.603,2.743c2.287,0,5.487-0.457,8.002-2.629 c1.487-1.257,2.744-3.315,2.744-6.173c0-2.516-1.029-4.116-2.629-5.488c-2.057-1.715-6.744-3.429-8.916-4.23l-6.288-2.172 c-3.543-1.257-7.659-2.858-10.631-6.059c-4.001-4.23-4.572-9.602-4.572-13.261c0-6.744,2.057-12.461,6.63-17.147 c5.373-5.487,11.775-6.974,18.863-6.974c5.258,0,13.718,0.915,22.634,7.545L634.871,407.59z'
              />
            </g>
          </svg>
          <h1>ENS Registrar</h1>
        </div>

        <div className="offset-lg-2 col-lg-8">
          <div className="jumbotron position-relative">
            {this.state.ethereumEnabled === false ? (<div className='opaque-overlay'>Please, log in to your Metamask account.</div>) : ''}

            {this.state.unsupportedBrowser === true
              ? (
                <div className="ui message">
                  <div className="header">
                    Ethereum wallet required
                  </div>
                  <p>
                    Please install <strong>MetaMask extension</strong> to enable reading data from ETH Blockchain.
                  </p>
                  <hr />
                  <div className="metamask-install-wrapper">
                    <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en"
                      target="_BLANK" rel="noopener noreferrer">
                      <div className="position-relative">
                        <img className="metamask" src={metamask} alt="Metamask logo" />
                        <img className="browser-logo" src={logoChrome} alt="Chrome logo" />
                      </div>
                      <div>Install for Chrome.</div>
                    </a>
                    <a href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
                      target="_BLANK" rel="noopener noreferrer">
                      <div className="position-relative">
                        <img className="metamask" src={metamask} alt="Metamask logo" />
                        <img className="browser-logo" src={logoFF} alt="Firefox logo" />
                      </div>
                      <div>Install for Firefox.</div>
                    </a>
                  </div>
                </div>
              )
              : (
                <div className={this.state.ethereumEnabled === false ? "blur" : ""}>

                  <p className="promo centered">
                    Associate your Eth address with something you will actually remember.
                  </p>

                  <hr />

                  <div>
                    <form id="ens-registration" name="ens-registration" onSubmit={this.registerSubdomain}>
                      <div className="form-group">
                        <label htmlFor="addressSelect" className="upper">Your Account Address</label>

                        {this.state.networkType
                          ? (<span className="right text-muted"><i className="fa fa-database" /> {this.state.networkType}</span>)
                          : (<span className="right">Not connected to any ETH network</span>)}

                        <div className="input-group">
                          {/* <select
                        className="form-control"
                        id="addressSelect"
                        onChange={this.setAccount}
                        value={this.state.selectedAccount}
                        required={true}>
                        {this.state.accounts.map(addr =>
                          <option
                            value={addr}
                            key={addr}
                          >{ addr }</option>
                        )}
                      </select> */}

                          <input
                            className="form-control"
                            id="addressSelect"
                            onChange={this.setAccount}
                            value={this.state.selectedAccount}
                            placeholder="Please, fill your account address"
                            required={true} />

                          <div className="input-group-append">
                            <span className="btn clickable input-group-text"
                              title="Copy to clipboard"
                              onClick={this.copyAccountAddress}>Copy</span>
                          </div>
                        </div>

                      </div>

                      <div className="form-group">
                        <fieldset disabled={disabled}>
                          <label htmlFor="subdomain" className="upper">Your new address name</label>
                          {this.state.subdomain && this.state.availability.availabilityChecked && this.state.availability.isCheckingAvailability === false && this.state.availability.isAvailable && (
                            <span className="right text-success">Available</span>
                          )}
                          {this.state.subdomain && this.state.availability.availabilityChecked && this.state.availability.isCheckingAvailability === false && this.state.availability.isAvailable === false && (
                            <span className="right text-danger">Not available</span>
                          )}

                          <div className="input-group">
                            <input
                              id="subdomain"
                              type="text"
                              className="form-control"
                              placeholder="e.g. alice"
                              pattern="[a-zA-Z0-9-_]*"
                              required={true}
                              value={this.state.subdomain}
                              onChange={this.handleChange}
                            />

                            <div className="input-group-append">
                              <span className="input-group-text">.topmonks.eth</span>

                              <button className="btn"
                                type="button"
                                onClick={this.checkAvailability}
                                disabled={this.state.domain && this.state.availability.isCheckingAvailability}>Available?</button>
                            </div>
                          </div>
                          <small className="form-text text-muted">Only letters, numbers, dash or underscore. Minimum length of subdomain is {this.state.minimumLength} letter.</small>

                          {/* TODO: Optimize, code is ugly. */}
                          {this.state.availability.availabilityCheckFailed
                            ? (
                              <div className="availability">
                                <div className="red circle">
                                  <img src={xMark} alt="x mark"></img>
                                </div>
                                <strong>Domain availability check failed.</strong>
                              </div>
                            ) : ''}

                          {this.state.availability.getEnsOwnerFailed
                            ? (
                              <div className="availability">
                                <div className="red circle">
                                  <img src={xMark} alt="x mark"></img>
                                </div>
                                <strong>Error reading from ENS. Please check selected ETH network.</strong>
                              </div>
                            ) : ''}
                        </fieldset>
                      </div>
                    </form>

                    <FlashMessage message={this.state.message} />
                    {callSuccess && (
                      <button type='button' className='btn btn-outline-dark btn-outline-alt' onClick={this.resetForm}>Register another address?</button>
                    )}

                  </div>
                </div>
              )}
          </div> {/* /jumbotron */}
          <div className='text-center'>
            {this.state.ethereumEnabled && (
              <button
                className={
                  "btn btn-register"
                  + (callSuccess ? " btn-success" : "")
                }
                type="submit"
                form="ens-registration"
                disabled={!this.state.isValid || disabled || !this.state.subdomain.length}
              >
                {(callInProgress || callSuccess) && (
                  <i className={
                    "fa fa-2x "
                    + (callInProgress ? "fa-spinner fa-spin" : "")
                    + (callSuccess ? "fa-check" : "")
                  } />
                )}
                <div style={(callInProgress || callSuccess) ? { opacity: 0 } : {}}>
                  <div className="upper">Register</div>
                  <div className="big">{this.state.subdomain}.topmonks.eth</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
