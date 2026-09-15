---
description: "Use quando precisar gerar testes unitários para um módulo do backend com node:test."
name: "Gerar testes unitários"
argument-hint: "Caminho do módulo (ex.: backend/src/services/documentService.js)"
agent: "agent"
---

# Gerar testes unitários do backend

Gere testes unitários para o módulo `${input:modulo:caminho do módulo}` usando o runner nativo `node:test` e `node:assert`.

Requisitos:

- Leia o módulo informado, suas dependências diretas e os testes existentes antes de editar.
- Siga as convenções já usadas em `backend/test`.
- Cubra o comportamento público, incluindo casos de sucesso, entradas inválidas e erros relevantes.
- Isole a unidade com fakes ou stubs simples para as dependências; não teste detalhes internos de implementação.
- Use nomes de testes descritivos em português e organize cada caso em preparação, execução e verificação.
- Não dependa de rede, serviços externos ou estado compartilhado. Crie e remova recursos temporários quando necessário.
- Coloque os testes em `backend/test`, preservando os arquivos existentes e evitando duplicação.
- Não altere o código de produção, exceto quando um defeito comprovado impedir um teste válido; nesse caso, explique e faça a menor correção possível.
- Execute primeiro o arquivo de teste criado ou alterado e depois a suíte completa do backend.
- Ao final, resuma os cenários cobertos e os resultados das validações.
