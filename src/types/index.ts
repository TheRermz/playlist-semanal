export interface LastFmTrack {
  artist: string;
  track: string;
  playcount: number;
}

export interface LastFmApiTrack {
  name: string;
  playcount: string;
  artist: {
    name: string;
    mbid: string;
    url: string;
  };
  url: string;
  '@attr': {
    rank: string;
  };
}

export interface LastFmApiResponse {
  toptracks: {
    track: LastFmApiTrack[] | LastFmApiTrack;
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface EnvConfig {
  lastfm: {
    apiKey: string;
    username: string;
  };
  spotify: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  playlist: {
    name: string;
    topTracksLimit: number;
  };
}

export interface SyncResult {
  totalTracks: number;
  foundTracks: number;
  notFoundTracks: string[];
  playlistId: string;
  playlistName: string;
}
