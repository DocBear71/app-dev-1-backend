// Application dependencies
const express = require('express');
const router = express.Router();
const superagent = require('superagent');
const MyLocation = require('../models/MyLocation.js');
const MyWeather = require('../models/MyWeather.js');
// const MyRestaurant = require("../models/MyRestaurant");

// route definitions
router.post('/', getLocation);

// Route handlers
async function getLocation(req, res) {
    try {
        // Use req.query when making a get request with query string params
        // Use req.body when making a post request with json body data
        const location = req.body.location;
        if(location === null || location === undefined || location === '') {
            res.status(500).json({success: false, message: 'A location string parameter is required!'});
            return;
        }
        // res.status(200).json({success: true, location: location});
        // Step 1: Fetch location data from LocationIQ
        const locationResponse = await superagent.get("https://us1.locationiq.com/v1/search.php")
            .query({
                key: process.env.LOCATIONIQ_KEY,
                q: location,
                format: 'json'
            });
        const topLocation = locationResponse.body[0];
        // res.status(200).json({success: true, location: topLocation});
        const locationData = new MyLocation(topLocation);

        // Step 2: Fetch weather data from OpenWeatherMap API
        const weatherResponse = await superagent.get('https://api.openweathermap.org/data/2.5/weather')
        .query({
            lat: locationData.lat,
            lon: locationData.lon,
            units: 'imperial', // Will return Fahrenheit
            appid: process.env.WEATHER_KEY
        })

        // res.status(200).json({success: true, location: weatherResponse.body});
        // return;

        const weatherData = new MyWeather(weatherResponse.body);

        // Sstep 3: Fetch restaurant data from Yelp API
        // const restaurantResponse = await superagent.get('https://api.yelp.com/v3/businesses/search')
        // .query({
        //     latitude: locationData.lat,
        //     longitude: locationData.lon,
        //     term: 'restaurants',
        //     limit: 8,
        // })
        // .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
        //
        // const restaurantArray = restaurantResponse.body.businesses.map(restaurant => new MyRestaurant(restaurant));


        res.status(200).json({
            location: locationData,
            weather: weatherData,
            restaurants: restaurantArray
        });

    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Something went wrong!'});
    }
}

module.exports = router;