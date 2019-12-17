import * as querystring from 'querystring';
import * as request from 'request';

interface LastSeenResponse {
  last_seen: {
    time: number;
    platform: PlatformId;
  };
}

const API_ROOT = 'https://api.vk.com/method/';
const API_USERS_GET_METHOD = 'users.get';
const API_VERSION = '5.89';

class VKClient {
  private ACCESS_TOKEN: string;

  constructor(accessToken: string) {
    this.ACCESS_TOKEN = accessToken;
  }

  public async fetchLastSeen(userId: string): Promise<LastSeen> {
    const queryParams = {
      'user_ids': userId,
      'fields': 'last_seen',
      'v': API_VERSION,
      'access_token': this.ACCESS_TOKEN,
    };
    const endpoint = `${API_ROOT}${API_USERS_GET_METHOD}?${querystring.stringify(queryParams)}`;
    return new Promise<LastSeen>((resolve, reject) => {
      request(endpoint, (error, _response, body) => {
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