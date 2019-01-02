import TopmonksRegistrar from "../contracts/TopmonksRegistrar.json";
import ENSRegistry from "../contracts/ENSRegistry.json";

function getAddr(contract, networkId) {
  const network = contract.networks[networkId];
  if (!network) {
    const errMsg = `No configuration found for network id ${networkId}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }
  return network.address;
}

export default {
  getEnsAddress: (networkId) => getAddr(ENSRegistry, networkId),
  getRegistrarAddress: (networkId) => getAddr(TopmonksRegistrar, networkId),
}
