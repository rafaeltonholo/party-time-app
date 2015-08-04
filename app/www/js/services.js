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

    return {
        //Declara propriedades com endpoint de cada recurso da api
        pessoa: serverRootUrl + "pessoa",
        login: serverRootUrl + "pessoa/login",
        pessoaEventos: serverRootUrl + "pessoa/{id_pessoa}/evento",
        evento: serverRootUrl + "evento/{id_evento}",
        eventoParticipantes: serverRootUrl + "evento/participantes/{id_evento}",
        pessoaEventos: serverRootUrl + "pessoa/{id_pessoa}/evento",
        addEvento: serverRootUrl + "pessoa/{id_pessoa}/evento",
        addConvite: serverRootUrl + "pessoa/{id_pessoa}/evento/{id_evento}/convite/{id_pessoa_convidada}"
    }
};

// Tornar o objeto api global.
var api = ServerAPI();

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
          addConvite: function (pessoaId, eventoId, pessoaConvidadaId) {
              return $http.post(api.addConvite
                .replace("{id_pessoa}", pessoaId)
                .replace("{id_evento}", eventoId)
                .replace("{id_pessoa_convidada}", pessoaConvidadaId), postConfig)
          },
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
  }])

/**
 * Servico de consultas de eventos
 * @author Kelvin
 */
  .factory("EventoService", ["$http", function ($http) {
      return {
          /**
           * Busca um evento pelo seu id
           *
           * @author Rafael R. Tonholo
           * @param idEvento - id do evento
           */
          get: function (idEvento) {
              return $http.get(api.evento.replace("{id_evento}", idEvento), postConfig);
          },
          getEventos: function (idPessoa) {
              return $http.get(api.pessoaEventos.replace('{id_pessoa}', idPessoa), postConfig);
          },

          /**
           * Busca os participantes de um evento
           *
           * @author Rafael R. Tonholo
           * @param idEvento - id do evento
           */
          getParticipantesEvento: function (idEvento) {
              return $http.get(api.eventoParticipantes.replace("{id_evento}", idEvento), postConfig);
          },
          addEvento: function (idPessoa, data) {
              return $http.post(api.addEvento.replace('{id_pessoa}', idPessoa), data, postConfig)
          }
      };
  }])

/**
 * Serviço de consultas de pessoas
 * @author Kelvin
 */
  .factory("PessoaService", ["$http", function ($http) {
      return {
          getPessoas: function () {
              return $http.get(api.pessoa, postConfig);
          }
      }
  }]);