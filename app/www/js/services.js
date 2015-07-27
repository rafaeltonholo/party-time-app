// Tornar o objeto api global.
var api = new ServerAPI();

angular.module('partyTimeApp.services', [])

   //Login service usado para fornecer funções de login
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

.factory("PerfilService", ["$http", function($http) {
    return {
        getConvitesPendentes: function(data) {
            return $http.get(api.pessoa + "/" + data + "/convite/pendentes", postConfig);
        },
        getEventosParticipados: function(data) {
            ///party/pessoa/:pessoa_id
            return $http.get(api.pessoa + "/" + data + "/evento/participados", postConfig);
        }
    };
}])

.factory("ConviteService", ["$http", function($http) {
    return { 
        getConvites: function(data) {
            return $http.get(api.pessoa + "/" + data.pessoa_id + "/convite/", postConfig);
        },
        aceitar: function(data) {
            return $http.put(api.pessoa + "/" + data.pessoa_id + "/convite/" + data.convite_id, data.data, postConfig);
        }
    };
}])

.factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
      }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
      }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
      }, {
        id: 4,
        name: 'Mike Harrington',
        lastText: 'This is wicked good ice cream.',
        face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
      }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        };
        return null;
      }
      
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