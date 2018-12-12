import React, { Component } from 'react';
import './App.css';
import logo from './images/logo.png';

import Ens from './lib/ens.js';
import copyToClipboard from './lib/copy.js';
import TopmonksRegistrar from './lib/TopmonksRegistrar.js';
import config from './lib/config.js';
import 'font-awesome/css/font-awesome.min.css';

import { hash as namehash } from "eth-ens-namehash";


const ens = new Ens(config);
// TopMonksRegistrar by se mozna mel prejmenovat proste na Registrar. Pokud chceme, aby se to dalo
//   vyuzit i na jine domeny nez topmonks.eth
const topmonksRegistrar = new TopmonksRegistrar(config);

const FlashMessage = ({ message }) => {
  if(message) {
    let spinner;
    if (message.spin) {
      spinner = <i className="fa fa-spinner fa-spin"></i>;
    }

    return(
      <div className={`alert alert-${message.type}`} role="alert">
        {spinner}
        &nbsp;
        {message.text}
      </div>
    )
  } else {
    return null
  }
}

const log = (toLog) => {
  if(process.env.NODE_ENV === 'development') {
    console.log(toLog);
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      minimumLength: 1,
      isValid: false,
      message: null,
      subdomain: '',
      ethCallInProgress: false,
      accounts: [],
      selectedAccount: ''
    };
  }

  componentDidMount () {
    // using the new API of MetaMask which protects user's privacy
    // by explicitly calling enable()
    // see https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    if (window.ethereum) {
      window.ethereum.enable().then(accounts => {
        // config.web3.eth.getAccounts().then(accounts => {
          this.setState({ accounts, selectedAccount: accounts[0] });
    
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
    }
  }

  setProgress = (ethCallInProgress, msgText, msgType) => {
    let newSubdomain;

    if (this.state.ethCallInProgress === true && ethCallInProgress === false) {
      newSubdomain = '';
    } else {
      newSubdomain = this.state.subdomain;
    }

    this.setState({
      ethCallInProgress: ethCallInProgress,
      message: {
        text: msgText,
        type: msgType,
        spin: ethCallInProgress
      },
      subdomain: newSubdomain
    });
  }

  registerSubdomain = (e) => {
    e.preventDefault();
    e.persist();

    if (this.checkValidity(this.state.subdomain) === false) {
      console.log('domain name is not valid');
      return;
    }

    let domain = `${this.state.subdomain}.topmonks.eth`;

    this.setProgress(true, `Registering domain ${domain}. This may take some time, please be patient.`, 'primary');

    ens.isFree(domain)
      .then((isFree) => {
        if (isFree) {
          topmonksRegistrar.register(this.state.subdomain, this.state.selectedAccount, {gas: 50000})
            .on('receipt', (receipt) => {
              this.setProgress(false, `Domain ${domain} has been registered to your address`, 'success');
              e.target.reset();
            })
            .on('error', (error) => {
              log(error);
              this.setProgress(false, `We are sorry, registratin of domain ${domain} failed.`, 'danger');
            });
        } else {
          this.setProgress(false, `Domain ${domain} is already registered. Please choose different domain.`, 'danger');
          e.target.reset();
        }
      })
      .catch((error) => {
        log(error);
        this.setProgress(false, `We are sorry, registratin of domain ${domain} failed.`, 'danger');
        e.target.reset();
      });
  }

  setAccount = (event) => {
    this.setState({ selectedAccount: event.target.value });
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
    this.setState({ subdomain: event.target.value });
    this.checkValidity(event.target.value);
  }

  render() {
    let disabled = this.state.ethCallInProgress === true;

    return (
      <div className="container">
        <div className="offset-md-2 col-md-8">
          <div className="text-center">
            <img className="logo" src={logo} alt="TopMonks logo"></img>
            <h1 className="upper centered header">ENS Registrar</h1>
          </div>

          <p className="promo centered">
            Associate your Eth address with something you will actually remember.
          </p>

          <FlashMessage message={this.state.message}/>

          <div>
            <form onSubmit={ this.registerSubdomain }>
              <div className="form-group">
                <label htmlFor="addressSelect" className="upper">Your Account Address</label>

                <div className="input-group">
                  <select 
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
                  </select>
                  <div className="input-group-append">
                    <span className="violet clickable input-group-text" 
                      title="Copy to clipboard"
                      onClick={this.copyAccountAddress}>Copy</span>
                  </div>
                </div>
                
              </div>

              <div className="form-group">
                <fieldset disabled={disabled}>
                  <label htmlFor="subdomain" className="upper">Subdomain</label>

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
                    </div>
                  </div>
                    <small className="form-text text-muted">Only letters, numbers, dash or underscore. Minimum length of subdomain is {this.state.minimumLength} letters.</small>
                </fieldset>
              </div>

              <div className="form-group">

                {this.state.subdomain && this.state.subdomain.length > 0
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
      </div>
    );
  }
}

export default App;
