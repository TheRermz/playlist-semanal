import SpotifyWebApi from 'spotify-web-api-node';
import http from 'http';
import { promises as fs } from 'fs';
import { SpotifyTokens } from '../types/index.js';
import { loadConfig } from '../config/env.js';

const TOKENS_FILE = '.spotify-tokens.json';

export class SpotifyAuth {
  private spotifyApi: SpotifyWebApi;
  private config = loadConfig();

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: this.config.spotify.clientId,
      clientSecret: this.config.spotify.clientSecret,
      redirectUri: this.config.spotify.redirectUri,
    });
  }

  async loadTokens(): Promise<SpotifyTokens | null> {
    try {
      const data = await fs.readFile(TOKENS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async saveTokens(tokens: SpotifyTokens): Promise<void> {
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  }

  async refreshAccessToken(): Promise<void> {
    const tokens = await this.loadTokens();
    if (!tokens) {
      throw new Error('No tokens found. Please authenticate first.');
    }

    this.spotifyApi.setRefreshToken(tokens.refreshToken);
    const data = await this.spotifyApi.refreshAccessToken();

    const newTokens: SpotifyTokens = {
      accessToken: data.body.access_token,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + data.body.expires_in * 1000,
    };

    await this.saveTokens(newTokens);
    this.spotifyApi.setAccessToken(newTokens.accessToken);
  }

  async authenticate(): Promise<SpotifyWebApi> {
    const tokens = await this.loadTokens();

    if (tokens) {
      if (Date.now() < tokens.expiresAt) {
        this.spotifyApi.setAccessToken(tokens.accessToken);
        this.spotifyApi.setRefreshToken(tokens.refreshToken);
        console.log('✓ Usando tokens salvos');
        return this.spotifyApi;
      } else {
        console.log('⟳ Tokens expirados, renovando...');
        await this.refreshAccessToken();
        return this.spotifyApi;
      }
    }

    console.log('Iniciando autenticação OAuth...');
    return this.performOAuthFlow();
  }

  private async performOAuthFlow(): Promise<SpotifyWebApi> {
    const scopes = ['playlist-modify-public', 'playlist-modify-private', 'playlist-read-private'];
    const authorizeURL = this.spotifyApi.createAuthorizeURL(scopes, 'state');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Abra este URL no navegador para autorizar:');
    console.log(authorizeURL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const code = await this.startCallbackServer();

    const data = await this.spotifyApi.authorizationCodeGrant(code);
    const tokens: SpotifyTokens = {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresAt: Date.now() + data.body.expires_in * 1000,
    };

    await this.saveTokens(tokens);
    this.spotifyApi.setAccessToken(tokens.accessToken);
    this.spotifyApi.setRefreshToken(tokens.refreshToken);

    console.log('✓ Autenticação concluída com sucesso!');
    return this.spotifyApi;
  }

  private startCallbackServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url || '', `http://localhost:8888`);
        const code = url.searchParams.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #1DB954;">✓ Autenticação concluída!</h1>
                <p>Você pode fechar esta janela e voltar ao terminal.</p>
              </body>
            </html>
          `);
          server.close();
          resolve(code);
        } else {
          res.writeHead(400);
          res.end('No code received');
          server.close();
          reject(new Error('No code received'));
        }
      });

      server.listen(8888, () => {
        console.log('Servidor de callback aguardando em http://localhost:8888/callback');
      });

      server.on('error', reject);
    });
  }

  getApi(): SpotifyWebApi {
    return this.spotifyApi;
  }
}
