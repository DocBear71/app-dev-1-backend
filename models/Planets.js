// /models/Planets.js

const mongoose = require('mongoose');
const { planetConnection } = require('../config/db');

// Create a separate schema for the temperature data without _id
// Create a separate schema for the temperature data without _id
const temperatureSchema = new mongoose.Schema({
    min: {
        type: Number,
        required: false
    },
    max: {
        type: Number,
        required: false
    },
    mean: {
        type: Number,
        required: false
    }
}, { _id: false });

const planetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Planet name is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return v && v.trim().length > 0;
            },
            message: 'Planet name cannot be empty'
        }
    },
    orderFromSun: {
        type: Number,
        validate: {
            validator: function(v) {
                return v > 0;
            },
            message: 'Order from Sun must be a positive number'
        },
        default: 1,
        unique: true // Add unique constraint here
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
                return next(new Error('Invalid temperature format.'));
            }
        }
    }

    // Validate that the temperature object is correctly formatted
    if (this.surfaceTemperatureC && typeof this.surfaceTemperatureC === 'object') {
        const { min, max, mean } = this.surfaceTemperatureC;

        // Convert to numbers if they're strings
        const minVal = min !== null && min !== undefined ? Number(min) : null;
        const maxVal = max !== null && max !== undefined ? Number(max) : null;

        // Only validate the min/max relationship if both values are present
        if (minVal !== null && maxVal !== null && minVal > maxVal) {
            return next(new Error('Surface temperature min value cannot be greater than max.'));
        }

        // Update the values with their numeric versions
        if (min !== null && min !== undefined) this.surfaceTemperatureC.min = minVal;
        if (max !== null && max !== undefined) this.surfaceTemperatureC.max = maxVal;
        if (mean !== null && mean !== undefined) this.surfaceTemperatureC.mean = Number(mean);
    }

    next();
});

planetSchema.index({ orderFromSun: 1 }, {
    unique: true,
    partialFilterExpression: { orderFromSun: { $gt: 0 } }
});


// Use the planetConnection instead of the default mongoose connection
const Planets = planetConnection.model('planets', planetSchema);

module.exports = Planets;