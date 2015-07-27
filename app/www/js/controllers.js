/// <reference path="../../../typings/angularjs/angular.d.ts"/>
angular.module('partyTimeApp.controllers', [])

.controller("LoginController", ["$scope", "LoginService", "$state", "$stateParams", "$ionicPopup", 
    function($scope, LoginService, $state, $stateParams, $ionicPopup) {
        $scope.data = {};
        
        /**
         * Redireciona página atual para uma rota qualquer
         * @author Rafael R. Tonholo
         * @param route - Rota de destino
         */    
        $scope.redirect = function(route) {
            $state.go(route);
        }
    
        /**
         * Mostra um AlertDialog para feedback para o usuário
         * @author Rafael R. Tonholo
         * @param title - Título do alerta
         * @param message - Mensagem do alerta
         * @param callback - function de callback que será executada quando o usuário apertar OK.
         */
        $scope.showAlert = function(title, message, callback) {
            var alertPoup = $ionicPopup.alert({
                title: title,
                template: message
            });
            
            alertPoup.then(function(res) {
                if(callback !== null && callback !== undefined && callback instanceof Function) callback();
            })
        }
    
        /**
         * Efetua o login de pessoa no banco de dados
         * @author Rafael R. Tonholo
         */
        $scope.singin = function() {
            var obj = {
                login: $scope.data.login,
                senha: $scope.data.password
            }
            
            LoginService.singin(obj).success(function(data, status, headers, config) {
                $scope.redirect("tab.perfil");
            })
            .error(function(data, status, headers, config) {
                if(status == 401) {
                    $scope.showAlert("Erro ao fazer Login", "Login ou senha inválidos", null);
                }
            });
        };
        
        /**
         * Efetua o cadastro de pessoa no banco de dados
         * @author Rafael R. Tonholo
         */
        $scope.singup = function() {
            var pessoa = $scope.data;
            
            LoginService.singup(pessoa)
                .success(function (data) {
                    $scope.showAlert("Cadastro de Pessoa", "Pessoa cadastrada com sucesso!", function() {
                        $scope.redirect("tab.perfil");
                    });
                })
                .error(function(data, status, headers, config) {
                    if(status == 412) {
                        var preConditions = "";
                        for(var i = 0; i < data.length; i++) {
                            preConditions += data[i].msg + "<br />";
                        }
                        
                        $scope.showAlert("Dados Obrigatórios", preConditions);
                    }
                });
        };
}])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
