import assert from "assert"
import { defaultEncoder } from "../encoder"

describe("defaultEncoder", () => {
  describe("#bundle(status, path, data) -> Promise(message)", () => {
    it("can bundle a message", async () => {
      const message = await defaultEncoder.bundle("ok", "test/path", { test: { data: "value" } })
      assert.deepEqual(message, {
        status: "ok",
        path: "test/path",
        data: { test: { data: "value" } },
      })
    })
  })

  describe("#encode(message) -> Promise(encodedData)", () => {
    it("can encode a message", async () => {
      const message = { status: "ok", path: "test/path", data: { test: { data: "value" } } }
      const encodedData = await defaultEncoder.encode(message)
      assert.equal(encodedData, JSON.stringify(message))
    })
  })

  describe("#decode(encodedData)-> Promise(message)", () => {
    it("can decode encodedData", async () => {
      const message = { status: "ok", path: "test/path", data: { test: { data: "value" } } }
      const decodedMessage = await defaultEncoder.decode(JSON.stringify(message))
      assert.deepEqual(decodedMessage, message)
    })
  })

  describe("#expand(message)-> Promise(message)", () => {
    it("can expand a message", async () => {
      const message = { status: "ok", path: "test/path", data: { test: { data: "value" } } }
      const expandedData = await defaultEncoder.expand(message)
      assert.deepEqual(expandedData, message)
    })
  })
})
