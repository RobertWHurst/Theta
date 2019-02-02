import { Pattern } from '../pattern'
import assert from 'assert'

describe('new Pattern(raw: string)', () => {

  it('can parse basic/path', () => {
    const pattern = new Pattern('basic/path')
    assert.strictEqual(pattern.raw, 'basic/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?basic\\/path\\/?)$')
  })

  it('can parse /basic/path', () => {
    const pattern = new Pattern('/basic/path')
    assert.strictEqual(pattern.raw, 'basic/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?basic\\/path\\/?)$')
  })

  it('can parse basic/path/', () => {
    const pattern = new Pattern('basic/path/')
    assert.strictEqual(pattern.raw, 'basic/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?basic\\/path\\/?)$')
  })

  it('can parse :key/path', () => {
    const pattern = new Pattern(':key/path')
    assert.strictEqual(pattern.raw, ':key/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?(?<key>[^\\/]+)\\/path\\/?)$')
  })

  it('can parse */path', () => {
    const pattern = new Pattern('*/path')
    assert.strictEqual(pattern.raw, '*/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?[^\\/]+\\/path\\/?)$')
  })

  it('can parse *([a-z]+)/path', () => {
    const pattern = new Pattern('*([a-z]+)/path')
    assert.strictEqual(pattern.raw, '*([a-z]+)/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?[a-z]+\\/path\\/?)$')
  })

  it('can parse path/+', () => {
    const pattern = new Pattern('path/+')
    assert.strictEqual(pattern.raw, 'path/+')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?path\\/.+)')
  })

  it('correctly handles escapes', () => {
    const pattern = new Pattern('escaped\\/path\\#chars\\\\in')
    assert.strictEqual(pattern.raw, 'escaped\\/path#chars\\\\in')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?escaped\\/path#chars\\\\in\\/?)$')
  })

  it('correctly handles channels', () => {
    const pattern = new Pattern('ch@and/path')
    assert.strictEqual(pattern.raw, 'ch@and/path')
    assert.strictEqual(pattern.pattern.source, '^(ch)@(\\/?and\\/path\\/?)$')
  })

  it('correctly handles multiple channels', () => {
    const pattern = new Pattern('ch1@ch2@and/path')
    assert.strictEqual(pattern.raw, 'ch1@ch2@and/path')
    assert.strictEqual(pattern.pattern.source, '^(ch1|ch2)@(\\/?and\\/path\\/?)$')
  })

  it('escapes regex chars outside of the segment\'s pattern', () => {
    const pattern = new Pattern('$basic/path')
    assert.strictEqual(pattern.raw, '$basic/path')
    assert.strictEqual(pattern.pattern.source, '^(?:([^@]+)@)?(\\/?\\$basic\\/path\\/?)$')
  })

  it('throws if a segment\'s pattern contains a regular expression group', () => {
    assert.throws(() => { new Pattern('*(([a-z]+))/path') }, /groups/)
  })

  it('throws if a segment\'s pattern is trailed by additional characters', () => {
    assert.throws(() => { new Pattern('*([a-z]+)invalid/path') }, /found after/)
  })

  it('throws if key name contains invalid characters', () => {
    assert.throws(() => { new Pattern(':$[]key([a-z]+)/path') }, /key names/)
  })

  describe('#tryMatch(path: string): Params', () => {

    it('can match path /basic/path', () => {
      const pattern = new Pattern('basic/path')
      const path = '/basic/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('can match path basic/path', () => {
      const pattern = new Pattern('basic/path')
      const path = 'basic/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('can match path basic/path/', () => {
      const pattern = new Pattern('basic/path')
      const path = 'basic/path/'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('can match value/path with pattern :key/path', () => {
      const pattern = new Pattern(':key/path')
      const path = 'value/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 1)
      assert.strictEqual(match.params.key, 'value')
    })

    it('can match path value/path with pattern */path', () => {
      const pattern = new Pattern('*/path')
      const path = 'value/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('can match path value/path with pattern */path', () => {
      const pattern = new Pattern('*/path')
      const path = 'value/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('can match path $basic/path with pattern $basic/path', () => {
      const pattern = new Pattern('$basic/path')
      const path = '$basic/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('can match path path/with/several/segments with pattern path/+', () => {
      const pattern = new Pattern('path/+')
      const path = 'path/with/several/segments'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(Object.keys(match.params).length, 0)
    })

    it('correctly isolates expected channels', () => {
      const pattern = new Pattern('ch@basic/path')
      const path = 'ch@basic/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(match.channel, 'ch')
      assert.strictEqual(match.path, 'basic/path')
    })

    it('correctly isolates unexpected channels', () => {
      const pattern = new Pattern('basic/path')
      const path = 'ch@basic/path'
      const match: any = pattern.tryMatch(path)
      assert.ok(match)
      assert.strictEqual(match.channel, 'ch')
      assert.strictEqual(match.path, 'basic/path')
    })

    it('does not match missing keys path/:key', () => {
      const pattern = new Pattern('path/:key')
      const path = 'path'
      assert.ok(!pattern.tryMatch(path))
    })

    it('does not match unrelated paths', () => {
      const pattern = new Pattern('basic.path')
      const path = 'other.path'
      assert.ok(!pattern.tryMatch(path))
    })
  })
})
