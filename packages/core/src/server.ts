import http from 'http'
import https from 'https'
import { default as WebSocket, Server as WebSocketServer } from 'ws'
import Theta from './theta'
import ConnectionManager from './connection-manager'
import Socket from './socket'
import Router from './router'

export default class Server {
  theta: Theta
  router: Router
  connectionManager: ConnectionManager
  _httpServer: http.Server | https.Server
  _socketServer: WebSocketServer

  constructor (theta: Theta) {
    this.theta = theta
    this.router = theta.router
    this.connectionManager = new ConnectionManager(theta, this)
    this._httpServer = this._setupHttpServer()
    this._socketServer = this._setupSocketServer()
  }

  listen (...args: any[]): void {
    if (!this._httpServer) { return }
    this._httpServer.listen(...args)
  }

  close (...args: any[]): void {
    if (!this._httpServer) { return }
    this._httpServer.close(...args)
  }

  _setupHttpServer (): http.Server | https.Server {
    if (this.theta.config.server) {
      return this.theta.config.server
    }
    if (this.theta.config.ssl) {
      return https.createServer(this.theta.config.ssl)
    }
    return http.createServer()
  }

  _setupSocketServer (): WebSocketServer {
    const socketServer = new WebSocketServer({
      backlog: this.theta.config.backlog,
      handleProtocols: this.theta.config.handleProtocols,
      path: this.theta.config.path,
      clientTracking: this.theta.config.clientTracking,
      maxPayload: this.theta.config.maxPayload,
      server: this._httpServer
    })
    socketServer.on('connection', r => this._handleConnection(r))
    return socketServer
  }

  _handleConnection (rawSocket: WebSocket) {
    const socket = new Socket(this.theta, this, rawSocket)
    this.connectionManager.add(socket)

    socket.on('error', err => { throw err })
    socket.on('message', async (context) => {
      await this.router.route(context)
      socket.clearRouterHandlers()
      if (context.$$handled) { return }
      await context.sendStatus('not-handled')
    })
  }
}
