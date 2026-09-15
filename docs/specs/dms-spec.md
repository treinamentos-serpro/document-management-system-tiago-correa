# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários enviem, consultem e baixem documentos armazenados localmente, com metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos via formulário `multipart/form-data`.
- Armazenamento dos arquivos no filesystem local.
- Listagem dos documentos enviados.
- Download de um documento por identificador.
- Associação de cada documento a um usuário proprietário.
- Validação básica de entrada e tratamento de erros.
- Interface React para upload, listagem e download.
- API HTTP desenvolvida com Express.
- Testes automatizados das principais operações da API.

### Fora do escopo

- Armazenamento em nuvem ou em provedores externos.
- Banco de dados persistente.
- Versionamento de documentos.
- Autenticação e autorização completas.
- Compartilhamento entre usuários.
- Pastas, tags ou categorização avançada.
- Busca textual no conteúdo dos arquivos.
- Conversão ou processamento do conteúdo dos documentos.
- Exclusão ou edição de documentos, salvo decisão futura.
- Controle de acesso baseado em papéis.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário deve conseguir enviar um documento por meio de um formulário. |
| RF-02 | O upload deve aceitar uma requisição `multipart/form-data` contendo o campo `file`. |
| RF-03 | O sistema deve gerar um identificador único para cada documento. |
| RF-04 | O sistema deve gravar o arquivo no diretório local `backend/storage`. |
| RF-05 | O sistema deve registrar os metadados do documento após o upload. |
| RF-06 | O sistema deve listar os documentos disponíveis. |
| RF-07 | O sistema deve permitir o download de um documento pelo identificador. |
| RF-08 | O sistema deve retornar erro apropriado quando o identificador não existir. |
| RF-09 | O sistema deve rejeitar requisições de upload sem arquivo. |
| RF-10 | O sistema deve preservar o nome original do arquivo nos metadados. |
| RF-11 | O sistema deve registrar tamanho e data/hora do upload. |
| RF-12 | O sistema deve associar o documento a um proprietário. |
| RF-13 | A interface deve informar estados de carregamento, sucesso e erro. |
| RF-14 | A interface deve atualizar a listagem após um upload bem-sucedido. |
| RF-15 | O endpoint `/health` deve continuar respondendo com o estado da aplicação. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser armazenados exclusivamente no filesystem local da aplicação. |
| RNF-02 | O upload deve utilizar `multer` com `diskStorage`. |
| RNF-03 | Os metadados devem permanecer em memória nesta primeira versão. |
| RNF-04 | A configuração deve ser feita por variáveis de ambiente sempre que aplicável. |
| RNF-05 | O backend deve utilizar Node.js, Express e CommonJS. |
| RNF-06 | O frontend deve utilizar React, Vite e módulos ESM. |
| RNF-07 | O backend deve respeitar o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-08 | Controllers não devem conter regras de persistência ou negócio. |
| RNF-09 | Services não devem depender diretamente de objetos de requisição ou resposta HTTP. |
| RNF-10 | Repositories devem encapsular acesso ao filesystem e à coleção de metadados. |
| RNF-11 | A API deve retornar JSON para respostas de sucesso ou erro, exceto no download. |
| RNF-12 | O download deve retornar o conteúdo binário com nome de arquivo apropriado. |
| RNF-13 | O sistema deve usar códigos HTTP coerentes e mensagens de erro legíveis. |
| RNF-14 | O sistema deve impedir que nomes de arquivos fornecidos pelo usuário