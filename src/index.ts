#!/usr/bin/env node

import { Command } from 'commander';
import { PlaylistService } from './services/playlist.js';
import { SpotifyAuth } from './auth/spotify-auth.js';
import { validateConfig } from './config/env.js';

const program = new Command();

program
  .name('playlist-semanal')
  .description('Sincroniza músicas mais ouvidas do Last.fm com playlist do Spotify')
  .version('1.0.0');

program
  .command('sync')
  .description('Sincroniza top tracks do Last.fm com playlist do Spotify')
  .action(async () => {
    try {
      const playlistService = new PlaylistService();
      await playlistService.sync();
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Erro:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('auth')
  .description('Realiza autenticação com o Spotify')
  .action(async () => {
    try {
      const auth = new SpotifyAuth();
      await auth.authenticate();
      console.log('\n✓ Autenticação concluída com sucesso!');
      process.exit(0);
    } catch (error) {
      console.error('\n✗ Erro na autenticação:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Valida configuração do arquivo .env')
  .action(() => {
    const isValid = validateConfig();
    process.exit(isValid ? 0 : 1);
  });

program.parse();
