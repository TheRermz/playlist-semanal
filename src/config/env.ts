import dotenv from 'dotenv';
import { EnvConfig } from '../types/index.js';

dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadConfig(): EnvConfig {
  return {
    lastfm: {
      apiKey: getEnvVar('LASTFM_API_KEY'),
      username: getEnvVar('LASTFM_USERNAME'),
    },
    spotify: {
      clientId: getEnvVar('SPOTIFY_CLIENT_ID'),
      clientSecret: getEnvVar('SPOTIFY_CLIENT_SECRET'),
      redirectUri: getEnvVar('SPOTIFY_REDIRECT_URI', 'http://localhost:8888/callback'),
    },
    playlist: {
      name: getEnvVar('PLAYLIST_NAME', 'Top Last.fm - Últimos 7 dias'),
      topTracksLimit: parseInt(getEnvVar('TOP_TRACKS_LIMIT', '30'), 10),
    },
  };
}

export function validateConfig(): boolean {
  try {
    const config = loadConfig();
    console.log('✓ Configuração válida');
    console.log(`  Last.fm: ${config.lastfm.username}`);
    console.log(`  Spotify Client ID: ${config.spotify.clientId.substring(0, 10)}...`);
    console.log(`  Playlist: ${config.playlist.name}`);
    console.log(`  Top Tracks Limit: ${config.playlist.topTracksLimit}`);
    return true;
  } catch (error) {
    console.error('✗ Erro na configuração:', (error as Error).message);
    return false;
  }
}
