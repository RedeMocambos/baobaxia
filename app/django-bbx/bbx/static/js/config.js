/***
 * config.js
 *
 * Arquivo de configuração da interface do Baobáxia 
 * Aqui são definidas as variáveis básicas de ambiente da interface.
 *
 */

// inicializa variável global BBX
if (typeof BBX === 'undefined') {
    BBX = {};
}

/***
 * EDITAR A PARTIR DAQUI
 */
BBX.config = {
    "imagePath": "/images",
    "apiUrl": "/api",
    "interfaceUrl": "/#",
    "MYMUCUA":"namaste",
    "MYREPOSITORY": "mocambos",
    "userLang": "pt_BR"
}
/***
 * NÃO EDITAR DAQUI EM DIANTE
 */

// set userLang shortcut
BBX.userLang = BBX.config.userLang;

// normalize language code from 'xx-xx', 'xx_xx' or whatelse to 'xx_XX'
BBX.reMatches = null,
BBX.reLang = /([a-zA-Z]{2})[\-\_]([a-zA-Z]{2})/;
BBX.reMatches = BBX.userLang.match(BBX.reLang);
BBX.userLang = BBX.reMatches[1] + '_' + BBX.reMatches[2].toUpperCase();
