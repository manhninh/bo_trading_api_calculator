import config from '@src/config';
import { STATUS } from '@src/contants/Response';
import IAccessTokenModel from '@src/models/accessTokens/IAccessTokenModel';
import IClientModel from '@src/models/clients/IClientModel';
import IUserModel from '@src/models/users/IUserModel';
import AccessTokenRepository from '@src/repository/AccessTokenRepository';
import RefreshTokenRepository from '@src/repository/RefreshTokenRepository';
import UserRepository from '@src/repository/UserRepository';
import { randomBytes } from 'crypto';
import { createServer, exchange, ExchangeDoneFunction } from 'oauth2orize';
import passport from 'passport';

// initialization token
const initToken = async (user: IUserModel, client: IClientModel, done: ExchangeDoneFunction) => {
  try {
    const accessTokenRes = new AccessTokenRepository();
    accessTokenRes.removeByUserIdAndClientId(user.id, client.client_id);
    const refreshTokenRes = new RefreshTokenRepository();
    refreshTokenRes.removeByUserIdAndClientId(user.id, client.client_id);
    const refreshToken = randomBytes(128).toString('hex');
    refreshTokenRes.create(<IAccessTokenModel>{
      user_id: user.id,
      client_id: client.client_id,
      token: refreshToken,
    });
    const accessToken = randomBytes(128).toString('hex');
    accessTokenRes.create(<IAccessTokenModel>{
      user_id: user.id,
      client_id: client.client_id,
      token: accessToken,
    });
    done(null, accessToken, refreshToken, { expires_in: config.TOKEN_LIFE });
  } catch (error) {
    done(error);
  }
};

// Create OAuth 2.0 server
const server = createServer();

// Exchange username & password for an access token.
server.exchange(
  exchange.password(
    async (client: IClientModel, username: string, password: string, _scope, done: ExchangeDoneFunction) => {
      try {
        const userRes = new UserRepository();
        userRes
          .checkUserOrEmail(username)
          .then((user) => {
            if (!user) return done(new Error('ACCOUNT_NOT_EXIST'));
            if (!user.checkPassword(password)) return done(new Error('ACCOUNT_LOGIN_FAIL'));
            if (user.status === STATUS.ACTIVE) {
              initToken(user, client, done);
            } else if (user.status === STATUS.BLOCK) {
              return done(new Error('ACCOUNT_BLOCK'));
            } else {
              return done(new Error('ACCOUNT_NOT_ACTIVE'));
            }
          })
          .catch((err) => done(err));
      } catch (error) {
        done(error);
      }
    },
  ),
);

// Exchange refreshToken for an access token.
server.exchange(
  exchange.refreshToken(function (client, refreshToken, _scope, done) {
    try {
      const refreshTokenRes = new RefreshTokenRepository();
      refreshTokenRes
        .findByToken(refreshToken)
        .then((refreshToken) => {
          if (!refreshToken) return done(null, false);
          const userRes = new UserRepository();
          userRes
            .findById(refreshToken.user_id)
            .then((user) => {
              if (!user) return done(null, false);
              initToken(user, client, done);
            })
            .catch((err) => done(err));
        })
        .catch((err) => done(err));
    } catch (error) {
      done(error);
    }
  }),
);

/**
 * @api {post} /api/v1/oauth/token Sign in
 * @apiVersion 1.0.0
 * @apiGroup I. Users
 *
 * @apiHeader {String} Content-Type application/json.
 * @apiHeader {String} Accept application/json.
 *
 * @apiHeaderExample {Header} Header-Example
 *    "Content-Type": "application/json"
 *    "Accept": "application/json"
 *
 * @apiParam {String} username
 * @apiParam {String} password
 * @apiParam {String} grant_type password
 * @apiParam {String} client_id b109f3bbbc244eb82441917ed06d618b9008dd09b3bef
 * @apiParam {String} client_secret password
 * @apiParam {String} scope offline_access
 *
 * @apiSuccess {Object} data
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "access_token": "d8e52612c0015c818fc76b007797e342bad3a6959f4241f11642c4249be7dae31d023112e0",
 *      "token_type": "Bearer"
 *    }
 *
 * @apiError (404 Not Found) NotFound API not found
 * @apiErrorExample {json} 404 Not Found Error
 *    HTTP/1.1 404 Not Found
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 * @apiErrorExample {json} 500 Account not exist
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       {
 *          "error": "server_error",
 *          "error_description": "Account not exist"
 *       }
 *    }
 * @apiErrorExample {json} 500 Login Fail
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       {
 *          "error": "server_error",
 *          "error_description": "Login Fail"
 *       }
 *    }
 * @apiErrorExample {json} 500 Account not active
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *       {
 *          "error": "server_error",
 *          "error_description": "ACCOUNT_NOT_ACTIVE"
 *       }
 *    }
 */

const token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];

const isAuthenticated = passport.authenticate('bearer', { session: false });

export { token, isAuthenticated };

