
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
	
if (!args[0]) throw `✳️ Falta texto para encuesta \n\n📌 Ejemplo : \n*${usedPrefix + command}* Hola|como|xd`
if (!text.split('|')) throw  `✳️ Separe las encuestas con *|* \n\n📌 Ejemplo : \n*${usedPrefix + command}* Hola|como|xd`

let name = await conn.getName(m.sender)
let a = []
let b = text.split('|')
for (let c = 1 || 0; c < b.length; c++) {
a.push([b[c]])
			}
			return conn.sendPoll(m.chat, `📊 *Encuesta solicitado por:* ${name}\n\n*Mensaje:* ${text.split('|')[0]}`, a, m)
}
handler.help = ['poll <hola|como|xd>']
handler.tags = ['group'] 
handler.command = ['poll', 'encuesta', 'polling'] 
handler.group = true

export default handler
