# ldap

Dans cette partie nous avons le code backend qui permet de relier notre frontend au serveur ldap

Nous utlisions LDAP js, passport et jsonwebtoken


//Définition des constantes______________________________________</br>
//1 - Définition pour l'authentification (on instancie le serveur en définissant ses variables de connection <br/>
const OPTS = { </br>
    server:{</br>
    url: "ldap://192.168.0.29:389", //url du ldap à remplacer (celui qui est utilisé pour votre connection à phpldapadmin par exemple </br>
    connectTimeout: 3000,</br>
    bindDN: "cn=admin,dc=example,dc=com",//"Domain name" de l'administrateur à préciser (=vos informations vous permettant de vous connecter à phpldapadmin</br>
    bindCredentials: 'hello', //votre mot de passe administrateur (utilisé lors de votre connection à phpldapadmin par exemple)</br>
    searchBase: "dc=example,dc=com",//domain sur lequel se retrouve votre serveur ldap</br>
    searchFilter: "(cn={{username}})",//le champ qui sera associé à votre requête de d'authentification (ici on précise le common name qui sera associé au login de l'utilisateur)</br>
    reconnect: true</br>
    //timeout: ldapConfig.timeout</br>
    }</br>
};</br>

//2 - Définition pour le changement du mot de passe</br>
//la constante est la même sauf que l'on ne l'encapsule pas dans un sous objet (à la différence de la constante OPT)</br>
//Elle sera utilisé avec le module ldapjs</br>
const ldapOptions = {</br>
    url: "ldap://localhost:389",</br>
    connectTimeout: 3000,</br>
    bindDN: "cn=admin,dc=example,dc=com",</br>
    bindCredentials: 'hello',</br>
    searchBase: "dc=example,dc=com",</br>
    searchFilter: "(cn={{username}})",</br>
    reconnect: true</br>
};</br>

D'autres informations sont disponibles dans les commentaires du code</br>
