var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');


/*Set EJS template Engine*/

app.use(bodyParser.urlencoded({
    extended: true
})); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection = require('express-myconnection'),
    mysql = require('mysql');

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(
    connection(mysql, {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'party',
        debug: false //set true if you wanna see debug logger
    }, 'request')

    );
//gmasters.com.br/party
app.get('/party', function (req, res) {
    res.send('Bem vindo ao party');
});


//RESTful route
var router = express.Router();
/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we hit url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.route("/party/pessoa/login")
    .post(function (req, res, next) {
        req.getConnection(function (err, conn) {

            if (err) {
                console.log(err);
                return next("Cannot Connect")
            };

            var data = {
                login: req.body.login,
                senha: req.body.senha
            };

            var sql = 'SELECT * FROM pessoa where login=? and senha=?';

            //verificar o comportamento de quando envia um parametro nulo
            conn.query(sql, [data.login, data.senha], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (rows.length > 0) {
                    res.statusCode = 200;
                    res.statusMessage = "Usuário logado";
                    res.send(rows);
                } else {
                    res.statusMessage = "Login não autorizado";
                    res.sendStatus(401);
                }
            });
        });
    }
        );
app.route("/party/pessoa")
//Recuperar todas as pessoas cadastradas
    .get(function (req, res, next) {

        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            var sql = 'SELECT * FROM pessoa';

            conn.query(sql, {}, function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.send(rows);
            });
        });
    })
    
//Cadastra uma nova pessoa
    .post(function (req, res, next) {
        //validation	
        req.assert('nome', 'Nome é requerido').notEmpty();
        req.assert('login', 'Login é obrigatorio e deve ser um email válido').isEmail();
        req.assert('senha', 'Senha é obrigatório').notEmpty();
        req.assert('idade', 'Idade é obrigatorio').notEmpty();
        req.assert('sexo', 'Sexo é obrigatorio').notEmpty();
        req.assert('sexo', 'Sexo deve ser M ou F').len(1, 1);

        var errors = req.validationErrors();
        if (errors) {
            res.status(412).json(errors);
            return;
        }
	
        //get data
        var data = {
            nome: req.body.nome,
            login: req.body.login,
            senha: req.body.senha,
            idade: req.body.idade,
            sexo: req.body.sexo,
            avatar: req.body.avatar
        };
		
        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("INSERT INTO pessoa set ? ", data, function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.sendStatus(200);
            });
        });
    });

app.route('/party/pessoa/:pessoa_id')

// Pega pessoa por Id
    .get(function (req, res, next) {

        var pessoa_id = req.params.pessoa_id;

        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            var sql = 'SELECT * FROM pessoa';

            if (pessoa_id) { sql = 'SELECT * FROM pessoa WHERE id = ?'; }

            conn.query(sql, [pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }
                res.send(rows);
            });
        });
    })
    
//Altera uma pessoa
    .put(function (req, res, next) {

        var pessoa_id = req.params.pessoa_id;

        var data = {
            nome: req.body.nome,
            login: req.body.login,
            senha: req.body.senha,
            idade: req.body.idade,
            sexo: req.body.sexo,
            avatar: req.body.avatar
        };

        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("UPDATE pessoa set ? WHERE id = ?", [data, pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }
                res.sendStatus(200);
            });
        });
    })
    
//Deleta a pessoa com id informado
    .delete(function (req, res, next) {

        var pessoa_id = req.params.pessoa_id;
        
        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("DELETE pessoa WHERE id = ?", [pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }
                res.sendStatus(200);
            });
        });
    });


app.route('/party/pessoa/:pessoa_id/evento')

// Insere um evento para a pessoa do id x
    .post(function (req, res, next) {
        //validações
        req.assert('nome', 'Nome é requerido').notEmpty();
        req.assert('endereco', 'Endereço é obrigatorio').notEmpty();
        req.assert('data', 'A Data é obrigatorio').isDate();
        req.assert('quantidade_maxima', 'Quantidade máxima de participantes é obrigatoria').notEmpty().isInt();

        var errors = req.validationErrors();
        if (errors) {
            res.status(412).json(errors);
            return;
        }

        //get data
        var data = {
            nome: req.body.nome,
            endereco: req.body.endereco,
            data: req.body.data,
            quantidade_maxima: req.body.quantidade_maxima,
            id_pessoa_criador: req.params.pessoa_id,
            foto: req.body.foto
        };


        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("SELECT COUNT(1) as count FROM evento WHERE nome = ? AND endereco = ? AND data = ?",
                [data.nome, data.endereco, data.data], function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return next("Mysql error, check your query");
                    }

                    var count = rows[0].count;
                    
                    if (count == 0) {
                        console.log('dados a serem inseridos:');
                        console.log(data);
                        conn.query("INSERT INTO evento set ?", data, function (err, rows) {

                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query");
                            }
                            res.sendStatus(200);

                        });
                    } else {
                        res.statusMessage = "Evento já existe";
                        res.sendStatus(400);//Não autorizado
                    }
                });
        });
    })
    
