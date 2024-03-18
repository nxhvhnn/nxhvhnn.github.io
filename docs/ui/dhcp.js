import {html} from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';

const lables = {
  0x00: '?',
  0x01: '5/5 Pings Received',
  0x02: 'Some Pings Received',
  0x03: 'FAILED',
  0x04: 'UP',
};
const oknesses = {
  '?': 'unknown',
  '5/5 Pings Received': 'good',
  'Some Pings Received': 'ok',
  'FAILED': 'bad',
};

export default {
  uuid: {
    eth: 0xFF01,
    dhcp: 0xFF05,
    dns: 0xFF06,
  },
  update: (c)=>{
  const lable = lables[c.value.eth.getUint8(3)] ;
  const okness = oknesses[lable];

  const val = c.value.dhcp.getUint8(0);
  
  const device_ip = `${c.value.dhcp.getUint8(0)}.${c.value.dhcp.getUint8(1)}.${c.value.dhcp.getUint8(2)}.${c.value.dhcp.getUint8(3)}`;
  const mask_ip = `${c.value.dhcp.getUint8(4)}.${c.value.dhcp.getUint8(5)}.${c.value.dhcp.getUint8(6)}.${c.value.dhcp.getUint8(7)}`;
  const gateway = `${c.value.dhcp.getUint8(8)}.${c.value.dhcp.getUint8(9)}.${c.value.dhcp.getUint8(10)}.${c.value.dhcp.getUint8(11)}`;
  
  const main_dns = `${c.value.dns.getUint8(0)}.${c.value.dns.getUint8(1)}.${c.value.dns.getUint8(2)}.${c.value.dns.getUint8(3)}`;
  const sec_dns = `${c.value.dns.getUint8(4)}.${c.value.dns.getUint8(5)}.${c.value.dns.getUint8(6)}.${c.value.dns.getUint8(7)}`;

  if (val != 0) {
    return html`
    <div class="tile ${device_ip?'good' :'bad'}">
      <span class="title">DHCP</span>
      <span class="value">${device_ip?'GOOD': 'NOT GOOD'}</span>
    </div>
    ${tile('Device IP', device_ip , device_ip?'ok':'bad', 'Device IPv4 Address: ' + device_ip
                                                          +'\nNetwork Mask: ' + mask_ip
                                                          +'\nDefault gateway: ' + gateway
                                                          +'\nMain DNS: ' + main_dns
                                                          +'\nSecondary DNS: ' + sec_dns
                                                          )}
    <div class="tile ${okness}">
      <span class="title">Factorify</span>
      <span class="value">${lable}</span>
    </div>
  `;
  } else {
    return html`
    <div class="tile">
      <span class="title">DHCP</span>
      <span class="value">Reboot ESP for DHCP</span>
    </div>
  `;
}}}