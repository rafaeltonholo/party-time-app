CREATE TABLE pessoa (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	nome VARCHAR(100) NOT NULL,
	login VARCHAR(100) NOT NULL,
	senha VARCHAR(100) NOT NULL,
	idade INT NOT NULL,
	sexo CHAR(1) NULL,
	avatar TEXT NULL
);

CREATE TABLE evento (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	nome VARCHAR(100) NOT NULL,
	endereco VARCHAR(200) NOT NULL,
	data DATETIME NOT NULL,
	quantidade_maxima INT NOT NULL,
	id_pessoa_criador INT NOT NULL,
	foto TEXT NULL
);

ALTER TABLE evento 
ADD CONSTRAINT FK_evento_pessoa
FOREIGN KEY(id_pessoa_criador) REFERENCES pessoa (id);


CREATE TABLE convite (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	id_pessoa INT NOT NULL,
	id_pessoa_convidado INT NOT NULL,
	id_evento INT NOT NULL,
	aceito BOOL NOT NULL
);

ALTER TABLE convite 
ADD CONSTRAINT FK_convite_pessoa
FOREIGN KEY(id_pessoa) REFERENCES pessoa (id);

ALTER TABLE convite 
ADD CONSTRAINT FK_convite_pessoa_convidado
FOREIGN KEY(id_pessoa_convidado) REFERENCES pessoa (id);

ALTER TABLE convite 
ADD CONSTRAINT FK_convite_evento
FOREIGN KEY(id_evento) REFERENCES evento (id);

CREATE TABLE participante_evento (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	id_pessoa INT NOT NULL,
	id_convite INT NOT NULL
);

ALTER TABLE participante_evento 
ADD CONSTRAINT FK_participante_evento_pessoa
FOREIGN KEY(id_pessoa) REFERENCES pessoa (id);

ALTER TABLE participante_evento 
ADD CONSTRAINT FK_participante_evento_convite
FOREIGN KEY(id_convite) REFERENCES convite (id);


SELECT ev.* FROM evento AS ev
WHERE EXISTS(
   SELECT 1 FROM pessoa WHERE pessoa.id = ? AND pessoa.id = ev.id_pessoa_criador
) OR EXISTS(
   SELECT 1 FROM participante_evento AS pe WHERE pe.id_pessoa = ? AND 
   EXISTS(
	   SELECT 1 FROM convite c WHERE c.id = pe.id_convite 
	   AND c.id_evento = ev.id 
   )
);