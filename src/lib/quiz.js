const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const dongOf = d => (d.addr.split(' ')[2] || '').replace(/\d.*$/, '');
const cityOf = d => (d.addr.includes('서귀포시') ? '서귀포시' : '제주시');

export function makeQuiz(d, all) {
  const dong = dongOf(d);
  if (d.id % 2 === 1 && dong) {
    const others = shuffle([...new Set(all.map(dongOf).filter(x => x && x !== dong))]).slice(0, 3);
    return {
      q: `"${d.name}"은(는) 어느 동네(읍·면·동)에 있을까요?`,
      opts: shuffle([dong, ...others]),
      ans: dong,
      hint: `힌트: ${cityOf(d)}에 있어요.`,
    };
  }
  const others = shuffle(all.filter(x => x.id !== d.id && x.title !== d.title)).slice(0, 3);
  const area = d.addr.replace('제주특별자치도 ', '').split(' ').slice(0, 2).join(' ');
  return {
    q: `"${d.title}" 자료는 어느 장소에 관한 이야기일까요?`,
    opts: shuffle([d.name, ...others.map(x => x.name)]),
    ans: d.name,
    hint: `힌트: 분류는 "${d.category || '기타'}", 위치는 ${area} 쪽이에요.`,
  };
}
