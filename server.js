console.log("server starting");

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const LdapStrategy = require('passport-ldapauth').Strategy;
const port = process.env.port || 3000;
const ldapjs = require('ldapjs')
const session = require('express-session');
const jwt = require("jsonwebtoken")

process.env.SECRET_KEY = 'secret'
function getCurrentUser(req) {
  if (req.headers && req.headers.authorization) {
      var authorization = req.headers.authorization;
      var user = null
      try {
          user = jwt.verify(authorization.split(' ')[1], process.env.SECRET_KEY);
      } catch (e) {
          console.log(e)
      }
      return user
  }
  return null
}

app.use(bodyParser.json())
app.use(cors())
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(session({
    secret: 'ldap secret',
    resave: false,
    saveUninitialized: true,
    cookie : { httpOnly: true, maxAge: 2419200000 } /// maxAge in milliseconds
  }));

/*const ldapOptions = {
    url: "ldap://localhost:389",
    connectTimeout: 3000,
    bindDN: "cn=admin,dc=example,dc=com",
    bindCredentials: 'password',
    searchBase: "dc=example,dc=com",
    searchFilter: "(uid={{username}})",
    reconnect: true
    //timeout: ldapConfig.timeout
  };
  passport.use(ldapOptions)
*/

const OPTS = {
    server:{
    url: "ldap://192.168.0.29:389",
    connectTimeout: 3000,
    bindDN: "cn=admin,dc=example,dc=com",
    bindCredentials: 'hello',
    searchBase: "dc=example,dc=com",
    searchFilter: "(cn={{username}})",
    reconnect: true
    //timeout: ldapConfig.timeout
    }
};

const ldapOptions = {
    url: "ldap://localhost:389",
    connectTimeout: 3000,
    bindDN: "cn=admin,dc=example,dc=com",
    bindCredentials: 'hello',
    searchBase: "dc=example,dc=com",
    searchFilter: "(cn={{username}})",
    reconnect: true
};


app.put('/update', (req, res, next) => {
  const user = getCurrentUser(req)
  const ldapClient = ldapjs.createClient(ldapOptions)
  const username = JSON.stringify(user.cn)
  const passwordOld = JSON.stringify(user.userPassword)
  const filter = JSON.stringify(user.uid)
  const dn = JSON.stringify(user.dn)
  const searchBase = JSON.stringify(ldapOptions.searchBase)
  if(user!==null){
    console.log('ok')
    console.log(user.dn.toString())
    ldapClient.bind(user.dn.toString(), user.userPassword.toString(), function(err, result){  
      if(err){
        console.log("petit probleme")
        console.error('erreur' + err)
      } 
        else{
          ldapClient.search(ldapOptions.searchBase.toString(), ldapOptions /*{
            filter: filter,
            attributes: 'dn',
            scope: 'sub'
          }*/, function(err, res){
            res.on('searchEntry', function(entry){
              console.log("first checkpoint")
              const userDN = user.dn;
              ldapClient.modify(userDN, [
                new ldapjs.Change({
                  operation: 'replace',
                  modification: {
                    userPassword: req.body.userPassword
                  }
                })
              ],
              (err)=>{
                if(err){
                  console.log("problème n°2")
                  console.log(err.code);
						      console.log(err.name);
						      console.log(err.message);
						      ldapClient.unbind();
                }
                else{
                  console.log("mot de passe changé avec succes!")
                }
              })
            })
            res.on('error', function(err) {
              console.error('erreur: ' + err.message);
            });
            res.on('end', function(result) {
              console.log('status: ' + result.status);
            });
          })
        }
    })
  }
  /*else if(user.mail!==req.body.mail) {
    res.send({status:404, data: "user non trouvé"})
  }*/
  else { 
    console.error(err)
    }
  (req, res, next)  
})

passport.use(new LdapStrategy(OPTS));

  app.listen(port, ()=> {
      console.log("Le serveur s'execute sur le port: " + port)
  })


  app.post('/login', (req, res, next) => {
    passport.authenticate('ldapauth', (err, user, info) => {
      const error = err || info
      if (error) 
        res.send({
          status: 500,
          data: error
        })
      if (!user){ 
        res.send({
          status: 404,
          data: "Utilisateur non trouvé"
        })
        console.log("user non trouvé")
        return res.redirect('/')
      }
      else {
        console.log("authentification réussi")
        let token = jwt.sign(user, process.env.SECRET_KEY, {
          expiresIn: 3600
        })
        res.send({
          status: 200,
          data: user,
          token
        })
        console.log(token) 
      }
    })(req, res, next)
  })
  
  
  module.exports = app;