// Quick test for genre-based filtering logic
const describe = (n,f)=>{console.log(`\n📝 ${n}`);f();};
const it=(n,f)=>{try{const r=f();if(r&&r.then)r.then(()=>console.log(`  ✅ ${n}`)).catch(e=>console.log(`  ❌ ${n}: ${e.message}`));else console.log(`  ✅ ${n}`);}catch(e){console.log(`  ❌ ${n}: ${e.message}`)}};
const expect=(a)=>({toBe:(b)=>{if(a!==b)throw new Error(`Expected ${b}, got ${a}`)},toEqual:(b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(`Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)}});

describe('Genre Filter Logic',()=>{
  it('Should select only posts whose spotifyContent.genres intersects user genres',()=>{
    const myGenres = new Set(['metal','heavy metal']);
    const posts = [
      { _id:'1', spotifyContent:{ genres:['pop','dance'] } },
      { _id:'2', spotifyContent:{ genres:['metal','thrash'] } },
      { _id:'3', spotifyContent:{ genres:['indie'] } },
      { _id:'4', spotifyContent:{ genres:['HEAVY METAL'] } },
      { _id:'5', spotifyContent:null },
    ];
    const filtered = posts.filter(p=>{
      const genres=(p.spotifyContent?.genres||[]).map(g=>String(g).toLowerCase());
      return genres.some(g=>myGenres.has(g));
    });
    expect(filtered.map(p=>p._id)).toEqual(['2','4']);
  });
});

console.log('\n🏁 Genre filter tests completed');
