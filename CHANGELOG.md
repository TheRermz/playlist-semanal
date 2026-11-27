# Changelog - Playlist Semanal

## 2026-11-26 - Versão Inicial

### Implementado

- **Stack**: Node.js + TypeScript
- **Funcionalidade**: Sincroniza top 30 músicas dos últimos 7 dias do Last.fm para playlist do Spotify
- **Arquitetura**:
  - `src/auth/spotify-auth.ts` - OAuth do Spotify com servidor local
  - `src/services/lastfm.ts` - Integração Last.fm API
  - `src/services/spotify.ts` - Integração Spotify API
  - `src/services/playlist.ts` - Lógica de sincronização
  - `src/index.ts` - CLI (comandos: sync, auth, config)

### Configuração

- **Playlist**: "Semaninha Murilo Fischer"
- **Músicas**: Top 30 dos últimos 7 dias
- **Agendamento**: Toda sexta-feira às 12h (cron)
- **Notificações**: Mensagens em terminais abertos + notificação desktop

### Problemas Resolvidos

#### 1. Spotify OAuth Redirect URI

- **Problema**: Spotify passou a exigir HTTPS mesmo para localhost
- **Solução**: Usar `http://127.0.0.1:8888/callback` em vez de `localhost`
- **Config Dashboard**: Adicionar URI exata no Spotify Developer Dashboard

#### 2. Spotify API Breaking Changes (Fevereiro 2026)

- **Problema**: Biblioteca `spotify-web-api-node` v5.0.2 usa endpoints depreciados
- **Endpoints removidos**: `/playlists/{id}/tracks`
- **Novos endpoints**: `/playlists/{id}/items`
- **Solução**: Implementar chamadas diretas com axios para:
  - `PUT /v1/playlists/{id}/items` (substituir músicas)
  - `POST /v1/playlists/{id}/items` (adicionar músicas)
  - `POST /v1/users/{id}/playlists` (criar playlist)
- **Referência**: [Spotify February 2026 Migration Guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)

#### 3. TypeScript - Zero `any`

- **Problema**: Uso de `any` na tipagem da API do Last.fm
- **Solução**: Criados tipos específicos:
  - `LastFmApiTrack` - Response da API Last.fm
  - `LastFmApiResponse` - Wrapper completo da response
- **Arquivo**: `src/types/index.ts`

#### 4. Notificações em Terminais

- **Problema**: Enviar mensagens para terminais abertos do usuário
- **Solução**: Script `sync-with-notify.sh` que:
  - Escreve em `/dev/pts/*` (todos terminais abertos)
  - Envia `notify-send` para notificação desktop
  - Loga no syslog via `logger`

### Comandos

```bash
# Autenticar
npm run auth

# Sincronizar manualmente
npm run sync

# Validar config
npm run config

# Build
npm run build

# Testar notificações
./sync-with-notify.sh
```

### Cron Job

```
0 12 * * 5 /home/hellmas/projetos/projetos-2027/playlist-semanal/sync-with-notify.sh
```

### Arquivos Importantes

- `.env` - Credenciais (gitignored)
- `.spotify-tokens.json` - Tokens OAuth (gitignored)
- `/tmp/playlist-sync.log` - Logs de execução

### Dependências Críticas

```json
{
  "spotify-web-api-node": "^5.0.2", // DESATUALIZADA - usar chamadas diretas
  "axios": "^1.6.0",
  "dotenv": "^16.3.1",
  "commander": "^11.1.0"
}
```

### TODOs Futuros

- [ ] Migrar completamente para `@spotify/web-api-ts-sdk` quando suportar endpoints `/items`
- [ ] Adicionar retry com backoff exponencial
- [ ] Histórico de sincronizações (banco de dados local?)
- [ ] Suporte para múltiplos períodos (7 dias, 1 mês, 1 ano)
- [ ] Dashboard web simples
- [ ] Testes automatizados
