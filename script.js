'use strict'

const charlie = document.querySelector('#charlie')
const david = document.querySelector('#david')
const scottie = document.querySelector('#scottie')
const crystal = document.querySelector('#crystal')
const board = document.querySelector('#board')

const modal = document.querySelector('#modal')
const closeButton = document.querySelector('#close-button')
const fullName = document.querySelector('#name')
const position = document.querySelector('#position')
const bioParagraph = document.querySelector('#bio')

const bios = {
  charlie: `Pastor Charlie came to Clearview Chapel in October of 2005. He loves
    to spend time with his beautiful wife Kerri and their three kids:
    Logan, Emma, and Cooper. Charlie also enjoys cycling, playing church
    softball, hiking, and coaching. Charlie has a BA in Church
    Ministries from Warner University, a MA in Theological Studies from
    Asbury Theological Seminary, and a PhD in Organizational Leadership
    from Eastern University. He has been in ministry since 1998.His
    ultimate goal is to love Jesus and serve the church for which he
    died.`,
  scottie: `Scottie graduated with an associate’s degree in business
    administration from Andrew College in 2005. He is an owner/operator
    at Troup Farm & Yard in LaGrange. He has been married to his wife
    Cailin since 2012. They have three kids: Beckham, Anderson, and
    Elodie. They enjoy watching movies and being outdoors. Scottie has a
    passion for youth and young adult ministry.`,
  crystal: `Crystal was born and raised in LaGrange and will always consider it
    her home. She has been a Christian since the age of 5 and has felt a
    strong inclination towards Children’s Ministry since she was 13. She
    graduated from Point University in West Point, GA, in 2015,
    obtaining a bachelor’s degree in Child and Youth Development with a
    minor in Biblical Studies. Crystal has been married to William House
    III (Willie) since 2011. Willie works as a superintendent in
    construction. In July 2019, they were blessed with the adoption of a
    little girl named Layna Grace. They were overjoyed and officially
    welcomed her as a House family member in October 2019. Additionally,
    they have 3 dogs, 1 cat, and 4 chickens. Both Crystal and Willie
    share a love for outdoor activities and travel whenever possible.
    Crystal’s hobbies include baking, singing (although she doesn’t do
    solos), and engaging in various activities with children. She
    possesses a deep passion for nurturing children’s knowledge of their
    Savior and aims to teach them the Bible in fun and exciting ways.
    Crystal firmly believes that this calling is from God and eagerly
    follows Him.`,
  david: `David grew up in Northeast Ohio where he spent years cultivating and nurturing his life-long passion for worship ministry. Eventually, this led to worship ministry positions spanning from camp ministry to bible college training to leading worship at both small and large multi-site megachurches. David is also the Paul S. and Jean R. Amos
    Distinguished Chair in Music and Director of Choral Activities at the Schwob School of Music at Columbus State University where he conducts the Schwob Singers, Choral Union, and teaches courses in voice and conducting. David holds the Doctor of Musical Arts degree
    in conducting from the University of Michigan, the Master of Music degree in conducting from the Eastman School of Music, and the Bachelor of Music degree in sacred music (vocal performance emphasis) from the Moody Bible Institute in Chicago, IL. David resides in Columbus, GA and is an avid coffee connoisseur, world traveler, and culinary arts champion.`,
  board: `Our church is led by a seven member board composed of godly women and men. These spiritually mature individuals are chosen by the congregation on an annual basis to serve three year terms. As a team, they gather together and seek God’s direction when it comes to guidance for the church. This group seeks to model servant leadership, wisdom, and unity within the body of Christ.`,
}

closeButton.addEventListener('click', () => {
  modal.close()
})

charlie.addEventListener('click', () => {
  fullName.innerHTML = charlie.querySelector('h3').innerHTML
  position.innerHTML = charlie.querySelector('h4').innerHTML
  bioParagraph.innerHTML = bios.charlie
  modal.showModal()
})
scottie.addEventListener('click', () => {
  fullName.innerHTML = scottie.querySelector('h3').innerHTML
  position.innerHTML = scottie.querySelector('h4').innerHTML
  bioParagraph.innerHTML = bios.scottie
  modal.showModal()
})
crystal.addEventListener('click', () => {
  fullName.innerHTML = crystal.querySelector('h3').innerHTML
  position.innerHTML = crystal.querySelector('h4').innerHTML
  bioParagraph.innerHTML = bios.crystal
  modal.showModal()
})
david.addEventListener('click', () => {
  fullName.innerHTML = david.querySelector('h3').innerHTML
  position.innerHTML = david.querySelector('h4').innerHTML
  bioParagraph.innerHTML = bios.david
  modal.showModal()
})
board.addEventListener('click', () => {
  fullName.innerHTML = board.querySelector('h3').innerHTML
  position.innerHTML = board.querySelector('h4').innerHTML
  bioParagraph.innerHTML = bios.board
  modal.showModal()
})
