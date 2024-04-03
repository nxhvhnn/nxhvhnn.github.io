//import './mock/ble.js';

import {html, render} from 'https://unpkg.com/lit-html@1.4.1?module';
import {until} from 'https://unpkg.com/lit-html@1.4.1/directives/until.js?module';
import {live} from 'https://unpkg.com/lit-html@1.4.1/directives/live.js?module';
import {connectDevice, disconnect, watchCharacteristic, canReconnect} from './ble.js';
import {
  saveSnapshot,
  saveSnapshotDescription,
  removeSnapshot,
  loadSnapshot,
  listSnapshots,
  shareSnapshot,
  importSnapshot
} from './snapshot.js'
import tile, {createTileContainer} from './ui/tile.js';

import helpUi from './ui/help.js';
import ethUi from './ui/eth.js';
import lldpUi from './ui/lldp.js';
import stpUi from './ui/stp.js';
import dhcpUi from './ui/dhcp.js';
import vlnaUi from './ui/vlan.js';

const bleService = 0x00FF;

const bleStatus = {
  unavailable: ['unavailable', 'bad', html`<p>
    Web Bluetooth is unavailable on your system or browser.
    Apple decided against implementing this API - Mozilla followed.
    Google Chrome, Edge (Chromium) and Opera should work fine, if the device has BLE capabilities.
  </p>`],
  failed: ['FAILED!', 'bad'],
  not_connected: ['connect', 'ok', connect],
  connecting: ['connecting...', 'ok'],
  connected: ['connected', 'good', ()=>window.location.reload()],
  disconnected: ['disconnected', 'bad'],
  history: ['connect', 'unknown', connect],
}

const bleContainer = createTileContainer('BLE');
const characteristics = [ethUi, dhcpUi, lldpUi, vlnaUi, stpUi].map(c=>({
  ...c,
  value: typeof c.uuid === 'object' ?
    Object.fromEntries(Object.entries(c.uuid).map(([k])=>
      [k,new DataView(new ArrayBuffer(0))]
    )) : new DataView(new ArrayBuffer(0)),
  lastChange: null,
  dom: createTileContainer(),
}));
const helpContainer = createTileContainer('HELP');

let selectedSnapshot = null;

async function setBleStatus(status, snapshotName) {
  const connected = status === bleStatus.connected;
  const history = status === bleStatus.history;

  if (history && !snapshotName) await loadSnapshot();
  if (status === bleStatus.failed) {
    window.setTimeout(() => setBleStatus(bleStatus.not_connected), 1500);
    await loadSnapshot();
  }

  let historySnapshots = listSnapshots(bleService);

  const historySelect = historySnapshots.map((v) => [
    v[1].time + (v[1].imported ? ' *' : ''), html`
      <button
        class="dark warn"
        @click=${() => {
          console.log('Clicked delete button for snapshot:', v[0]);
          removeSnapshot(v[0]);
          const currentIndex = historySnapshots.findIndex(
            (item) => item[0] === v[0]
          );
          if (currentIndex !== -1 && currentIndex < historySnapshots.length - 1) {
            const nextSnapshot = historySnapshots[currentIndex + 1][0];
            selectedSnapshot = nextSnapshot;
            loadSnapshot(nextSnapshot);
            setBleStatus(bleStatus.history, nextSnapshot);
          } else if (currentIndex > 0) {
            const prevSnapshot = historySnapshots[currentIndex - 1][0];
            selectedSnapshot = prevSnapshot;
            loadSnapshot(prevSnapshot);
            setBleStatus(bleStatus.history, prevSnapshot);
          } else {
            selectedSnapshot = null;
          }
        }}
      >
        ❌ delete
      </button>
      <button
        class="dark ok"
        @click=${(e) => {
          shareSnapshot(v[0])
            .catch((e) => e.message)
            .then((msg) => {
              const prev = e.target.textContent;
              e.target.textContent = msg;
              window.setTimeout(() => {
                e.target.textContent = prev;
              }, 1000);
            });
        }}
      >
        📨 share
      </button>
      <div>
        <!-- this div somehow prevents autofocus on the textarea if the parent is display: flex -->
        <textarea
          class="dark wide"
          placeholder="Add description"
          rows="6"
          @keyup=${(e) => saveSnapshotDescription(v[0], e.target.value, e)}
          .value=${v[1].description || ''}
        ></textarea>
      </div>
      ${v[1].imported && html`<p>* imported ${v[1].imported}</p>`}
    `,
    () => {
      loadSnapshot(v[0]);
      setBleStatus(bleStatus.history, v[0]);
      selectedSnapshot = v[0]; // Set selected snapshot
    },
  ]);
  const historyDashboard = [
    historySnapshots.length + ' entries',
    connected
      ? html`
          <form
            class="flex flex-gap"
            @submit=${async (e) => {
              e.preventDefault();
              const description = e.target.querySelector('[name="description"]')
                .value;
              await saveSnapshot(bleService, description);
              await loadSnapshot();
              historySnapshots = listSnapshots(bleService);
              setBleStatus(bleStatus.connected);
              // Call function to jump to the slide of the newly created snapshot
              selectSlideOfNewSnapshot();
            }}
          >
            <button class="dark good">💾 create new</button>
            <textarea
              class="dark wide"
              name="description"
              placeholder="Add description"
              rows="6"
            ></textarea>
          </form>
        `
      : html`
          <p>Connect to a device to take snapshots of its configuration!</p>
        `,
    () => (canReconnect() ? connect() : setBleStatus(bleStatus.history)),
  ];

  render(
    html`
      ${tile('BLE', ...status)}
      ${tile(
        'History',
        [historyDashboard, ...historySelect],
        selectedSnapshot ? 'good' : connected ? 'unknown' : 'ok'
      )}
      ${selectedSnapshot ? tile('Snapshot Details') : ''}
    `,
    bleContainer
  );
}

