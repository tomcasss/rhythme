// Tests de lógica de filtrado de visibilidad (simplificado sin BD)
describe('Visibility filtering logic (simplified)', () => {
  const isVisibilityAllowed = (viewer, owner, section) => {
    const setting = owner?.privacy?.[section] || 'public';
    if (String(owner._id) === String(viewer?._id)) return true;
    const viewerId = viewer?._id && String(viewer._id);
    const ownerId = owner?._id && String(owner._id);
    if (owner.blockedUsers?.some(id => String(id) === viewerId)) return false;
    if (viewer?.blockedUsers?.some(id => String(id) === ownerId)) return false;
    if (setting === 'public') return true;
    if (setting === 'followers') {
      return owner.followers?.some(id => String(id) === viewerId);
    }
    if (setting === 'private') return false;
    return true;
  };

  it('Filters out private posts for non-followers', () => {
    const owner = { _id: '1', privacy: { posts: 'followers' }, followers: ['2'] };
    const viewerFollower = { _id: '2' };
    const viewerStranger = { _id: '3' };
    expect(isVisibilityAllowed(viewerFollower, owner, 'posts')).toBe(true);
    expect(isVisibilityAllowed(viewerStranger, owner, 'posts')).toBe(false);
  });

  it('Blocks posts when owner blocked viewer', () => {
    const owner = { _id: '1', privacy: { posts: 'public' }, blockedUsers: ['2'] };
    const viewer = { _id: '2' };
    expect(isVisibilityAllowed(viewer, owner, 'posts')).toBe(false);
  });

  it('Viewer blocking owner also hides posts', () => {
    const owner = { _id: '1', privacy: { posts: 'public' } };
    const viewer = { _id: '2', blockedUsers: ['1'] };
    expect(isVisibilityAllowed(viewer, owner, 'posts')).toBe(false);
  });
});

afterAll(() => { console.log('\n🏁 Visibility filter tests completed'); });
