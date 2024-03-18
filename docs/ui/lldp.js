import {html} from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';
import {parseLLDP} from '../lldp.js';

function extendObj(base, key, ext) {
  if (!base[key]) base[key] = {};
  base[key] = {...base[key], ...ext};
}

export default {
  uuid: {
    lldp: 0xFF02,
    vlan: 0xFF03,
  },
  update: (c)=>{
    const lldp = parseLLDP(c.value.lldp);
    const lldpStatus = c.value.lldp && c.value.lldp.byteLength ? lldp.length ? 'good' : c.value.lldp.byteLength > 2 ? 'bad' : 'ok' : 'unknown';

    const cleanValues = {
      'System name': lldp.find(v=>v.name==='System name')?.value,
      'Chassis ID': lldp.find(v=>v.name==='Chassis ID')?.value?.value,
      'Port description': lldp.find(v=>v.name==='Port description')?.value,
      'Port ID': lldp.find(v=>v.name==='Port ID')?.value?.value,
      'Extended Power-via-MDI': lldp.find(v=>(
        v.name==='Vendor Specific'
        && v.value.subtypeName === 'Extended Power-via-MDI'
      )),
    }
const managementAddress = cleanValues['Management address']?.['Address']?.['IPv4'];
    const tiles = [
      tile('Switch', cleanValues['System name'] || cleanValues['Chassis ID'], 'ok', cleanValues['Chassis ID']),
      tile('Management Address', managementAddress, 'ok', cleanValues['Management address']),
      tile('Port', cleanValues['Port description'] || cleanValues['Port ID'], 'ok', cleanValues['Port ID']),
      tile('POE', cleanValues['Extended Power-via-MDI']?.value?.value?.['Power value'], 'good', cleanValues['Extended Power-via-MDI'])
    ];

    const detail = lldp.map(tlv=>`${tlv.name}: ${JSON.stringify(tlv.value, null, 2)}`).join('\n');

    return html`
      ${tile('LLDP', lldpStatus.toUpperCase(), lldpStatus, detail)}
      ${tile('VLAN', vlanStatus.toUpperCase(), vlanStatus, detectedVlans)}
      ${tiles}
      ${Object.entries(vlans).map(([id, vlan])=>tile(
        (vlan.untagged ? 'Native ' : '') + (vlan.role || '') + ' VLAN',
        vlan.name ? id+'\n'+vlan.name : id,
        getVLANState(vlan),
        {id: id, ...vlan},
      ))}
    `;
  }
}
