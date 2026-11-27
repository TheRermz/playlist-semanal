# Playlist Semanal Last.fm → Spotify

Script CLI que sincroniza automaticamente suas 30 músicas mais ouvidas dos últimos 7 dias do Last.fm para uma playlist no Spotify.

## Funcionalidades

- Busca top 30 músicas dos últimos 7 dias do Last.fm
- Cria ou atualiza playlist no Spotify automaticamente
- Pode ser executado manualmente ou via cron job
- Autenticação OAuth segura com o Spotify
- Logs detalhados do processo de sincronização

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Last.fm com histórico de scrobbles
- Conta no Spotify

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Obter Credenciais do Last.fm

1. Acesse https://www.last.fm/api/account/create
2. Crie uma aplicação
3. Copie a API Key

### 3. Obter Credenciais do Spotify

1. Acesse https://developer.spotify.com/dashboard
2. Crie uma nova aplicação
3. Copie o Client ID e Client Secret
4. Em "Edit Settings", adicione `http://localhost:8888/callback` nas Redirect URIs

### 4. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
LASTFM_API_KEY=sua-api-key-do-lastfm
LASTFM_USERNAME=seu-usuario-lastfm

SPOTIFY_CLIENT_ID=seu-client-id-spotify
SPOTIFY_CLIENT_SECRET=seu-client-secret-spotify
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

PLAYLIST_NAME=Top Last.fm - Últimos 7 dias
TOP_TRACKS_LIMIT=30
```

### 5. Validar Configuração

```bash
npm run config
```

## Uso

### Autenticação Inicial

Antes da primeira sincronização, autentique com o Spotify:

```bash
npm run auth
```

Isso abrirá seu navegador para autorizar a aplicação. Após autorizar, os tokens serão salvos localmente.

### Sincronização Manual

Execute a sincronização quando quiser:

```bash
npm run sync
```

O script irá:
1. Buscar suas top 30 músicas dos últimos 7 dias no Last.fm
2. Procurar cada música no Spotify
3. Criar ou atualizar a playlist com as músicas encontradas

### Sincronização Automática (Cron)

Para executar automaticamente toda sexta-feira às 12h:

```bash
crontab -e
```

Adicione a linha:

```bash
0 12 * * 5 cd /caminho/completo/playlist-semanal && /usr/bin/npm run sync >> /tmp/playlist-sync.log 2>&1
```

Substitua `/caminho/completo/playlist-semanal` pelo caminho absoluto do projeto.

## Comandos Disponíveis

- `npm run sync` - Executa sincronização completa
- `npm run auth` - Autentica com Spotify
- `npm run config` - Valida configuração
- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript

## Estrutura do Projeto

```
playlist-semanal/
├── src/
│   ├── index.ts              # CLI principal
│   ├── auth/
│   │   └── spotify-auth.ts   # Autenticação OAuth Spotify
│   ├── config/
│   │   └── env.ts            # Configuração e validação
│   ├── services/
│   │   ├── lastfm.ts         # Integração Last.fm
│   │   ├── spotify.ts        # Integração Spotify
│   │   └── playlist.ts       # Lógica de sincronização
│   └── types/
│       └── index.ts          # Tipos TypeScript
├── .env                      # Variáveis de ambiente (não commitado)
├── .env.example              # Template de configuração
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Erro "Playlist não encontrada"

A playlist será criada automaticamente na primeira execução. Se houver erro, verifique se a autenticação do Spotify está válida.

### Erro "Missing required environment variable"

Verifique se todas as variáveis estão configuradas no arquivo `.env`. Execute `npm run config` para validar.

### Músicas não encontradas no Spotify

Algumas músicas podem não ser encontradas devido a:
- Diferenças nos nomes entre Last.fm e Spotify
- Músicas não disponíveis no Spotify
- Artistas com nomes similares

O script mostrará a lista de músicas não encontradas ao final.

### Token expirado

Os tokens do Spotify são renovados automaticamente. Se houver problema, execute `npm run auth` novamente.

## Segurança

- Arquivos `.env` e `.spotify-tokens.json` estão no `.gitignore`
- Nunca commite credenciais no repositório
- Tokens têm scopes mínimos necessários

## Licença

MIT
