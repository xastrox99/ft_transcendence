import * as Joi from "joi";

/***
 * @description set the required env vars for server to dire properly
 * */
export const validationSchema = Joi.object({
  INTRA_CLIENT_ID: Joi.string().required(),
  INTRA_CLIENT_SECRET: Joi.string().required(),
  INRTA_CALLBACK_URI: Joi.string().required(),
  S3ACCESSKEY: Joi.string().required(),
  S3REGION: Joi.string().required(),
  S3BUCKET: Joi.string().required(),
  S3SECRETKEY: Joi.string().required(),
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().valid("development", "production"),
  // LOGGER MODE
  LOG_MODE: Joi.string().valid("dev", "combined", "long", "short"),
  // JWT VARS
  JWT_SECRET_TOKEN: Joi.string().required().min(10).max(2048),
  JWT_TOKEN_EXPIRES_DATE: Joi.string().required(),
});

/**
 * @description set env vars validation options
 *
 * @param abortEarly abort server if some vars not availble in .env file
 */
export const validationOptions = {
  abortEarly: true,
};
