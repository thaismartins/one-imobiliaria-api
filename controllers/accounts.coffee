express = require 'express'
router = express.Router()
auth = require '../services/auth'
User = require '../models/User'
Group = require '../models/UserGroup'
Company = require '../models/Company'
utils = require '../services/utils'
fs = require 'fs'
multer = require 'multer'
uploadPath = './public/uploads/users'
upload = multer({ 'dest': uploadPath })
nodemailer = require 'nodemailer'
jwt = require 'jsonwebtoken'
config = require '../config'


# DO LOGIN
router.post '/auth', (req, res) ->

  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('origin', 'Origin is required').notEmpty()

  if req.body.origin == 'admin'
    req.checkBody('username', 'Username is required').notEmpty()
    query = {username: req.body.username}
  else
    req.checkBody('email', 'Email is required').notEmpty()
    query = {email: req.body.email}

  errors = req.validationErrors(true);
  return res.with(res.type.fieldsMissing, {'errors': errors}) if errors

  User.findOne(query).populate('group').exec (err, userFound) ->
    return res.with(res.type.itemNotFound) if not userFound? or userFound.group.type != req.body.origin
    return res.with(res.type.wrongPassword) if !userFound.comparePassword(req.body.password)

    hasToken = false
    if req.body.pushToken?
      for token in userFound.pushToken
        hasToken = true if req.body.pushToken == token

      if !hasToken
        User.findOneAndUpdate query, {$push: {pushToken: req.body.pushToken}}, (err) ->
          return res.with(res.type.codeError, err) if err

    res.with({'token': userFound.generateToken(), 'code': userFound._id})

# REMEMBER PASSWORD
router.post '/remember', (req, res) ->

  req.checkBody('email', 'Email is required').notEmpty()

  errors = req.validationErrors(true);
  return res.with(res.type.fieldsMissing, {'errors': errors}) if errors

  expiredDate = new Date()
  expiredDate.setHours(expiredDate.getHours() + 12)
  code = Math.floor(Math.random() * (999999 - 111111 + 1) + 111111)

  remember =
    code: code.toString()
    expiresIn: expiredDate.toISOString()

  User.findOneAndUpdate {email: req.body.email}, {$set: remember: remember}, {new: true}, (err, userFound) ->
    return res.with(res.type.itemNotFound) unless userFound?

    transporter = nodemailer.createTransport({
      host: 'cpanel0147.hospedagemdesites.ws'
      port: 465
      secure: true
      requireTLS: true
      auth:
        user: 'one@one.com.br'
        pass: 'one'
    })

    emailbodyfilepath = __dirname + '/../public/emails/remember.html'
    emailHtml = fs.readFileSync(emailbodyfilepath,'utf8')

    emailHtml = emailHtml.replace('__CODE__', code.toString())
    emailHtml = emailHtml.replace('__NAME__', userFound.name)

    mailOptions =
      from: '"One Consultoria Imobiliária" <one@one.com.br>'
      to: userFound.email
      subject: 'Recuperação Senha'
      html: emailHtml.toString()

    transporter.sendMail mailOptions, (err) ->
      return res.with(res.type.emailError, err) if err
      res.with(res.type.rememberSuccess)

# VALIDATE TOKEN REMEMBER PASSWORD
router.post '/remember/validate', (req, res) ->

  req.checkBody('code', 'Code is required').notEmpty()
  req.checkBody('email', 'Email is required').notEmpty()

  errors = req.validationErrors(true);
  return res.with(res.type.fieldsMissing, {'errors': errors}) if errors

  User.findOne {email: req.body.email, 'remember.code': req.body.code, 'remember.expiresIn': {$gte: new Date().toISOString()}}, (err, userUpdated) ->
    return res.with(res.type.codeError, err) if err or not userUpdated?
    res.with(userUpdated)
    
# CHANGE PASSWORD
router.put '/change-password', (req, res) ->

  req.checkBody('code', 'Code is required').notEmpty()
  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('email', 'Email is required').notEmpty()

  errors = req.validationErrors(true);
  return res.with(res.type.fieldsMissing, {'errors': errors}) if errors

  user = new User()
  user.password = req.body.password

  User.findOneAndUpdate({'email': req.body.email, 'remember.code': req.body.code}, {$set: {password: user.password}}, {new: true}).populate('group').exec (err, userUpdated) ->
    return res.with(res.type.dbError, err) if err
    userUpdated.token = userUpdated.generateToken()
    res.with(userUpdated.withoutPassword())


# GET ALL USERS
router.get '/', auth.isAuthenticated, (req, res) ->
  User.find({}, '-password').populate('group').populate('companies').exec (err, usersFound) ->
    return res.with(res.type.dbError, err) if err
    res.with(usersFound)

# GET SPECIFIC USER
router.get '/:id', auth.isAuthenticated, (req, res) ->
  User.findOne({'_id': req.params.id}, '-password').populate('group').populate('companies').exec (err, userFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(userFound) if userFound
    res.with(res.type.itemNotFound)

# ADD NEW USER
router.post '/', (req, res) ->
  User.findOne {email: req.body.email}, (err, userFound) ->
    return res.with(res.type.itemExists) if userFound

    user = new User(req.body);
    user.created = new Date()
    type = 'admin'
    type = req.body.group if req.body.group?

    Group.findOne {'type': type}, (err, groupFound) ->
        return res.with(res.type.dbError, err) if err
        user.group = groupFound._id if groupFound
        user.save (err) ->
          return res.with(res.type.dbError, err) if err
          user.token = user.generateToken()
          user.populate 'group', (err, userSaved) ->
            res.with(userSaved.withoutPassword())

# UPDATE EXISTENT USER
router.put '/:id', auth.isAuthenticated, upload.single('photo'), (req, res) ->
  User.findOne {_id: req.params.id}, (err, userFound) ->
    return res.with(res.type.dbError, err) if err
    return res.with(res.type.itemNotFound) unless userFound?

    user = new User(req.body)
    
    type = 'admin'
    type = req.body.group if req.body.group?

    Group.findOne {'type': type}, (err, groupFound) ->
      return res.with(res.type.dbError, err) if err
      user.group = groupFound._id if groupFound
      User.findOneAndUpdate({_id: req.params.id}, {$set: user.forUpdate()}, {new: true}).populate('group').exec (err, userUpdated) ->
        return res.with(res.type.dbError, err) if err
        userUpdated.token = user.generateToken()
        res.with(userUpdated.withoutPassword())

# DELETE USER
router.delete '/:id', auth.isAuthenticated, (req, res) ->
  User.findOneAndRemove {'_id': req.params.id}, (err) ->
    return res.with(res.type.dbError, err) if err
    Company.findOneAndRemove {user: req.params.id}, (err, companyFounded) ->
      return res.with(res.type.dbError, err) if err
      Coupon.findOneAndRemove {'company': companyFounded._id}, (err) ->
        return res.with(res.type.dbError, err) if err
        res.with(res.type.deleteSuccess)

module.exports = router