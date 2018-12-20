import Pattern from '../pattern'
import assert from 'assert'

describe('Pattern', () => {

  it('can parse /basic/path', () => {
    const pattern = new Pattern('/basic/path')
    assert.strictEqual(pattern.raw, 'basic/path')
    assert.strictEqual(pattern.pattern.source, '^basic\\/path$')
  })

  it('can parse basic/path', () => {
    const pattern = new Pattern('basic/path')
    assert.strictEqual(pattern.raw, 'basic/path')
    assert.strictEqual(pattern.pattern.source, '^basic\\/path$')
  })

  it('can parse :key/path', () => {
    const pattern = new Pattern(':key/path')
    assert.strictEqual(pattern.raw, ':key/path')
    assert.strictEqual(pattern.pattern.source, '^(?<key>[^\\/]+)\\/path$')
  })

  it('can parse */path', () => {
    const pattern = new Pattern('*/path')
    assert.strictEqual(pattern.raw, '*/path')
    assert.strictEqual(pattern.pattern.source, '^[^\\/]+\\/path$')
  })

  it('can parse path/+', () => {
    const pattern = new Pattern('path/+')
    assert.strictEqual(pattern.raw, 'path/+')
    assert.strictEqual(pattern.pattern.source, '^path\\/.+')
  })

  it('can match path /basic/path', () => {
    const pattern = new Pattern('basic/path')
    const path = '/basic/path'
    const params: any = pattern.tryMatch(path)
    assert.ok(params)
    assert.strictEqual(Object.keys(params).length, 0)
  })

  it('can match path basic/path', () => {
    const pattern = new Pattern('basic/path')
    const path = 'basic/path'
    const params: any = pattern.tryMatch(path)
    assert.ok(params)
    assert.strictEqual(Object.keys(params).length, 0)
  })

  it('pattern :key/path can match value/path', () => {
    const pattern = new Pattern(':key/path')
    const path = 'value/path'
    const params: any = pattern.tryMatch(path)
    assert.ok(params)
    assert.strictEqual(Object.keys(params).length, 1)
    assert.strictEqual(params.key, 'value')
  })

  it('pattern */path can match path value/path', () => {
    const pattern = new Pattern('*/path')
    const path = 'value/path'
    const params: any = pattern.tryMatch(path)
    assert.ok(params)
    assert.strictEqual(Object.keys(params).length, 0)
  })

  it('pattern path/+ can match path path/with/several/segments', () => {
    const pattern = new Pattern('path/+')
    const path = 'path/with/several/segments'
    const params: any = pattern.tryMatch(path)
    assert.ok(params)
    assert.strictEqual(Object.keys(params).length, 0)
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
