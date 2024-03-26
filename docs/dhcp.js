export function parseDHCP(hexString) {
    console.log("Hexadecimal string:", hexString);

    const decimals = hexString.match(/.{2}/g).map(hex => parseInt(hex, 16));
  
    const deviceIP = decimals.slice(0, 4).join('.');
    const mask = decimals.slice(4, 8).join('.');
    const gateway = decimals.slice(8, 12).join('.');
    const main_dns = decimals.slice(12, 16).join('.');
    const sec_dns = decimals.slice(16, 20).join('.');

    return {
      deviceIP,
      mask,
      gateway,
      main_dns,
      sec_dns
    };
  }
  