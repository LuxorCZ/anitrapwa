
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
  },
  formatTimeString: function (timeString) {
    return ('0' + timeString).slice(-2);
  },
  formatTime: function (data) {
    if (!isNaN(parseInt(data))) {
      const d = new Date();
      d.setTime(data * 1000);
      return d.getUTCDate() + '-' + d.getUTCMonth() + '-' + d.getUTCFullYear() +
             ' ' + this.formatTimeString(d.getUTCHours()) + ':' + this.formatTimeString(d.getUTCMinutes());
    }
    return '';
  }
};

export default functions;
