import { describe, it, expect, vi, beforeAll } from 'vitest';

import { ipfsService } from '../services/ipfs';

// jsdom provides File/Blob

describe('ipfsService', () => {
  beforeAll(() => {
    // jsdom may not implement createObjectURL
    // @ts-ignore
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
  });

  it('mockUpload returns blob URL and hash', () => {
    const f = new File([new Blob(['data'])], 'a.mp3', { type: 'audio/mpeg' });
    const res = ipfsService.mockUpload(f);
    expect(res.hash).toMatch(/^Qm/);
    expect(res.url.startsWith('blob:')).toBe(true);
    expect(res.size).toBe(f.size);
  });

  it('getUrl builds gateway url', () => {
    expect(ipfsService.getUrl('HASH')).toContain('HASH');
  });

  it('uploadTrackWithMetadata composes upload results', async () => {
    const f = new File([new Blob(['audio'])], 'track.mp3', { type: 'audio/mpeg' });
    const cover = new File([new Blob(['img'])], 'cover.png', { type: 'image/png' });
    const spy = vi
      .spyOn(ipfsService, 'uploadFile')
      .mockResolvedValueOnce({ hash: 'ha', url: 'uA', size: f.size }) // audio
      .mockResolvedValueOnce({ hash: 'hc', url: 'uC', size: cover.size }) // cover
      .mockResolvedValueOnce({ hash: 'hm', url: 'uM', size: 10 }); // metadata

    const res = await ipfsService.uploadTrackWithMetadata(f, { title: 't', artist: 'a', coverImage: cover });
    expect(res?.audioHash).toBe('ha');
    expect(res?.coverHash).toBe('hc');
    expect(res?.metadataUrl).toBe('uM');

    spy.mockRestore();
  });
});
