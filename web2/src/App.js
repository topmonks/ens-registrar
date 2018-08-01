import React, { Component } from 'react';
import './App.css';

import Web3 from 'web3';
const web3 = new Web3('http://localhost:8545');
const namehash = require("eth-ens-namehash").hash;

var accounts;
web3.eth.getAccounts()
  .then((r) => {
    accounts = r;
  }).catch((e) => {
    throw "Couldn't get ethereum accounts!!! OMG!!"
  });

const ENS = require('./contracts/ENSRegistry.json');
import TopmonksRegistrar from './contracts/TopmonksRegistrar.json';
// const TopmonksRegistrar = require('./contracts/TopmonksRegistrar.json');
const ens = new web3.eth.Contract(ENS.abi, "0xFE753725882318B3BC2e0eF8819FA9F106B9C271");

const registrar = new web3.eth.Contract(TopmonksRegistrar.abi, "0x16BF4F9b95518Bc7FF4a7337c84c329f7636a4E2");

ens.methods.owner(namehash('topmonks.eth')).call()
  .then((r) => {
    console.log('goob');
    console.log(r);
  }).catch((e) => {
    console.log('bad');
    console.log(e);
  });

const FlashMessage = ({ message }) => {
  // tohle nejde nejak hezceji abych nemusel psat else?
  if(message) {
    return(
      <div className={`alert alert-${message.type}`} role="alert">
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
      registerInProgress: false,
      alreadyRegistered: ['admin']
    };
  }

  // registerSubdomain = (e) => {
  //   e.preventDefault();
  //
  //   if(this.state.alreadyRegistered.includes(this.state.subdomain)) {
  //     this.setState({ message: { text: "Unfortunatelly this domain is already registered. Please choose another one.", type: "danger" } });
  //     setTimeout(() => { this.setState({ message: null }) }, 1800 );
  //   } else {
  //     this.setState({ message: { text: `Registering ${this.state.subdomain}. Please wait until it gets processed on blockchain`, type: "primary" }, registerInProgress: true });
  //     setTimeout(() => {
  //       this.setState({ message: { text: 'Registration completed!', type: "success" }, registerInProgress: false })
  //       setTimeout(() => { this.setState({ message: null }) }, 1800);
  //     }, 1800 );
  //   }
  // }

  registerSubdomain = (e) => {
    e.preventDefault();

    this.setState({ registerInProgress: true });

    // const fullnode = namehash(`${this.state.subdomain}.topmonks.eth`);
    const node = web3.utils.sha3(this.state.subdomain);

    registrar.methods.register(node, accounts[2])
      .send({ from: accounts[2] })
      .on('receipt', (receipt) => {
        console.log('goob!');
        console.log(receipt);
      })
      .on('error', (error) => {
        console.log('Somethign went wrong');
        console.log(error);
      });
  }

  render() {
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
          </form>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
