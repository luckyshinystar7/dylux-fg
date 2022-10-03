//import db from '../lib/database.js'

let handler = async (m, {conn, usedPrefix}) => {
	
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let name = conn.getName(who) 
    let user = global.db.data.users[who]
 
    conn.reply(m.chat, `
┌───⊷ *BALANCE* ⊶
▢ *📌Nombre* : _@${who.split('@')[0]}_
▢ *💎Diamantes* : _${global.db.data.users[who].diamond}_
▢ *⬆️XP* : _Total ${global.db.data.users[who].exp}_
└──────────────

*NOTA :* 
Puedes comprar 💎 diamantes usando los comandos
❏ *${usedPrefix}buy <cantidad>*
❏ *${usedPrefix}buyall*`, m, { mentions: [who] })
}
handler.help = ['balance']
handler.tags = ['econ']
handler.command = ['bal', 'diamantes', 'diamond', 'balance'] 

export default handler
