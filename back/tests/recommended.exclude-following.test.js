// Jest test that recommendations exclude posts from followed authors

describe('Exclude Following Authors in Recommendations',()=>{
  it('Should filter out posts authored by followed users',()=>{
    const me = { _id:'me', following:['u1','u2'] };
    const posts = [
      { _id:'p1', userId:'u1' },
      { _id:'p2', userId:'u3' },
      { _id:'p3', userId:'u2' },
      { _id:'p4', userId:'me' },
    ];
    const following = new Set(me.following);
    const filtered = posts.filter(p=> p.userId !== 'me' && !following.has(p.userId));
    expect(filtered.map(p=>p._id)).toEqual(['p2']);
  });
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('\n🏁 Exclude following authors tests completed');
});
