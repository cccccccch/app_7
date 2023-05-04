/*
 * @Author: Dywade
 * @Date: 2022-02-18 11:04:11
 * @LastEditTime: 2022-02-18 11:29:06
 * @LastEditors: Dywade
 * @Description: 
 */
interface getUrlQueryData {
    token?: string;
    platform?: string;
    deviceId?: string | number;
    familyId?: string | number;
    dataTypeEnum?: string;
    userId?: string | number;
    appVersion?: string;
    statusbarheight?: string | number;
}

const hex2rgb = (hex: string) => {
    if (!hex || typeof hex !== "string" || hex.length !== 7) {
        return hex;
    }
    hex = hex.replace("#", "0x");
    const r = ((hex as any) & 0xff0000) >> 16;
    const g = ((hex as any) & 0xff00) >> 8;
    const b = (hex as any) & 0xff;
    return [r, g, b];
};
const getUrlQuery = (url: any) => {
    if (!url) return url;
    let result: any = {};
    const reg = /([^?&=]+)=([^?&=]+)/g;
    url.replace(reg, ($1: any, $2: any, $3: any) => $2 !== null && $2 !== undefined && (result[$2] = $3.split("#/").shift()));
    return result;
};
const rgb2xyz = (r: number, g: number, b: number) => {
    const x = r * 0.49 + g * 0.31 + b * 0.2;
    const y = r * 0.17697 + g * 0.8124 + b * 0.01063;
    const z = r * 0.0 + g * 0.01 + b * 0.99;
    return { x, y, z };
};

const xyz2xy = (x: number, y: number, z: number) => {
    const xx = x / (x + y + z);
    const yy = y / (x + y + z);
    return Math.round(xx * 65536) + " " + Math.round(yy * 65536);
};

const gamma_correction = (value: number) => {
    if (value > 0.04045) {
        return Math.pow((value + 0.055) / 1.055, 2.4);
    } else {
        return value / 12.92;
    }
};

const rgb2xy = (r: number, g: number, b: number) => {
    const xyz = rgb2xyz(gamma_correction(r), gamma_correction(g), gamma_correction(b));
    return xyz2xy(xyz.x, xyz.y, xyz.z);
};

export { hex2rgb, getUrlQuery, rgb2xy }