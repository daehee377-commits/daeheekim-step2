import { useEffect, useMemo, useState } from 'react';
import MapView from './components/MapView.jsx';
import PlaceList from './components/PlaceList.jsx';
import CoursePanel from './components/CoursePanel.jsx';
import { usePlaces } from './hooks/usePlaces.js';
import { load, save } from './lib/storage.js';

export default function App() {
  const { status, places, practice } = usePlaces();
  const [cat, setCat] = useState('전체');
  const [q, setQ] = useState('');
  const [course, setCourse] = useState(() => load('jeju_course', []));
  const [stamps, setStamps] = useState(() => load('jeju_stamps', []));
  const [focus, setFocus] = useState(null);
  const [quizId, setQuizId] = useState(null);

  useEffect(() => save('jeju_course', course), [course]);
  useEffect(() => save('jeju_stamps', stamps), [stamps]);

  const byId = useMemo(() => new Map(places.map(p => [p.id, p])), [places]);
  const validCourse = useMemo(() => course.filter(id => byId.has(id)), [course, byId]);
  const cats = useMemo(() => ['전체', ...new Set(places.map(p => p.category || '기타'))], [places]);

  const shown = useMemo(() => {
    const t = q.trim();
    return places.filter(
      d => (cat === '전체' || (d.category || '기타') === cat) && (!t || (d.name + d.addr + d.title + d.content).includes(t))
    );
  }, [places, cat, q]);
  const shownIds = useMemo(() => new Set(shown.map(d => d.id)), [shown]);

  const toggle = id => setCourse(c => (c.includes(id) ? c.filter(x => x !== id) : [...c, id]));
  const move = (id, dir) =>
    setCourse(c => {
      const i = c.indexOf(id), j = i + dir;
      if (i < 0 || j < 0 || j >= c.length) return c;
      const n = c.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const go = id => {
    setFocus({ id, n: Date.now() });
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <header>
        <h1>제주 역사문화 퀴즈 투어</h1>
        <p>마음에 드는 곳을 찜 → 나만의 답사 코스로 연결 → 장소 퀴즈를 맞히면 도장 찍기 (제주특별자치도 제주역사문화 데이터, 기준일 2022-12-09)</p>
      </header>

      {practice && <div className="practice">연습 모드 — 서버(API)에서 데이터를 받지 못해 파일 데이터로 보여 주고 있어요.</div>}

      <main>
        <section className="panel">
          <MapView
            places={places}
            shownIds={shownIds}
            course={validCourse}
            stamps={stamps}
            focus={focus}
            fitKey={cat + '|' + q}
            onToggle={toggle}
          />
          <p className="sub">지도는 인터넷에 연결되어 있어야 보입니다.</p>
        </section>

        <section className="panel">
          <h2>장소 찾기 <span className="sub">{status === 'ready' ? shown.length + '곳' : ''}</span></h2>
          <div className="row">
            <input type="search" placeholder="장소명, 주소, 내용으로 검색" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            {cats.map(c => (
              <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          {status === 'loading' ? (
            <p className="sub" style={{ marginTop: 10 }}>불러오는 중...</p>
          ) : (
            <PlaceList shown={shown} course={validCourse} onToggle={toggle} onGo={go} />
          )}
        </section>

        <CoursePanel
          course={validCourse}
          byId={byId}
          places={places}
          stamps={stamps}
          quizId={quizId}
          onQuiz={setQuizId}
          onSolved={id => setStamps(s => (s.includes(id) ? s : [...s, id]))}
          onCloseQuiz={() => setQuizId(null)}
          onMove={move}
          onRemove={toggle}
          onGo={go}
          onClear={() => setCourse([])}
          onClearStamps={() => setStamps([])}
        />
      </main>
    </>
  );
}