// Pega todos os eventos da pessoa id x
    .get(function (req, res, next) {

        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            var query =
                "SELECT ev.* FROM evento AS ev " +
                "WHERE EXISTS(" +
                "   SELECT 1 FROM pessoa WHERE pessoa.id = ? AND pessoa.id = ev.id_pessoa_criador" +
                ") OR EXISTS(" +
                "   SELECT 1 FROM participante_evento AS pe WHERE pe.id_pessoa = ? AND pe.id_evento = ev.id" +
                ");";

            conn.query(query, [req.params.pessoa_id, req.params.pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.send(rows);
            });
        });

    });

app.route("/party/pessoa/:pessoa_id/evento/participados")
    .get(function (request, response, next) {
        request.getConnection(function (err, conn) {
            if (err) return next("Cannot Connect");

            var pessoa_id = request.params.pessoa_id;

            var query =
                "SELECT " +
                "    ev.*," +
                "	(" +
                "		SELECT COUNT(1) FROM participante_evento" +
                "		WHERE EXISTS(" +
                "			SELECT 1 FROM convite c" +
                "			WHERE c.id = participante_evento.id_convite" +
                "			AND c.id_evento = ev.id" +
                "		)" +
                "	) participantes " +
                " FROM evento ev " +
                "WHERE EXISTS(" +
                "	SELECT 1 FROM convite c" +
                "	WHERE EXISTS(" +
                "		SELECT 1 FROM participante_evento pe" +
                "		WHERE pe.id_convite = c.id AND" +
                "		pe.id_pessoa = ?" +
                "	) AND c.id_evento = ev.id" +
                ") AND data < NOW()";

            console.log(query);
            console.log(pessoa_id);
            conn.query(query, [pessoa_id], function (err, rows) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                response.send(rows);
            });
        });
    });

app.route("/party/pessoa/:pessoa_id/evento/:evento_id")

// Pega o evento de id x da pessoa y
    .get(function (req, res, next) {

        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            var query = "SELECT ev.* FROM evento AS ev WHERE id = ?";

            //verificar o comportamento de quando envia um parametro nulo
            conn.query(query, [req.params.pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.send(rows);
            });
        });
    })
    
// Atualiza eventos
    .put(function (req, res, next) {
        req.assert('nome', 'Nome é requerido').notEmpty();
        req.assert('endereco', 'Endereço é obrigatorio').notEmpty();
        req.assert('data', 'A Data é obrigatorio').isDate();
        req.assert('quantidade_maxima', 'Quantidade máxima de participantes é obrigatoria').notEmpty().isInt();

        var errors = req.validationErrors();
        if (errors) {
            res.status(412).json(errors);
            return;
        }

        var evento_id = req.params.evento_id;

        var data = {
            nome: req.body.nome,
            endereco: req.body.endereco,
            data: req.body.data,
            quantidade_maxima: req.body.quantidade_maxima,
            foto: req.body.foto
        };

        //update into mysql
        req.getConnection(function (err, conn) {

            if (err) {
                res.sendStatus(500);
                return next("Cannot Connect");
            }

            conn.query("UPDATE evento set ? WHERE id = ?", [data, evento_id], function (err, result) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }

                if (result.changedRows === 0) {
                    res.sendStatus(304);
                } else {
                    res.sendStatus(200);
                }
            });

        });
    }) // fim put
// Deleta eventos
    .delete(function (req, res, next) {

        var evento_id = req.params.evento_id;

        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("DELETE evento WHERE id = ?", [evento_id], function (err, result) {

                if (err) {
                    console.log(err);
                    res.sendStatus(304);
                    return;
                }
                if (result.affectedRows >= 1) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(304);
                }
            });

        });
    }); // fim delete

app.route('/party/pessoa/:pessoa_id/evento/:evento_id/convite/:pessoa_convidada_id')
// Insere um convite para a pessoa do id x
    .post(function (req, res, next) {
        var pessoa_id = req.params.pessoa_id;
        var evento_id = req.params.evento_id;
        var pessoa_convidada_id = req.params.pessoa_convidada_id;

        //get data
        var data = {
            id_evento: evento_id,
            id_pessoa: pessoa_id,
            id_pessoa_convidado: pessoa_convidada_id,
            aceito: 1
        };


        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("SELECT COUNT(1) as count FROM convite WHERE id_evento = ? AND id_pessoa = ? AND id_pessoa_convidado = ?",
                [data.nome, data.endereco, data.data], function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return next("Mysql error, check your query");
                    }

                    var count = rows[0].count;
                    var retorno;

                    if (count == 0) {
                        conn.query("INSERT INTO convite set ? ", data, function (err, rows) {

                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                                return next("Mysql error, check your query");
                            }
                        });
                    } else {
                        retorno = { message: "Evento já existe" };
                    }

                    res.sendStatus(200);
                    res.send(retorno);
                });
        });
    })
