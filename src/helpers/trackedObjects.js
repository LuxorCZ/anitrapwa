const functions = {
  getTrackedObjectAge: function (number) {
    return number;
  },
  getTrackedObjectSex: function (string) {
    return string;
  },
  getTrackedObjectSpecies: function (string) {
    return string;
  },
  getTrackedObjectName: function (data) {
    if (!data) {
      return '';
    }

    if (data.TrackedObjectName) {
      return data.TrackedObjectName;
    }

    if (data.TrackedObjectCode) {
      return data.TrackedObjectCode;
    }

    return '';
  }
};

export default functions;
