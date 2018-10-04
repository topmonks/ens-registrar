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
      message: null,
      subdomain: '',
      ethCallInProgress: false,
      accounts: [],
      selectedAccount: '',
    };
  }

  componentDidMount() {
    config.web3.eth.getAccounts().then(accounts =>
      this.setState({ accounts, selectedAccount: accounts[0] })
    );
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

    let domain = `${this.state.subdomain}.topmonks.eth`;

    this.setProgress(true, `Registruji domenu ${domain}`, 'primary');

    ens.isFree(domain)
      .then((isFree) => {
        if (isFree) {
          topmonksRegistrar.register(this.state.subdomain, this.state.selectedAccount)
            .on('receipt', (receipt) => {
              this.setProgress(false, `Domenu ${domain} jsme zaregistrovali na vasi adresu`, 'success');
              e.target.reset();
            })
            .on('error', (error) => {
              log(error);
              this.setProgress(false, `Bohuzel, domenu ${domain} se nepodarilo zaregistrovat.`, 'danger');
            });
        } else {
          this.setProgress(false, `Domena ${domain} je jiz zaregistrovana. Vyberte si prosim jinou.`, 'danger');
          e.target.reset();
        }
      })
      .catch((error) => {
        log(error);
        this.setProgress(false, `Bohuzel, domenu ${domain} se nepodarilo zaregistrovat.`, 'danger');
        e.target.reset();
      });
  }

  setAccount = (event) => {
    this.setState({ selectedAccount: event.target.value });
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
            Associate your Eth address with rememberable subdomain under <b>topmonks.eth</b>.
          </p>

          <FlashMessage message={this.state.message}/>

          <div>
            <form onSubmit={ this.registerSubdomain }>
              <div className="form-group">
                <label htmlFor="addressSelect">Address</label>
                <select className="form-control" id="addressSelect" onChange={this.setAccount} value={this.state.selectedAccount}>
                  {this.state.accounts.map(addr =>
                    <option
                      value={addr}
                      key={addr}
                    >{ addr }</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <fieldset disabled={disabled}>
                  <label htmlFor="subdomain">Subdomain</label>

                  <div className="input-group">
                    <input
                      id="subdomain"
                      type="text"
                      className="form-control"
                      placeholder="e.g. alice"
                      pattern="[a-zA-Z0-9-_]*"
                      required="true"
                      value={this.state.subdomain}
                      onChange={event => { this.setState({ subdomain: event.target.value }) }} />

                    <div className="input-group-append">
                      <span className="input-group-text">.topmonks.eth</span>
                    </div>
                  </div>
                    <small className="form-text text-muted">Only letters, numbers, dash or underscore</small>
                </fieldset>
              </div>

              <div className="form-group">
                <button
                  className="btn btn-block btn-primary"
                  type="submit"
                >Register!</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
