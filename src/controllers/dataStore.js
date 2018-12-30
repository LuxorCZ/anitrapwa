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
