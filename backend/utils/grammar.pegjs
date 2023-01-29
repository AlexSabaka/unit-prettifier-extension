// Accepts expressions like "2 1/2", "3/10", "5", "1.2", "0,5" and computes their value.

Number "number"
  = number:(Integer / Fraction / FractionWithWhole / Float)
  {
    return number[0] / number[1];
  }

FractionWithWhole
  = whole:Integer _ frac:Fraction
  {
    return [
    	whole[0] * frac[1] + whole[1] * frac[0],
        whole[1] * frac[1]
    ];
  }

Fraction "fraction"
  = divisor:Integer _ "/" _ divider:Integer
  { 
    return [ divisor[0], divider[0] ];
  }

FractionCharacter "fracChar"
  = [½⅓⅕⅙⅛⅔⅖⅚⅜¾⅗⅝⅞⅘¼⅐⅑⅒]
  {
    const values = {
      '½': [1, 2],
      '⅓': [1, 3],
      '⅕': [1, 5],
      '⅙': [1, 6],
      '⅛': [1, 8],
      '⅔': [2, 3],
      '⅖': [2, 5],
      '⅚': [5, 6],
      '⅜': [3, 8],
      '¾': [3, 4],
      '⅗': [3, 5],
      '⅝': [5, 8],
      '⅞': [7, 8],
      '⅘': [4, 5],
      '¼': [1, 4],
      '⅐': [1, 7],
      '⅑': [1, 9],
      '⅒': [1, 10],
    };
    return values[text()];
  }
  
Float "float"
  = [0-9]* FracDivisorCharacter [0-9]* [1-9] { return [parseFloat(text()), 1]; }

FracDivisorCharacter "fracDivisorChar"
 = ',' / '.'

Integer "integer"
  = [1-9] [0-9]* { return [parseInt(text()), 1]; }

_ "whitespace"
  = [ \t\n\r]+
