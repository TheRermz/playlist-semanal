import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyAuth } from '../auth/spotify-auth.js';
import { loadConfig } from '../config/env.js';

export class SpotifyService {
  private auth: SpotifyAuth;
  private api!: SpotifyWebApi;
  private config = loadConfig();

  constructor() {
    this.auth = new SpotifyAuth();
  }

  async initialize(): Promise<void> {
    this.api = await this.auth.authenticate();
  }

  async searchTrack(artist: string, track: string): Promise<string | null> {
    try {
      const query = `artist:${artist} track:${track}`;
      const result = await this.api.searchTracks(query, { limit: 1 });

      if (result.body.tracks?.items && result.body.tracks.items.length > 0) {
        return result.body.tracks.items[0].uri;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar: ${artist} - ${track}`, error);
      return null;
    }
  }

  async searchTracksInBatch(tracks: Array<{ artist: string; track: string }>): Promise<{
    foundUris: string[];
    notFound: string[];
  }> {
    const foundUris: string[] = [];
    const notFound: string[] = [];

    console.log(`Buscando ${tracks.length} músicas no Spotify...`);

    for (let i = 0; i < tracks.length; i++) {
      const { artist, track } = tracks[i];
      const uri = await this.searchTrack(artist, track);

      if (uri) {
        foundUris.push(uri);
      } else {
        notFound.push(`${artist} - ${track}`);
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1}/${tracks.length} processadas...`);
      }

      await this.delay(100);
    }

    console.log(`✓ ${foundUris.length}/${tracks.length} músicas encontradas no Spotify`);
    if (notFound.length > 0) {
      console.log(`⚠ ${notFound.length} músicas não encontradas`);
    }

    return { foundUris, notFound };
  }

  async findPlaylist(name: string): Promise<string | null> {
    try {
      const user = await this.api.getMe();
      const userId = user.body.id;

      let offset = 0;
      const limit = 50;

      while (true) {
        const playlists = await this.api.getUserPlaylists(userId, { limit, offset });

        for (const playlist of playlists.body.items) {
          if (playlist.name === name) {
            return playlist.id;
          }
        }

        if (playlists.body.items.length < limit) {
          break;
        }
        offset += limit;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
      throw error;
    }
  }

  async createPlaylist(name: string, description: string = ''): Promise<string> {
    try {
      const user = await this.api.getMe();
      const playlist = await this.api.createPlaylist(name, {
        description,
        public: true,
      });

      console.log(`✓ Playlist "${name}" criada`);
      return playlist.body.id;
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      throw error;
    }
  }

  async getOrCreatePlaylist(name: string): Promise<string> {
    console.log(`Buscando playlist "${name}"...`);
    const existingId = await this.findPlaylist(name);

    if (existingId) {
      console.log(`✓ Playlist encontrada (ID: ${existingId})`);
      return existingId;
    }

    console.log(`Playlist não encontrada, criando...`);
    const description = `Playlist gerada automaticamente com as 30 músicas mais ouvidas dos últimos 7 dias do Last.fm`;
    return await this.createPlaylist(name, description);
  }

  async replacePlaylistTracks(playlistId: string, trackUris: string[]): Promise<void> {
    try {
      const batchSize = 100;

      await this.api.replaceTracksInPlaylist(playlistId, trackUris.slice(0, batchSize));

      for (let i = batchSize; i < trackUris.length; i += batchSize) {
        const batch = trackUris.slice(i, i + batchSize);
        await this.api.addTracksToPlaylist(playlistId, batch);
        await this.delay(100);
      }

      console.log(`✓ Playlist atualizada com ${trackUris.length} músicas`);
    } catch (error) {
      console.error('Erro ao atualizar playlist:', error);
      throw error;
    }
  }

  async getPlaylistInfo(playlistId: string): Promise<{ name: string; url: string }> {
    const playlist = await this.api.getPlaylist(playlistId);
    return {
      name: playlist.body.name,
      url: playlist.body.external_urls.spotify,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