// Deleta um convite de um evento para uma pessoa
    .delete(function (req, res, next) {

        var pessoa_id = req.params.pessoa_id;
        var evento_id = req.params.evento_id;
        var id = req.params.id;

        //inserting into mysql
        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            conn.query("DELETE convite WHERE id_evento = ? AND id_pessoa_convidado = ? AND id_pessoa = ?", [evento_id, id, pessoa_id],
                function (err, result) {

                    if (err) {
                        console.log(err);
                        res.sendStatus(304);
                        return;
                    }
                    if (result.affectedRows >= 1) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(304);
                    }
                });

        });
    }); // fim delete

app.route("/party/pessoa/:pessoa_id/convite")
// Pega os convites de pessoa de id x
    .get(function (req, res, next) {
        var pessoa_id = req.params.pessoa_id;

        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            var query = "SELECT " +
                "	c.*, ev.nome, ev.endereco, ev.quantidade_maxima," +
                "	ev.data, ev.foto, p.nome nome_convidado " +
                "FROM convite c " +
                "INNER JOIN evento ev ON ev.id = c.id_evento " +
                "LEFT JOIN pessoa p ON ev.id = c.id_pessoa_convidado = p.id " +
                "WHERE (id_pessoa = ? OR id_pessoa_convidado = ?) AND aceito = -1";

            //verificar o comportamento de quando envia um parametro nulo
            conn.query(query, [pessoa_id, pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.send(rows);
            }); // fim query
        }); // fim getConnection;
    }); // fim get

app.route("/party/pessoa/:pessoa_id/convite/pendentes")
// Pega os convites de pessoa de id x
    .get(function (req, res, next) {
        var pessoa_id = req.params.pessoa_id;

        req.getConnection(function (err, conn) {

            if (err) return next("Cannot Connect");

            var query = "SELECT COUNT(*) count FROM convite WHERE id_pessoa_convidado = ? AND aceito = -1";

            //verificar o comportamento de quando envia um parametro nulo
            conn.query(query, [pessoa_id], function (err, rows) {

                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.send("" + rows[0].count);
            }); // fim query
        }); // fim getConnection;
    });

app.route("/party/pessoa/:pessoa_id/convite/:convite_id")
// Atualiza eventos
    .put(function (req, res, next) {
        req.assert('aceito', 'Aceito é requerido').isBoolean();

        var errors = req.validationErrors();
        if (errors) {
            res.status(412).json(errors);
            return;
        }

        var pessoa_id = req.params.pessoa_id;
        var convite_id = req.params.convite_id;

        var data = {
            aceito: req.body.aceito
        };

        //update into mysql
        req.getConnection(function (err, conn) {

            if (err) {
                res.sendStatus(500);
                return next("Cannot Connect");
            }

            conn.beginTransaction(function (err) {
                if (err) { throw err; }

                console.log(data);

                conn.query("UPDATE convite SET ? WHERE id = ? AND id_pessoa_convidado = ?", [data, convite_id, pessoa_id],
                    function (err, result) {
                        if (err) {
                            console.log(err);
                            res.sendStatus(500);
                            return conn.rollback(function () {
                                throw err;
                            });
                        }

                        if (result.changedRows === 0) {
                            res.sendStatus(304);
                        } else {
                            var participante_evento = {
                                id_pessoa: pessoa_id,
                                id_convite: convite_id
                            };
                            if (data.aceito) {
                                var query = "INSERT INTO participante_evento SET ?";
                                conn.query(query, participante_evento, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.sendStatus(500);
                                        return conn.rollback(function () {
                                            throw err;
                                        });
                                    }

                                    conn.commit(function (err) {
                                        if (err) {
                                            return conn.rollback(function () {
                                                throw err;
                                            });
                                        }

                                        console.log('success!');
                                        res.sendStatus(200);
                                    });
                                });
                            } else {
                                conn.commit(function (err) {
                                    if (err) {
                                        return conn.rollback(function () {
                                            throw err;
                                        });
                                    }

                                    console.log('success!');
                                    res.sendStatus(200);
                                });
                            }
                        } // fim else
                    }); // fim query
            }); //fim beginTran

        }); //fim getConnection
    }); // fim put

//now we need to apply our router here
app.use('/party', router);

//start Server
var server = app.listen(10014, function () {

    console.log("Listening to port %s", server.address().port);
});