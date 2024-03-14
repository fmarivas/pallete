const { createCanvas } = require('canvas');
const express = require('express');
const tinycolor = require('tinycolor2');
const getImageColors = require('get-image-colors')

//Funcoes auxiliares
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


// Função para converter a cor RGB para HSL
function rgbToHsl(rgbColor) {
    // Extrair os valores de RGB
    const match = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    const r = parseInt(match[1]) / 255;
    const g = parseInt(match[2]) / 255;
    const b = parseInt(match[3]) / 255;

    // Calcular o valor máximo e mínimo entre R, G e B
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Calcular a luminosidade (lightness)
    const l = (max + min) / 2;

    // Calcular a saturação (saturation)
    let s, h;
    if (max === min) {
        s = 0;
    } else {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    }

    // Calcular o matiz (hue)
    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = ((g - b) / (max - min)) % 6;
    } else if (max === g) {
        h = (b - r) / (max - min) + 2;
    } else {
        h = (r - g) / (max - min) + 4;
    }

    // Converter o matiz para graus
    h *= 60;
    if (h < 0) {
        h += 360;
    }

    // Retornar a cor no formato HSL
    return `hsl(${h.toFixed(0)}, ${s.toFixed(2) * 100}%, ${l.toFixed(2) * 100}%)`;
}

// Função para converter a cor RGB para HSV
function rgbToHsv(rgbColor) {
    // Extrair os valores de RGB
    const match = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    const r = parseInt(match[1]) / 255;
    const g = parseInt(match[2]) / 255;
    const b = parseInt(match[3]) / 255;

    // Calcular o valor máximo e mínimo entre R, G e B
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Calcular a saturação (saturation)
    const s = max === 0 ? 0 : 1 - min / max;

    // Calcular o matiz (hue)
    let h;
    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = (g - b) / (max - min);
    } else if (max === g) {
        h = 2 + (b - r) / (max - min);
    } else {
        h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) {
        h += 360;
    }

    // Calcular o valor (value)
    const v = max * 100;

    // Retornar a cor no formato RGB
    return `rgb(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(v)}%)`;
}

// Função para converter a cor RGB para HEX
function rgbToHex2(rgbColor) {
    // Extrair os valores de RGB
    const match = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');

    // Retornar a cor no formato HEX
    return `#${r}${g}${b}`.toUpperCase();
}


class paletteGen {
    static availableComb() {
        //Number of combination
        const combination = [
            "monochromatic",
            "complementary",
            "triad",
            "analogous",
            "splitComplementary",
            "tetrad",
            "square",
        ];
        return combination;
    }
	static colorPallete(){
		const Colors = [
			'rgb(255, 255, 0)',     // Amarelo (Primary)
			'rgb(154, 205, 50)', // Amarelo-esverdeado  (Terceary)
			'rgb(0, 128, 0)',       // Verde  (Secundary)
			'rgb(0, 128, 128)', // Verde-azulado  (Terceary)
			'rgb(0, 0, 255)',       // Azul (Primary)
			'rgb(139, 0, 255)', // Azul-violeta  (Terceary)
			'rgb(128, 0, 128)',     // Violeta (Secundary)
			'rgb(139, 0, 139)', // Violeta-avermelhado  (Terceary)
			'rgb(255, 0, 0)',       // Vermelho (Primary)
			'rgb(255, 69, 0)', // Laranja-avermelhado  (Terceary)
			'rgb(255, 165, 0)',     // Laranja (Secundary)
			'rgb(255, 215, 0)', // Amarelo-laranja  (Terceary)
		];	
		
		return Colors
	}

	// Função para obter o rótulo de cor com base no tipo de cor especificado
	static getColorLabel(color, color_type) {
		if (color_type === "RGB") {
			return color;
		} else if (color_type === "HSL") {
			const hslColor = rgbToHsl(color);
			return hslColor; // Supondo que hslColor seja uma string no formato "hsl(x, y%, z%)"
		} else if (color_type === "HSV") {
			const hsvColor = rgbToHsv(color);
			return hsvColor; // Supondo que hsvColor seja uma string no formato "hsv(x, y%, z%)"
		} else if (color_type === "HEX") {
			const hexColor = rgbToHex2(color);
			return hexColor; // Supondo que hexColor seja uma string no formato "#xxxxxx"
		}
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
        if (isValidHex(color_client) || (typeof color_client === 'string' && isValidRGB(...color_client.split(',')))) {
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
            return { error: 'The provided color is invalid.' };
        }
    }
		
	// Função para gerar a roda de cores com rótulos
	static generateColorWheel(colors, color_type) {
		const canvasSize = 1000;
		const radius = canvasSize / 2;
		const canvas = createCanvas(canvasSize, canvasSize);
		const context = canvas.getContext('2d');
		const angleStep = (2 * Math.PI) / colors.length;

		// Limpar o canvas
		context.clearRect(0, 0, canvasSize, canvasSize);

		// Desenhar a roda de cores
		colors.forEach((colorInfo, index) => {
			const { color, label } = colorInfo;
			const startAngle = (index - 3.5) * angleStep;
			const endAngle = startAngle + angleStep;

			// Desenhar o setor da roda de cores
			context.beginPath();
			context.moveTo(radius, radius);
			context.arc(radius, radius, radius, startAngle, endAngle);
			context.closePath();
			context.fillStyle = color;
			context.fill();

			// Adicionar o rótulo
			context.font = "20px Arial";
			context.fillStyle = "black";
			context.textAlign = "center";
			const midAngle = startAngle + angleStep / 2;
			const textX = radius * 0.8 * Math.cos(midAngle) + radius; // Posição X do texto
			const textY = radius * 0.8 * Math.sin(midAngle) + radius; // Posição Y do texto
			context.fillText(label, textX, textY);		
		});

		return canvas.toBuffer();
	}
	
	// Função para gerar a combinação correspondente com base no ID fornecido
	static generateCombinationByType(color_client, combinationID) {
		// Verifica se a cor fornecida é válida
		if (isValidHex(color_client) || (typeof color_client === 'string' && isValidRGB(...color_client.split(',')))) {
			let rgbColor;
			let color; 
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

			switch (combinationID) {
				case 'monochromatic':
					return paletteGen.monochromaticColors(rgbColor);
				case 'complementary':
					return paletteGen.complementaryColors(rgbColor);
				case 'triad':
					return paletteGen.triadicColors(rgbColor);
				case 'analogous':
					return paletteGen.analogousColors(rgbColor);
				case 'splitComplementary':
					return paletteGen.splitComplementaryColors(rgbColor);
				case 'tetrad':
					return paletteGen.tetradicColors(rgbColor);
				case 'square':
					return paletteGen.squareColors(rgbColor);
				default:
					return null; // Combinação não suportada
			}
		} else {
			return { error: 'The provided color is invalid.' };
		}			
	}

	static async imageColorExtrator(imgUrl){
		
		try{
			const colors = await getImageColors(imgUrl);
			const hexValue = colors.map(color => tinycolor(`rgba(${color._rgb[0]}, ${color._rgb[1]}, ${color._rgb[2]}, ${color._rgb[3]})`).toHexString());
			return hexValue;
		}catch(error){
			console.error(error)
			throw new Error("Internal Server Error")
		}
	}

	
}


module.exports = paletteGen;
