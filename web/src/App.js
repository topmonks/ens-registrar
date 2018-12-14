import React, { Component } from 'react';
import './App.css';
import logo from './images/logo.png';
import checkMark from './images/check-mark.png';
import xMark from './images/x-mark.png';
import metamask from './images/download-metamask-dark.png';

import FlashMessage from './flash-message';
import Ens from './lib/ens.js';
import copyToClipboard from './lib/copy.js';
import parseTransactionFromError from './lib/parseError';
import TopmonksRegistrar from './lib/TopmonksRegistrar.js';
import config from './lib/config.js';
import 'font-awesome/css/font-awesome.min.css';

import { hash as namehash } from "eth-ens-namehash";


const ens = new Ens(config);
// TopMonksRegistrar by se mozna mel prejmenovat proste na Registrar. Pokud chceme, aby se to dalo
// vyuzit i na jine domeny nez topmonks.eth
const topmonksRegistrar = new TopmonksRegistrar(config);

const log = (toLog) => {
  if(process.env.NODE_ENV === 'development') {
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
      accounts: [],
      selectedAccount: '',
      
      // todo move to object
      availabilityChecked: false,
      isCheckingAvailability: false,
      isAvailable: false,
      availabilityCheckFailed: false
    };
  }

  componentDidMount () {
    // using the new API of MetaMask which protects user's privacy
    // by explicitly calling enable()
    // see https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    if (window.ethereum) {

      // Detect to which eth network we are currently connected
      config.web3.eth.net
      .getNetworkType()
      .then(network => {
        this.setState({networkType: network});
      });

      // namespace window.ethereum exists but is not yet enabled
      this.setState({
        ethereumEnabled: false
      });

      window.ethereum.enable().then(accounts => {
        this.setState({ 
          accounts,
          selectedAccount: accounts[0],
          ethereumEnabled: true
        });
  
        // Check who is the owner
        // for some stupid reason the async/await seems not be supported
        // and on Ganache v6.1.8 the owner seems to be always 0x000...000
        var ethOwner, topmonksOwner
        ens.contract.methods.owner(namehash("eth")).call().then(v => {
          ethOwner = v;
          console.log('ethOwner', ethOwner);
        }).catch(err => {
          console.error('Getting owner of domain eth failed', err);
        });
        ens.contract.methods.owner(namehash("topmonks.eth")).call().then(v => {
          topmonksOwner = v;
          console.log('topmonksOwner', topmonksOwner);
        }).catch(err => {
          console.error('Getting owner of domain topmonks.eth failed', err);
        });
      });
    } else {
      this.setState({unsupportedBrowser: true});
    }
  }

  setMessage = (ethCallInProgress, msgText, msgType, txLink = null) => {
    this.setState({
      ethCallInProgress: ethCallInProgress,
      message: {
        text: msgText,
        type: msgType,
        spin: ethCallInProgress,
        txLink
      }
    });
  }

  registerSubdomain = async (event) => {
    event.preventDefault();
    event.persist();

    if (this.checkValidity(this.state.subdomain) === false) {
      console.log('domain name is not valid');
      return;
    }

    let domain = `${this.state.subdomain}.topmonks.eth`;
    this.setMessage(true, `Registering domain ${domain}. This may take some time, please be patient.`, 'primary');

    const isAvailable = await this.checkAvailability();
    
    if (isAvailable) {
      topmonksRegistrar.register(this.state.subdomain, this.state.selectedAccount, {gas: 50000})
        .on('receipt', (receipt) => {
          this.setMessage(false, `Domain ${domain} has been registered to your address`, 'success');
          event.target.reset();
        })
        .on('error', (error) => {
          // oh boy, the error contains stringified tx receipt, prepended with some error message
          // I need to parse the object from it, to get the transactionHash
          log(error);

          const errorMessage = `We are sorry, registratin of domain ${domain} failed.`;
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
          
          this.setMessage(false, errorMessage, 'danger', txLink);

          // Check availability again. Has the domain been taken by someone else in the meantime?
          this.checkAvailability();
        });
    } else {
      // domain is not available.
      // message is already displayed by checkAvailability() method
      event.target.reset();
    }
  }

  setAccount = (event) => {
    this.setState({ selectedAccount: event.target.value });
  }

  checkAvailability = async () => {
    let domain = `${this.state.subdomain}.topmonks.eth`;
    this.setState({
      isCheckingAvailability: true,
      availabilityChecked: false,
      availabilityCheckFailed: false
    });

    const isAvailable = await ens.isFree(domain).catch((err) => {
      console.error('Checking domain availability failed with err:', err);
      // todo: Display error
      this.setState({
        isCheckingAvailability: false,
        availabilityCheckFailed: true
      });
    });

    this.setState({
      isAvailable,
      isCheckingAvailability: false,
      availabilityChecked: true
    });

    return isAvailable;
  }

  copyAccountAddress = () => {
    copyToClipboard(this.state.selectedAccount);
  }

  checkValidity = (subdomain) => {
    const isValid = !!subdomain && subdomain.trim().length >= this.state.minimumLength;
    this.setState({ isValid });
    return isValid;
  }
  
  handleChange = (event) => {
    this.setState({ 
      subdomain: event.target.value,
      availabilityChecked: false
    });
    this.checkValidity(event.target.value);
  }

  render() {
    let disabled = this.state.ethCallInProgress === true;

    return (
      <div className="container">

        {this.state.unsupportedBrowser === true 
        ? (
          <div class="ui negative message">
            <div class="header">
              Ethereum wallet required
            </div>
            <p>
              Please install MetaMask extension to enable reading data from ETH Blockchain.
              <img class="metamask" src={metamask} alt="Metamask logo"/>
            </p>
            <ul class="list">
              <li><a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" 
                target="_BLANK" rel="noopener noreferrer">Install for Chrome.</a></li>
              <li><a href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/" 
                target="_BLANK" rel="noopener noreferrer">Install for Firefox.</a></li>
            </ul>
          </div>
        )
        : (
          <div className="offset-md-2 col-md-8">
            <div className="text-center">
              <img className="logo" src={logo} alt="TopMonks logo"></img>
              <h1 className="upper centered header">ENS Registrar</h1>
            </div>

            <p className="promo centered">
              Associate your Eth address with something you will actually remember.
            </p>

            <FlashMessage message={this.state.message}/>

            {this.state.ethereumEnabled === false 
              ? (<FlashMessage message={{
                text: 'Please, log in to your Metamask account.',
                type: 'warning'
              }}/>) 
              : ''
            }

            <div>
              <form onSubmit={ this.registerSubdomain }>
                <div className="form-group">
                  <label htmlFor="addressSelect" className="upper">Your Account Address</label>

                  {this.state.networkType 
                  ? (<span className="right">Currently connected to {this.state.networkType}</span>)
                  : (<span className="right">Not connected to any ETH network</span>)}

                  <div className="input-group">
                    {/* <select 
                      className="form-control" 
                      id="addressSelect"
                      onChange={this.setAccount}
                      value={this.state.selectedAccount}
                      required="true">
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
                      required="true" />

                    <div className="input-group-append">
                      <span className="violet clickable input-group-text" 
                        title="Copy to clipboard"
                        onClick={this.copyAccountAddress}>Copy</span>
                    </div>
                  </div>
                  
                </div>

                <div className="form-group">
                  <fieldset disabled={disabled}>
                    <label htmlFor="subdomain" className="upper">Your new address name</label>

                    <div className="input-group">
                      <input
                        id="subdomain"
                        type="text"
                        className="form-control"
                        placeholder="e.g. alice"
                        pattern="[a-zA-Z0-9-_]*"
                        required="true"
                        value={this.state.subdomain}
                        onChange={this.handleChange}
                        />

                      <div className="input-group-append">
                        <span className="input-group-text">.topmonks.eth</span>

                        <button className="btn violet"
                          type="button"
                          onClick={this.checkAvailability}
                          disabled={this.state.domain && this.state.isCheckingAvailability}>Available?</button>
                      </div>
                    </div>
                      <small className="form-text text-muted">Only letters, numbers, dash or underscore. Minimum length of subdomain is {this.state.minimumLength} letters.</small>

                      {/* TODO: Optimize, code is ugly. */}
                      {this.state.subdomain && this.state.availabilityChecked && this.state.isCheckingAvailability === false && this.state.isAvailable
                      ? (
                        <div className="availability">
                          <div className="green circle">
                            <img src={checkMark} alt="check mark"></img>
                          </div>
                          <strong>{this.state.subdomain}.topmonks.eth</strong> is available.
                        </div>
                      )
                      : ('')}

                      {this.state.subdomain && this.state.availabilityChecked && this.state.isCheckingAvailability === false && this.state.isAvailable === false
                      ? (
                        <div className="availability">
                          <div className="red circle">
                            <img src={xMark} alt="x mark"></img>
                          </div>
                          <strong>{this.state.subdomain}.topmonks.eth</strong> is not available.
                        </div>
                      )
                      : ('')}

                      {this.state.availabilityCheckFailed
                      ? (
                        <div className="availability">
                          <div className="red circle">
                            <img src={xMark} alt="x mark"></img>
                          </div>
                          <strong>Domain availability check failed.</strong>
                        </div>
                      ) : ''}
                  </fieldset>
                </div>

                <div className="form-group">

                  {this.state.ethereumEnabled && this.state.subdomain && this.state.subdomain.length > 0
                    ? (
                      <button
                        className="btn btn-block orange btn-subdomain"
                        type="submit"
                        disabled={!this.state.isValid || disabled}>
                          <div className="upper">Register</div>
                          <div className="big">{this.state.subdomain}.topmonks.eth</div>
                        </button>
                    )
                    : (
                      <button className="btn btn-block orange"
                      type="submit" disabled>Register</button>
                    )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
