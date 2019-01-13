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
              return;
            }
            store.init(email);
            dataStore.dataCache.user.username = email;
            dataStore.methods.user.setToken(result.API_KEY);
            dataStore.methods.user.setUsername(email);
            callback(null, that.MESSAGE);
          });
        }).catch(function (data) {
          const message = 'Unable to connect to Anitra servers.';
          callback(message, data);
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
                  const list = [];
                  for (let object of data.list) {
                    if (object) {
                      object.hasLastData = false;
                      object.hasRecentData = false;
                      list[object.TrackedObjectId] = {
                        TrackedObjectId: object.TrackedObjectId,
                        TrackedObjectCode: object.TrackedObjectCode,
                        TrackedObjectName: object.TrackedObjectName,
                        IndividualSex: object.IndividualSex,
                        CurrentAge: object.CurrentAge,
                        SpeciesName_English: object.SpeciesName_English
                      };
                      store.storage.setItem('trackedObject-' + object.TrackedObjectId, object);
                    }
                  }
                  let ret = list.filter(val => val);
                  store.storage.setItem('trackedObjects', ret);
                  callback(null, ret);
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
        store.storage.getItem('trackedObject-' + id, function (err, data) {
          if (err) {
            callback(err, null);
          }
          if (data) {
            callback(null, data);
            return;
          }
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
        });
      }
    }
  },
  dataCache: {
    user: {
      token: null,
      username: null
    },
    notifications: []
  },
  methods: {
    user: {
      setToken: function (token) {
        dataStore.dataCache.user.token = token;
        localStorage.setItem('token', token);
      },
      setUsername: function (username) {
        localStorage.setItem('username', username);
        dataStore.dataCache.user.username = username;
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
        if (dataStore.dataCache.user.username) {
          return dataStore.dataCache.user.username;
        }
        const username = localStorage.getItem('username');
        dataStore.dataCache.user.username = username;
        return username;
      },
      verifySignOn: function (router) {
        if (!this.isSignedIn()) { //  && dataStore.methods.generic.isOnline()
          router.push('/sign');
        }
      },
      signOut: function (callback) {
        store.storage.clear().then(function () {
          localStorage.removeItem('username');
          localStorage.removeItem('token');
          callback(null, null);
        }).catch(function () {
          const err = true;
          callback(err, null);
        });
      }
    },
    generic: {
      isApiKeyValid: function (requestData) {
        // todo add notification
        if (requestData.STATUS_CODE === 'ERROR' && requestData.MESSAGE === 'Api key is invalid.') {
          router.push('/sign');
          dataStore.methods.generic.addNotification('You have been signed out. Please sign in again.');
          return false;
        }
        return true;
      },
      isOnline: function () {
        return navigator.onLine;
      },
      addNotification: function (text) {
        dataStore.dataCache.notifications.push(text);
      },
      getNotification: function () {
        return dataStore.dataCache.notifications.pop();
      },
      getStorageEstimate: function (callback) {
        navigator.storage.estimate().then(function (estimate) {
          if (!estimate) {
            const hasError = true;
            callback(hasError, null);
            return;
          }
          callback(null, (estimate.usage / estimate.quota).toFixed(2));
        });
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
      },
      getTrackedObjectTracks: function (id, forceReload, doStore, days, limit, callback) {
        const key = `track-${id}-${days}-${limit}`;
        store.storage.getItem(key, function (err, data) {
          if (data && !err && !forceReload) {
            callback(null, data);
            return;
          }

          if (dataStore.methods.generic.isOnline()) {
            const token = dataStore.methods.user.getToken();

            const url = constants.apiUrl + '/tracked-object/last-days/' + id + '?days=' + days + '&count=' + limit;
            console.log(url);

            fetch(
              url, {
                method: 'GET',
                headers: new Headers({
                  'Authorization': token
                })
              }
            ).then(function (data) {
              if (err) {
                callback(err, null);
                return;
              }
              data.json().then(function (response) {
                if (dataStore.methods.generic.isApiKeyValid(response)) {
                  const positions = response.positions;
                  if (doStore) {
                    store.storage.setItem(key, positions);
                  }
                  callback(null, response.positions);
                }
              });
            });
          }
          const error = true;
          callback(error, null);
        });
      },
      saveTrackedObject: function (id, data) {
        store.storage.setItem('trackedObject-' + id, data);
      }
    },
    maps: {
      getTile: function (x, y, z, callback) {
        x = Math.abs(x);
        y = Math.abs(y) - 1;
        z = Math.abs(z);
        const key = `map-${z}-${x}-${y}`;
        store.storage.getItem(key, function (err, data) {
          if (data && !err) {
            callback(null, data);
            return;
          }
          if (dataStore.methods.generic.isOnline()) {
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
          } else {
            const err = true;
            callback(err, null);
          }
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
