import rateLimit from "express-rate-limit";
import RedisStore, { RedisReply } from "rate-limit-redis";
import redisClient from "@/config/redis";
import { ResponseError } from "@/errors/ResponseError";

// General Rate Limiter (e.g., 100 requests per 15 minutes)
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	store: new RedisStore({
		sendCommand: (command: string, ...args: string[]) => redisClient.call(command, ...args) as Promise<RedisReply>,
		prefix: "rl:general:", // Optional: prefix for Redis keys
	}),
	handler: (_req, _res, next) => {
		next(new ResponseError(429, "Too many requests, please try again later."));
	},
});

// Strict Rate Limiter for Auth (e.g., 20 requests per 15 minutes for login/register)
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // Strict limit for auth endpoints
	standardHeaders: true,
	legacyHeaders: false,
	store: new RedisStore({
		sendCommand: (command: string, ...args: string[]) => redisClient.call(command, ...args) as Promise<RedisReply>,
		prefix: "rl:auth:", // Optional: prefix for Redis keys
	}),
	handler: (_req, _res, next) => {
		next(
			new ResponseError(
				429,
				"Too many login attempts, please try again after 15 minutes.",
			),
		);
	},
});
