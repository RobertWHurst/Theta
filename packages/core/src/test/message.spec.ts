import assert from 'assert'
import { Message } from '../message'
import theta from './fixture/theta'
import pattern from './fixture/pattern'

describe('new Message(theta: Theta)', () => {

  it('can be constructed passing it an instance of theta', () => {
    assert.doesNotThrow(() => { new Message(theta()) })
  })

  describe('.fromEncodedData(): Message', () => {

    it('returns an instance of Message constructed from a theta instance and encoded data', async () => {
      const encodedData = 'ENCODED_DATA'
      const message = await Message.fromEncodedData(theta({
        decoder: (encodedData: string) => {
          assert.strictEqual(encodedData, 'ENCODED_DATA')
          return 'DATA'
        },
        classifier: (data: any) => {
          assert.strictEqual(data, 'DATA')
          return 'PATH'
        }
      }), encodedData)
      assert.strictEqual((message as any)._path, 'PATH')
      assert.deepStrictEqual(message.data, 'DATA')
    })
  })

  describe('#_tryToApplyPattern(pattern: Pattern): boolean', () => {

    it('populates channel, path, and params if the message matches the given pattern and returns true', () => {
      const message = new Message(theta())
      ;(message as any)._path = 'RAW_PATH'

      assert.ok(message.$$tryToApplyPattern(pattern({
        tryMatch: (path: string) => {
          assert.strictEqual(path, 'RAW_PATH')
          return {
            channel: 'CHANNEL',
            path: 'PATH',
            params: 'PARAMS'
          }
        }
      })))

      assert.strictEqual(message.channel, 'CHANNEL')
      assert.strictEqual(message.path, 'PATH')
      assert.strictEqual(message.params, 'PARAMS')
    })

    it('returns false if the message does not apply to the given pattern', () => {
      const message = new Message(theta())
      ;(message as any)._path = 'RAW_PATH'

      assert.ok(!message.$$tryToApplyPattern(pattern({
        tryMatch: (path: string) => {
          assert.strictEqual(path, 'RAW_PATH')
          return
        }
      })))

      assert.ok(!message.channel)
      assert.ok(!message.path)
      assert.strictEqual(Object.keys(message.params).length, 0)
    })
  })
})
