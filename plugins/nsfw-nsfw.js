
import fetch from 'node-fetch'
import axios from 'axios'
let handler = async (m, { conn, usedPrefix, command }) => {
	
	if (!global.db.data.chats[m.chat].nsfw) throw `🚫 ${msg.gpNsfw(usedPrefix)}`
   let user = global.db.data.users[m.sender].age
   if (user < 17) throw `❎ ${msg.noNsfw()}`
   
   m.react(rwait)

let type = (command).toLowerCase()
switch (type) {
	
case 'ass':
case 'culos':
    let as = await (await fetch(global.API('fgmods', '/api/nsfw/ass', { }, 'apikey'))).json()
    conn.sendButton(m.chat, `✅ Random *${command}*`, fgyt, as.result, [[`▷▷ ${msg.next()}`, `${usedPrefix + command}`]], m)
   m.react(xmoji) 
break

case 'boobs':
case 'boobies':
    let xb = await (await fetch(global.API('fgmods', '/api/nsfw/boobs', { }, 'apikey'))).json()
    conn.sendButton(m.chat, `✅ Random *${command}*`, fgyt, xb.result, [[`▷▷ ${msg.next()}`, `${usedPrefix + command}`]], m)
   m.react(xmoji) 
break

case 'pussy':
    let xp = await (await fetch(global.API('fgmods', '/api/nsfw/pussy', { }, 'apikey'))).json()
    conn.sendButton(m.chat, `✅ Random *${command}*`, fgyt, xp.result, [[`▷▷ ${msg.next()}`, `${usedPrefix + command}`]], m)
   m.react(xmoji) 
break

case 'lesbians':
case 'lesbian':
    let les = await (await fetch(global.API('fgmods', '/api/nsfw/lesbian', { }, 'apikey'))).json()
   conn.sendButton(m.chat, `✅ Random *${command}*`, fgyt, les.result, [[`▷▷ ${msg.next()}`, `${usedPrefix + command}`]], m)
   m.react(xmoji) 
break

case 'pack':
case 'cosplay':
	     let img = await conn.getFile(global.API('fgmods', '/api/nsfw/cosplay', { }, 'apikey'))
	     conn.sendButton(m.chat, `✅ ${msg.lresult()} 🤭\n Random *${command}*`, fgyt, img.data, [['▷▷ SIGUIENTE', `${usedPrefix + command}`]], m)
	     m.react(xmoji) 
	break


default:
 }
}

handler.help = ['ass', 'boobs', 'lesbian', 'pack', 'pussy']
handler.tags = ['nsfw']
handler.command = /^(ass|culos|boobs|boobies|lesbian|lesbians|pussy|cosplay|pack)$/i
handler.diamond = true
handler.register = true
handler.group = true

export default handler
