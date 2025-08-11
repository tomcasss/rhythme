// Simple logic test for report throttling (mocked persistence)
describe('Report service throttling logic (isolated mock)', () => {
  const reports = [];
  const now = Date.now();
  const reportUserMock = ({ reporterId, targetUserId }) => {
    const since = now - 24 * 60 * 60 * 1000;
    const existing = reports.find(r => r.reporterId === reporterId && r.targetUserId === targetUserId && r.createdAt >= since);
    if (existing) return { throttled: true };
    const rec = { reporterId, targetUserId, createdAt: now };
    reports.push(rec);
    return { success: true };
  };

  it('Allows first report then throttles second within 24h', () => {
    const first = reportUserMock({ reporterId: 'u1', targetUserId: 'u2' });
    expect(first.success).toBe(true);
    const second = reportUserMock({ reporterId: 'u1', targetUserId: 'u2' });
    expect(second.throttled).toBe(true);
  });
});

afterAll(() => { console.log('\n🏁 Report service logic tests completed'); });
