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

// 2700k-6500k 每100K对应一个颜色
const templatureColor = [
    "#BDE0FE",
    "#C2E1FB",
    "#C7E1F8",
    "#CDE1F5",
    "#D2E2F2",
    "#D7E2EF",
    "#DDE3EC",
    "#E2E3E9",
    "#E7E3E7",
    "#ECE4E4",
    "#F2E4E1",
    "#F7E5DE",
    "#FBE5DB",
    "#FBE3D8",
    "#FBE2D4",
    "#FBE1D1",
    "#FCE0CE",
    "#FCDFCA",
    "#FCDDC7",
    "#FCDCC4",
    "#FCDBC0",
    "#FCDABD",
    "#FDD8BA",
    "#FDD7B6",
    "#FDD6B3",
    "#FDD5AF",
    "#FDD3AC",
    "#FDD2A9",
    "#FDD1A5",
    "#FED0A2",
    "#FECE9F",
    "#FECD9B",
    "#FECC98",
    "#FECB95",
    "#FECA91",
    "#FEC88E",
    "#FFC78A",
    "#FFC687",
    "#FFC584",
];
// 榜威灯是 2000k-6500k 每100K对应一个颜色
const templatureColor_BW = [
    "#BAE0FF",
    "#BFE0FC",
    "#C4E1FA",
    "#C9E1F7",
    "#CEE2F4",
    "#D2E2F2",
    "#D7E2EF",
    "#DCE3ED",
    "#E1E3EA",
    "#E6E3E8",
    "#EBE4E5",
    "#EFE4E2",
    "#F4E4E0",
    "#F9E5DD",
    "#FBE4DA",
    "#FBE3D7",
    "#FBE2D4",
    "#FBE1D1",
    "#FCE0CE",
    "#FCDFCB",
    "#FCDEC8",
    "#FCDCC5",
    "#FCDCC2",
    "#FCDABF",
    "#FCD9BC",
    "#FDD8B9",
    "#FDD7B6",
    "#FDD6B3",
    "#FDD5B0",
    "#FDD4AD",
    "#FDD3AA",
    "#FDD1A7",
    "#FED0A4",
    "#FECFA1",
    "#FECE9E",
    "#FECD9A",
    "#FECC97",
    "#FECB94",
    "#FECA91",
    "#FEC88E",
    "#FFC78B",
    "#FFC688",
    "#FFC585",
    "#FFC478",
    "#FFC480",
    "#FFC482",
];

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
export { templatureColor, templatureColor_BW, hex2rgb, getUrlQuery }