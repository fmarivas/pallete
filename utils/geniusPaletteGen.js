const { createCanvas } = require('canvas');
const express = require('express');
const tinycolor = require('tinycolor2');

//Funcoes para validar dados
// Função para validar se a cor é hexadecimal
function isValidHex(color) {
    return /^([0-9A-Fa-f]{6})$/i.test(color);
}

// Função para validar se os valores RGB são inteiros entre 0 e 255
function isValidRGB(r, g, b) {
    return Number.isInteger(parseInt(r, 10)) && parseInt(r, 10) >= 0 && parseInt(r, 10) <= 255 &&
        Number.isInteger(parseInt(g, 10)) && parseInt(g, 10) >= 0 && parseInt(g, 10) <= 255 &&
        Number.isInteger(parseInt(b, 10)) && parseInt(b, 10) >= 0 && parseInt(b, 10) <= 255;
}

// Função para converter cor RGB para Hexadecimal
function rgbToHex(r, g, b) {
	// Converte um valor para sua representação hexadecimal
	const toHex = (value) => {
		const hex = Math.max(0, Math.min(255, value)).toString(16); // Converte para hexadecimal
		return hex.length === 1 ? '0' + hex : hex; // Adiciona um zero à esquerda, se necessário
	};

	return toHex(Math.max(0, Math.min(255, r))) +
		   toHex(Math.max(0, Math.min(255, g))) +
		   toHex(Math.max(0, Math.min(255, b)));
}

// Função para converter cor Hexadecimal para RGB
function hexToRgb(hex) {
	let r = parseInt(hex.substring(1, 3), 16);
	let g = parseInt(hex.substring(3, 5), 16);
	let b = parseInt(hex.substring(5, 7), 16);
	return { r, g, b };
}

class paletteGen {
    static availableComb() {
        //Number of combination
        const combination = [
            "monochromatic",
            "complementary",
            "Triadic",
            "Analogous",
            "Split-Complementary",
            "Tetradic (Double-Complementary)",
            "Square",
        ];

        return combination;
    }

    static monochromaticColors(color) {
        // Gerar uma matriz de cores monocromáticas com base na cor fornecida
        const tones = tinycolor(color).monochromatic();

        // Mapear a matriz de objetos TinyColor para uma matriz de strings hexadecimais
        const hexColors = tones.map(t => t.toHexString());

        // Ordenar tons do mais escuro ao mais claro com base na luminosidade
        hexColors.sort((b, a) => {
            const luminanceA = tinycolor(a).getLuminance();
            const luminanceB = tinycolor(b).getLuminance();
            return luminanceA - luminanceB;
        });

        return hexColors;
    }

    static complementaryColors(color) {
        // Obter cor complementar
        const complement = tinycolor(color).complement();

        // Retornar array com cor original e complementar
        return [
            tinycolor(color).toHexString(),
            complement.toHexString()
        ];
    }

	static triadicColors(color) {

	  // Obter variações triádicas
	  const triadic = tinycolor(color).triad();

	  // Extrair cores hexadecimais
	  const colors = [
		"#"+rgbToHex(color.r, color.g, color.b),
		triadic[1].toHexString(),
		triadic[2].toHexString()
	  ];

	  // Retornar paleta tríade
	  return colors;
	}
    
	static analogousColors(color) {

	  // Obter cores análogas
	  const analogs = tinycolor(color).analogous();

	  // Extrair cores hexadecimais
	  const colors = [
	   "#"+rgbToHex(color.r, color.g, color.b), 
		analogs[1].toHexString(),
		analogs[2].toHexString()
	  ];

	  // Retornar paleta
	  return colors; 

	}
	
	static splitComplementaryColors(color) {
	  // Obter cores split-complementares
	  const splits = tinycolor(color).splitcomplement();

	  // Extrair cores hexadecimais
	  const colors = [
		"#"+rgbToHex(color.r, color.g, color.b), 
		splits[1].toHexString(),
		splits[2].toHexString()
	  ];

	  // Retornar paleta
	  return colors;
	}	
	

	static tetradicColors(color) {
	  // Obter cores tetrádicas
	  const tetrad = tinycolor(color).tetrad();

	  // Extrair cores hexadecimais
	  const colors = [
		"#"+rgbToHex(color.r, color.g, color.b), 
		tetrad[1].toHexString(),
		tetrad[2].toHexString(),
		tetrad[3].toHexString()
	  ];

	  // Retornar paleta
	  return colors;
	  
	}


	static squareColors(color) {
	  // Obter variações quadradas
	  const square = tinycolor(color).tetrad();

	  // Extrair cores hexadecimais, removendo a cor original
	  const originalHex = `#${rgbToHex(color.r, color.g, color.b)}`;
	  const squareHex = square.map(c => c.toHexString());

	  // Verifica se a cor original já está presente na matriz
	  const hasOriginal = squareHex.includes(originalHex);

	  // Se a cor original não estiver presente, adiciona-a à matriz
	  if (!hasOriginal) {
		squareHex.unshift(originalHex);
	  }

	  // Verificar se há menos de 4 cores
	  if (squareHex.length < 4) {
		// Se houver menos de 4 cores, calcular as cores restantes
		const remaining = 4 - squareHex.length;
		for (let i = 0; i < remaining; i++) {
		  // Calcula a cor equidistante no círculo cromático
		  const newColor = tinycolor(color).spin(90 * (i + 1)).toHexString();
		  // Verifica se a nova cor já está presente na matriz
		  const hasNewColor = squareHex.includes(newColor);
		  // Se a nova cor não estiver presente, adiciona-a à matriz
		  if (!hasNewColor) {
			squareHex.push(newColor);
		  }
		}
	  }

	  // Retorna a paleta
	  return squareHex;
	}
	
    static generateCombination(color_client) {
        if ((isValidHex(color_client)) || isValidRGB(...color_client.split(','))) {
            // Se a entrada for válida, continue com o processamento normal
            let color;
            let rgbColor;

            if (isValidHex(color_client)) {
                // Formata como #RRGGBB se for hexadecimal
                color = `#${color_client}`;
                // Converte de hex to RGB
                rgbColor = hexToRgb(color);
            } else {
                const [r, g, b] = color_client.split(',').map(Number);
                // Formata o RGB
                rgbColor = { r, g, b };
            }

            return {
                monochromatic: paletteGen.monochromaticColors(rgbColor),
                complementary: paletteGen.complementaryColors(rgbColor),
                triad: paletteGen.triadicColors(rgbColor),
                analogous: paletteGen.analogousColors(rgbColor),
                splitComplementary: paletteGen.splitComplementaryColors(rgbColor),
                tetrad: paletteGen.tetradicColors(rgbColor),
                square: paletteGen.squareColors(rgbColor),
            };
        } else {
            return { error: 'A cor fornecida é inválida.' };
        }
    }
}

module.exports = paletteGen;
