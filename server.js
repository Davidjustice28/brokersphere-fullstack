const { urlencoded } = require('express')
const express = require('express')
const nodeMailer = require('nodemailer')
const fs = require('fs')
const {connect, addAgentToMongo} = require('./mongo')
const exp = require('constants')
const path = require('path')
require('dotenv').config()

//email functionality

const transporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'davidjustice28@gmail.com',
        pass: process.env.MAIL_PASSWORD
    }
})


//server which receives form data from front end and sends an email to the new users email address

const app = express()

const port = 3000

app.use(express.urlencoded())
app.use(express.static(path.join(__dirname,'static')))

app.get('/', (req,res) => {
    res.sendFile(__dirname+'/landing.html')
})
app.get('/signup', (req,res) => {
    res.sendFile(__dirname+'/signup.html')
})

app.get('/referral', async(req,res) => {
    res.sendFile(__dirname+'/referral.html')
})

app.get('/contact', async(req,res) => {
    res.sendFile(__dirname+'/contact.html')
})

app.post('/referral', async(req,res) => {
    let agents = await connect()
    console.log(typeof agents)
    let results = agents.map((agent) => {
        if(agent.state == req.body.state_input) {
            return agent.email
        }
    }).toString()
    console.log(`Results = ${results}`)
    if(!(results === null || results === undefined) ) {
        let {city_input, state_input, budget_input, sender_name, property_type, preapproved, sender_email, notes_input} = req.body
        transporter.sendMail({
            from:'davidjustice28@gmail',
            to: results,
            subject: 'Brokersphere - New Real Estate Referral in Your Area',
            text:`
            Referral Alert - a new referral lead was sent out by ${sender_name}

            Details Below: 

            Location: ${city_input+ ' '+ state_input}
            Property Type: ${property_type}
            Budget: ${budget_input}
            Preapproved: ${preapproved}
            Notes: ${notes_input}

            If your interested in acquiring this lead, please email ${sender_name} at ${sender_email}.

            *respond as soon as possible, as this email has been sent to all agents who services the lead's
            desired area. If you land the lead, the sending agent will provide you with all of the leads contact info.
            `,
        }, function(err,info) {
            if(err) {
                console.log(err)
            } else {
                console.log(`Email sent: ${info.response}`)
            }
        })

        res.sendFile(__dirname+'/referral.html')
        console.log('Thank you for uploading a referral lead. An agent should be reaching out shortly.')
    }
})



app.post('/signup' , async (req, res) => {
    let reqData = req.body
    let {name,email,state,brokerage} = reqData

    let agents = await connect()
    let alreadyExists = agents.some((agent) => agent.email == email)

    if(alreadyExists === false) {
        addAgentToMongo({name:name,email:email,state:state,brokerage:brokerage})
        console.log(reqData)
        fs.readFile('email.html','utf-8', async(err,data) => {
            if(err) {
                console.log(err)
            }
            transporter.sendMail({
                from:'davidjustice28@gmail',
                to: email,
                subject: 'Thanks For Joining Brokersphere',
                html:data,
                attachments: [
                    {
                        filename: 'bs-blue-bg.PNG',
                        path: __dirname+'/bs-blue-bg.PNG',
                        cid:'unique@nodemailer.com'
                    }
                ]
            }, function(err,info) {
                if(err) {
                    console.log(err)
                } else {
                    console.log(`Email sent: ${info.response}`)
                }
            })
        })
    }else {
        res.sendFile(__dirname+'/signup.html')
        console.log('Error: Email provided is already in use')
    }
})

app.post('/contact', (req,res) => {
    const {contact_name,contact_email, contact_message } = req.body
    transporter.sendMail({
        from:contact_email,
        to: 'brokersphere@yahoo.com',
        subject: 'Brokersphere Site - New Contact Request',
        text: `A site visitor with the name ${contact_name} has requested to get in touch
        Heres the request info:

        Name: ${contact_name}
        Email: ${contact_email}
        Message: ${contact_message}

        Please reach out to this visitor as soon as possible.
        `
    }, function(err,info) {
        if(err) {
            console.log(err)
        }else {
            console.log(info)
        }
    })
    res.sendFile(__dirname+'/landing.html')
})

app.listen(process.env.PORT || port, function() {
    console.log(`Server is listening on port ${port}`)
})