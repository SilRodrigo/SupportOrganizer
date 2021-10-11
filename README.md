Essa é uma aplicação bem simples para controlar abertura e encerramentos de chamados
para a área de suporte de uma empresa.

A estruturação foi minimalizada e customizada. Sendo assim o back-end possui apenas duas camadas.
A app.js que recebe as requisições e a core.js que trata e devolve informações do banco.

Você vai precisar instalar NodeJs e MongoDB (Sugiro instalar o MongoDBCompass também).

https://nodejs.org/en/ <br>
https://www.mongodb.com/try/download/community

após essas instalações, na pasta da aplicação
instale os pacotes necessários:

npm install express
npm install cookie-parser
npm install mongoose

Depois siga as instruções da pasta "DocumentosMongoDB" para adicionar alguns pré-cadastros para o sistema.

após isso basta rodar a aplicação com o comando:

node app.js

a porta padrão está configurada para 8080, mas você pode altera-la no arquivo app.js.

Foi criado um usuário padrão:
Usuário: Teste <br>
Senha: 1234

Nessa aplicação disponibilizada não foram incrementados os cadastros pela aplicação, ou seja,
Você precisa criar os usuários e empresas direto pelo mongoDbCompass ou dando os comandos pelo mongoose
Alterando o método manualAdjust existente em app.js e core.js.
