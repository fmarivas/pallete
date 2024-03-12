const express = require('express')
const router = express.Router()
const axios = require('axios')
const tinycolor = require("tinycolor2");
const palette = require('../utils/geniusPaletteGen')

router.get('/', (req , res) =>{
	res.send("Welcome to your color palettes app!");
})

//Conjunto de todas combinacoes existentes na API
router.get("/schemes", (req, res)=>{
	const combination = palette.availableComb()
	res.json({combination})
})
	
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

// Manipulador de rota para a rota /palette/:combinationID
router.get("/palette/:combinationID", async (req, res) => {
    // const combinationID = req.params.combinationID;
    // let color_client = req.query.type;
	
    // Verifica se a combinação é suportada
    // if (!combinationID.includes(combinationID)) {
        // return res.status(400).json({ error: 'Combinação não suportada.' });
    // }
	
	// let color = tinycolor(color_client)
	
	// if(color.getFormat() === "name"){
		// color_client = color.toHex()
		
	// }

    // Verifica se a cor fornecida é válida
    // if ((isValidHex(color_client)) || (color_client.includes(',') && isValidRGB(...color_client.split(',')))) {
        // const combination = generateCombinationByType(color_client, combinationID);
        // if (combination) {
            // res.json({ [combinationID]: combination });
        // } else {
            // res.status(400).json({ error: 'Erro ao gerar a combinação.' });
        // }
    // } else {
        // res.status(400).json({ error: 'A cor fornecida é inválida.' });
    // }
});

module.exports = router