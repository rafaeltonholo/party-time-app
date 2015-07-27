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

.controller("PerfilController", ["$scope", "PerfilService", "$state", "$stateParams", "$ionicPopup", 
    function($scope, PerfilService, $state, $stateParams, $ionicPopup) {
        // TODO: Verificar como passar este perfil da view de singin para cá.
        $scope.perfil = {
            id: 1,
            nome: "Rafael Ribeiro Tonholo",
            idade: 22,
            sexo: "Masculino",
            avatar: "https://fbcdn-sphotos-d-a.akamaihd.net/hphotos-ak-xfp1/v/t1.0-9/1925284_700811609969826_1050477551_n.jpg?oh=58932513002513dba7e5682cb62eded7&oe=5659D9CB&__gda__=1443809892_c2da02d23ea01b23f6c9f2b7f23d6b89"
        };
        
        /**
         * Redireciona o usuário para a página de convites, para visualizar todos os convites dele
         */
        $scope.showConvites = function() {
            $state.go("tab.convites");
        } 
        
        /**
         * Função que verifica e retorna quantos convites a pessoa possue pendente
         * @author Rafael R. Tonholo
         * @param id - id do perfil.
         */
        function getConvitePendentes (id) {
            var data = {pessoa_id: id};
            
            PerfilService.getConvitesPendentes(data.pessoa_id)
                .success(function(data) {
                    $scope.convitesPendentes = data + " convite(s) pendente(s)";
                })
                .error(function(data, status, headers, config) {
                    $scope.convitesPendentes = "0 convite(s) pendente(s)";
                });
        }
        
        var eventoVazio = [{ nome: "Nenhum evento participado" }];
        
        /**
         * Função que busca todos os eventos já participados pela pessoa
         * @author Rafael R. Tonholo
         * @param id - id da pessoa
         */
        function getEventosParticipados(id) {
            
            PerfilService.getEventosParticipados(id)
                .success(function(data) {
                    if(data.length === 0) {
                        $scope.eventosParticipados = eventoVazio;
                    } else {
                        $scope.eventosParticipados = data;
                    }
                })
                .error(function(data, status, headers, config) {
                    $scope.convitesPendentes = eventoVazio;
                });
        } 
        
        $scope.convitesPendentes = "0 convite(s) pendente(s)";
        
        $scope.eventosParticipados = [];
        
        getConvitePendentes($scope.perfil.id);
        getEventosParticipados($scope.perfil.id);
}])

.controller("ConviteController", ["$scope", "ConviteService", "$ionicPopup", function($scope, ConviteService, $ionicPopup) {
    // TODO: pegar id da pessoa via login.
    $scope.pessoa = {
        id: 1
    };
    
    $scope.convites = [];
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
     * Busca no servidor os convites relacionados a esta pessoa.
     * @author Rafael R. Tonholo
     * @param pessoa - Pessoa que possui os convites.
     */
    function getConvites(pessoa) {
        var data = {
            pessoa_id: pessoa.id
        };
        
        ConviteService.getConvites(data)
            .success(function(returnedData) {
                angular.forEach(returnedData, function(value, key) {
                    value.owner = data.pessoa_id == value.id_pessoa;
                    value.convidado = value.owner ? "Anfitrião" : "Convidado";
                    if(value.owner) value.nome_convidado = "Nome do convidado: " + value.nome_convidado; 
                });
                
                $scope.convites = returnedData; 
            })
            .error(function(data, status, headers, config) {
            });
    };
    
    function removeConvite(convite) {
        $scope.convites.splice($scope.convites.indexOf(convite), 1);
    };
    
    $scope.aceitar = function(convite) {
        var data = {
            pessoa_id: convite.id_pessoa_convidado,
            convite_id: convite.id,
            data: {
                aceito: true
            }
        };
        
        ConviteService.aceitar(data)
            .success(function(data) {
                $scope.showAlert("Convite", "Convite aceito com sucesso!", function() {
                    removeConvite(convite);
                });
            })
            .error(function(data, status, headers, config) {
                $scope.showAlert("Convite", "Erro ao aceitar Convite.");
            });
    };
    
    $scope.rejeitar = function(convite) {
        var data = {
            pessoa_id: convite.id_pessoa_convidado,
            convite_id: convite.id,
            data: {
                aceito: false
            }
        };
        
        ConviteService.aceitar(data)
            .success(function(data) {
                $scope.showAlert("Convite", "Convite rejeitado com sucesso!", function() {
                    removeConvite(convite);
                });
            })
            .error(function(data, status, headers, config) {
                $scope.showAlert("Convite", "Erro ao rejeitar Convite.");
            });
    };
    
    getConvites($scope.pessoa);
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
