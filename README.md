Essa é uma aplicação bem simples para controlar abertura e encerramentos de chamados
para a área de suporte de uma empresa entre varios colaboradores.<br>
Se um colaborador abrir um chamado todos os outros logados também receberão a notificação.<br>
Também é possível adaptar o código para receber requisições de chamados de fontes externas.

![Alt Text](https://github.com/SilRodrigo/SupportOrganizer/blob/main/Demo/demo1.gif)

A estruturação foi minimalizada e customizada. Sendo assim o back-end possui apenas duas camadas.
A app.js que recebe as requisições e a core.js que trata e devolve informações do banco.

Você vai precisar instalar NodeJs e MongoDB (Sugiro instalar o MongoDBCompass também).

https://nodejs.org/en/ <br>
https://www.mongodb.com/try/download/community

após essas instalações, acesse a pasta da aplicação pelo terminal de sua preferencia(cmd, powershell, vscode, etc) <br>
e instale os pacotes necessários usando os comandos abaixo: <br>

npm install express <br>
npm install cookie-parser <br>
npm install mongoose <br>

Depois siga as instruções da pasta "DocumentosMongoDB" para adicionar alguns pré-cadastros para o sistema.

por fim, execute o seguinte comando:

node app.js

pronto! sua aplicação ja deve estar funcionando <br>
Você pode acessá-la pelo endereço http://localhost:8080/
Ou pelo ip da maquina na qual você levantou a aplicação.

A porta padrão está configurada para 8080, mas você pode altera-la no arquivo app.js.

Para logar: <br>
Usuário: Teste <br>
Senha: 1234

Nessa aplicação disponibilizada não foram incrementados os cadastros pela aplicação, ou seja,
Você precisa criar os usuários e empresas direto pelo mongoDbCompass ou dando os comandos pelo mongoose
Alterando o método manualAdjust existente em app.js e core.js.

Qualquer dúvida/sugestão pode entrar em contato.
Um abraço!
