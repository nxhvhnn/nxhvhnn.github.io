import {html} from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';
import {parseLLDP} from '../lldp.js';

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
      'Management address': lldp.find(v=>v.name==='Management address')?.value,
      'Port ID': lldp.find(v=>v.name==='Port ID')?.value?.value,
      'Extended Power-via-MDI': lldp.find(v=>(
        v.name==='Vendor Specific'
        && v.value.subtypeName === 'Extended Power-via-MDI'
      )),
      'Port VLAN ID': lldp.find(v=>
        v.name==='Vendor Specific'
        && v.value.subtypeName === 'Port VLAN ID'
      )?.value?.value,
      'Network Policy Voice': lldp.find(v=>
        v.name==='Vendor Specific'
        && v.value.subtypeName === 'Network Policy'
        && v.value.value['Application Type']==='Voice'
      ),
      'VLAN Name': lldp.filter(v=>
        v.name==='Vendor Specific'
        && v.value.subtypeName === 'VLAN Name'
      )
    }
    const managementAddress = cleanValues['Management address']?.['Address']?.['IPv4'];

    const tiles = [
      tile('Switch', cleanValues['System name'] || cleanValues['Chassis ID'], 'ok', cleanValues['Chassis ID']),
      tile('Management Address', managementAddress, 'ok', cleanValues['Management address']),      tile('POE', cleanValues['Extended Power-via-MDI']?.value?.value?.['Power value'], 'good', cleanValues['Extended Power-via-MDI']),
      tile('Port', cleanValues['Port description'] || cleanValues['Port ID'], 'ok', cleanValues['Port ID'])
    ];

    const detail = lldp.map(tlv=>`${tlv.name}: ${JSON.stringify(tlv.value, null, 2)}`).join('\n');

    return html`
      ${tile('LLDP', lldpStatus.toUpperCase(), lldpStatus, detail)}
      ${tiles}
    `;
  }
}
