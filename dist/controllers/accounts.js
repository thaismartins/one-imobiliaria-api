var Group, User, auth, config, express, fs, multer, nodemailer, router, upload, uploadPath;

express = require('express');

router = express.Router();

auth = require('../services/auth');

User = require('../models/User');

Group = require('../models/UserGroup');

fs = require('fs');

multer = require('multer');

uploadPath = './public/uploads/users';

upload = multer({
  'dest': uploadPath
});

nodemailer = require('nodemailer');

config = require('../config');

router.post('/auth', function(req, res) {
  var errors, query;
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('origin', 'Origin is required').notEmpty();
  if (req.body.origin === 'admin') {
    req.checkBody('username', 'Username is required').notEmpty();
    query = {
      username: req.body.username
    };
  } else {
    req.checkBody('email', 'Email is required').notEmpty();
    query = {
      email: req.body.email
    };
  }
  errors = req.validationErrors(true);
  if (errors) {
    return res["with"](res.type.fieldsMissing, {
      'errors': errors
    });
  }
  return User.findOne(query).populate('group').exec(function(err, userFound) {
    var hasToken, i, len, ref, token;
    if ((userFound == null) || userFound.group.type !== req.body.origin) {
      return res["with"](res.type.itemNotFound);
    }
    if (!userFound.comparePassword(req.body.password)) {
      return res["with"](res.type.wrongPassword);
    }
    hasToken = false;
    if (req.body.pushToken != null) {
      ref = userFound.pushToken;
      for (i = 0, len = ref.length; i < len; i++) {
        token = ref[i];
        if (req.body.pushToken === token) {
          hasToken = true;
        }
      }
      if (!hasToken) {
        User.findOneAndUpdate(query, {
          $push: {
            pushToken: req.body.pushToken
          }
        }, function(err) {
          if (err) {
            return res["with"](res.type.codeError, err);
          }
        });
      }
    }
    return res["with"]({
      'token': userFound.generateToken(),
      'code': userFound._id
    });
  });
});

router.post('/remember', function(req, res) {
  var code, errors, expiredDate, remember;
  req.checkBody('email', 'Email is required').notEmpty();
  errors = req.validationErrors(true);
  if (errors) {
    return res["with"](res.type.fieldsMissing, {
      'errors': errors
    });
  }
  expiredDate = new Date();
  expiredDate.setHours(expiredDate.getHours() + 12);
  code = Math.floor(Math.random() * (999999 - 111111 + 1) + 111111);
  remember = {
    code: code.toString(),
    expiresIn: expiredDate.toISOString()
  };
  return User.findOneAndUpdate({
    email: req.body.email
  }, {
    $set: {
      remember: remember
    }
  }, {
    "new": true
  }, function(err, userFound) {
    var emailHtml, emailbodyfilepath, mailOptions, transporter;
    if (userFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    transporter = nodemailer.createTransport({
      host: 'cpanel0147.hospedagemdesites.ws',
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: 'one@one.com.br',
        pass: 'one'
      }
    });
    emailbodyfilepath = __dirname + '/../public/emails/remember.html';
    emailHtml = fs.readFileSync(emailbodyfilepath, 'utf8');
    emailHtml = emailHtml.replace('__CODE__', code.toString());
    emailHtml = emailHtml.replace('__NAME__', userFound.name);
    mailOptions = {
      from: '"One Consultoria Imobiliária" <one@one.com.br>',
      to: userFound.email,
      subject: 'Recuperação Senha',
      html: emailHtml.toString()
    };
    return transporter.sendMail(mailOptions, function(err) {
      if (err) {
        return res["with"](res.type.emailError, err);
      }
      return res["with"](res.type.rememberSuccess);
    });
  });
});

router.post('/remember/validate', function(req, res) {
  var errors;
  req.checkBody('code', 'Code is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  errors = req.validationErrors(true);
  if (errors) {
    return res["with"](res.type.fieldsMissing, {
      'errors': errors
    });
  }
  return User.findOne({
    email: req.body.email,
    'remember.code': req.body.code,
    'remember.expiresIn': {
      $gte: new Date().toISOString()
    }
  }, function(err, userUpdated) {
    if (err || (userUpdated == null)) {
      return res["with"](res.type.codeError, err);
    }
    return res["with"](userUpdated);
  });
});

router.put('/change-password', function(req, res) {
  var errors, user;
  req.checkBody('code', 'Code is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  errors = req.validationErrors(true);
  if (errors) {
    return res["with"](res.type.fieldsMissing, {
      'errors': errors
    });
  }
  user = new User();
  user.password = req.body.password;
  return User.findOneAndUpdate({
    'email': req.body.email,
    'remember.code': req.body.code
  }, {
    $set: {
      password: user.password
    }
  }, {
    "new": true
  }).populate('group').exec(function(err, userUpdated) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    userUpdated.token = userUpdated.generateToken();
    return res["with"](userUpdated.withoutPassword());
  });
});

router.get('/', auth.isAuthenticated, function(req, res) {
  return User.find({}, '-password').populate('group').populate('companies').exec(function(err, usersFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](usersFound);
  });
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
  return User.findOne({
    '_id': req.params.id
  }, '-password').populate('group').populate('companies').exec(function(err, userFound) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (userFound) {
      return res["with"](userFound);
    }
    return res["with"](res.type.itemNotFound);
  });
});

router.post('/', function(req, res) {
  return User.findOne({
    email: req.body.email
  }, function(err, userFound) {
    var type, user;
    if (userFound) {
      return res["with"](res.type.itemExists);
    }
    user = new User(req.body);
    user.created = new Date();
    type = 'admin';
    if (req.body.group != null) {
      type = req.body.group;
    }
    return Group.findOne({
      'type': type
    }, function(err, groupFound) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      if (groupFound) {
        user.group = groupFound._id;
      }
      return user.save(function(err) {
        if (err) {
          return res["with"](res.type.dbError, err);
        }
        user.token = user.generateToken();
        return user.populate('group', function(err, userSaved) {
          return res["with"](userSaved.withoutPassword());
        });
      });
    });
  });
});

router.put('/:id', auth.isAuthenticated, upload.single('photo'), function(req, res) {
  return User.findOne({
    _id: req.params.id
  }, function(err, userFound) {
    var type, user;
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    if (userFound == null) {
      return res["with"](res.type.itemNotFound);
    }
    user = new User(req.body);
    type = 'admin';
    if (req.body.group != null) {
      type = req.body.group;
    }
    return Group.findOne({
      'type': type
    }, function(err, groupFound) {
      if (err) {
        return res["with"](res.type.dbError, err);
      }
      if (groupFound) {
        user.group = groupFound._id;
      }
      return User.findOneAndUpdate({
        _id: req.params.id
      }, {
        $set: user.forUpdate()
      }, {
        "new": true
      }).populate('group').exec(function(err, userUpdated) {
        if (err) {
          return res["with"](res.type.dbError, err);
        }
        userUpdated.token = user.generateToken();
        return res["with"](userUpdated.withoutPassword());
      });
    });
  });
});

router["delete"]('/:id', auth.isAuthenticated, function(req, res) {
  return User.findOneAndRemove({
    '_id': req.params.id
  }, function(err) {
    if (err) {
      return res["with"](res.type.dbError, err);
    }
    return res["with"](res.type.deleteSuccess);
  });
});

module.exports = router;
