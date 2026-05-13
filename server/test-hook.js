// file temporaneo per testare il post-commit hook di graphify
function testAuth(token) {
  return verifyJWT(token)
}

function verifyJWT(token) {
  return token === 'valid'
}

function logout(userId) {
  invalidateSession(userId)
}

module.exports = { testAuth, verifyJWT, logout }
