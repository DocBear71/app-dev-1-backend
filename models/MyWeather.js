const MyWeather = function (json) {
    this.lat = json.coord.lat;
    this.lon = json.coord.lon;
    this.weatherName = json.weather[0].main; // weather description (i.e. Mist)
    this.weather = json.weather[0].description;
    this.current_temp = json.main.temp;
    this.feels_like = json.main.feels_like;
    this.temp_min = json.main.temp_min;
    this.temp_max = json.main.temp_max;
    this.pressure = json.main.pressure;
    this.humidity = json.main.humidity;
    this.visibility = json.visibility;
    this.wind_speed = json.wind.speed;
    this.wind_direction = json.wind.deg;
    this.cloud_percentage = json.clouds.all;
    this.datetime = json.dt;
    this.sunrise = json.sys.sunrise;
    this.sunset = json.sys.sunset;
    this.timezone = json.timezone;
}

module.exports = MyWeather;