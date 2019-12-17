import * as querystring from 'querystring';
import * as request from 'request';

interface LastSeenResponse {
  last_seen: {
    time: number;
    platform: PlatformId;
  };
}

class VKClient {
  private static API_ROOT = 'https://api.vk.com/method/';
  private static API_VERSION = '5.89';
  private ACCESS_TOKEN: string;

  constructor(accessToken: string) {
    this.ACCESS_TOKEN = accessToken;
  }

  public async fetchLastSeen(userId: string): Promise<LastSeen> {
    const queryParams = {
      'user_ids': userId,
      'fields': 'last_seen',
      'v': VKClient.API_VERSION,
      'access_token': this.ACCESS_TOKEN,
    };
    const endpoint = `${VKClient.API_ROOT}?${querystring.stringify(queryParams)}`;
    return new Promise<LastSeen>((resolve, reject) => {
      request(endpoint, (error, _response, body) => {
        console.log('Body', body);
        if (error) reject(error);
        const firstUserData: LastSeenResponse = JSON.parse(body)['response'][0];
        resolve({
          time: new Date(firstUserData['last_seen']['time'] * 1000),
          platformId: firstUserData['last_seen']['platform'],
        });
      });
    });
  }
}

export default VKClient;