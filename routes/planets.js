// Application dependencies
const express = require('express');
const router = express.Router();
const Planets = require('../models/Planets');

// route definitions
// Get all Planets
router.get('/', getPlanets);
// Get a single planet
router.get('/:id', getSinglePlanet);
// Add a new planet
router.post('/', addPlanet);
// Update a single planet
router.put('/:id', updateSinglePlanet);
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
        // let { name, orderFromSun, hasRings, mainAtmosphere, surfaceTemperatureC } = req.body;
        const result = await validatePlanetInput(req.body);

        if(!result.success) {
            return res.status(400).json({success: false, message: result.error});
        }

        if (!name) {
            return res.status(400).json({success: false, message: 'Name is required'});
        }

        // Handle mainAtmosphere if it's a string
        if (mainAtmosphere) {
            mainAtmosphere = hasAtmosphere(mainAtmosphere);
        }

        // Handle surfaceTemperatureC parsing with specific string format
        let temperatureData = {
            min: 0,
            max: 0,
            mean: 0
        };

        if (surfaceTemperatureC) {
            // If it's already an object
            if (typeof surfaceTemperatureC === 'object' && !Array.isArray(surfaceTemperatureC)) {
                temperatureData = {
                    min: surfaceTemperatureC.min || 0,
                    max: surfaceTemperatureC.max || 0,
                    mean: surfaceTemperatureC.mean || 0
                };
            }
            // If it's a string
            else if (typeof surfaceTemperatureC === 'string') {
                // Try to extract values using regex pattern for "min: -90.1, max: 57.3, mean: 15.2"
                const pattern = /min:\s*([-+]?\d*\.?\d+),\s*max:\s*([-+]?\d*\.?\d+),\s*mean:\s*([-+]?\d*\.?\d+)/i;
                const match = surfaceTemperatureC.match(pattern);

                if (match) {
                    temperatureData = {
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        mean: parseFloat(match[3])
                    };
                    console.log('Successfully parsed temperature string:', temperatureData);
                } else {
                    // If the regex didn't match, log the issue
                    console.log('Could not parse temperature string with regex:', surfaceTemperatureC);

                    // Try alternate formats - maybe it's inside braces
                    const bracesPattern = /\{.*min:\s*([-+]?\d*\.?\d+),\s*max:\s*([-+]?\d*\.?\d+),\s*mean:\s*([-+]?\d*\.?\d+).*}/i;
                    const bracesMatch = surfaceTemperatureC.match(bracesPattern);

                    if (bracesMatch) {
                        temperatureData = {
                            min: parseFloat(bracesMatch[1]),
                            max: parseFloat(bracesMatch[2]),
                            mean: parseFloat(bracesMatch[3])
                        };
                        console.log('Successfully parsed temperature string with braces pattern:', temperatureData);
                    } else {
                        console.log('Could not parse temperature string with braces pattern either');
                    }
                }
            }
        }

        // Create the planet with properly formatted data
        const planet = new Planets({
            name,
            orderFromSun: orderFromSun || 0,
            hasRings: hasRings || false,
            mainAtmosphere: mainAtmosphere || [],
            surfaceTemperatureC: temperatureData
        });

        console.log("Attempting to save planet with data:", JSON.stringify(planet, null, 2));

        const savedPlanet = await planet.save();
        res.json({success: true, data: savedPlanet});
    } catch (error) {
        console.log("Error in addPlanet:", error);
        res.status(500).json({success: false, message: `Something went wrong: ${error.message}`});
    }
}

