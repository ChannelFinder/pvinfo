const okCol = "#" + process.env.REACT_APP_OK_SEVERITY_COLOR;
const minorCol = "#" + process.env.REACT_APP_MINOR_SEVERITY_COLOR;
const majorCol = "#" + process.env.REACT_APP_MAJOR_SEVERITY_COLOR;
const invalidCol = "#" + process.env.REACT_APP_INVALID_SEVERITY_COLOR;
const undefinedCol = "#" + process.env.REACT_APP_UNDEFINED_SEVERITY_COLOR;


// modBrightness function sourced from https://natclark.com/tutorials/javascript-lighten-darken-hex-color/
const modBrightness = (hexColor, magnitude) => {
    hexColor = hexColor.replace(`#`, ``);
    if (hexColor.length === 6) {
        const decimalColor = parseInt(hexColor, 16);
        let r = (decimalColor >> 16) + magnitude;
        r > 255 && (r = 255);
        r < 0 && (r = 0);
        let g = (decimalColor & 0x0000ff) + magnitude;
        g > 255 && (g = 255);
        g < 0 && (g = 0);
        let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
        b > 255 && (b = 255);
        b < 0 && (b = 0);
        return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
        return hexColor;
    }
};

const severityColors = {
    OK: okCol,
    MINOR: minorCol,
    MAJOR: majorCol,
    INVALID: invalidCol,
    UNDEFINED: undefinedCol,
    MINOR_ACK: modBrightness(minorCol, 50),
    MAJOR_ACK: modBrightness(majorCol, -50),
    INVALID_ACK: modBrightness(invalidCol, 75),
    UNDEFINED_ACK: modBrightness(undefinedCol, 50),
};

const colors = {
    SEV_COLORS: severityColors,
}

export default colors;
