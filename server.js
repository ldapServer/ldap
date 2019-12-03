console.log("server starting");

//chargement des modules
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

//decodage du token de connection ___________________________________________
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
//___________________________________________________________________________

app.use(bodyParser.json()) //Définition des modules utilitaires à utiliser avex express + serialization de la session
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

//______________________________________________________________________________

/*2 constantes ont été utilisé pour permettre la modularité des requêtes dans le cas de l'authentification
et dans le cas du changement de mot de passse*/

//Définition des constantes______________________________________
//1 - Définition pour l'authentification (on instancie le serveur en définissant ses variables de connection
const OPTS = { 
    server:{
    url: "ldap://192.168.0.29:389", //url du ldap à remplacer (celui qui est utilisé pour votre connection à phpldapadmin par exemple
    connectTimeout: 3000,
    bindDN: "cn=admin,dc=example,dc=com",//"Domain name" de l'administrateur à préciser (=vos informations vous permettant de vous connecter à phpldapadmin
    bindCredentials: 'hello', //votre mot de passe administrateur (utilisé lors de votre connection à phpldapadmin par exemple)
    searchBase: "dc=example,dc=com",//domain sur lequel se retrouve votre serveur ldap
    searchFilter: "(cn={{username}})",//le champ qui sera associé à votre requête de d'authentification (ici on précise le common name qui sera associé au login de l'utilisateur)
    reconnect: true
    //timeout: ldapConfig.timeout
    }
};

//2 - Définition pour le changement du mot de passe
//la constante est la même sauf que l'on ne l'encapsule pas dans un sous objet (à la différence de la constante OPT)
//Elle sera utilisé avec le module ldapjs
const ldapOptions = {
    url: "ldap://localhost:389",
    connectTimeout: 3000,
    bindDN: "cn=admin,dc=example,dc=com",
    bindCredentials: 'hello',
    searchBase: "dc=example,dc=com",
    searchFilter: "(cn={{username}})",
    reconnect: true
};

//_______________________________________________________________________________


//Définition des requêtes________________________________________________________

//1- Changement de mot de passe
app.put('/update', (req, res, next) => {
  const user = getCurrentUser(req) //token de connection
  const ldapClient = ldapjs.createClient(ldapOptions) //associaction de la constante d'objet de connection avec le module ldapjs
  const username = JSON.stringify(user.cn)
  const passwordOld = JSON.stringify(user.userPassword)
  const filter = JSON.stringify(user.uid)
  const dn = JSON.stringify(user.dn)
  const searchBase = JSON.stringify(ldapOptions.searchBase)
  if(user!==null){ //si le Token est absent, la requête ne s'execute pas
    console.log('ok')
    console.log(user.dn.toString())
    ldapClient.bind(user.dn.toString(), user.userPassword.toString(), function(err, result){  
      if(err){error
        console.log("petit probleme")
        console.('erreur' + err)
      } 
        else{
          ldapClient.search(ldapOptions.searchBase.toString(), ldapOptions, function(err, res){
            res.on('searchEntry', function(entry){
              console.log("first checkpoint")
              const userDN = user.dn;
              ldapClient.modify(userDN, [
                new ldapjs.Change({
                  operation: 'replace', //on précise la nature de l'opération, ici il s'agit d'un changement de variable pour le user connecté 
                  modification: {
                    userPassword: req.body.userPassword //on change le mot de passe avec ce qui sera entré par l'utilisateur
                  }
                })
              ],
              (err)=>{
                if(err){
                  console.log("problème n°2");
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
	
  else { 
    console.error(err)
    }
  (req, res, next)  
})

//authentification
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
        let token = jwt.sign(user, process.env.SECRET_KEY, { //Génération du Token lorsque le user se connecte. Il sera utilisé pour le changement du mot de passe et agira directement sur le user connecté
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

passport.use(new LdapStrategy(OPTS));

  app.listen(port, ()=> {
      console.log("Le serveur s'execute sur le port: " + port)
  })
  
  module.exports = app;
