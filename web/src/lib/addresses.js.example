import TopmonksRegistrar from "../contracts/TopmonksRegistrar.json";
import ENSRegistry from "../contracts/ENSRegistry.json";

function getAddr(contract) {
  return contract.networks[Object.keys(contract.networks)[0]].address;
}

export default {
  ensAddress: getAddr(ENSRegistry),
  registrarAddress: getAddr(TopmonksRegistrar),
}
