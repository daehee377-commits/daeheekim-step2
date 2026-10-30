import { shortAddr } from '../lib/geo.js';

export default function PlaceList({ shown, course, onToggle, onGo }) {
  if (!shown.length) return <p className="sub">검색 결과가 없습니다.</p>;
  return (
    <div id="list">
      {shown.map(d => {
        const on = course.includes(d.id);
        return (
          <div className="item" key={d.id}>
            <div className="t" onClick={() => onGo(d.id)}>
              <b>{d.name}</b>
              <span className="tag">{d.category || '기타'}</span>
              <span className="sub">{shortAddr(d)}</span>
            </div>
            <button className={'btn' + (on ? ' on' : '')} onClick={() => onToggle(d.id)}>
              {on ? '♥ 찜' : '♡ 찜'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
