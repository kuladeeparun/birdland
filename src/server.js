import 'dotenv/config';
import sirv from 'sirv';
import express from 'express';
import { auth } from 'express-openid-connect';
import bodyParser from 'body-parser';
// import compression from 'compression';
import * as sapper from '@sapper/server';
import { get as get_user } from './api/user.js';

const {
	PORT,
	NODE_ENV,
	AUTH0_CLIENT_ID,
	AUTH0_DOMAIN,
	VERCEL_URL
} = process.env;

const dev = NODE_ENV === 'development';
const base = VERCEL_URL ? `https://${VERCEL_URL}` : `http://localhost:${PORT}`;

const app = express();

app.use(
	// TODO is this necessary?
	// compression({ threshold: 0 }),

	bodyParser.json(),

	sirv('static', { dev }),

	auth({
		required: false,
		auth0Logout: true,
		baseURL: base,
		issuerBaseURL: `https://${AUTH0_DOMAIN}`,
		clientID: AUTH0_CLIENT_ID,
		appSession: {
			// secret: AUTH0_CLIENT_SECRET
			secret: 'a-long-random-string'
		}
	}),

	sapper.middleware({
		session: async (req) => {
			const user = req.openid.user
				? await get_user(req.openid.user)
				: null;

			return {
				user
			};
		}
	})
);

app.listen(PORT, err => {
	if (err) console.log('error', err);
});

export default app;