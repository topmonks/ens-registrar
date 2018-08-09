import React, { Component } from 'react';
import './App.css';

import Ens from './lib/ens.js';
import TopmonksRegistrar from './lib/TopmonksRegistrar.js';
import config from './lib/config.js';
import 'font-awesome/css/font-awesome.min.css';


const ens = new Ens(config);
// TopMonksRegistrar by se mozna mel prejmenovat proste na Registrar. Pokud chceme, aby se to dalo
//   vyuzit i na jine domeny nez topmonks.eth
const topmonksRegistrar = new TopmonksRegistrar(config);

// Tohle bude potreba upravit pro realny provoz aby bralo account z Mist/MetaMask..
var accounts;
config.web3.eth.getAccounts()
  .then((r) => {
    accounts = r;
  });


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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      subdomain: '',
      ethCallInProgress: false
    };
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

    let domain = `${this.state.subdomain}.topmonks.eth`;

    this.setProgress(true, `Registruji domenu ${domain}`, 'primary');

    ens.isFree(domain)
      .then((isFree) => {
        if (isFree) {
          topmonksRegistrar.register(this.state.subdomain, accounts[2])
            .on('receipt', (receipt) => {
              this.setProgress(false, `Domenu ${domain} jsme zaregistrovali na vasi adresu`, 'success');
            })
            .on('error', (error) => {
              this.setProgress(false, `Bohuzel, domenu ${domain} se nepodarilo zaregistrovat.`, 'danger');
            });
        } else {
          this.setProgress(false, `Domena ${domain} je jiz zaregistrovana. Vyberte si prosim jinou.`, 'danger');
        }
      });
  }

  render() {
    let disabled = this.state.ethCallInProgress === true;

    return (
      <div className="container">
        <div className="offset-md-2 col-md-8">
          <div className="text-center">
            <h1>TopMonks registrar</h1>
          </div>

          <p>
            To register your Ethereum address with some rememberable subdomain under topmonks.eth domain just type it below and hit Register. Your subdomain can only include letters, numbers, and dash or underscore. You also have to have MetaMask installed and working.
          </p>

          <FlashMessage message={this.state.message}/>

          <div className="text-center">
            <form onSubmit={ this.registerSubdomain }>
              <fieldset disabled={disabled}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. alice"
                    pattern="[a-zA-Z0-9-_]*"
                    value={this.state.subdomain}
                    onChange={event => { this.setState({ subdomain: event.target.value }) }}
                  />

                <div className="input-group-append">
                  <span className="input-group-text">.topmonks.eth</span>
                  <button
                    className="btn btn-outline-secondary"
                    type="submit"
                  >Register!</button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
