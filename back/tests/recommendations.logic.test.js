// Jest logic tests for recommendation scoring (friend & posts)

describe('Recommendations Logic Tests', () => {
  it('Friend-of-friend candidates should be counted and ranked', () => {
    const me = { _id: 'me', following: ['a','b'] };
    const friends = [{ following: ['x','y'] }, { following: ['y','z'] }];
    const already = new Set(['me','a','b']);
    const counts = new Map();
    for (const f of friends) {
      for (const cand of (f.following || [])) {
        const s = String(cand);
        if (!already.has(s)) counts.set(s, (counts.get(s)||0)+1);
      }
    }
    const ranked = Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]);
    expect(ranked[0][0]).toBe('y');
    expect(ranked[0][1]).toBe(2);
  });

  it('Post recommendation score should prefer follows and spotify matches', () => {
    const following = new Set(['u1']);
    const fof = new Set(['u2']);
    const preferredArtists = new Set(['Artist A']);
    const preferredIds = new Set(['sp123']);
    const candidate = {
      userId: { _id: 'u1' },
      likes: ['x','y','z'],
      spotifyContent: { artist: 'Artist A', spotifyId: 'sp123', type: 'track' },
      createdAt: new Date().toISOString(),
    };
    let score = 0;
    const authorId = String(candidate.userId._id);
    if (following.has(authorId)) score += 5;
    if (fof.has(authorId)) score += 3;
    score += Math.min((candidate.likes||[]).length, 10) * 0.5;
    const sc = candidate.spotifyContent;
    if (sc) {
      if (preferredArtists.has(sc.artist||'')) score += 4;
      if (preferredIds.has(sc.spotifyId||'')) score += 6;
      if (sc.type === 'track') score += 1;
    }
    expect(score).toBe(5 + 0 + 1.5 + 4 + 6 + 1); // 17.5
  });
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('\n🏁 Recommendations logic tests completed');
});
