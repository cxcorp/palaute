const jwt = require('jsonwebtoken')
const { ApplicationError } = require('../util/customErrors')
const { ADMINS, JWT_KEY } = require('../util/config')
const { User } = require('../models')

const isSuperAdmin = (username) => ADMINS.includes(username)

const createTestUser = async () => {
  const testUser = await User.create({
    id: 'abc1234',
    username: 'ohj_tosk',
    email: 'grp-toska@helsinki.fi',
    studentNumber: '092345321',
    employeeNumber: '99999a9',
    firstName: 'Gert',
    lastName: 'Adamson',
  })

  return testUser
}

const getLoggedInAsUser = async (actualUser, loggedInAsUser) => {
  if (!isSuperAdmin(actualUser)) return undefined

  const user = await User.findOne({ where: { id: loggedInAsUser } })

  return user
}

const getUser = async (username) => {
  const user = await User.findOne({
    where: {
      username,
    },
  })
  if (!user && username === 'ohj_tosk') return createTestUser()
  if (!user) {
    throw new ApplicationError(`User with username ${username} not found`, 404)
  }

  return user
}

const getUsernameFromToken = (req) => {
  const { token } = req.headers

  const { username } = jwt.verify(token, JWT_KEY)

  if (!username) throw new ApplicationError('Token is missing username', 403)

  return username
}

const getUsernameFromShibboHeaders = (req) => {
  const { uid: username } = req.headers

  if (!username) throw new ApplicationError('Missing uid header', 403)

  return username
}

const currentUserMiddleware = async (req, _, next) => {
  const isNoAdPath = req.path.startsWith('/noad')

  const username = isNoAdPath
    ? await getUsernameFromToken(req)
    : getUsernameFromShibboHeaders(req)

  if (!username) throw new ApplicationError('Missing uid header', 403)

  req.user = await getUser(username)

  if (req.headers['x-admin-logged-in-as']) {
    const loggedInAsUser = await getLoggedInAsUser(
      username,
      req.headers['x-admin-logged-in-as'],
    )
    if (loggedInAsUser) req.user = loggedInAsUser
  }

  req.user.set('iamGroups', isNoAdPath ? [] : req.iamGroups ?? [])

  req.isAdmin = isNoAdPath ? false : isSuperAdmin(req.user.username)

  return next()
}

module.exports = currentUserMiddleware
