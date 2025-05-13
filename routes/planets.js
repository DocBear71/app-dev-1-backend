// /routes/planets.js

// Application dependencies
const express = require('express');
const router = express.Router();
const Planets = require('../models/Planets');

// Validation middleware
const validatePlanet = async (req, res, next) => {
    try {
        const validation = await validatePlanetInput(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                errors: validation.errors || [validation.error]
            });
        }

        next();
    } catch (error) {
        console.error("Error in validation middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Validation error",
            errors: ["An error occurred during validation"]
        });
    }
};

// route definitions with validation middleware
// Get all Planets
router.get('/', getPlanets);
// Get a single planet
router.get('/:id', getSinglePlanet);
// Add a new planet
router.post('/', (req, res, next) => validatePlanet(req, res, next), addPlanet);
// Update a single planet
router.put('/:id', (req, res, next) => validatePlanet(req, res, next), updateSinglePlanet);
// Delete a single planet
router.delete('/:id', deleteSinglePlanet);
// Delete all planets (new endpoint)
router.delete('/', deleteAllPlanets);

// Route handlers
async function getPlanets(req, res) {
    try {
        console.log('GET /planets endpoint called');

        // Get count of documents for verification
        const count = await Planets.countDocuments();
        console.log(`Found ${count} planets in the database`);

        const planets = await Planets.find();
        console.log('Planets retrieved:', planets.length);

        res.json({success: true, data: planets});
    } catch(error) {
        console.log('Error in getPlanets:', error);
        res.status(500).json({success: false, message: 'Something went wrong!'});
    }
}

async function getSinglePlanet(req, res) {
    try {
        const id = req.params.id;
        if (!isValidId(id)) {
            return res.status(404).json({success: false, message: 'Invalid ID format' });
        }
        const planet = await Planets.findById(id);
        if(!planet) {
            return res.status(404).json({success: false, message: "Planet Not Found"});
        }
        res.json({success: true, data: planet});
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Something went wrong!'});
    }
}

async function addPlanet(req, res) {
    try {
        // Add logging to help debug
        console.log("Received planet data:", JSON.stringify(req.body, null, 2));

        // At this point, validation has already been done by the middleware
        let { name, orderFromSun, hasRings, mainAtmosphere, surfaceTemperatureC } = req.body;

        // Process atmosphere data
        if (mainAtmosphere) {
            mainAtmosphere = hasAtmosphere(mainAtmosphere);
        }

        // Process temperature data - enforcing our validation rules
        let temperatureData = {
            min: surfaceTemperatureC?.min !== undefined ? Number(surfaceTemperatureC.min) : null,
            max: surfaceTemperatureC?.max !== undefined ? Number(surfaceTemperatureC.max) : null,
            mean: surfaceTemperatureC?.mean !== undefined ? Number(surfaceTemperatureC.mean) : null
        };

        // Create planet object with proper defaults
        const planet = new Planets({
            name: name.trim(),
            orderFromSun: Number(orderFromSun) || 1, // Default to 1 if not provided or invalid
            hasRings: Boolean(hasRings),
            mainAtmosphere: Array.isArray(mainAtmosphere) ? mainAtmosphere : [],
            surfaceTemperatureC: temperatureData
        });

        console.log("Attempting to save planet with data:", JSON.stringify(planet, null, 2));

        const savedPlanet = await planet.save();
        res.json({ success: true, data: savedPlanet });
    } catch (error) {
        console.log("Error in addPlanet:", error.stack);
        // Handle MongoDB duplicate key errors more gracefully
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            if (error.code === 11000) {
                // This is a duplicate key error
                return res.status(409).json({
                    success: false,
                    message: 'A planet with this order number already exists',
                    errors: ['A planet with this order number already exists']
                });
            }
        }

        res.status(500).json({ success: false, message: `Something went wrong: ${error.message}` });
    }
}

async function updateSinglePlanet(req, res) {
    try {
        const id = req.params.id;
        if (!isValidId(id)) {
            return res.status(400).json({success: false, message: 'Invalid ID format'});
        }

        // At this point, validation has already been done by the middleware
        let { name, orderFromSun, hasRings, mainAtmosphere, surfaceTemperatureC } = req.body;

        const updates = {};

        // Only update fields that are provided
        if (name !== undefined) updates.name = name.trim();
        if (orderFromSun !== undefined) updates.orderFromSun = Number(orderFromSun);
        if (hasRings !== undefined) updates.hasRings = Boolean(hasRings);

        // Handle mainAtmosphere if provided
        if (mainAtmosphere) {
            // Handle mainAtmosphere if it's a string
            mainAtmosphere = hasAtmosphere(mainAtmosphere);
            updates.mainAtmosphere = mainAtmosphere;
        }

        // Handle surfaceTemperatureC if provided
        if (surfaceTemperatureC) {
            // Process temperature data consistently with validation
            updates.surfaceTemperatureC = {
                min: surfaceTemperatureC.min !== undefined ? Number(surfaceTemperatureC.min) : null,
                max: surfaceTemperatureC.max !== undefined ? Number(surfaceTemperatureC.max) : null,
                mean: surfaceTemperatureC.mean !== undefined ? Number(surfaceTemperatureC.mean) : null
            };
        }

        console.log("Updating planet with data:", JSON.stringify(updates, null, 2));

        // Use runValidators to ensure the updates meet schema validation
        const updatedPlanet = await Planets.findByIdAndUpdate(
            id,
            {$set: updates},
            {new: true, runValidators: true}
        );

        if (!updatedPlanet) {
            return res.status(404).json({success: false, message: 'Planet not found'});
        }

        res.json({success: true, data: updatedPlanet});
    } catch (error) {
        console.log("Error in updateSinglePlanet:", error);
        // Handle MongoDB duplicate key errors more gracefully
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            if (error.code === 11000) {
                // This is a duplicate key error
                return res.status(409).json({
                    success: false,
                    message: 'A planet with this order number already exists',
                    errors: ['A planet with this order number already exists']
                });
            }
        }

        res.status(500).json({ success: false, message: `Something went wrong: ${error.message}` });
    }
}

