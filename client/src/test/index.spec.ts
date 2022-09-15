import { theta } from "../index"
import { Client } from "../client"
import assert from "assert"

describe("theta(config?: Config)", () => {
  it("constructs an instance of client with opts and returns it", () => {
    const config = {}
    const client = theta(config)
    assert.equal((client as any)._config, config)
    assert.equal(client.constructor, Client)
  })
})
