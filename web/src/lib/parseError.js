/**
 * Assuming error.message contains stringified object with tx receipt.
 * Something like this
 * 
 * 
Transaction ran out of gas. Please provide more gas:
{
  "blockHash": "0x4f249f64f62f0aaf44d20241891b75e559db2fb16671903a2024c029efc8e77d",
  "blockNumber": 4618843,
  "contractAddress": null,
  "cumulativeGasUsed": 5432126,
  "from": "0x69b41fe106aa04e3a2f91fc80ab11ff605cbd53e",
  "gasUsed": 4627078,
  "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "status": false,
  "to": "0x1ba0599bbb54e8982dff0dae19cf4571d7673c2d",
  "transactionHash": "0x160942ca135f38a6913f9cb5135e6b942c9573eb1635d34e170352a41eb3eee2",
  "transactionIndex": 7,
  "events": {}
}
 
*/
export default function parseTransactionFromError(err) {
  const lines = err.message.split(/\r\n|\r|\n/);
  const lineCount = lines.length;

  if (lineCount <= 1) {
    return null;
  }

  if (lines[1] === '{' && lines[lines.length - 1] === '}') {
    // we have stringified tx object. Let's parse it
    lines.splice(0, 1);
    const txLines = lines.join('');
    try {
      const tx = JSON.parse(txLines);
      return tx;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
