const MyLocation = function (json) {
    this.lat = json.lat;
    this.lon = json.lon;
    this.display_name = json.display_name;
}

module.exports = MyLocation;