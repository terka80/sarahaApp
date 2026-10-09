import { client } from "../../DB/redis.connection.js";

export const setCache = async ({ key, value, ttl = undefined } = {}) => {
  if (typeof value == "object") {
    value = JSON.stringify(value);
  }
  return client.set(key, value, { EX: ttl });
};

export const getCache = async ({ key } = {}) => {
  let value = await client.get(key);

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};
export const existCache = async ({ key } = {}) => {
  return await client.exists(key);
};

export const updateCache = async ({ key, value, ttl = undefined } = {}) => {
  if (!(await existCache({ key }))) {
    return 0;
  }
  return setCache({ key, value, ttl });
};
export const deleteCache = async ({ key, value, ttl = undefined } = {}) => {
  return client.del(key);
};
export const keysCache = async ({ prefix } = {}) => {
  return client.keys(`${prefix}*`);
};
export const ttlCache = async ({ key } = {}) => {
  return client.ttl(key);
};
export const expireCache = async ({ key, ttl } = {}) => {
  return client.expire(key, ttl);
};
export const incrementByCache = async ({ key, value=1 } = {}) => {
  return client.incrBy(key, value);
};