async function updateSinglePlanet(req, res) {
    try {
        const id = req.params.id;
        if (!isValidId(id)) {
            return res.status(400).json({success: false, message: 'Invalid ID format'});
        }

        let { name, orderFromSun, hasRings, mainAtmosphere, surfaceTemperatureC } = req.body;

        const updates = {};

        // Only update fields that are provided
        if (name) updates.name = name;
        if (orderFromSun !== undefined) updates.orderFromSun = orderFromSun;
        if (hasRings !== undefined) updates.hasRings = hasRings;

        // Handle mainAtmosphere if provided
        if (mainAtmosphere) {
            // Handle mainAtmosphere if it's a string
            mainAtmosphere = hasAtmosphere(mainAtmosphere);
            updates.mainAtmosphere = mainAtmosphere;
        }

        // Handle surfaceTemperatureC if provided
        if (surfaceTemperatureC) {
            let temperatureData = {};

            // If it's already an object
            if (typeof surfaceTemperatureC === 'object' && !Array.isArray(surfaceTemperatureC)) {
                temperatureData = {
                    min: surfaceTemperatureC.min !== undefined ? surfaceTemperatureC.min : 0,
                    max: surfaceTemperatureC.max !== undefined ? surfaceTemperatureC.max : 0,
                    mean: surfaceTemperatureC.mean !== undefined ? surfaceTemperatureC.mean : 0
                };
            }
            // If it's a string
            else if (typeof surfaceTemperatureC === 'string') {
                // Try to extract values using regex pattern for "min: -90.1, max: 57.3, mean: 15.2"
                const pattern = /min:\s*([-+]?\d*\.?\d+),\s*max:\s*([-+]?\d*\.?\d+),\s*mean:\s*([-+]?\d*\.?\d+)/i;
                const match = surfaceTemperatureC.match(pattern);

                if (match) {
                    temperatureData = {
                        min: parseFloat(match[1]),
                        max: parseFloat(match[2]),
                        mean: parseFloat(match[3])
                    };
                    console.log('Successfully parsed temperature string:', temperatureData);
                } else {
                    // If the regex didn't match, try another approach
                    console.log('Could not parse temperature string with regex:', surfaceTemperatureC);

                    // Try alternate formats - maybe it's inside braces
                    const bracesPattern = /\{.*min:\s*([-+]?\d*\.?\d+),\s*max:\s*([-+]?\d*\.?\d+),\s*mean:\s*([-+]?\d*\.?\d+).*}/i;
                    const bracesMatch = surfaceTemperatureC.match(bracesPattern);

                    if (bracesMatch) {
                        temperatureData = {
                            min: parseFloat(bracesMatch[1]),
                            max: parseFloat(bracesMatch[2]),
                            mean: parseFloat(bracesMatch[3])
                        };
                        console.log('Successfully parsed temperature string with braces pattern:', temperatureData);
                    } else {
                        console.log('Could not parse temperature string with braces pattern either');

                        // Try one more approach with separate value extraction
                        try {
                            // Extract values independently
                            const minMatch = surfaceTemperatureC.match(/min:\s*([-+]?\d*\.?\d+)/i);
                            const maxMatch = surfaceTemperatureC.match(/max:\s*([-+]?\d*\.?\d+)/i);
                            const meanMatch = surfaceTemperatureC.match(/mean:\s*([-+]?\d*\.?\d+)/i);

                            if (minMatch && maxMatch && meanMatch) {
                                temperatureData = {
                                    min: parseFloat(minMatch[1]),
                                    max: parseFloat(maxMatch[1]),
                                    mean: parseFloat(meanMatch[1])
                                };
                                console.log('Parsed temperature using individual property matches:', temperatureData);
                            }
                        } catch (e) {
                            console.log('Failed to parse with individual matches:', e);
                        }
                    }
                }
            }

            // Only set the temperature update if we successfully parsed values
            if (Object.keys(temperatureData).length > 0) {
                updates.surfaceTemperatureC = temperatureData;
            }
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
        res.status(500).json({success: false, message: `Something went wrong: ${error.message}`});
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

function validatePlanetInput(input) {
    // input is expected to look like this:
    // {
    //     "_id": ObjectId('ff30d2a3e781873fcb660'),
    //     "name": "Jupiter,
    //     "orderFromSun": 5,
    //     "hasRings": true,
    //     "mainAtmosphere": ["H2", "He", "CH4"],
    //     surfaceTemperatureC: {min: 0, max: 1, mean: 0.5}
    // }
    let {name, orderFromSun, hasRings} = input; //this is called deconstruction

    // Sanitize the name
    name = typeof name === 'string' ? name.trim() : name;

    if (!name) {
        return{valid: false, error: 'Invalid planet name'};
    }
}

function isValidId(id) {
    return (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) ||  // 24-char hex string
        (id instanceof Uint8Array && id.length === 12) ||               // 12-byte Uint8Array
        (Number.isInteger(id));
}

module.exports = router;