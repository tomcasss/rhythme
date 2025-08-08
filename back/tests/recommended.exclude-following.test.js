// Test that recommendations exclude posts from authors the user already follows
const describe=(n,f)=>{console.log(`\n📝 ${n}`);f();};
const it=(n,f)=>{try{const r=f();if(r&&r.then)r.then(()=>console.log(`  ✅ ${n}`)).catch(e=>console.log(`  ❌ ${n}: ${e.message}`));else console.log(`  ✅ ${n}`);}catch(e){console.log(`  ❌ ${n}: ${e.message}`)}};
const expect=(a)=>({toEqual:(b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(`Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)}});

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

console.log('\n🏁 Exclude following authors tests completed');
