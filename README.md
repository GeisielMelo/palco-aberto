# Projeto Acadêmico - Palco Aberto

Sistema web para divulgar a programação de apresentações culturais de um evento noturno.

## Objetivo

Permitir que o público consulte eventos, horários e participantes, que artistas mantenham o próprio perfil e que a administração gerencie eventos, programação e usuários.

## Funcionalidades

- Página de cada evento com a programação ordenada por horário e destaque da apresentação atual e da próxima.
- Página de cada participante com dados, redes sociais e apresentações.
- Cadastro e login com JWT e senhas protegidas por bcrypt.
- Papéis de acesso: padrão (navega e cria o próprio perfil de artista), participante (edita o perfil e acompanha as suas apresentações) e administrador (gerencia o sistema).
- Área administrativa para cadastrar, editar e excluir eventos, participantes e apresentações, além de gerenciar os usuários.

## Tecnologias

Node.js, Express, SQLite (better-sqlite3), EJS, Bootstrap 5, Bootstrap Icons, jsonwebtoken e bcryptjs.

## Estrutura

```text
app.js         configuração do Express
database/      conexão, criação das tabelas e seed
middlewares/   autenticação e controle de acesso
models/        consultas ao banco
lib/           validação, formatação e regras da programação
routes/        rotas públicas, da conta e administrativas
views/         páginas EJS
public/        JavaScript do navegador
```

## Pré-requisitos

Node.js 20 ou superior e npm.

## Instalação e execução

```bash
npm install
npm run seed
npm start
```

Acesse `http://localhost:3000`. As variáveis `PORT` e `JWT_SECRET` são opcionais.

## Banco de dados

O arquivo `database.sqlite` e as tabelas `events`, `participants`, `performances` e `users` são criados automaticamente na primeira execução. O comando `npm run seed` apaga os dados atuais e insere os dados de demonstração.

## Dados de demonstração

Dois eventos (Noite Cultural e Sarau da Primavera), quatro participantes, seis apresentações e as contas abaixo.

| Papel | E-mail | Senha |
| --- | --- | --- |
| Administrador | admin@palcoaberto.local | admin |
| Participante | joao@palcoaberto.local | joao |
| Padrão | carla@palcoaberto.local | carla |

## Rotas principais

| Rotas | Acesso |
| --- | --- |
| `/`, `/eventos/:id`, `/participantes`, `/participantes/:id`, `/entrar`, `/cadastro` | Público |
| `/conta`, `/conta/perfil` | Usuário logado |
| `/admin`, `/admin/eventos`, `/admin/participantes`, `/admin/apresentacoes`, `/admin/usuarios` | Administrador |

## Limitações

- Não há recuperação de senha.
- O destaque da apresentação atual usa o horário do servidor e só muda quando a página é recarregada.
- Não há verificação de conflito de horário entre apresentações do mesmo palco.
