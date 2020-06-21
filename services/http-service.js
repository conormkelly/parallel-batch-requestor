//* Provides HTTP request methods.

const axios = require('axios');

// Configure request and response interceptors to calculate response times
axios.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date();
    response.duration =
      response.config.metadata.endTime - response.config.metadata.startTime;
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date();
    error.duration =
      error.config.metadata.endTime - error.config.metadata.startTime;
    return Promise.reject(error);
  }
);

// Wrapper methods to perform HTTP requests

/**
 * Perform a HTTP GET request.
 * @param {{url: string}} config
 */
async function get({ url }) {
  return axios.get(url);
}

/**
 * Perform a HTTP POST request.
 * @param {{url: string, reqBody: any}} config
 */
async function post({ url, reqBody }) {
  return axios.post(url, reqBody);
}

module.exports = { get, post };
