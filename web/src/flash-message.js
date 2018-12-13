import React from 'react';

export default function FlashMessage ({ message }) {
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

        {message.txLink 
        ? (<div>Check the transaction at <a href={message.txLink} target="_BLANK" rel="noopener noreferrer">Etherscan.io</a></div>) 
        : ''}
      </div>
    )
  } else {
    return null
  }
}