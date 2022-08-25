import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import db from '../lib/database.js'


let handler = async (m, { conn, usedPrefix, command}) => {


let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
if (!(who in db.data.users)) throw `✳️ El usuario no se encuentra en mi base de datos`
let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')
let { name, exp, limit, lastclaim, registered, regTime, age, level, role } = db.data.users[who]
let username = conn.getName(who)
let prem = global.prems.includes(who.split`@`[0])
let sn = createHash('md5').update(who).digest('hex')
let user = db.data.users[who]
user.role = global.rpg.role(user.level).name

let str = `
┌───「 *PERFIL* 」
▢ *🔖 Nombres:* 
   • ${username} ${registered ? '\n   • ' + name + ' ': ''}
   • @${who.replace(/@.+/, '')}
▢ *📱Numero:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
▢ *🔗Link:* wa.me/${who.split`@`[0]}${registered ? '\n▢ *🎈Edad*: ' + age + ' años' : ''}
▢ *💎 Diamantes :* ${limit}
▢ *🆙 Nivel* : ${level}
▢ *🏆Rango:* ${user.role}
▢ *📇 Registrado :* ${registered ? 'Si': 'No'}
▢ *⭐ Premium* : ${prem ? 'Si' : 'No'}
└──────────────`

    conn.sendFile(m.chat, pp, 'perfil.jpg', str, m, false, { mentions: [who] })
    

}
handler.help = ['perfil @user']
handler.tags = ['group']
handler.command = ['profile', 'perfil'] 

export default handler
