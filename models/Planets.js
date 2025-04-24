const mongoose = require('mongoose');
const { planetConnection } = require('../config/db');

// Create a separate schema for the temperature data without _id
const temperatureSchema = new mongoose.Schema({
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    },
    mean: {
        type: Number,
        required: true
    }
}, { _id: false });

const planetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    orderFromSun: {
        type: Number,
        default: 0
    },
    hasRings: {
        type: Boolean,
        default: false
    },
    mainAtmosphere: {
        type: [String],
        default: []
    },
    surfaceTemperatureC: temperatureSchema,
    discoveredDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware to handle parsing string to object if needed
planetSchema.pre('validate', function(next) {
    // Check if surfaceTemperatureC is a string and try to parse it
    if (this.surfaceTemperatureC && typeof this.surfaceTemperatureC === 'string') {
        try {
            // Try to parse if it's a JSON string
            this.surfaceTemperatureC = JSON.parse(this.surfaceTemperatureC);
        } catch (e) {
            // If it fails, try to parse as a string like "{min: -90.1, max: 57.3, mean: 15.2}"
            try {
                const match = this.surfaceTemperatureC.match(/\{min: ([-\d.]+), max: ([-\d.]+), mean: ([-\d.]+)}/);
                if (match) {
                    this.surfaceTemperatureC = {
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        mean: parseFloat(match[3])
                    };
                }
            } catch (innerError) {
                console.error("Failed to parse temperature string:", innerError);
            }
        }
    }
    next();
});

// Use the planetConnection instead of the default mongoose connection
const Planets = planetConnection.model('planets', planetSchema);

module.exports = Planets;