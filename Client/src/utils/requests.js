const axios = require("axios");

const router = axios.create({withCredentials:true})

const request = {

    getRequest: (path, params, next, err) => {
        router.get(path, params)
              .then(next)
              .catch(err)
    },
    postRequest: (path, params, next, err) => {
        router.post(path, params)
              .then(next)
              .catch(err)
    },
    deleteRequest: (path, params, next, err) => {
        router.delete(path, params)
              .then(next)
              .catch(err)
    }
};

module.exports = request;