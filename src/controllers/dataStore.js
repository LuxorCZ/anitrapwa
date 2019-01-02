import constants from '../common/constants.js';
import store from './storage.js';
import router from '@/router/index.js';

const dataStore = {
  apiActions: {
    user: {
      signIn: function (email, password, callback) {
        const formData = new FormData();
        const that = this;
        formData.append('email', email);
        formData.append('password', password);
        fetch(constants.apiUrl + '/login/', {method: 'POST', body: formData}).then(function (data) {
          data.json().then(function (result) {
            if (result.STATUS_CODE === 'ERROR') {
              callback(result.MESSAGE, '');
              dataStore.dataCache.user.username = email;
              store.init(email);
              return;
            }
            dataStore.methods.user.setToken(result.API_KEY);
            callback(null, that.MESSAGE);
          });
        });
      }
    },
    trackedObjects: {
      getAllTrackedObjects: function (callback) {
        if (dataStore.methods.user.isSignedIn()) {
          const token = dataStore.methods.user.getToken();
          const url = constants.apiUrl + '/tracked-object/list';
          fetch(
            url, {
              method: 'GET',
              headers: new Headers({
                'Authorization': token
              })
            }
          ).then(function (response) {
            response.json().then(
              function (data) {
                if (dataStore.methods.generic.isApiKeyValid(data)) {
                  store.storage.setItem('trackedObjects', data.list);
                  callback(null, data.list);
                }
              }
            );
          }).catch(function () {
            const errMessage = 'Error fetching tracked objects';
            callback(errMessage, {});
          });
        }
      },
      getTrackedObject: function (id, callback) {
        const token = dataStore.methods.user.getToken();
        const url = constants.apiUrl + '/tracked-object/detail/' + id;
        const callErr = function () {
          const errMessage = 'Error fetching tracked object';
          callback(errMessage, {});
        };
        fetch(
          url, {
            method: 'GET',
            headers: new Headers({
              'Authorization': token
            })
          }
        ).then(function (response) {
          response.json().then(function (data) {
            if (dataStore.methods.generic.isApiKeyValid(data)) {
              store.storage.setItem('trackedObject-' + id, data.trackedobject);
              callback(null, data.trackedobject);
            }
          }).catch(function () {
            callErr();
          });
        }).catch(function () {
          callErr();
        });
      }
    }
  },
  dataCache: {
    user: {
      token: null,
      username: null
    }
  },
  methods: {
    user: {
      setToken: function (token) {
        dataStore.dataCache.user.token = token;
        localStorage.setItem('token', token);
      },
      getToken: function () {
        return dataStore.dataCache.user.token;
      },
      loadTokenFromStore: function () {
        dataStore.dataCache.user.token = localStorage.getItem('token');
      },
      isSignedIn: function () {
        return dataStore.dataCache.user.token !== null;
      },
      getUsername: function () {
        return dataStore.dataCache.user.username;
      },
      verifySignOn: function (router) {
        if (!this.isSignedIn() && dataStore.methods.generic.isOnline()) {
          router.push('/sign');
        }
      }
    },
    generic: {
      isApiKeyValid: function (requestData) {
        // todo add notification
        if (requestData.STATUS_CODE === 'ERROR' && requestData.MESSAGE === 'Api key is invalid.') {
          router.push('/sign');
          return false;
        }
        return true;
      },
      isOnline: function () {
        return navigator.onLine;
      }
    },
    trackedObjects: {
      getTrackedObjects: function (callback, forceReload) {
        if (forceReload) {
          dataStore.apiActions.trackedObjects.getAllTrackedObjects(callback);
          return;
        }
        store.storage.getItem('trackedObjects').then(function (data) {
          if (data) {
            callback(null, data);
            return;
          }
          dataStore.apiActions.trackedObjects.getAllTrackedObjects(callback);
        }, function (data) {
          dataStore.apiActions.trackedObjects.getAllTrackedObjects(callback);
        }).catch(function () {
          dataStore.apiActions.trackedObjects.getAllTrackedObjects(callback);
        });
      },
      getTrackedObject: function (id, forceReload, callback) {
        dataStore.apiActions.trackedObjects.getTrackedObject(id, callback);
      }
    },
    maps: {
      getTile: function (x, y, z, callback) {
        x = Math.abs(x);
        y = Math.abs(y) - 1;
        z = Math.abs(z);
        const key = `map-${z}-${x}-${y}`;
        store.storage.getItem(key, function (err, data) {
          console.log(err, data);
          if (data && !err) {
            callback(null, data);
            return;
          }
          const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/${z}/${x}/${y}@2x?access_token=pk.eyJ1IjoibHV4b3JjeiIsImEiOiJjamo4bnNyazgyb3M2M3dzMm15amthMDJuIn0.xDY8zfwOwMeR2wi3_nks_g`;
          fetch(url).then(function (response) {
            const err = false;
            response.blob().then(function (blob) {
              store.storage.setItem(key, blob).then(function () {
                console.log('stored');
              });
              callback(err, blob);
            });
          }).catch(function (response) {
            const err = true;
            callback(err, null);
          });
        });
      }
    }
  },
  init: function () {
    this.methods.user.loadTokenFromStore();
    if (this.methods.user.getUsername()) {
      store.init(this.methods.user.getUsername());
    }
  }
};

export default dataStore;
