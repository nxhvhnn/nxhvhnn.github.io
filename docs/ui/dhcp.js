// ui/dhcp.js
import { html } from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';
import { parseDHCP } from '../dhcp.js'; 

export default {
  uuid: {
    dhcp: 0xFF06,
    eth: 0xFF01,
  },
  update: (c) => {
    const conn = c.value.eth.byteLength > 4 && c.value.eth.getUint8(4);
    console.log(c.value.eth.getUint8(4))
    const dhcpDataView = c.value.dhcp;
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
