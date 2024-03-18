import {html} from 'https://unpkg.com/lit-html@1.4.1?module';
import tile from './tile.js';
import {parseLLDP} from '../lldp.js';
import {parseVLAN} from '../vlan.js';

function extendObj(base, key, ext) {
  if (!base[key]) base[key] = {};
  base[key] = {...base[key], ...ext};
}

function getVLANState(vlan) {
  if (vlan.announced && vlan.detected && vlan.traffic?.arp) return 'good';
  if (vlan.announced) return 'ok';
  return 'unknown';
}

export default {
  uuid: {
    lldp: 0xFF02,
    vlan: 0xFF03,
  },
  update: (c)=>{
    const lldp = parseLLDP(c.value.lldp);
    const vlanStatus = c.value.vlan && c.value.vlan.byteLength ? !(c.value.vlan.byteLength % 3) ? 'good' : 'bad' : 'unknown';
    const detectedVlans = vlanStatus === 'good' ?
      parseVLAN(c.value.vlan)
    : [];



    const vlans = {};

    const portVLAN = cleanValues['Port VLAN ID'];
    if (portVLAN) extendObj(vlans, portVLAN, {announced: true, role: 'Port'})

    const voiceVLAN = cleanValues['Network Policy Voice']?.value?.value?.['VLAN ID'];
    if (voiceVLAN) extendObj(vlans, voiceVLAN, {announced: true, role: 'Voice'})

    cleanValues['VLAN Name'].forEach(v=>
      extendObj(vlans, v.value.value.id, {name: v.value.value.name, announced: true})
    );

    detectedVlans.filter(v=>v.id!==0).forEach(v=>extendObj(vlans, v.id, {detected: true, tagged: true, traffic: v.traffic}));
    if (detectedVlans[0]?.id===0 && detectedVlans[0]?.traffic?.arp)
      extendObj(vlans, portVLAN || 0, {detected: true, untagged: true, traffic: detectedVlans[0].traffic});

    return html`
      ${tile('VLAN', vlanStatus.toUpperCase(), vlanStatus, detectedVlans)}
      ${Object.entries(vlans).map(([id, vlan])=>tile(
        (vlan.untagged ? 'Native ' : '') + (vlan.role || '') + ' VLAN',
        vlan.name ? id+'\n'+vlan.name : id,
        getVLANState(vlan),
        {id: id, ...vlan},
      ))}
    `;
  }
}
