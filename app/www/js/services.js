// Tornar o objeto api global.
var api = new ServerAPI();

angular.module('partyTimeApp.services', [])

  /**
   * Factory do objeto $localStorage. Objeto para fácil acesso dos controllers aos dados armazenados baseado em chave/valor.
   * @author Kelvin R. Ferreira
   * @param $window - objeto window enviado para a factory. É utilizado o localStorage deste objeto
   */
  .factory('$localstorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }])

  /**
   * Login service usado para fornecer funções de login
   * @author Rafael R. Tonholo
   */
  .factory("LoginService", ["$http", function ($http) {

    return {
      singup: function (data) {
        return $http.post(api.pessoa, data, postConfig)
      },
      singin: function (data) {
        return $http.post(api.login, data, postConfig)
      }

    };
  }])

  /**
   * Perfil service usado para fornecer funções do perfil
   * @author Rafael R. Tonholo
   */
  .factory("PerfilService", ["$http", function ($http) {
    return {
      getConvitesPendentes: function (data) {
        return $http.get(api.pessoa + "/" + data + "/convite/pendentes", postConfig);
      },
      getEventosParticipados: function (data) {
        return $http.get(api.pessoa + "/" + data + "/evento/participados", postConfig);
      }
    };
  }])

  /**
   * Convite service usado para fornecer funções do convite
   * @author Rafael R. Tonholo
   */
  .factory("ConviteService", ["$http", function ($http) {
    return {
      getConvites: function (data) {
        return $http.get(api.pessoa + "/" + data.pessoa_id + "/convite/", postConfig);
      },
      aceitar: function (data) {
        return $http.put(api.pessoa + "/" + data.pessoa_id + "/convite/" + data.convite_id, data.data, postConfig);
      },
      getConvitesPendentes: function (data) {
        return $http.get(api.pessoa + "/" + data + "/convite/pendentes", postConfig);
      },
      getEventosParticipados: function (data) { }
    };
  }]);
  
/**
 * Objeto que representa a configuração dos métodos post
 * @author Kelvin R. Ferreira
 */
var postConfig = { header: { "Content-Type": "application/json" } };

/**
 * Objeto que representa as urls da nossa api
 * @author Kelvin R. Ferreira
 */
function ServerAPI() {
  //Declara url base para a api do server
  var serverRootUrl = "http://127.0.0.1:10014/party/";
  
  //Declara propriedades com endpoint de cada recurso da api
  this.pessoa = serverRootUrl + "pessoa";
  this.login = serverRootUrl + "pessoa/login";
};