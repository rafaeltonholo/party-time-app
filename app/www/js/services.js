
angular.module('partyTimeApp.services', [])

   //Login service usado para fornecer funções de login
  .factory("LoginService", ["$http", function ($http) {
    var api = new ServerAPI();
    return {
      singup: function (data) {
        return $http.post(api.pessoa, data, postConfig)
      },
      singin: function (data) {
        return $http.post(api.login, data, postConfig)
      }
      
    };
  }])

.factory("PerfilService", ["$http", function($http) {
    return {
        getConvitesPendentes: function(data) {
            return $http.get(SERVER_ADDRESS + "/party/pessoa/" + data + "/convite/pendentes", {
                header: {
                    "Content-Type": "application/json"
                }
            });
        },
        getEventosParticipados: function(data) {
            
        }
    };
}])

.factory("ConviteService", ["$http", function($http) {
    return { 
        getConvites: function(data) {
            return $http.get(SERVER_ADDRESS + "/party/pessoa/" + data.pessoa_id + "/convite/", {
                header: {
                    "Content-Type": "application/json"
                }
            });
        },
        aceitar: function(data) {
            return $http.put(SERVER_ADDRESS + "/party/pessoa/" + data.pessoa_id + "/convite/" + data.convite_id, data.data, {
                header: {
                    "Content-Type": "application/json"
                }
            });
        }
    };
}])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array


        }
        return null;
      }
      return null;
    }
  };
});
    };
  });
  
var postConfig = {
  header: {
    "Content-Type": "application/json"
  }
}
function ServerAPI() {
  //Declara url base para a api do server
  var serverRootUrl = "http://127.0.0.1:10014/party/";
  
  //Declara propriedades com endpoint de cada recurso da api
  this.pessoa = serverRootUrl + "pessoa";
  this.login = serverRootUrl + "pessoa/login";
}