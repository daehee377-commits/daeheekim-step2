import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const esc = s =>
  String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function pinIcon(d, course, stamps) {
  const i = course.indexOf(d.id);
  const cls = i < 0 ? 'pin' : stamps.includes(d.id) ? 'pin st' : 'pin in';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"><span>${i < 0 ? '' : i + 1}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

function popupHtml(d, on) {
  return `<div class="pop"><h3>${esc(d.name)}</h3>
    <span class="tag">${esc(d.category || '기타')}</span><span class="sub">${esc(d.title)}</span>
    <div class="sub">${esc(d.addr)}</div>
    <div class="tx">${esc(d.content)}</div>
    <div class="bt"><button class="btn ${on ? 'on' : ''}" data-fav="${d.id}">${on ? '♥ 찜 해제' : '♡ 찜'}</button>
    <a href="${esc(d.url)}" target="_blank" rel="noopener">원문 보기</a></div></div>`;
}

export default function MapView({ places, shownIds, course, stamps, focus, fitKey, onToggle }) {
  const el = useRef(null);
  const s = useRef({ markers: new Map(), byId: new Map() });
  const latest = useRef({});
  latest.current = { course, stamps, onToggle };
  const firstFit = useRef(true);

  useEffect(() => {
    const map = L.map(el.current).setView([33.38, 126.55], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    s.current.map = map;
    s.current.layer = L.layerGroup().addTo(map);
    s.current.line = L.polyline([], { color: '#e07a2f', weight: 4, dashArray: '8 6' }).addTo(map);

    const node = el.current;
    const onClick = e => {
      const b = e.target.closest('[data-fav]');
      if (b) latest.current.onToggle(+b.dataset.fav);
    };
    node.addEventListener('click', onClick);
    return () => {
      node.removeEventListener('click', onClick);
      map.remove();
      s.current = { markers: new Map(), byId: new Map() };
    };
  }, []);

  useEffect(() => {
    const S = s.current;
    S.layer.clearLayers();
    S.markers = new Map();
    S.byId = new Map(places.map(p => [p.id, p]));
    places.forEach(d => {
      const m = L.marker([d.lat, d.lng], {
        icon: pinIcon(d, latest.current.course, latest.current.stamps),
        title: d.name,
      });
      m.bindPopup(() => popupHtml(d, latest.current.course.includes(d.id)));
      S.markers.set(d.id, m);
    });
  }, [places]);

  useEffect(() => {
    const S = s.current;
    S.markers.forEach((m, id) => {
      const d = S.byId.get(id);
      m.setIcon(pinIcon(d, course, stamps));
      if (shownIds.has(id)) {
        if (!S.layer.hasLayer(m)) S.layer.addLayer(m);
      } else {
        S.layer.removeLayer(m);
      }
      if (m.isPopupOpen()) m.getPopup().setContent(popupHtml(d, course.includes(id)));
    });
    S.line.setLatLngs(course.filter(id => S.byId.has(id)).map(id => [S.byId.get(id).lat, S.byId.get(id).lng]));
  }, [places, shownIds, course, stamps]);

  useEffect(() => {
    if (firstFit.current) {
      firstFit.current = false;
      return;
    }
    const S = s.current;
    const shown = places.filter(p => shownIds.has(p.id));
    if (shown.length && shown.length < places.length) {
      S.map.fitBounds(shown.map(d => [d.lat, d.lng]), { padding: [30, 30], maxZoom: 14 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  useEffect(() => {
    if (!focus) return;
    const S = s.current;
    const m = S.markers.get(focus.id);
    const d = S.byId.get(focus.id);
    if (!m || !d) return;
    if (!S.layer.hasLayer(m)) S.layer.addLayer(m);
    S.map.setView([d.lat, d.lng], 14);
    m.openPopup();
  }, [focus]);

  return <div ref={el} id="map" />;
}
