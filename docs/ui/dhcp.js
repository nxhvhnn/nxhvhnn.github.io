// ui/dhcp.js
import { html } from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';
import { parseDHCP } from '../dhcp.js'; 

const lables = {
  0: '?',
  1: '200 OK',
  2: '404 Not Found',
  3: '408 Request Timeout',
  4: '500 Internal Server Error',
  5: '502 Bad Gateway',
  6: '503 Service Unavailable',
  7: '504 Gateway Timeout',
};

const oknesses = {
  '?': 'Unknown',
  '200 OK': 'good',
  '404 Not Found': 'bad',
  '408 Request Timeout': 'bad',
  '500 Internal Server Error': 'bad',
  '502 Bad Gateway': 'bad',
  '503 Service Unavailable': 'bad',
  '504 Gateway Timeout': 'bad',
};

export default {
  uuid: 0xFF05,
    update: (c) => {
    const lable = c.value.byteLength ? lables[c.value.getUint8(21)] || 'Unknown!' : 'Not connected...';
    const okness = oknesses[lable];

    console.log(c.value.getUint8(21));
    const conn = c.value.byteLength > 22 && c.value.getUint8(22);
    const dhcpDataView = c.value;
    const dhcpHexString = Array.from(new Uint8Array(dhcpDataView.buffer))
                          .map(byte => byte.toString(16).padStart(2, '0'))
                          .join('');
    
    const dhcpInfo = parseDHCP(dhcpHexString); 
    console.log('Parsed DHCP info:', dhcpInfo); 
    
    if (conn === 1 && dhcpInfo.deviceIP !== '0.0.0.0') {
    return html`
      <div class="tile good">
        <span class="title">DHCP</span>
        <span class="value">GOOD</span>
      </div>
       ${tile('Device IP', dhcpInfo.deviceIP, 'ok', 'Device IPv4 Address: ' + dhcpInfo.deviceIP
                                             + '\nNetwork Mask: ' + dhcpInfo.mask
                                             + '\nDefault gateway: ' + dhcpInfo.gateway
                                             + '\nMain DNS: ' + dhcpInfo.main_dns
                                             + '\nSecondary DNS: ' + dhcpInfo.sec_dns)}
      
                                             <div class="tile ${okness}">
                                             <span class="title">Factorify Status</span>
                                             <span class="value">${lable}</span>
                                           </div>
                                             `;
   } else if (conn === 1 && dhcpInfo.deviceIP === '0.0.0.0') {
    return html`
      <div class="tile bad">
        <span class="title">DHCP</span>
        <span class="value">FAILED</span>
     </div>
      `;
   } else {
    return html`<div class="tile">
        <span class="title">DHCP</span>
        <span class="value">Reboot ESP for DHCP</span>
      </div>

    `
   }
  }
}
