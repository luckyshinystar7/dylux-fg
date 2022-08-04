import { instagramStalk } from '@bochilteam/scraper'

let handler= async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `✳️ Escriba un Nombre de Usuario\n\n📌Ejemplo : ${usedPrefix + command} fg98._`
    const {
        username,
        avatar,
        name,
        description,
        followersH,
        followingH,
        postsH,
    } = await instagramStalk(args[0])
    
    let igst = `
┌──「 *STALKING* 
▢ *🔖 Nombre Completo* : ${name} 
▢ *🔖 Username* : ${username}
▢ *👥 Seguidores* : ${followersH}
▢ *🫂 Siguiendo* : ${followingH}
▢ *📌 Bio :* ${description}

▢ *🔗 Link* : https://instagram.com/${username.replace(/^@/, '')}
└──────────────
`
let pp = await( await conn.getFile(avatar)).data
conn.sendFile(m.chat, pp, 'igstalk.jpg', igst, m)
m.react(done)
}

handler.help = ['igstalk'].map(v => v + ' <username>')
handler.tags = ['downloader']

handler.command = ['igstalk'] 

export default handler
