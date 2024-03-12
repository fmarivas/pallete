const express = require('express')
const router = express.Router()
const tinycolor = require("tinycolor2");
const palette = require('../utils/geniusPaletteGen')

router.get('/', (req , res) =>{
	res.send("Welcome to your color palettes app!");
})

/**
 * @swagger
 * /schemes:
 *   get:
 *     summary: Get available color combination schemes
 *     description: Retrieves a list of all available color combination schemes in the API.
 *     responses:
 *       200:
 *         description: Successful operation. Returns a list of available color combination schemes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 combination:
 *                   type: array
 *                   description: List of available color combination schemes.
 *                   items:
 *                     type: string
 */
//Conjunto de todas combinacoes existentes na API
router.get("/schemes", (req, res)=>{
	const combination = palette.availableComb()
	res.json({combination})
})


/**
 * @swagger
 * /palette:
 *   get:
 *     summary: Generate color palettes
 *     description: Generates color palettes based on the provided color.
 *     parameters:
 *       - in: query
 *         name: color
 *         description: Color for which to generate palettes. Can be in Color Name, HEX, RGB, HSL, or HSV format.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns generated color palettes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 colorCollection:
 *                   type: array
 *                   description: Collection of generated color palettes.
 *                   items:
 *                     type: object
 *                     properties:
 *                       monochromatic:
 *                         type: array
 *                         description: List of monochromatic colors.
 *                         items:
 *                           type: string
 *                       complementary:
 *                         type: array
 *                         description: List of complementary colors.
 *                         items:
 *                           type: string
 *                       triad:
 *                         type: array
 *                         description: List of triadic colors.
 *                         items:
 *                           type: string
 *                       analogous:
 *                         type: array
 *                         description: List of analogous colors.
 *                         items:
 *                           type: string
 *                       splitComplementary:
 *                         type: array
 *                         description: List of split-complementary colors.
 *                         items:
 *                           type: string
 *                       tetrad:
 *                         type: array
 *                         description: List of tetradic colors.
 *                         items:
 *                           type: string
 *                       square:
 *                         type: array
 *                         description: List of square colors.
 *                         items:
 *                           type: string
 *       400:
 *         description: Bad request. Returns an error message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */	
router.get("/palette", async (req, res) => { 
    let color_client = req.query.color; // Cor fornecida pelo usuário
	
	let color = tinycolor(color_client)
	
	if(color.getFormat() === "name"){
		color_client = color.toHex()
	}
	
    const result = palette.generateCombination(color_client);
    
    if (result.error) {
        res.status(400).json(result);
    } else {
        res.json({ colorColletion: [result] });
    }
});


/**
 * @swagger
 * /colorwheel:
 *   get:
 *     summary: Generate color wheel
 *     description: Generates a color wheel based on the provided color type.
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Type of color representation (RGB, HSL, HSV, or HEX).
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         description: Format of the color wheel image (e.g., png, jpeg).
 *         schema:
 *           type: string
 *           default: png
 *     responses:
 *       200:
 *         description: Successful operation. Returns the generated color wheel image.
 *       400:
 *         description: Bad request. Returns an error message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Rota da roda de cores
router.get("/colorwheel", (req, res) => {
    const color_type = req.query.type;
    const format = req.query.format || "png";
	const colors = [];
	
	const Colors = palette.colorPallete()
	
    if (color_type === "RGB" || color_type === "HSL" || color_type === "HSV" || color_type === "HEX") {
        for (let i = 0; i < Colors.length; i++) {
            const color = Colors[i];
            const label = palette.getColorLabel(color, color_type);
            colors.push({ color, label });
        }

        res.type(format).send(palette.generateColorWheel(colors));
    } else {
        res.status(400).json({ error: "Tipo de cor inválido. Os tipos suportados são RGB, HSL, HSV e HEX." });
    }
});

/**
 * @swagger
 * /palette/{combinationID}:
 *   get:
 *     summary: Generate color palette by combination ID
 *     description: Generates a color palette based on the provided color and combination ID.
 *     parameters:
 *       - in: path
 *         name: combinationID
 *         description: ID of the color combination scheme.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: color
 *         description: Color for which to generate the palette. Can be in HEX, RGB, HSL, or HSV format.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns the generated color palette.
 *       400:
 *         description: Bad request. Returns an error message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Manipulador de rota para a rota /palette/:combinationID
router.get("/palette/:combinationID", async (req, res) => {
    const combinationID = req.params.combinationID;
    let color_client = req.query.color;
	
    // Verifica se a combinação é suportada
    if (!combinationID.includes(combinationID)) {
        return res.status(400).json({ error: 'Combinação não suportada.' });
    }
	
	let color = tinycolor(color_client)
	
	if(color.getFormat() === "name"){
		color_client = color.toHex()
		
	}
	
	const combination = palette.generateCombinationByType(color_client, combinationID);
	
	if (combination) {
		res.json({ [combinationID]: combination });
	} else {
		res.status(400).json({ error: 'Erro ao gerar a combinação.' });
	}

});

module.exports = router