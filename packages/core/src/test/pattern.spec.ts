import Pattern from '../pattern'
import { strict as assert } from 'assert'

describe('new Pattern(raw: string)', () => {

  it('can parse /basic/path', () => {
    const pattern = new Pattern('/basic/path')
    assert.equal(pattern.raw, 'basic/path')
    assert.equal(pattern.pattern.source, '^basic\\/path$')
  })

  it('can parse :key/path', () => {
    const pattern = new Pattern(':key/path')
    assert.equal(pattern.raw, ':key/path')
    assert.equal(pattern.pattern.source, '^(?<key>[^\\/]+)\\/path$')
  })

  it('can parse */path', () => {
    const pattern = new Pattern('*/path')
    assert.equal(pattern.raw, '*/path')
    assert.equal(pattern.pattern.source, '^[^\\/]+\\/path$')
  })

  it('can parse *([a-z]+)/path', () => {
    const pattern = new Pattern('*([a-z]+)/path')
    assert.equal(pattern.raw, '*([a-z]+)/path')
    assert.equal(pattern.pattern.source, '^[a-z]+\\/path$')
  })

  it('can parse path/+', () => {
    const pattern = new Pattern('path/+')
    assert.equal(pattern.raw, 'path/+')
    assert.equal(pattern.pattern.source, '^path\\/.+')
  })

  it('correctly handles escapes', () => {
    const pattern = new Pattern('escaped\\/path\\#chars\\\\in')
    assert.equal(pattern.raw, 'escaped\\/path#chars\\\\in')
    assert.equal(pattern.pattern.source, '^escaped\\/path#chars\\\\in$')
  })

  it('correctly handles namespaces', () => {
    const pattern = new Pattern('namespace@and/path')
    assert.equal(pattern.raw, 'namespace@and/path')
    assert.equal(pattern.namespace, 'namespace')
    assert.equal(pattern.pattern.source, '^and\\/path$')
  })

  it('escapes regex chars outside of the segment\'s pattern', () => {
    const pattern = new Pattern('$basic/path')
    assert.equal(pattern.raw, '$basic/path')
    assert.equal(pattern.pattern.source, '^\\$basic\\/path$')
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
      const params: any = pattern.tryMatch(path)
      assert.ok(params)
      assert.equal(Object.keys(params).length, 0)
    })

    it('can match path basic/path', () => {
      const pattern = new Pattern('basic/path')
      const path = 'basic/path'
      const params: any = pattern.tryMatch(path)
      assert.ok(params)
      assert.equal(Object.keys(params).length, 0)
    })

    it('pattern :key/path can match value/path', () => {
      const pattern = new Pattern(':key/path')
      const path = 'value/path'
      const params: any = pattern.tryMatch(path)
      assert.ok(params)
      assert.equal(Object.keys(params).length, 1)
      assert.equal(params.key, 'value')
    })

    it('pattern */path can match path value/path', () => {
      const pattern = new Pattern('*/path')
      const path = 'value/path'
      const params: any = pattern.tryMatch(path)
      assert.ok(params)
      assert.equal(Object.keys(params).length, 0)
    })

    it('pattern path/+ can match path path/with/several/segments', () => {
      const pattern = new Pattern('path/+')
      const path = 'path/with/several/segments'
      const params: any = pattern.tryMatch(path)
      assert.ok(params)
      assert.equal(Object.keys(params).length, 0)
    })

    it('does not match missing keys path/:key', () => {
      const pattern = new Pattern('path/:key')
      const path = 'path'
      const params: any = pattern.tryMatch(path)
      assert.ok(!params)
    })

    it('does not match unrelated paths', () => {
      const pattern = new Pattern('basic.path')
      const path = 'other.path'
      assert.ok(!pattern.tryMatch(path))
    })
  })
})
