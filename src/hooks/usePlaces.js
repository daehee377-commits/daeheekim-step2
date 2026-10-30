import { useEffect, useState } from 'react';

// API로 받고, 실패하면 파일(data/places.json)로 대신 보여 주는 "연습 모드"
export function usePlaces() {
  const [state, setState] = useState({ status: 'loading', places: [], practice: false });

  useEffect(() => {
    let off = false;
    fetch('/api/places')
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(j => {
        if (!j.places?.length) throw new Error('empty');
        if (!off) setState({ status: 'ready', places: j.places, practice: false });
      })
      .catch(async () => {
        const m = await import('../../data/places.json');
        if (!off) setState({ status: 'ready', places: m.default, practice: true });
      });
    return () => {
      off = true;
    };
  }, []);

  return state;
}
