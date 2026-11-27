import axios from 'axios';
import { LastFmTrack, LastFmApiResponse, LastFmApiTrack } from '../types/index.js';
import { loadConfig } from '../config/env.js';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';

export class LastFmService {
  private config = loadConfig();

  async getTopTracks(limit: number = 50): Promise<LastFmTrack[]> {
    try {
      const response = await axios.get<LastFmApiResponse>(LASTFM_API_URL, {
        params: {
          method: 'user.gettoptracks',
          user: this.config.lastfm.username,
          api_key: this.config.lastfm.apiKey,
          period: '7day',
          limit,
          format: 'json',
        },
      });

      if (!response.data.toptracks?.track) {
        throw new Error('Nenhuma música encontrada no Last.fm');
      }

      const tracks: LastFmApiTrack[] = Array.isArray(response.data.toptracks.track)
        ? response.data.toptracks.track
        : [response.data.toptracks.track];

      return tracks.map((track) => ({
        artist: track.artist.name,
        track: track.name,
        playcount: parseInt(track.playcount, 10),
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Usuário '${this.config.lastfm.username}' não encontrado no Last.fm`);
        }
        throw new Error(`Erro ao buscar dados do Last.fm: ${error.message}`);
      }
      throw error;
    }
  }

  async getTopTracksWithRetry(limit: number = 50, maxRetries: number = 3): Promise<LastFmTrack[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Buscando top ${limit} músicas do Last.fm...`);
        const tracks = await this.getTopTracks(limit);
        console.log(`✓ ${tracks.length} músicas encontradas`);
        return tracks;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        console.log(`⚠ Tentativa ${attempt} falhou, tentando novamente...`);
        await this.delay(1000 * attempt);
      }
    }
    throw new Error('Failed after all retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
