/**
 * @param color - Color to parse
 * @example parseColor('rgba(255,15,50,.2)')
 * parseColor('rgb(50,60,20)')
 * parseColor('pink')
 * parseColor('hsla(120,100%,50%,0.3)')
 * @description Helper function that will parse colors for RGBA color space
 * @returns Array length 4 where each value corresponds to RGBA
 */
export declare function parseColor(color: string): Array<number>;
/**
 * @description Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * @param h - The hue
 * @param s - The saturation (percentage)
 * @param l - The lightness (percentage)
 * @returns The RGB representation
 */
export declare function hslToRgb(h: number, s: number, l: number): Array<number>;
/**
 * @description Converts a given hex color to RGB
 * @param color - The hex color
 * @returns The RGB representation
 */
export declare function hexToRgb(color: string): Array<number>;
/**
 * @description Convert color string of any type to RGBA string
 * @param color - Color string to parse
 * @returns RGBA string for CSS
 */
export declare function getRGBA(color: string): string;
/**
 * @description
 * @param min The minimum value to return
 * @param max The maximum value to return
 * @param int Specifies whether the value returned should be an integer
 * @returns Random number between min and max
 */
export declare function getRandomNumber(min: number, max: number, int?: boolean): number;
/**
 * @description This is a shallow object difference function
 * @param a The root object
 * @param b The new object
 * @returns Object containing the different entries
 */
export declare function objectDiff<T>(a: T, b: T): {
    [key: string]: any;
};
/**
 * @description A function to map a decimal to a color
 * @param x X coordinate of point
 * @param y Y coordinate of point
 * @param width Width of canvas
 * @param height Height of canvas
 * @param colors Array of colors specified by string
 * @param returnString Should the function return a string
 */
export declare function gradient(x: number, y: number, width: number, height: number, colors: Array<string>, returnString?: boolean): string | [number, number, number, number];
/**
 * @description Better rounding function that returns a number
 * @param value Value to round
 * @param decimals How many decimal places to round to
 * @returns Float rounded to the specified decimal place
 */
export declare function round(value: number, decimals: number): number;
/**
 * @description Function to flatten an array of arrays
 * @param arr Array to flatten
 */
export declare function flattenArray(arr: any[]): any[];