function selectSlideOfNewSnapshot() {
  const lastSlideIndex = document.querySelectorAll('.carousel__slide').length - 1;
  // Ensure the index is not negative
  if (lastSlideIndex >= 0) {
    const carousel = document.querySelector('.carousel');
    carousel.carousel('setSelectedIndex', lastSlideIndex);
  }
}


async function connect() {
  setBleStatus(bleStatus.connecting);
  const device = await connectDevice(bleService).catch(e=>{
    console.error(e);
    setBleStatus(bleStatus.failed);
  });
  if (!device) return;
  setBleStatus(bleStatus.connected);
  device.addEventListener('gattserverdisconnected', ()=>setBleStatus(bleStatus.disconnected));
  device.addEventListener('gattserverconnected', ()=>setBleStatus(bleStatus.connected));
}

async function init() {
  render(helpUi, helpContainer);

  characteristics.forEach(c=>{
    if (typeof c.uuid === 'object') {
      c.value = {};
      Object.entries(c.uuid).forEach(([name, uuid])=>{
        c.value[name] = new DataView(new ArrayBuffer(0));
        watchCharacteristic(uuid, (value, isNotify)=>{
          if (isNotify) c.lastChange = new Date();
          c.value[name] = value;
          render(value.byteLength ? c.update(c) : html``, c.dom);
        });
      })
    } else {
      c.value = new DataView(new ArrayBuffer(0));
      watchCharacteristic(c.uuid, (value, isNotify)=>{
        if (isNotify) c.lastChange = new Date();
        c.value = value;
        render(value.byteLength ? c.update(c) : html``, c.dom);
      })
    }
  });
  const isBluetoothAvailable = navigator.bluetooth ? await navigator.bluetooth.getAvailability() : false;

  if (isBluetoothAvailable) {
    setBleStatus(bleStatus.not_connected);
  } else {
    setBleStatus(bleStatus.unavailable);
  }
  if (window.location.hash.length > 0) {
    const name = await importSnapshot(window.location.hash.slice(1,Infinity));
    window.location.hash = '';
    loadSnapshot(name);
    const index = listSnapshots(bleService).findIndex((v)=>v.id === name);
    setBleStatus(bleStatus.history, name);
    bleContainer.classList.add('expand');
    const historySwipe = bleContainer.querySelector('.swipe');
    historySwipe.scrollTo(index + 1 * historySwipe.clientWidth, 0);
  }
}

init();
