import {html} from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';

const lables = {
  0x00: '?',
  0x01: 'Stopped',
  0x02: 'Started',
  0x03: 'DOWN',
  0x04: 'UP',
};
const oknesses = {
  '?': 'unknown',
  'Stopped': 'bad',
  'Started': 'ok',
  'DOWN': 'bad',
  'UP': 'good',
};

export default {
  uuid: 0xFF01,
  update: (c)=>{
    const lable = c.value.byteLength ? lables[c.value.getUint8(0)] || 'Unknown!' : 'Not connected...';
    const okness = oknesses[lable];

    const externalPower = c.value.byteLength > 1 && c.value.getUint8(1);
    const batteryLevel = c.value.byteLength > 2 && c.value.getUint8(2);

    return html`
      <div class="tile ${okness}">
        <span class="title">ETH</span>
        <span class="value">${lable}</span>
      </div>
      <div class="tile ${externalPower?'good':'ok'}">
        <span class="title">Power</span>
        <span class="value">${externalPower?'External':'Battery'}</span>
      </div>
      ${tile('Battery', batteryLevel && (batteryLevel+'%'), batteryLevel>50?'good':batteryLevel>25?'ok':'bad')}
      `;
  }
}
