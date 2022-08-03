// @ts-check
import * as ws from 'ws'
import path from 'path'
import storeSystem from './store.js'
import Helper from './helper.js'
import { HelperConnection } from './simple.js'
import importFile from './import.js'
import db, { loadDatabase } from './database.js'
import single2multi from './single2multi.js'

/** @type {import('@adiwajshing/baileys')} */
// @ts-ignore
const {
    DisconnectReason,
    default: makeWASocket,
    // useSingleFileAuthState
} = (await import('@adiwajshing/baileys')).default

const authFolder = storeSystem.fixFileName(`${Helper.opts._[0] || ''}sessions`)
const authFile = `${Helper.opts._[0] || 'session'}.data.json`

const [isCredsExist, isAuthSingleFileExist] = await Promise.all([Helper.checkFileExists(authFolder + '/creds.json'), Helper.checkFileExists(authFile)])

let authState = await storeSystem.useMultiFileAuthState(authFolder)
const store = storeSystem.makeInMemoryStore()

// Convert single auth to multi auth
if (Helper.opts['singleauth'] || Helper.opts['singleauthstate']) {
    if (!isCredsExist && isAuthSingleFileExist) {
        console.debug('- singleauth -', 'creds.json not found', 'compiling singleauth to multiauth...')
        await single2multi(authFile, authFolder, authState)
        console.debug('- singleauth -', 'compiled successfully')
        authState = await storeSystem.useMultiFileAuthState(authFolder)
    } else if (!isAuthSingleFileExist) console.error('- singleauth -', 'singleauth file not found')
}

const storeFile = `${Helper.opts._[0] || 'data'}.store.json`
store.readFromFile(storeFile)

/** @type {import('@adiwajshing/baileys').UserFacingSocketConfig} */
const connectionOptions = {
    printQRInTerminal: true,
    auth: authState.state,
    // logger: pino({ level: 'trace' })
}

/** 
 * @typedef {{ handler?: typeof import('../handler').handler, participantsUpdate?: typeof import('../handler').participantsUpdate, groupsUpdate?: typeof import('../handler').groupsUpdate, onDelete?:typeof import('../handler').deleteUpdate, connectionUpdate?: typeof connectionUpdate, credsUpdate?: () => void }} EventHandlers
 * 
 * @typedef {ReturnType<makeWASocket> & { isInit?: boolean, isReloadInit?: boolean, msgqueque?: import('./queque').default } & EventHandlers} Socket 
 */


/** @type {Map<string, Socket>} */
let conns = new Map();
/** 
 * @param {Socket?} oldSocket 
 * @param {{ handler?: typeof import('../handler'), isChild?: boolean, connectionOptions?: import('@adiwajshing/baileys').UserFacingSocketConfig, store: typeof store }} opts
 */
async function start(oldSocket = null, opts = { store }) {
    /** @type {Socket} */
    let conn = makeWASocket({
        ...connectionOptions,
        ...opts.connectionOptions,
        getMessage: async (key) => (opts.store.loadMessage(/** @type {string} */(key.remoteJid), key.id) || opts.store.loadMessage(/** @type {string} */(key.id)) || {}).message || { conversation: 'Please send messages again' },
    })
    HelperConnection(conn)

    if (oldSocket) {
        conn.isInit = oldSocket.isInit
        conn.isReloadInit = oldSocket.isReloadInit
    }
    if (conn.isInit == null) {
        conn.isInit = false
        conn.isReloadInit = true
    }

    store.bind(conn.ev, {
        groupMetadata: conn.groupMetadata
    })
    await reload(conn, false, opts).then((success) => console.log('- bind handler event -', success))

    return conn
}


let OldHandler = null
/** 
 * @param {Socket} conn 
 * @param {boolean} restartConnection
 * @param {{ handler?: PromiseLike<typeof import('../handler')> | typeof import('../handler'), isChild?: boolean }} opts
 */
