import { km, shortAddr } from '../lib/geo.js';
import Quiz from './Quiz.jsx';

export default function CoursePanel({ course, byId, places, stamps, quizId, onQuiz, onSolved, onCloseQuiz, onMove, onRemove, onGo, onClear, onClearStamps }) {
  let dist = 0;
  for (let i = 1; i < course.length; i++) dist += km(byId.get(course[i - 1]), byId.get(course[i]));
  const done = course.filter(id => stamps.includes(id)).length;

  return (
    <section className="panel" style={{ gridColumn: '1/-1' }}>
      <h2>나의 답사 코스 · 퀴즈 스탬프</h2>
      <div className="sub">
        {course.length
          ? `${course.length}곳 · 순서대로 이동 시 약 ${dist.toFixed(1)}km`
          : '아직 찜한 곳이 없습니다. 목록이나 지도에서 ♡ 찜을 눌러 보세요.'}
      </div>
      <div className="bar"><i style={{ width: course.length ? (done / course.length) * 100 + '%' : 0 }} /></div>
      <div className="sub">
        {course.length ? (done === course.length ? '🎉 코스 완주! 모든 도장을 모았어요.' : `도장 ${done} / ${course.length}`) : ''}
      </div>

      {quizId != null && byId.has(quizId) && (
        <Quiz key={quizId} place={byId.get(quizId)} all={places} onSolved={onSolved} onClose={onCloseQuiz} />
      )}

      <ol id="course">
        {course.map((id, i) => {
          const d = byId.get(id);
          const s = stamps.includes(id);
          return (
            <li key={id} className={s ? 'done' : ''}>
              <span className="n">{i + 1}</span>
              <span className="nm" onClick={() => onGo(id)}>
                <b>{d.name}</b> <span className="sub">{shortAddr(d)}</span>
              </span>
              <button className="btn" disabled={i === 0} onClick={() => onMove(id, -1)}>▲</button>
              <button className="btn" disabled={i === course.length - 1} onClick={() => onMove(id, 1)}>▼</button>
              <button className={'btn warn' + (s ? ' on' : '')} onClick={() => !s && onQuiz(id)}>
                {s ? '도장 ✔' : '퀴즈 풀기'}
              </button>
              <button className="btn" onClick={() => onRemove(id)}>✕</button>
            </li>
          );
        })}
      </ol>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn" onClick={onClear}>코스 비우기</button>
        <button className="btn" onClick={onClearStamps}>도장 초기화</button>
      </div>
    </section>
  );
}