function hasAtmosphere(mainAtmosphere) {
    if (typeof mainAtmosphere === 'string') {
        try {
            // If it looks like a JSON array string
            if (mainAtmosphere.trim().startsWith('[') && mainAtmosphere.trim().endsWith(']')) {
                mainAtmosphere = JSON.parse(mainAtmosphere);
            } else {
                // Split by commas if it's a comma-separated string
                mainAtmosphere = mainAtmosphere.split(',').map(item => item.trim());
            }
        } catch (e) {
            console.log('Error parsing mainAtmosphere:', e);
            mainAtmosphere = [mainAtmosphere]; // Fallback to array with the string as single item
        }
    }
    return mainAtmosphere;
}

async function deleteSinglePlanet(req, res) {
    try {
        const id = req.params.id;
        if (!isValidId(id)) {
            return res.status(400).json({success: false, message: 'Invalid ID format'});
        }

        const deletedPlanet = await Planets.findByIdAndDelete(id);

        if (!deletedPlanet) {
            return res.status(404).json({success: false, message: 'Planet not found'});
        }

        res.json({success: true, message: 'Planet deleted successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Something went wrong!'});
    }
}

async function deleteAllPlanets(req, res) {
    try {
        const result = await Planets.deleteMany({});
        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} planets`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Something went wrong!'});
    }
}

async function validatePlanetInput(input) {
    // Initialize errors array to collect all validation issues
    const errors = [];

    // Check if input is undefined or null
    if (!input) {
        return { success: false, error: 'No input provided', errors: ['No input provided'] };
    }

    let { name, orderFromSun, surfaceTemperatureC } = input;

    // Validate name - required and not empty
    if (!name || (typeof name === 'string' && name.trim() === '')) {
        errors.push('Planet name is required');
    }

    // Validate orderFromSun - must be a positive number
    let orderValue = orderFromSun;
    if (typeof orderFromSun === 'string') {
        orderValue = parseInt(orderFromSun);
    }

    // If orderFromSun is provided but invalid
    if (orderFromSun !== undefined && (isNaN(orderValue) || orderValue <= 0)) {
        errors.push('Order from Sun must be a positive number');
    }

    if (orderValue > 0) {
        try {
            // In case of update, we need the ID to exclude the current planet
            const id = input._id || input.id;

            // Build the query to check for duplicates
            const query = { orderFromSun: orderValue };

            // If we have an ID (for updates), exclude the current planet
            if (id) {
                query._id = { $ne: id };
            }

            const existingPlanet = await Planets.findOne(query);

            if (existingPlanet) {
                errors.push(`A planet with order ${orderValue} already exists (${existingPlanet.name})`);
            }
        } catch (error) {
            console.error("Error checking for duplicate orderFromSun:", error);
            // Don't add to errors - we'll allow it to proceed and let the database
            // unique constraint handle it if there's an issue checking
        }
    }

    // Validate temperature values if provided
    if (surfaceTemperatureC) {
        // Convert string representation if needed
        if (typeof surfaceTemperatureC === 'string') {
            try {
                // Try to parse as JSON
                surfaceTemperatureC = JSON.parse(surfaceTemperatureC);
            } catch (e) {
                // If not valid JSON, try to parse using regex
                const pattern = /min:\s*([-+]?\d*\.?\d+),\s*max:\s*([-+]?\d*\.?\d+),\s*mean:\s*([-+]?\d*\.?\d+)/i;
                const match = surfaceTemperatureC.match(pattern);

                if (match) {
                    surfaceTemperatureC = {
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        mean: parseFloat(match[3])
                    };
                } else {
                    // If still can't parse, add error
                    errors.push('Invalid temperature format');
                }
            }
        }

        // Check min/max relationship if we have an object with numeric values
        if (typeof surfaceTemperatureC === 'object' &&
            surfaceTemperatureC.min !== undefined &&
            surfaceTemperatureC.max !== undefined) {

            const min = Number(surfaceTemperatureC.min);
            const max = Number(surfaceTemperatureC.max);

            if (!isNaN(min) && !isNaN(max) && min > max) {
                errors.push('Minimum temperature cannot be greater than maximum temperature');
            }
        }
    }

    // Return validation result
    if (errors.length > 0) {
        return {
            success: false,
            error: errors[0], // First error for backward compatibility
            errors: errors    // All errors for better feedback
        };
    }

    return { success: true };
}

function isValidId(id) {
    return (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) ||  // 24-char hex string
        (id instanceof Uint8Array && id.length === 12) ||               // 12-byte Uint8Array
        (Number.isInteger(id));
}

module.exports = router;