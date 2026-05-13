// file temporaneo per testare il post-commit hook di graphify
function testAuth(token) {
  return verifyJWT(token)
}

function verifyJWT(token) {
  return token === 'valid'
}

module.exports = { testAuth, verifyJWT }
