// localforage.INDEXEDDB
import localForage from 'localforage';

const storage = {
  init: function (name) {
    localForage.config({
      driver: localForage.INDEXEDDB, // Force WebSQL; same as using setDriver()
      name: 'anitra',
      version: 1.0,
      storeName: name, // Should be alphanumeric, with underscores.
      description: 'some description'
    });
  },
  storage: localForage
};

export default storage;
