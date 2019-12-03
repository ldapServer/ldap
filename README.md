# ldap

Dans cette partie nous avons le code backend qui permet de relier notre frontend au serveur ldap

Nous utlisions LDAP js, passport et jsonwebtoken


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

D'autres informations sont disponibles dans les commentaires du code
