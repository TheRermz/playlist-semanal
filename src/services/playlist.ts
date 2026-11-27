import { LastFmService } from './lastfm.js';
import { SpotifyService } from './spotify.js';
import { SyncResult } from '../types/index.js';
import { loadConfig } from '../config/env.js';

export class PlaylistService {
  private lastfm: LastFmService;
  private spotify: SpotifyService;
  private config = loadConfig();

  constructor() {
    this.lastfm = new LastFmService();
    this.spotify = new SpotifyService();
  }

  async sync(): Promise<SyncResult> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Iniciando sincronização Last.fm → Spotify');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await this.spotify.initialize();

    const tracks = await this.lastfm.getTopTracksWithRetry(this.config.playlist.topTracksLimit);

    if (tracks.length === 0) {
      throw new Error('Nenhuma música encontrada no Last.fm');
    }

    console.log(`\nTop 5 músicas mais ouvidas:`);
    tracks.slice(0, 5).forEach((track, i) => {
      console.log(`  ${i + 1}. ${track.artist} - ${track.track} (${track.playcount} plays)`);
    });
    console.log('');

    const { foundUris, notFound } = await this.spotify.searchTracksInBatch(tracks);

    if (foundUris.length === 0) {
      throw new Error('Nenhuma música encontrada no Spotify');
    }

    const playlistId = await this.spotify.getOrCreatePlaylist(this.config.playlist.name);

    await this.spotify.replacePlaylistTracks(playlistId, foundUris);

    const playlistInfo = await this.spotify.getPlaylistInfo(playlistId);

    const result: SyncResult = {
      totalTracks: tracks.length,
      foundTracks: foundUris.length,
      notFoundTracks: notFound,
      playlistId,
      playlistName: playlistInfo.name,
    };

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Sincronização concluída!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Playlist: ${playlistInfo.name}`);
    console.log(`URL: ${playlistInfo.url}`);
    console.log(`Músicas adicionadas: ${foundUris.length}/${tracks.length}`);

    if (notFound.length > 0) {
      console.log(`\n⚠ Músicas não encontradas no Spotify (${notFound.length}):`);
      notFound.forEach(track => console.log(`  - ${track}`));
    }

    console.log('\n');

    return result;
  }
}
