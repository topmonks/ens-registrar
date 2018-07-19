module.exports = async function assertRevert(promise, regExp = /revert$/) {
  let f = () => {};
  try {
    await promise;
  } catch(e) {
    f = () => {throw e};
  } finally {
    assert.throws(f, regExp);
  }
};

