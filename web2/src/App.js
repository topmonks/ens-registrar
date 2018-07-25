import React, { Component } from 'react';
import './App.css';


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

  registerSubdomain = () => {
    if(this.state.alreadyRegistered.includes(this.state.subdomain)) {
      this.setState({ message: { text: "Unfortunatelly this domain is already registered. Please choose another one.", type: "danger" } });
      setTimeout(() => { this.setState({ message: null }) }, 1800 );
    } else {
      this.setState({ message: { text: `Registering ${this.state.subdomain}. Please wait until it gets processed on blockchain`, type: "primary" }, registerInProgress: true });
      setTimeout(() => {
        this.setState({ message: { text: 'Registration completed!', type: "success" }, registerInProgress: false })
        setTimeout(() => { this.setState({ message: null }) }, 1800);
      }, 1800 );
    }
  }

  render() {
    return (
      <div className="container">
        <div className="offset-md-2 col-md-8">
          <div className="text-center">
            <h1>TopMonks registrar</h1>
          </div>

          <p>
            To register your Ethereum address with some rememberable subdomain under topmonks.eth domain just type it below and hit Register. You have to have MetaMask installed and working.
          </p>

          <FlashMessage message={this.state.message}/>

          <div className="text-center">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="e.g. alice"
                value={this.state.subdomain}
                onChange={event => { this.setState({ subdomain: event.target.value }) }}
              />

            <div className="input-group-append">
              <span className="input-group-text">.topmonks.eth</span>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={ this.registerSubdomain }
              >Register!</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