async function reload(conn, restartConnection, opts = {}) {
    if (!opts.handler) opts.handler = importFile(Helper.__filename(path.resolve('./handler.js'))).catch(console.error)
    if (opts.handler instanceof Promise) opts.handler = await opts.handler;
    if (!opts.handler && OldHandler) opts.handler = OldHandler
    OldHandler = opts.handler
    // const isInit = !!conn.isInit
    const isReloadInit = !!conn.isReloadInit
    if (restartConnection) {
        try { conn.ws.close() } catch { }
        // @ts-ignore
        conn.ev.removeAllListeners()
        Object.assign(conn, await start(conn) || {})
    }

    // Assign message like welcome, bye, etc.. to the connection
    Object.assign(conn, getMessageConfig())

    if (!isReloadInit) {
        if (conn.handler) conn.ev.off('messages.upsert', conn.handler)
        if (conn.participantsUpdate) conn.ev.off('group-participants.update', conn.participantsUpdate)
        if (conn.groupsUpdate) conn.ev.off('groups.update', conn.groupsUpdate)
        if (conn.onDelete) conn.ev.off('messages.delete', conn.onDelete)
        if (conn.connectionUpdate) conn.ev.off('connection.update', conn.connectionUpdate)
        if (conn.credsUpdate) conn.ev.off('creds.update', conn.credsUpdate)
    }
    if (opts.handler) {
        conn.handler = /** @type {typeof import('../handler')} */(opts.handler).handler.bind(conn)
        conn.participantsUpdate = /** @type {typeof import('../handler')} */(opts.handler).participantsUpdate.bind(conn)
        conn.groupsUpdate = /** @type {typeof import('../handler')} */(opts.handler).groupsUpdate.bind(conn)
        conn.onDelete = /** @type {typeof import('../handler')} */(opts.handler).deleteUpdate.bind(conn)
    }
    if (!opts.isChild) conn.connectionUpdate = connectionUpdate.bind(conn)
    conn.credsUpdate = authState.saveCreds.bind(conn)
    // conn.credsUpdate = authState.saveState.bind(conn)

    // @ts-ignore
    conn.ev.on('messages.upsert', conn.handler)
    // @ts-ignore
    conn.ev.on('group-participants.update', conn.participantsUpdate)
    // @ts-ignore
    conn.ev.on('groups.update', conn.groupsUpdate)
    // @ts-ignore
    conn.ev.on('messages.delete', conn.onDelete)
    // @ts-ignore
    if (!opts.isChild) conn.ev.on('connection.update', conn.connectionUpdate)
    // @ts-ignore
    conn.ev.on('creds.update', conn.credsUpdate)

    conn.isReloadInit = false
    return true

}

/**
 * @this {Socket}
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['connection.update']} update
 */
async function connectionUpdate(update) {
    console.log(update)
    // /** @type {Partial<{ connection: import('@adiwajshing/baileys').ConnectionState['connection'], lastDisconnect: { error: Error | import('@hapi/boom').Boom, date: Date }, isNewLogin: import('@adiwajshing/baileys').ConnectionState['isNewLogin'] }>} */
    const { connection, lastDisconnect, isNewLogin } = update
    if (isNewLogin) this.isInit = true
    // @ts-ignore
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    if (code && code !== DisconnectReason.loggedOut && this?.ws.readyState !== ws.CONNECTING) {
        console.log(await reload(this, true).catch(console.error))
        global.timestamp.connect = new Date
    }
    if (connection == 'open') console.log('- opened connection -')

    if (db.data == null) loadDatabase()
}

function getMessageConfig() {
    const welcome = 'Hola, @user\nBienvenido al grupo @group'
    const bye = 'Adiós @user'
    const spromote = '@user ahora es administrador'
    const sdemote = '@user perdió la administración'
    const sDesc = 'La descripción ha sido cambiada a \n@desc'
    const sSubject = 'El nombre del grupo ha sido cambiado a \n@group'
    const sIcon = 'El icono del grupo ha sido cambiado.'
    const sRevoke = 'El enlace del grupo ha sido cambiado a \n@revoke'

    return {
        welcome,
        bye,
        spromote,
        sdemote,
        sDesc,
        sSubject,
        sIcon,
        sRevoke
    }
}

const conn = start(null, { store }).catch(console.error)

export default {
    start,
    reload,
    conn,
    conns,
    connectionOptions,
    authFolder,
    storeFile,
    authState,
    store,
    getMessageConfig
}
