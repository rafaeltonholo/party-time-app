"use strict";

/// <reference path="../../../typings/angularjs/angular.d.ts"/>
angular.module('partyTimeApp.controllers', [])


    .controller("LoginController", ["$scope", "LoginService", "$state", "$stateParams", "$ionicPopup", "$localstorage",
        function ($scope, LoginService, $state, $stateParams, $ionicPopup, $localstorage) {
            $scope.data = {};

            /**
             * Redireciona página atual para uma rota qualquer
             * @author Rafael R. Tonholo
             * @param route - Rota de destino
             */
            $scope.redirect = function (route) {
                $state.go(route);
            }

            /**
             * Mostra um AlertDialog para feedback para o usuário
             * @author Rafael R. Tonholo
             * @param title - Título do alerta
             * @param message - Mensagem do alerta
             * @param callback - function de callback que será executada quando o usuário apertar OK.
             */
            $scope.showAlert = function (title, message, callback) {
                var alertPoup = $ionicPopup.alert({
                    title: title,
                    template: message
                });

                alertPoup.then(function (res) {
                    if (callback !== null && callback !== undefined && callback instanceof Function) callback();
                })
            }

            /**
             * Efetua o login de pessoa no banco de dados
             * @author Rafael R. Tonholo
             */
            $scope.singin = function () {
                var obj = {
                    login: $scope.data.login,
                    senha: $scope.data.password
                }

                LoginService.singin(obj).success(function (data, status, headers, config) {
                    //Salva usuario atual no localStorage
                    if (data.length > 0)
                        $localstorage.setObject("currentUser", data[0]);

                    $scope.redirect("tab.perfil");
                })
                    .error(function (data, status, headers, config) {
                        if (status == 401) {
                            $scope.showAlert("Erro ao fazer Login", "Login ou senha inválidos", null);
                        }
                    });
            };

            /**
             * Efetua o cadastro de pessoa no banco de dados
             * @author Rafael R. Tonholo
             */
            $scope.singup = function () {
                var pessoa = $scope.data;

                LoginService.singup(pessoa)
                    .success(function (data) {
                        //Salva usuario atual no localStorage
                        if (data.length > 0)
                            $localstorage.setObject("currentUser", data[0]);

                        $scope.showAlert("Cadastro de Pessoa", "Pessoa cadastrada com sucesso!", function () {
                            $scope.redirect("tab.perfil");
                        });
                    })
                    .error(function (data, status, headers, config) {
                        if (status == 412) {
                            var preConditions = "";
                            for (var i = 0; i < data.length; i++) {
                                preConditions += data[i].msg + "<br />";
                            }

                            $scope.showAlert("Dados Obrigatórios", preConditions);
                        }
                    });
            };
        }])

    .controller("PerfilController", ["$scope", "PerfilService", "$state", "$stateParams", "$ionicPopup", "$localstorage",
        function ($scope, PerfilService, $state, $stateParams, $ionicPopup, $localstorage) {

            $scope.perfil = $localstorage.getObject("currentUser");

            $scope.perfil.sexo = getSexo($scope.perfil.sexo);

            /**
             * Redireciona o usuário para a página de convites, para visualizar todos os convites dele
             */
            $scope.showConvites = function () {
                $state.go("tab.convites");
            }

            /**
             * Retorna se o sexo é macho ou mulé
             */
            function getSexo(s) {
                return s.toLowerCase() == 'm' ? 'Macho' : "Mulé";
            }

            /**
             * Função que verifica e retorna quantos convites a pessoa possue pendente
             * @author Rafael R. Tonholo
             * @param id - id do perfil.
             */
            function getConvitePendentes(id) {
                var data = { pessoa_id: id };

                PerfilService.getConvitesPendentes(data.pessoa_id)
                    .success(function (data) {
                        $scope.convitesPendentes = data + " convite(s) pendente(s)";
                    })
                    .error(function (data, status, headers, config) {
                        $scope.convitesPendentes = "0 convite(s) pendente(s)";
                    });
            }

            var eventoVazio = [{ nome: "Nenhum evento participado", show: false }];

            /**
             * Função que busca todos os eventos já participados pela pessoa
             * @author Rafael R. Tonholo
             * @param id - id da pessoa
             */
            function getEventosParticipados(id) {

                PerfilService.getEventosParticipados(id)
                    .success(function (data) {
                        if (data.length === 0) {
                            $scope.eventosParticipados = eventoVazio;
                        } else {
                            data.show = true;
                            $scope.eventosParticipados = data;
                        }
                    })
                    .error(function (data, status, headers, config) {
                        $scope.convitesPendentes = eventoVazio;
                    });
            }

            $scope.convitesPendentes = "0 convite(s) pendente(s)";

            $scope.eventosParticipados = [];

            getConvitePendentes($scope.perfil.id);
            getEventosParticipados($scope.perfil.id);
        }])

    .controller("ConviteController", ["$scope", "ConviteService", "$ionicPopup", "$localstorage", "$state",
        function ($scope, ConviteService, $ionicPopup, $localstorage, $state) {

            $scope.pessoa = $localstorage.getObject("currentUser")

            $scope.convites = [];
            /**
             * Mostra um AlertDialog para feedback para o usuário
             * @author Rafael R. Tonholo
             * @param title - Título do alerta
             * @param message - Mensagem do alerta
             * @param callback - function de callback que será executada quando o usuário apertar OK.
             */
            $scope.showAlert = function (title, message, callback) {
                var alertPoup = $ionicPopup.alert({
                    title: title,
                    template: message
                });

                alertPoup.then(function (res) {
                    if (callback !== null && callback !== undefined && callback instanceof Function) callback();
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
                    .success(function (returnedData) {
                        angular.forEach(returnedData, function (value, key) {
                            value.owner = data.pessoa_id == value.id_pessoa;
                            value.convidado = value.owner ? "Anfitrião" : "Convidado";
                            value.nome_convidado = (value.owner ? "Nome do convidado: " : "Anfitrião: ") + value.nome_convidado;
                        });

                        $scope.convites = returnedData;
                    })
                    .error(function (data, status, headers, config) {
                    });
            };

            function removeConvite(convite) {
                $scope.convites.splice($scope.convites.indexOf(convite), 1);
            };

            $scope.aceitar = function (convite) {
                var data = {
                    pessoa_id: convite.id_pessoa_convidado,
                    convite_id: convite.id,
                    data: {
                        aceito: true
                    }
                };

                ConviteService.aceitar(data)
                    .success(function (data) {
                        $scope.showAlert("Convite", "Convite aceito com sucesso!", function () {
                            removeConvite(convite);
                        });
                    })
                    .error(function (data, status, headers, config) {
                        $scope.showAlert("Convite", "Erro ao aceitar Convite.");
                    });
            };

            $scope.rejeitar = function (convite) {
                var data = {
                    pessoa_id: convite.id_pessoa_convidado,
                    convite_id: convite.id,
                    data: {
                        aceito: false
                    }
                };

                ConviteService.aceitar(data)
                    .success(function (data) {
                        $scope.showAlert("Convite", "Convite rejeitado com sucesso!", function () {
                            removeConvite(convite);
                        });
                    })
                    .error(function (data, status, headers, config) {
                        $scope.showAlert("Convite", "Erro ao rejeitar Convite.");
                    });
            };

            getConvites($scope.pessoa);
        }])

    .controller("EventoController", function ($scope, $state, $stateParams, $localstorage, EventoService) {
        //Recupera o usuário atual
        var currentUser = $localstorage.getObject("currentUser");

        //Realiza a primeira carga
        RetrieveUserEvents();

        /**
         * Função para redirecionar para adicionar um evento
         * @author Kelvin
         */
        $scope.goAddEvent = function () {
            $state.go('tab.eventos-add');
        }

        /**
         * Função para redirecionar para detalhes de um evento
         *
         * @author Rafael R. Tonholo
         */
        $scope.abrirDetalhes = function (idEvento) {
            $state.go("tab.eventos-details", { eventoId: idEvento });
        }

        /**
         * Função para recarregar os dados da tela de eventos
         * @author Kelvin
         */
        $scope.refreshEvents = function () {
            RetrieveUserEvents();
        }

        /**
         * Função para redirecionar para compartilhar convidar outras pessoas
         * @author Kelvin
         */
        $scope.goInvitePeople = function (eventId) {
            $localstorage.set('currentEventId', eventId)
            $state.go('tab.convites-add')
        }

        /**
         * Recupera os eventos do usuário atual
         * @author Kelvin
         */
        function RetrieveUserEvents() {
            EventoService.getEventos(currentUser.id)
                .success(function (eventos) {

                    eventos.forEach(function (element) {
                        element.data = (new Date(element.data)).toLocaleDateString()
                    }, this);

                    $scope.currentUserEvents = eventos;
                });
        }
    })

    .controller("AddEventoController", function ($scope, $state, $ionicPopup, $localstorage, EventoService) {
        $scope.data = {};

        /**
         * Função para adicionar um novo evento
         * @author Kelvin
         */
        $scope.addEvent = function () {
            var currentUser = $localstorage.getObject("currentUser");

            var evento = {
                nome: $scope.data.nome,
                endereco: $scope.data.endereco,
                data: getDate($scope.data.dataEvento),
                quantidade_maxima: $scope.data.quantidadeMaxima,
                id_pessoa_criador: currentUser.id,
                foto: $scope.data.linkUrl
            };

            EventoService.addEvento(currentUser.id, evento)
                .success(function (res) {
                    $state.go('tab.eventos')
                })
                .error(function (res) {

                    if (res.length > 0) {
                        var msg = "";
                        for (var i = 0; i < res.length; i++) {
                            msg += res[i].msg;
                            msg += "<br/>"
                        }

                        var alertPopup = $ionicPopup.alert({
                            title: "Erro",
                            template: msg
                        });

                        alertPopup.then(function (res) { })
                    }
                });

            /**
             * Função que transforma texto em uma data no formato aceito pela api
             * yyyy-MM-dd
             * @author Kelvin
             * @updated Rafael
             */
            function getDate(text) {
                var date = text.split("/");
                if (date[0].length != 2) throw new "DayInvalid";
                if (date[1].length != 2) throw new "MonthInvalid";
                if (date[2].length != 4) throw new "YearInvalid";

                var newDate = new Date(parseInt(date[2]), parseInt(date[1]) - 1, parseInt(date[0]));

                return newDate.toISOString().slice(0, 10);
            }
        };
    })
    .controller("EventoDetailController", function ($scope, $stateParams, $state, $localstorage, EventoService) {
        $scope.evento = {};
        $scope.convidadosEvento = [];

        var convidadosVazio = [{ nome: "Não há convidados para este evento!", hide: true }];

        // Busca os dados do evento.
        EventoService.get($stateParams.eventoId)
            .success(function (data) {
                $scope.evento = data;
                var date = new Date($scope.evento.data);
                var data = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
                $scope.evento.data = data;
                // Busca os participantes do evento solicitado
                EventoService.getParticipantesEvento($scope.evento.id)
                    .success(function (data) {
                        if (data.length === 0) {
                            $scope.convidadosEvento = convidadosVazio;
                        } else {
                            $scope.convidadosEvento = data;
                            $scope.convidadosEvento.forEach(function (element) {
                                element.sexo = element.sexo.toLowerCase() === "m" ? "Macho" : "Muié";
                            })
                        }
                    })
                    .error(function (data, status, headers, config) {
                        $scope.convidadosEvento = convidadosVazio;
                    });
            })
            .error(function (data, status, headers, config) {
                console.error(data);
            });

    })

    .controller("AddConviteController", function ($scope, $localstorage, $stateParams, $state, ConviteService, PessoaService) {

        $scope.pessoaConvidada = {}

        $scope.selecionarPessoa = function () {
            var currentUser = $localstorage.getObject("currentUser");
            var currentEventId = Number($localstorage.get('currentEventId'));

            var pessoaConvidadaId = $scope.pessoaConvidada.id;

            ConviteService.addConvite(currentUser.id, currentEventId, pessoaConvidadaId)
                .success(function (res) {
                    $state.go('tab.eventos')
                });
        }

        PessoaService.getPessoas()
            .success(function (res) {
                $scope.pessoas = res;
            });

    });
