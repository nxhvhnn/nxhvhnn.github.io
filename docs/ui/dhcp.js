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
  },
  update: (c)=>{
  const lable = lables[c.value.eth.getUint8(3)];
  const okness = oknesses[lable];


  const val1 = c.value.dhcp.getUint8(0);
  const val2 = c.value.dhcp.getUint8(1);
  const val3 = c.value.dhcp.getUint8(2);
  const val4 = c.value.dhcp.getUint8(3);

  const val5 = c.value.dhcp.getUint8(4);
  const val6 = c.value.dhcp.getUint8(5);
  const val7 = c.value.dhcp.getUint8(6);
  const val8 = c.value.dhcp.getUint8(7);

  const val9 = c.value.dhcp.getUint8(8);
  const val10 = c.value.dhcp.getUint8(9);
  const val11 = c.value.dhcp.getUint8(10);
  const val12 = c.value.dhcp.getUint8(11);

  const val13 = c.value.dhcp.getUint8(12);
  const val14 = c.value.dhcp.getUint8(13);
  const val15 = c.value.dhcp.getUint8(14);
  const val16 = c.value.dhcp.getUint8(15);

  const val17 = c.value.dhcp.getUint8(16);
  const val18 = c.value.dhcp.getUint8(17);
  const val19 = c.value.dhcp.getUint8(18);
  const val20 = c.value.dhcp.getUint8(19);

  
  const device_ip = `${val1}.${val2}.${val3}.${val4}`;
  const mask_ip = `${val5}.${val6}.${val7}.${val8}`;
  const gateway = `${val9}.${val10}.${val11}.${val12}`;
  const main_dns = `${val13}.${val14}.${val15}.${val16}`;
  const sec_dns = `${val17}.${val18}.${val19}.${val20}`;

  if (val1 != 0) {
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