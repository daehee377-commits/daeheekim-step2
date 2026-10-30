import { useMemo, useState } from 'react';
import { makeQuiz } from '../lib/quiz.js';

export default function Quiz({ place, all, onSolved, onClose }) {
  const quiz = useMemo(() => makeQuiz(place, all), [place, all]);
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);

  const pick = opt => {
    if (opt === quiz.ans) {
      setSolved(true);
      onSolved(place.id);
    } else {
      setWrong(w => [...w, opt]);
    }
  };

  return (
    <div className="quiz">
      <h3>📜 {place.name} 퀴즈</h3>
      <div className="q">{quiz.q}</div>
      <div className="opts">
        {quiz.opts.map(o => (
          <button key={o} className="btn" disabled={solved || wrong.includes(o)} onClick={() => pick(o)}>
            {o}
          </button>
        ))}
      </div>
      <div className="fb">
        {solved && (
          <>
            <span className="ok">정답! 도장을 찍었어요 🎉</span>
            <div className="sub">{place.content.slice(0, 160)}…</div>
          </>
        )}
        {!solved && wrong.length > 0 && (
          <span className="no">아쉬워요, 다시 골라 보세요. {quiz.hint}</span>
        )}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
