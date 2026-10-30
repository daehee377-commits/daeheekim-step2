import bundled from '../data/places.json' with { type: 'json' };

const INFO_KEY = process.env.JEJU_CULTURE_INFO_KEY;
const LOCATION_KEY = process.env.JEJU_CULTURE_LOCATION_KEY;
const INFO_URL = process.env.JEJU_CULTURE_INFO_URL;
const LOCATION_URL = process.env.JEJU_CULTURE_LOCATION_URL;

const keyOk = k => k && !k.startsWith('여기에');

function items(json) {
  const found = json?.response?.body?.items?.item ?? json?.items ?? json?.data ?? json;
  return Array.isArray(found) ? found : [];
}

async function call(url, key) {
  const u = new URL(url);
  u.searchParams.set('serviceKey', key);
  u.searchParams.set('pageNo', '1');
  u.searchParams.set('numOfRows', '1000');
  u.searchParams.set('type', 'json');
  const r = await fetch(u);
  if (!r.ok) throw new Error('upstream ' + r.status);
  return items(await r.json());
}

function merge(info, loc) {
  const g = new Map(info.map(x => [String(x['데이터 고유번호']), x]));
  return loc.map(l => {
    const x = g.get(String(l['데이터 고유번호'])) || {};
    return {
      id: Number(l['데이터 고유번호']), name: l['장소명'], lat: Number(l['위도']), lng: Number(l['경도']),
      zip: l['우편번호'], addr: l['위치'], url: l['데이터 상세보기 URL'],
      category: x['분류'], dir1: x['디렉토리1'], dir2: x['디렉토리2'],
      title: x['제목'], author: x['저작자'], date: x['발행일'], content: x['내용'],
    };
  });
}

export default async function handler(req, res) {
  let places = bundled, source = 'bundled';
  if (keyOk(INFO_KEY) && keyOk(LOCATION_KEY) && INFO_URL && LOCATION_URL) {
    try {
      const [info, loc] = await Promise.all([call(INFO_URL, INFO_KEY), call(LOCATION_URL, LOCATION_KEY)]);
      const merged = merge(info, loc);
      if (merged.length) { places = merged; source = 'api'; }
    } catch (e) {
      console.error('open api failed:', e.message);
    }
  }
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.status(200).json({ source, count: places.length, places });
}
